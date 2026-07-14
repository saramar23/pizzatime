import { fetchQuery } from "convex/nextjs"
import { api } from "../../../convex/_generated/api"
import { planOrder } from "./planner"
import { validatePlan } from "./validate"
import { executePlan } from "./execute"
import { formatOrderReply } from "./format"

// Tells the route what to do next:
// - "chat": not a cart action, let the restaurant agent handle it
// - "order": we handled it, here's the finished customer reply
export type OrderHandlerResult =
  | { intent: "chat" }
  | { intent: "order"; reply: string }

export async function handleOrderMessage(
  userMessage: string,
  sessionId: string,
  previousAssistantMessage?: string
): Promise<OrderHandlerResult> {
  // One menu read: used both to guide the planner and to validate its output.
  const menu = await fetchQuery(api.menu.getAllMenuItems)
  const menuSummary = menu.map((item) => item.name).join(", ")
  const beforeCart = await fetchQuery(api.cart.getCart, { sessionId })

  const cartSummary = beforeCart.length === 0
  ? "Cart is currently empty."
  : `Current cart: ${beforeCart.map(item => `${item.quantity}x ${item.itemName}`).join(", ")}`;

  const plan = await planOrder(userMessage, menuSummary, cartSummary, previousAssistantMessage);
  
  if (plan.intent === "chat") {
    return { intent: "chat" }
  }

  const { valid, rejected } = validatePlan(plan, menu)
  const { failed } = await executePlan(sessionId, valid)

  const updatedCart = await fetchQuery(api.cart.getCart, { sessionId });
  const reply = formatOrderReply({ cart: updatedCart, rejected, failed })

  return { intent: "order", reply }
}
