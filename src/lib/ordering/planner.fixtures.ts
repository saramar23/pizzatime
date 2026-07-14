import type { PlannerOutput } from "./planner"

// Real planner outputs to build/test the validator, executor, and reply WITHOUT calling the AI.
export const PLANNER_FIXTURES: { message: string; plan: PlannerOutput }[] = [
  {
    message: "2 margherita and 2 peroni",
    plan: {
      intent: "order",
      actions: [
        { type: "add", itemName: "Margherita", quantity: 2 },
        { type: "add", itemName: "Peroni Nastro Azzurro", quantity: 2 },
      ],
    },
  },
  {
    message: "i changed my mind, i just want 1 big slice instead",
    plan: {
      intent: "order",
      actions: [
        { type: "clear" },
        { type: "add", itemName: "The Big Slice", quantity: 1 },
      ],
    },
  },
  {
    message: "how many calories are in the margherita?",
    plan: {
      intent: "chat",
      actions: [],
    },
  },
  {
    message: "i don't want anything anymore",
    plan: {
      intent: "order",
      actions: [{ type: "clear" }],
    },
  },
  {
    message: "add a big slice",
    plan: {
      intent: "order",
      actions: [{ type: "add", itemName: "big slice", quantity: 1 }],
    },
  },
  {
    message: "remove one margherita",
    plan: {
      intent: "order",
      actions: [{ type: "remove", itemName: "Margherita", quantity: 1 }],
    },
  },
  {
    message: "add a chicken pizza",  // not on menu
    plan: {
      intent: "order",
      actions: [{ type: "add", itemName: "Chicken Pizza", quantity: 1 }],
    },
  },
]
