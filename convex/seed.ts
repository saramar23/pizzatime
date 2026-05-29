import { internalMutation } from "./_generated/server"
import { menuItems } from "./data/menuItems"

export const seed = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing data first to avoid duplicates on re-seed
        const existingItems = await ctx.db.query("menu_items").collect()
        for (const item of existingItems) {
            await ctx.db.delete(item._id)
        }

        const existingInventory = await ctx.db.query("inventory").collect()
        for (const item of existingInventory) {
            await ctx.db.delete(item._id)
        }

        // Insert menu items and create inventory rows
        for (const item of menuItems) {
            const menuItemId = await ctx.db.insert("menu_items", item)

            await ctx.db.insert("inventory", {
                menuItemId,
                stock: 20,             // start every item with 20 units
                lowStockThreshold: 5,  // warn agent
                soldToday: 0,
                updatedAt: Date.now(),
            })
        }
        console.log(`Seeded ${menuItems.length} menu items with inventory.`)
    },
})