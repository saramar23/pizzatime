// chat_history: defineTable({
//     sessionId: v.string(),
//     role: chatRoleValidator,
//     content: v.string(),
//     toolCalls: v.optional(v.string()),        // JSON string of tool call log
//     createdAt: v.number(),
//   })
//     .index("by_session", ["sessionId"])
//     .index("by_session_time", ["sessionId", "createdAt"]),
// })

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