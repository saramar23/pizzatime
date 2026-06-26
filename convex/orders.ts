import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { orderStatusValidator } from "./schema";

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "ready"];
const QUEUE_CUTOFF = (30 * 60 * 1000);

export const createOrder = mutation({
    args: {
        sessionId: v.string(),
        items: v.array(
            v.object({
                menuItemId: v.id("menu_items"),
                name: v.string(),
                quantity: v.number(),
                priceEach: v.number(),
            })
        ),
        notes: v.optional(v.string()),
        estimatedWaitMinutes: v.number(),
        subtotal: v.number()
    },
    handler: async (ctx, args) => {

        const orders = await ctx.db
            .query("orders")
            .collect();

        const activeOrders = orders.filter(order => ACTIVE_STATUSES.includes(order.status));
        const staleActiveOrders = activeOrders.filter(ord => ord.createdAt <= (Date.now() - QUEUE_CUTOFF));
        for (const stale of staleActiveOrders) {
            await ctx.db.patch(stale._id, {
                status: "completed",
                updatedAt: Date.now(),
            })
        }
        
        const currentOrder = await ctx.db
            .query("counters")
            .withIndex("by_name", q => q.eq("name", "orderNumber"))
            .first();

        let orderNumber = 1;

        if (!currentOrder) {
            await ctx.db.insert("counters", {
                name: "orderNumber",
                value: 1,
            })
        } else {
            orderNumber = currentOrder.value + 1;
            await ctx.db.patch(currentOrder._id, {
                value: orderNumber
            })
        }

        const orderId = await ctx.db.insert("orders", {
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: "pending",
            orderNumber: orderNumber
        });

        for (const item of args.items) {
            const inventory = await ctx.db
                .query("inventory")
                .withIndex("by_menuItem", (q) => q.eq("menuItemId", item.menuItemId))
                .first();

            if (!inventory || inventory.stock < item.quantity) {
                throw new Error(`Not enough stock for ${item.name}.`);
            }

            await ctx.db.patch(inventory._id, {
                stock: inventory.stock - item.quantity,
                soldToday: inventory.soldToday + item.quantity,
                updatedAt: Date.now(),
            });

        }
        return { estimatedWaitMinutes: args.estimatedWaitMinutes, orderId, orderNumber };
    }
})

export const getOrderBySessionId = query({
    args: {
        sessionId: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("orders")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .collect()
    }
})

export const updateOrderStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: orderStatusValidator,
    },
    handler: async (ctx, args) => {
        await ctx.db
            .patch(args.orderId, {
                status: args.status,
                updatedAt: Date.now()
            })
    },
})

export const getActiveOrders = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const activeOrders = orders.filter(order => ACTIVE_STATUSES.includes(order.status));
        const recentActiveOrders = activeOrders.filter(ord => ord.createdAt > (Date.now() - QUEUE_CUTOFF) );
        return recentActiveOrders;
    }
})

export const getEstimatedWaitMinutes = query({
    args: {
        items: v.array(
            v.object({
                menuItemId: v.id("menu_items"),
                quantity: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const menuItems = await ctx.db
            .query("menu_items")
            .collect();

        const activeOrders = orders.filter(order => ACTIVE_STATUSES.includes(order.status));
        
        const prepById: Record<Id<"menu_items">, number> = {};

        menuItems.forEach((item) => {
            prepById[item._id] = item.prepTimeMinutes;
        });

        let cartTime = 0;

        args.items.forEach((cartIt) => {
            const cartPrepTime = prepById[cartIt.menuItemId] ?? 0;
            cartTime += cartPrepTime * cartIt.quantity;
        });

        let time = 0;

        const recentActiveOrders = activeOrders.filter(ord => ord.createdAt > (Date.now() - QUEUE_CUTOFF) );

        recentActiveOrders.forEach((order) => {
            order.items.forEach((it) => {
                const totQueueTime = prepById[it.menuItemId] ?? 0;
                time += totQueueTime * it.quantity;
            });
        });

        return time + cartTime;
    },
})

export const getCompletedOrders = query({
    args: {},
    handler: async (ctx) => {
        const statuses = ["completed", "cancelled"]
        const orders = await ctx.db
            .query("orders")
            .collect()

        const completedOrders = orders.filter(order => statuses.includes(order.status))
        return completedOrders;
    }
})