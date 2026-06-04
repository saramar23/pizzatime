import { mastra } from "@/mastra"
import { NextRequest } from "next/server"

export const runtime = "nodejs"

function chatErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { error?: { message?: string } } }).data
    if (data?.error?.message) return data.error.message
  }
  if (err instanceof Error) return err.message
  return "Chat failed. Please try again."
}

export async function POST(req: NextRequest) {
  const { messages, sessionId }: {
    messages: { role: "user" | "assistant"; content: string }[]
    sessionId: string
  } = await req.json()

  try {
    const agent = mastra.getAgent("restaurantAgent")
    const stream = await agent.stream(
      messages[messages.length - 1].content,
      {
        context: [
          {
            role: "system" as const,
            content: `The customer's sessionId is: ${sessionId}. Always use this sessionId for cart and order tools. Never ask the customer for it.`
          }
        ]
      }
    )

    return new Response(stream.textStream as unknown as BodyInit, {
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
