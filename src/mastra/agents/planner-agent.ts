import { createOpenAI } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent'

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
});

const openRouterModel =
    process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free';

// Same OpenRouter setup as the restaurant agent, but this agent has NO tools.
// Tools + structured output are unreliable on weak/free models (see Mastra docs),
// so the planner only reads text and returns the structured plan.

export const plannerAgent = new Agent({
    id: 'order-planner',
    name: 'Order Planner',
    instructions:
        `You convert a customer message into a structured cart plan for a pizza restaurant.

    Rules:
    - "intent" is "order" ONLY if the customer wants to change the cart (add/remove/clear). Otherwise "chat".
    - For every item the customer mentions, add one entry to "actions".
    - "type" is "add", "remove", or "clear".
    - "clear" removes everything: no itemName or quantity needed.
    - "itemName": if the customer clearly refers to a menu item, use that item's EXACT name from the menu list. If what they ask for is NOT on the menu, copy their own wording verbatim — do NOT substitute a different menu item. It is better to name a non-existent item (which gets rejected) than to swap in the wrong real one.
    - If quantity is not stated for an add/remove, use 1.
    - "changed my mind, I want X instead" means: clear (or remove old items) THEN add X — include BOTH actions.
    - Short confirmations ("sure", "yes", "ok", "the second one", "add that"): use the previous assistant message to resolve which item. Only set intent "order" if that message offered to add a specific menu item (or asked which of named items to add). If it was only info (wait time, calories, recommendations without an add offer), set intent "chat".
    - If it's just a question, greeting, or comment, set intent "chat" and return an empty actions array.
    - When the customer message includes both a number and an item name (e.g. "2 moretti", "3 margherita"), the number is always quantity, never a list position. Only use the previous assistant message to resolve bare confirmations with no item name ("yes", "the second one", "that one").
    `,
    model: openrouter.chat(openRouterModel),
});
