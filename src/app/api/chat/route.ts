import { mastra } from "@/mastra";
import type { MastraModelOutput } from "@mastra/core/stream";
import { fetchQuery } from "convex/nextjs";
import { NextRequest } from "next/server";
import { api } from "../../../../convex/_generated/api";
export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

type CartLine = { itemName: string; quantity: number; itemPrice?: number };

type CartToolPayload =
  | { success?: boolean; cart?: CartLine[] }
  | CartLine[];

function chatErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { error?: { message?: string } } }).data;
    if (data?.error?.message) return data.error.message;
  }
  if (err instanceof Error) return err.message;
  return "Chat failed. Please try again.";
}

function isToolSyntaxLeak(text: string): boolean {
  return (
    /<\|tool_call/i.test(text) ||
    /<tool_call/i.test(text) ||
    /tool_call\|>/i.test(text) ||
    /call:\w+\{/.test(text)
  );
}

function formatCartLines(cart: CartLine[]): string {
  if (cart.length === 0) return "Your cart is empty. What would you like?";
  const items = cart.map((i) => `${i.quantity}x ${i.itemName}`).join(", ");
  return `Done! Your cart now has: ${items}. Anything else?`;
}

function cartLinesFromPayload(payload: CartToolPayload): CartLine[] | null {
  if (Array.isArray(payload)) return payload;
  if (payload.cart?.length) return payload.cart;
  return null;
}

function cartFromToolResults(
  steps: Awaited<MastraModelOutput["steps"]>
): string | null {
  for (let i = steps.length - 1; i >= 0; i--) {
    for (const toolResult of steps[i].toolResults ?? []) {
      const payload = toolResult.payload?.result as CartToolPayload | undefined;
      if (!payload) continue;

      const lines = cartLinesFromPayload(payload);
      if (lines) return formatCartLines(lines);
    }
  }
  return null;
}

async function getFinalAnswerText(output: MastraModelOutput): Promise<string> {
  await output.consumeStream();

  const steps = await output.steps;
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    const text = step.text?.trim();
    if (!text || isToolSyntaxLeak(text)) continue;
    if (!step.toolCalls?.length) return text;
  }

  const fromTools = cartFromToolResults(steps);
  if (fromTools) return fromTools;

  const text = await output.text;
  const trimmed = text?.trim() ?? "";
  if (trimmed && !isToolSyntaxLeak(trimmed)) return trimmed;

  const leakedToolSyntax = steps.some((step) =>
    isToolSyntaxLeak(step.text ?? "")
  );
  if (leakedToolSyntax) {
    return "I had trouble updating your order. Please try again.";
  }

  return "";
}

function toAgentMessages(messages: ChatMessage[]): ChatMessage[] {
  const [first, ...rest] = messages;
  if (first?.role === "assistant") return rest;
  return messages;
}

async function formatCartContext(sessionId: string): Promise<string> {
  const cart = await fetchQuery(api.cart.getCart, { sessionId });
  if (cart.length === 0) {
    return "Current cart: empty.";
  }
  const lines = cart.map(
    (item) =>
      `${item.quantity}x ${item.itemName} ($${item.itemPrice} each)`
  );
  const total = cart.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );
  return `Current cart: ${lines.join(", ")}. Cart total: $${total}. When adding items, this is what is already in the cart — additions stack on top unless the customer wants to replace their order.`;
}

export async function POST(req: NextRequest) {
  const { messages, sessionId }: {
    messages: ChatMessage[];
    sessionId: string;
  } = await req.json();

  if (!sessionId?.trim()) {
    return new Response("Session not ready. Please try again.", { status: 400 });
  }

  try {
    const agent = mastra.getAgent("restaurantAgent");
    const agentMessages = toAgentMessages(messages);
    const cartContext = await formatCartContext(sessionId);
    const output = await agent.stream(
      agentMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        context: [
          {
            role: "system" as const,
            content: [
              `Customer sessionId: ${sessionId}. Use this for all cart and order tools. Never ask the customer for it.`,
              "The chat UI already greeted the customer with a welcome message. Do not greet or welcome them again.",
              cartContext,
            ].join(" "),
          },
        ],
      }
    );

    const answer = await getFinalAnswerText(output);
    const text =
      answer || "Sorry, I couldn't put together a response. Please try again.";

    const body = new ReadableStream<string>({
      start(controller) {
        controller.enqueue(text);
        controller.close();
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    const message = chatErrorMessage(err);
    const isRateLimit =
      message.includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("rate");

    console.error("[chat]", message);

    return new Response(
      isRateLimit
        ? "I'm temporarily unavailable (API rate limit). Try again later."
        : message,
      { status: isRateLimit ? 429 : 502 }
    );
  }
}
