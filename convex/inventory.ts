import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getItemStockById = query({
    args: {
        menuItemId: v.id("menu_items")
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("inventory")
            .withIndex("by_menuItem", (q) => q.eq("menuItemId", args.menuItemId))
            .first()
    }
})

export const getLowStock = query({
    args: {},
    handler: async (ctx) => {
        const item =
            await ctx.db
                .query("inventory")
                .collect()

        return item.filter((item) => item.stock <= item.lowStockThreshold)
    },
})

export const updateStock = mutation({
    args: {
        menuItemId: v.id("menu_items"),
        quantity: v.number()
    },
    handler: async (ctx, args) => {
        const item =
            await ctx.db
                .query("inventory")
                .withIndex("by_menuItem", (q) => q.eq("menuItemId", args.menuItemId))
                .first();

        if (!item) throw new Error("Item not found");

        await ctx.db.patch(item._id, {
            stock: item.stock + args.quantity,
            updatedAt: Date.now(),
        })
    }
})
