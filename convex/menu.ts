import { query } from "./_generated/server"
import { v } from "convex/values"
import { dietaryTagValidator, menuCategoryValidator } from "./schema"

// ─── Get all available menu items ─────────────────────────────────────────────
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("menu_items")
      .withIndex("by_available", (q) => q.eq("isAvailable", true))
      .collect()
  },
})

// ─── Get items by category ────────────────────────────────────────────────────
export const getByCategory = query({
  args: {
    category: menuCategoryValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menu_items")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect()
  },
})

// ─── Get featured items (daily specials / chef picks) ─────────────────────────
export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("menu_items")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect()
  },
})

// ─── Get most popular items ───────────────────────────────────────────────────
// Returns top N items sorted by popularity score (0–100)
export const getPopular = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5
    const items = await ctx.db
      .query("menu_items")
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect()

    return items
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
  },
})

// ─── Get single item by ID ────────────────────────────────────────────────────
export const getById = query({
  args: {
    id: v.id("menu_items"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// ─── Search menu by name ──────────────────────────────────────────────────────
export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menu_items")
      .withSearchIndex("search_menu", (q) =>
        q.search("name", args.searchTerm).eq("isAvailable", true)
      )
      .collect()
  },
})

// ─── Get shareable items ──────────────────────────────────────────────────────
export const getShareable = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("menu_items")
      .filter((q) =>
        q.and(
          q.eq(q.field("isAvailable"), true),
          q.eq(q.field("isShareable"), true)
        )
      )
      .collect()
  },
})

// ─── Get items by dietary tag ─────────────────────────────────────────────────
// Used by the agent to filter e.g. vegetarian or gluten-free options
export const getByDietary = query({
  args: {
    tag: dietaryTagValidator,
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menu_items")
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect()

    return items.filter((item) => item.dietary.includes(args.tag))
  },
})