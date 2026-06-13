import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { orderStatusValidator } from "./schema";

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
        const orderId = await ctx.db.insert("orders", {
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: "pending"
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
        return { estimatedWaitMinutes: args.estimatedWaitMinutes, orderId };
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
        const statuses = ["pending", "confirmed", "preparing", "ready"]
        const orders = await ctx.db
            .query("orders")
            .collect()

        const activeOrders = orders.filter(order => statuses.includes(order.status))
        return activeOrders;
    }
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