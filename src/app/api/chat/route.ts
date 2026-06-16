import { mastra } from "@/mastra"
import { NextRequest } from "next/server"

export const runtime = "nodejs"

type ChatMessage = { role: "user" | "assistant"; content: string }

type AgentStreamChunk = {
  type: string
  payload?: {
    text?: string
    output?: { toolCalls?: unknown[] }
  }
}

function chatErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { error?: { message?: string } } }).data
    if (data?.error?.message) return data.error.message
  }
  if (err instanceof Error) return err.message
  return "Chat failed. Please try again."
}

/**
 * Use tools and THEN writes a clear answer without showing thinking logic.
 * 
 */
function createFinalAnswerStream(
  source: ReadableStream<AgentStreamChunk>
): ReadableStream<string> {
  let stepText = "";
  let lastTextOnlyStep = "";

  return new ReadableStream<string>({
    async start(controller) {
      const reader = source.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value.type === "reasoning-delta") {
            continue;
          }

          if (value.type === "text-delta" && value.payload?.text) {
            stepText += value.payload.text;
          } else if (value.type === "step-finish") {
            const toolCalls = value.payload?.output?.toolCalls;
            if (toolCalls && toolCalls.length > 0) {
              stepText = "";
              lastTextOnlyStep = "";
            } else if (stepText) {
              lastTextOnlyStep = stepText;
              stepText = "";
            }
          }
        }

        const finalAnswer = stepText || lastTextOnlyStep;
        if (finalAnswer) {
          controller.enqueue(finalAnswer);
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  })
}

function toAgentMessages(messages: ChatMessage[]): ChatMessage[] {
  const [first, ...rest] = messages;
  if (first?.role === "assistant") return rest;
  return messages;
}

export async function POST(req: NextRequest) {
  const { messages, sessionId }: {
    messages: ChatMessage[]
    sessionId: string
  } = await req.json();

  if (!sessionId?.trim()) {
    return new Response("Session not ready. Please try again.", { status: 400 })
  }

  try {
    const agent = mastra.getAgent("restaurantAgent");
    const agentMessages = toAgentMessages(messages);
    const stream = await agent.stream(
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
            ].join(" "),
          },
        ],
      }
    )

    const textStream = createFinalAnswerStream(
      stream.fullStream as ReadableStream<AgentStreamChunk>
    )

    return new Response(textStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (err) {
    const message = chatErrorMessage(err)
    const isRateLimit =
      message.includes("429") || message.toLowerCase().includes("rate")

    console.error("[chat]", message)

    return new Response(
      isRateLimit
        ? "The AI is busy (rate limit). Wait a moment and try again."
        : message,
      { status: isRateLimit ? 429 : 502 }
    )
  }
}
