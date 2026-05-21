import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCart = query({
    args: {
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        return ctx.db
            .query("cart")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .collect()
    }
})

export const addToCart = mutation({
    args: {
        sessionId: v.string(),
        menuItemId: v.id("menu_items"),
        quantity: v.number(),
        itemName: v.string(),
        itemPrice: v.number()
    },
    handler: async (ctx, args) => {
        const item =
            await ctx.db
                .query("cart")
                .withIndex("by_session_item", (q) => q.eq("sessionId", args.sessionId).eq("menuItemId", args.menuItemId))
                .first();

        if (!item) {
            await ctx.db.insert("cart", {
                ...args,
                addedAt: Date.now()
            })
        } else {
            await ctx.db.patch(item._id, {
                quantity: args.quantity,
                addedAt: Date.now()
            })
        }
    }
})

export const removeFromCart = mutation({
    args: {
        sessionId: v.string(),
        menuItemId: v.id("menu_items"),
        quantity: v.number()
    },
    handler: async (ctx, args) => {
        const item =
            await ctx.db
                .query("cart")
                .withIndex("by_session_item", (q) => q.eq("sessionId", args.sessionId).eq("menuItemId", args.menuItemId))
                .first();

        if (!item) {
            throw new Error("Item not found in cart.");
        };

        if (item.quantity <= args.quantity) {
            await ctx.db.delete(item._id)
        } else {
            await ctx.db.patch(item._id, {
                quantity: item.quantity - args.quantity
            })
        }
    }
})

export const clearCart = mutation({
    args: {
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        const item =
            await ctx.db
                .query("cart")
                .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
                .collect();

        if (item.length === 0) { 
            return; 
        }
        
        for (const cartItem of item) {
            await ctx.db.delete(cartItem._id)
        }
    }
})