import { mastra } from "@/mastra"
import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const { messages, sessionId }: {
    messages: { role: "user" | "assistant"; content: string }[]
    sessionId: string
  } = await req.json()

  // Use variable name not Id to call the agent
  const agent = mastra.getAgent("restaurantAgent")

  const stream = await agent.stream(messages[messages.length - 1].content, {
    memory: {
      thread: sessionId,
      resource: sessionId,
    },
  })

//TypeScript version mismatch between Mastra's types and Node's types
  return new Response(stream.textStream as unknown as BodyInit, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
