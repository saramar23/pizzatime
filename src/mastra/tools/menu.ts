import { createTool } from "@mastra/core/tools"
import { fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import z from "zod"

export const getMenu = createTool({
    id: "menu",                   
    description: "Reads all items available in the Restaurants' menu. All dishes, beverages, drinks of all types.",
    inputSchema: z.object({}),
    execute: async () => {
        const items = await fetchQuery(api.menu.getAllMenuItems)
        return items
    }
})

export const getMenuByCategory = createTool({
    id: "menu-category",
    description: "Takes a specific category and returns all the items available in that category.",
    inputSchema: z.object({
        category: z.enum(["beer", "pizza", "dessert", "drink", "special"])
    }),
    execute: async ({ category }) => {
        const results = await fetchQuery(api.menu.getByCategory, {
            category
        })
        return results
    }
})

export const getFeatured = createTool({
    id: "featured-menu",
    description: "Returns all items listed in the 'featured' section of the menu.",
    inputSchema: z.object({}),
    execute: async () => {
        const featuredItems = await fetchQuery(api.menu.getFeatured)
        return featuredItems
    }
})

export const getPopular = createTool({
    id: "most-popular",
    description: "Returns all popular items loved by customers. These are the ones that are ordered the most.",
    inputSchema: z.object({
        limit: z.optional(z.number())
    }),
    execute: async ({ limit }) => {
        const popularItems = await fetchQuery(api.menu.getPopular, {
            limit
        })
        return popularItems
    }
})

export const searchOnMenu = createTool({
    id: "search-menu",
    description: "Search all available items inside the Menu.",
    inputSchema: z.object({
        searchTerm: z.string()
    }),
    execute: async ({ searchTerm }) => {
        const availableItems = await fetchQuery(api.menu.searchMenu, {
            searchTerm
        })
        return availableItems
    }
})

export const getShareableItems = createTool({
    id: "shareable-items",
    description: "Returns all menu items that are good for sharing between multiple people, including how many people each item feeds.",
    inputSchema: z.object({}),
    execute: async () => {
        const servings = await fetchQuery(api.menu.getShareable)
        return servings
    }
})