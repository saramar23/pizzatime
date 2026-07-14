import type { RejectedAction } from "./validate"
import type { ExecutionResult } from "./execute"

// Minimal shape the presenter needs. Real Convex cart rows satisfy this.
type CartItemView = { itemName: string; quantity: number }

function actionName(action: ExecutionResult["failed"][number]["action"]): string {
  return action.type === "clear" ? "clear the cart" : action.itemName
}

// Builds ONE honest customer sentence from real results:
// what's in the cart now + what was rejected + what failed.
export function formatOrderReply(params: {
  cart: CartItemView[]
  rejected: RejectedAction[]
  failed: ExecutionResult["failed"]
}): string {
  const { cart, rejected, failed } = params;
  const parts: string[] = [];

  if (rejected.length > 0) {
    const names = rejected.map((r) => r.itemName ?? "that item").join(", ")
    parts.push(`I couldn't find ${names} on our menu.`)
  }

  if (failed.length > 0) {
    const names = failed.map((f) => actionName(f.action)).join(", ")
    parts.push(`I couldn't add ${names} — please try again.`)
  }

  if (cart.length === 0) {
    parts.push("Your cart is empty.")
  } else {
    const items = cart.map((c) => `${c.quantity}x ${c.itemName}`).join(", ")
    parts.push(`Your cart now has: ${items}.`)
  }

  return parts.join(" ")
}
