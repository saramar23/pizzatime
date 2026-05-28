import { createTool } from "@mastra/core/tools"
import { fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import z from "zod"

export const getWaitTime = createTool({
    id: "waiting-time",
    description: "Estimates the wait time in minutes on new orders based on all active orders currently in the kitchen queue.",
    inputSchema: z.object({}),
    execute: async () => {
        const waitingTime = await fetchQuery(api.orders.getActiveOrders)
        return waitingTime
    }
})