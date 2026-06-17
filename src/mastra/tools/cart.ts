import { createTool } from "@mastra/core/tools"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import z from "zod"
import { Id } from "../../../convex/_generated/dataModel"

export const getCartItems = createTool({
  id: "cart-items",
  description:
    "Returns the customer's current cart. Use for 'what's in my cart' and always verify cart state before telling the customer what was added or removed.",
  inputSchema: z.object({
    sessionId: z.string(),
  }),
  execute: async ({ sessionId }) => {
    return await fetchQuery(api.cart.getCart, { sessionId })
  },
})

export const addItemToCart = createTool({
  id: "add-item-to-cart",
  description:
    "Adds items to the cart. Requires menuItemId, itemName, and itemPrice from searchOnMenu. quantity is how many to add (e.g. '2 margherita' → quantity: 2). Returns { success, cart }.",
  inputSchema: z.object({
    sessionId: z.string(),
    menuItemId: z.string(),
    quantity: z.number(),
    itemName: z.string(),
    itemPrice: z.number(),
  }),
  execute: async ({ sessionId, menuItemId, quantity, itemName, itemPrice }) => {
    await fetchMutation(api.cart.addToCart, {
      sessionId,
      quantity,
      itemName,
      itemPrice,
      menuItemId: menuItemId as Id<"menu_items">,
    })
    const cart = await fetchQuery(api.cart.getCart, { sessionId })
    return { success: true, cart }
  },
})

export const removeItemFromCart = createTool({
  id: "remove-item-from-cart",
  description:
    "Removes items from the cart. Use when the customer changes their mind or wants fewer of an item. Returns { success, cart }.",
  inputSchema: z.object({
    sessionId: z.string(),
    menuItemId: z.string(),
    quantity: z.number(),
  }),
  execute: async ({ sessionId, menuItemId, quantity }) => {
    await fetchMutation(api.cart.removeFromCart, {
      sessionId,
      quantity,
      menuItemId: menuItemId as Id<"menu_items">,
    })
    const cart = await fetchQuery(api.cart.getCart, { sessionId })
    return { success: true, cart }
  },
})

export const clearEntireCart = createTool({
  id: "clear-cart",
  description:
    "Removes every item from the cart. Use when replacing the whole order after a change of mind. Returns { success, cart }.",
  inputSchema: z.object({
    sessionId: z.string(),
  }),
  execute: async ({ sessionId }) => {
    await fetchMutation(api.cart.clearCart, { sessionId })
    const cart = await fetchQuery(api.cart.getCart, { sessionId })
    return { success: true, cart }
  },
})
