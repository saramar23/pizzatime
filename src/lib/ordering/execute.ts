import { fetchMutation } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import type { ValidatedAction } from "./validate"

export type ExecutionResult = {
  succeeded: ValidatedAction[]
  failed: { action: ValidatedAction; reason: string }[]
}

// Runs every valid action against Convex, in order.
// "Skip and report": if one action fails (e.g. out of stock), we record it
// and keep going, so one bad item doesn't cancel the whole order.
export async function executePlan(
  sessionId: string,
  actions: ValidatedAction[]
): Promise<ExecutionResult> {
  const succeeded: ValidatedAction[] = [];
  const failed: { action: ValidatedAction; reason: string }[] = [];

  for (const action of actions) {
    try {
      if (action.type === "clear") {
        await fetchMutation(api.cart.clearCart, { sessionId })
      } else if (action.type === "add") {
        await fetchMutation(api.cart.addToCart, {
          sessionId,
          menuItemId: action.menuItemId,
          quantity: action.quantity,
          itemName: action.itemName,
          itemPrice: action.itemPrice,
        })
      } else {
        await fetchMutation(api.cart.removeFromCart, {
          sessionId,
          menuItemId: action.menuItemId,
          quantity: action.quantity,
        })
      }
      succeeded.push(action)
    } catch (err) {
      failed.push({
        action,
        reason: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  return { succeeded, failed }
}
