import { createTool } from "@mastra/core/tools"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import z from "zod"
import { Id } from "../../../convex/_generated/dataModel"

export const getCartItems = createTool({
    id: "cart-items",
    description: "Check entire cart content and the quantity for every single item.",
    inputSchema: z.object({
        sessionId: z.string()
    }),
    execute: async ({ sessionId }) => {
        const cart = await fetchQuery(api.cart.getCart, {
            sessionId
        })
        return cart
    }
})

export const addItemToCart = createTool({
    id: "add-item-to-cart",
    description: "Adds a specific quantity of an item to the cart. If the item is already in the cart, check the stock quantity and increase current cart quantity up to the stock quantity.",
    inputSchema: z.object({
        sessionId: z.string(),
        menuItemId: z.string(),
        quantity: z.number(),
        itemName: z.string(),
        itemPrice: z.number()
    }),
    execute: async ({ sessionId, menuItemId, quantity, itemName, itemPrice }) => {
        const addItemQuantity = await fetchMutation(api.cart.addToCart, {
            sessionId, quantity, itemName, itemPrice,
            menuItemId: menuItemId as Id<"menu_items">
        })
        return addItemQuantity
    }
})

export const removeItemFromCart = createTool({
    id: "remove-item-from-cart",
    description: "Removes a specific quantity of an item from the cart. If quantity matches or exceeds current cart quantity, the item is removed entirely.",
    inputSchema: z.object({
        sessionId: z.string(),
        menuItemId: z.string(),
        quantity: z.number()
    }),
    execute: async ({ sessionId, menuItemId, quantity }) => {
        const removeItemQuantity = await fetchMutation(api.cart.removeFromCart, {
            sessionId, quantity,
            menuItemId: menuItemId as Id<"menu_items">
        })
        return removeItemQuantity
    }
})

export const clearEntireCart = createTool({
    id: "clear-cart",
    description: "Clears the cart entirely. Ask the user if they are sure about the action before clearing the cart.",
    inputSchema: z.object({
        sessionId: z.string()
    }),
    execute: async ({ sessionId }) => {
        const clearedCart = await fetchMutation(api.cart.clearCart, {
            sessionId
        })
        return clearedCart
    }
})