import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { useSessionId } from "./useSessionId"

export function useCart() {
    const sessionId = useSessionId();
    const addToCart = useMutation(api.cart.addToCart);
    const removeFromCart = useMutation(api.cart.removeFromCart);
    const clearCart = useMutation(api.cart.clearCart);

    const handleAdd = async (menuItemId: Id<"menu_items">, quantity: number, itemName: string, itemPrice: number) => {
        if (!sessionId) return
        await addToCart({ sessionId, menuItemId, quantity, itemName, itemPrice })
    }

    const handleRemove = async (menuItemId: Id<"menu_items">, quantity: number) => {
        if (!sessionId) return
        await removeFromCart({ sessionId, menuItemId, quantity })
    }

    const handleClear = async () => {
        if (!sessionId) return
        await clearCart({ sessionId })
    }

    return { handleAdd, handleRemove, handleClear }
}
