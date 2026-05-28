import { createTool } from "@mastra/core/tools"
import { fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import z from "zod"
import { Id } from "../../../convex/_generated/dataModel"

export const getNutritionInfo = createTool({
    id: "nutrition-info",
    description: "Gets nutritional information from the database and informs the customer about calories, protein, carbs and fat values upon request.",
    inputSchema: z.object({
        id: z.string()
    }),
    execute: async ({ id }) => {
        const nutritionalValues = await fetchQuery(api.menu.getItemById, {
            id: id as Id<"menu_items">
        })
        return nutritionalValues
    }
})

export const getDietaryItems = createTool({
    id: "dietary",
    description: "Returns all available menu items that match a specific dietary requirement such as vegetarian, vegan, gluten-free, dairy-free, halal, nut-free, kosher, spicy etc.",
    inputSchema: z.object({
        tag: z.enum(["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free", "halal", "kosher", "spicy"])
    }),
    execute: async ({ tag }) => {
        const dietaryMenuItems = await fetchQuery(api.menu.getByDietaryTag, {
            tag 
        })
        return dietaryMenuItems
    }
})
