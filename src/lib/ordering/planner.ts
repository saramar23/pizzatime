import { z } from 'zod'
import { plannerAgent } from '@/mastra/agents/planner-agent';

const INTENT_ENUM = ["order", "chat"] as const;
const ACTION_TYPE_ENUM = ["add", "remove", "clear"] as const;

const plannerSchema = z.object({
    intent: z.enum(INTENT_ENUM).describe("Order if they want to change the cart, chat otherwise."),
    actions: z.array(z.object({
        type: z.enum(ACTION_TYPE_ENUM),
        itemName: z.optional(z.string().describe("Best guess at a real menu item name.")),
        quantity: z.optional(z.number().int().positive())
    })).describe("One entry per item the customer mentioned. Empty when intent is chat.")
})

export type PlannerOutput = z.infer<typeof plannerSchema>;

/*  IMPORTANT: Discriminated union instead of optional is better, but free models have a hard time with union types. 
*  They handle simple objects better.
*  I'll use optional for now.
*/

// The free model occasionally returns no object at all. Retry a few times
// before giving up, since a repeat call usually succeeds.
const MAX_ATTEMPTS = 3;

export async function planOrder(
    userMessage: string,
    menuSummary: string,
    cartSummary: string,
    previousAssistantMessage?: string
): Promise<PlannerOutput> {
    const prior = previousAssistantMessage?.trim()
        ? `\nPrevious assistant message: "${previousAssistantMessage.trim()}"`
        : "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const response = await plannerAgent.generate(
                `Menu items available: ${menuSummary}\n${cartSummary}${prior}\n\nCustomer message: "${userMessage}"`,
                {
                    structuredOutput: {
                        schema: plannerSchema,
                        // Free model may not support the response_format API, so inject the
                        // schema into the prompt instead. Less strict, but works more widely.
                        jsonPromptInjection: true,
                    },
                }
            );

            return plannerSchema.parse(response.object);
        } catch {
            console.warn(
                `[planner] Failed to get a valid order plan (attempt ${attempt}/${MAX_ATTEMPTS}).`
            );
        }
    }
    throw new Error("Couldn't get a valid order plan. Try again.");
}
