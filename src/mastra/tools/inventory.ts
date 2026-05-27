import { createTool } from "@mastra/core/tools"
import { fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import z from "zod"
import { Id } from "../../../convex/_generated/dataModel"

export const checkItemStock = createTool({
    id: "item-stock",
    description: "Check stock for a specific item using its unique id",
    inputSchema: z.object({
        menuItemId: z.string()
    }),
    execute: async ({ menuItemId }) => {
        const itemStock = await fetchQuery(api.inventory.getItemStockById, { 
            menuItemId: menuItemId  as Id<"menu_items">
        })
        return itemStock
    }
})

export const getLowStock = createTool({
    id: "low-stock",
    description: "Gets the items with a low stock from the inventory",
    inputSchema: z.object({}),
    execute: async () => {
        const lowStockItems = await fetchQuery(api.inventory.getLowStockItem)
        return lowStockItems
    }
})