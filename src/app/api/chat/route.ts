import { mastra } from "@/mastra";
import type { MastraModelOutput } from "@mastra/core/stream";
import { fetchQuery } from "convex/nextjs";
import { NextRequest } from "next/server";
import { api } from "../../../../convex/_generated/api";
import { handleOrderMessage } from "@/lib/ordering/orchestrator";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

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

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function sanitizeCustomerReply(text: string): string {
  return text
    .replace(UUID_PATTERN, "")
    .replace(/\b(?:with your )?session\s*id\b[:\s\[]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

function stepsHadToolActivity(
  steps: Awaited<MastraModelOutput["steps"]>
): boolean {
  return steps.some(
    (step) =>
      (step.toolCalls?.length ?? 0) > 0 ||
      (step.toolResults?.length ?? 0) > 0
  );
}

async function getFinalAnswerText(
  output: MastraModelOutput,
): Promise<string> {
  await output.consumeStream();

  const steps = await output.steps;

  let candidate = "";
  for (let i = steps.length - 1; i >= 0; i--) {
    const text = steps[i].text?.trim();
    if (text && !isToolSyntaxLeak(text)) {
      candidate = text;
      break;
    }
  }

  if (!candidate) {
    const trimmed = (await output.text)?.trim() ?? "";
    if (trimmed && !isToolSyntaxLeak(trimmed)) candidate = trimmed;
  }

  if (!candidate) {
    if (steps.some((step) => isToolSyntaxLeak(step.text ?? ""))) {
      candidate = "I had trouble updating your order. Please try again.";
    } else if (stepsHadToolActivity(steps)) {
      candidate =
        "Sorry, I had trouble putting that together. What else can I help with?";
    }
  }

  if (!candidate) return "";

  return candidate;
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

function streamTextResponse(text: string): Response {
  const body = new ReadableStream<string>({
    start(controller) {
      controller.enqueue(text);
      controller.close();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// Restyles a pipeline cart outcome in Slice's voice. Falls back to the
// factual brief if narration fails, never invents cart state.
async function narrateOrderResult(
  factualBrief: string,
  agentMessages: ChatMessage[]
): Promise<string> {
  try {
    const agent = mastra.getAgent("restaurantAgent");
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
              "The ordering system already updated the cart. Do not call tools.",
              `Exact outcome (keep every item name and quantity unchanged): ${factualBrief}`,
              "Rewrite this for the customer in your Slice voice. One short reply (1-3 sentences).",
              "Do not invent items, quantities, or alternatives. If something was rejected, acknowledge it warmly.",
            ].join(" "),
          },
        ],
      }
    );

    const narrated = await getFinalAnswerText(output);
    if (!narrated || isToolSyntaxLeak(narrated)) return factualBrief;
    return narrated;
  } catch {
    return factualBrief;
  }
}

// Conversation path: advice, prices, calories, weather, personality.
// Cart mutations are handled by the ordering pipeline before this runs.
async function runChatAgent(
  agentMessages: ChatMessage[],
  sessionId: string,
): Promise<string> {
  const agent = mastra.getAgent("restaurantAgent");
  const cartContext = await formatCartContext(sessionId);
  const menu = await fetchQuery(api.menu.getAllMenuItems);
  const menuItemsList = menu.map(item => `${item.name} - ${item.description}`).join(", ");
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
            "The chat UI already greeted the customer with a welcome message. Do not greet or welcome them again.",
            "You do not change the cart — an ordering system handles adds, removes, and clears.",
            `Menu items: (only these exist): ${menuItemsList}`,
            cartContext,
          ].join(" "),
        },
      ],
    }
  );

  const answer = await getFinalAnswerText(output);

  return sanitizeCustomerReply(
    answer || "Sorry, I couldn't put together a response. Please try again."
  );
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
    const agentMessages = toAgentMessages(messages);
    const lastUserMessage =
      [...agentMessages].reverse().find((message) => message.role === "user")
        ?.content ?? "";
    const previousAssistantMessage =
      [...agentMessages].reverse().find((message) => message.role === "assistant")
        ?.content;

    // 1) Pipeline updates the cart; Slice narrates the factual outcome.
    if (lastUserMessage) {
      const orderResult = await handleOrderMessage(
        lastUserMessage,
        sessionId,
        previousAssistantMessage
      );
      if (orderResult.intent === "order") {
        const narrated = await narrateOrderResult(
          orderResult.reply,
          agentMessages
        );
        return streamTextResponse(sanitizeCustomerReply(orderResult.reply));
      }
    }

    // 2) Not a cart action → let the restaurant agent converse.
    const text = await runChatAgent(agentMessages, sessionId);
    return streamTextResponse(text);
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
