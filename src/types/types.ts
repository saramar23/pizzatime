export const categories: { label: string; value: Category; emoji: string }[] = [
    { label: "All", value: "all", emoji: "🍽️" },
    { label: "Pizza", value: "pizza", emoji: "🍕" },
    { label: "Drinks", value: "drink", emoji: "🥤" },
    { label: "Beer", value: "beer", emoji: "🍺" },
    { label: "Desserts", value: "dessert", emoji: "🍮" },
    { label: "Specials", value: "special", emoji: "⭐" },
]

export type Category = "all" | "pizza" | "drink" | "beer" | "dessert" | "special"