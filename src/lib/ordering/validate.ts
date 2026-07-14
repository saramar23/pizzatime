import type { Doc, Id } from "../../../convex/_generated/dataModel"
import type { PlannerOutput } from "./planner"

// What the executor needs to run each action with no guessing.
export type ValidatedAction =
  | { type: "clear" }
  | {
      type: "add"
      menuItemId: Id<"menu_items">
      itemName: string
      itemPrice: number
      quantity: number
    }
  | {
      type: "remove"
      menuItemId: Id<"menu_items">
      itemName: string
      quantity: number
    }

export type RejectedAction = { itemName?: string; reason: string }

export type ValidationResult = {
  valid: ValidatedAction[]
  rejected: RejectedAction[]
}

// Match the planner's guessed name to a real menu item.
// Exact (case-insensitive) first, then a loose "contains" fallback
// so "big slice" still finds "The Big Slice".
function findMenuItem(
  name: string,
  menu: Doc<"menu_items">[]
): Doc<"menu_items"> | null {
  const query = name.trim().toLowerCase();
  if (!query) return null;

  const exact = menu.find((item) => item.name.toLowerCase() === query)
  if (exact) return exact;

  const partial = menu.find(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      query.includes(item.name.toLowerCase())
  )
  return partial ?? null
}

export function validatePlan(
  plan: PlannerOutput,
  menu: Doc<"menu_items">[]
): ValidationResult {
  const valid: ValidatedAction[] = [];
  const rejected: RejectedAction[] = [];

  for (const action of plan.actions) {
    if (action.type === "clear") {
      valid.push({ type: "clear" })
      continue
    }

    if (!action.itemName) {
      rejected.push({ reason: `Missing item name for "${action.type}".` })
      continue
    }

    const item = findMenuItem(action.itemName, menu)
    if (!item) {
      rejected.push({ itemName: action.itemName, reason: "Not on the menu." })
      continue
    }

    const quantity = action.quantity ?? 1

    if (action.type === "add") {
      valid.push({
        type: "add",
        menuItemId: item._id,
        itemName: item.name,
        itemPrice: item.price,
        quantity,
      })
    } else {
      valid.push({
        type: "remove",
        menuItemId: item._id,
        itemName: item.name,
        quantity,
      })
    }
  }

  return { valid, rejected }
}
