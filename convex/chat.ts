import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { chatRoleValidator } from "./schema";

export const saveMessage = mutation({
    args: {
        sessionId: v.string(),
        role: chatRoleValidator,
        content: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("chat_history", {
            ...args,
            createdAt: Date.now()
        })
    }
})

export const getMessages = query({
    args: {
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("chat_history")
            .withIndex("by_session_time", (q) => q.eq("sessionId", args.sessionId))
            .collect()
    }
})