import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Shared validators 

export const dietaryTagValidator = v.union(
  v.literal("vegetarian"),
  v.literal("vegan"),
  v.literal("gluten-free"),
  v.literal("dairy-free"),
  v.literal("nut-free"),
  v.literal("halal"),
  v.literal("kosher"),
  v.literal("spicy")
)

export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("completed"),
  v.literal("cancelled")
)

export const chatRoleValidator = v.union(
  v.literal("user"),
  v.literal("assistant")
)

export const menuCategoryValidator = v.union(
  v.literal("beer"),
  v.literal("pizza"),
  v.literal("dessert"),
  v.literal("drink"),
  v.literal("special")
)

// Schema 

export default defineSchema({
  // Source of truth for everything on the menu.
  menu_items: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),                        // in dollars
    category: menuCategoryValidator,
    imageUrl: v.optional(v.string()),

    // Nutrition
    calories: v.number(),
    protein: v.number(),                      // grams
    carbs: v.number(),                        // grams
    fat: v.number(),                          // grams

    // Shareability
    recommendedServings: v.number(),          // "feeds ~2 people"
    isShareable: v.boolean(),                 // good for sharing?

    // Dietary tags
    dietary: v.array(dietaryTagValidator),

    // Metadata
    isAvailable: v.boolean(),
    isFeatured: v.boolean(),
    prepTimeMinutes: v.number(),              // avg prep time
    popularity: v.number(),                   // 0–100 score for recommendations
  })
    .index("by_category", ["category"])
    .index("by_available", ["isAvailable"])
    .index("by_featured", ["isFeatured"])
    .searchIndex("search_menu", {
      searchField: "name",
      filterFields: ["category", "isAvailable"],
    }),

  // inventory 
  // Tracks real-time stock levels. One row per menu_item.
  inventory: defineTable({
    menuItemId: v.id("menu_items"),
    stock: v.number(),
    lowStockThreshold: v.number(),            // warn agent when stock <= this
    soldToday: v.number(),                    // reset daily via cron
    updatedAt: v.number(),                    // Date.now() on each write
  })
    .index("by_menuItem", ["menuItemId"])
    .index("by_stock", ["stock"]),

  // cart 
  // Per-session cart. sessionId = anonymous ID from the chatbot widget.
  cart: defineTable({
    sessionId: v.string(),
    menuItemId: v.id("menu_items"),
    itemName: v.string(),                     // denormalised for display speed
    itemPrice: v.number(),                    // snapshot at time of add
    quantity: v.number(),
    specialInstructions: v.optional(v.string()),
    addedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_item", ["sessionId", "menuItemId"]),

  // orders 
  // Placed orders (cart → order on checkout).
  orders: defineTable({
    sessionId: v.string(),
    status: orderStatusValidator,
    items: v.array(
      v.object({
        menuItemId: v.id("menu_items"),
        name: v.string(),
        quantity: v.number(),
        priceEach: v.number(),
      })
    ),
    subtotal: v.number(),
    estimatedWaitMinutes: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    orderNumber: v.number()
  })
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
    .index("by_status_created", ["status", "createdAt"]),

  // chat_history 
  // Stores every message for each session (used by Mastra memory + UI replay).
  chat_history: defineTable({
    sessionId: v.string(),
    role: chatRoleValidator,
    content: v.string(),
    toolCalls: v.optional(v.string()),        // JSON string of tool call log
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_time", ["sessionId", "createdAt"]),

  // For order n#
  counters: defineTable({
    name: v.string(),
    value: v.number()
  })
    .index("by_name", ["name"])
})