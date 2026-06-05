"use client"

import { useState } from "react"
import { MessageCircle, X, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"
import { useSessionId } from "@/hooks/useSessionId"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Ciao! 👋 I'm Slice, your PizzaTime assistant. I can help you explore the menu, check calories, manage your cart, and estimate wait times. What can I get you?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  // Generates a session ID for this browser session
  const sessionId = useSessionId();

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          sessionId,
        }),
      })

      if (!res.ok) throw new Error("Failed to get response")
      if (!res.body) throw new Error("No response body")

      // Bot Response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      }
      setMessages(prev => [...prev, assistantMessage])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        )
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again!",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed bottom-6 right-6 z-[100] flex size-14 cursor-pointer items-center justify-center rounded-full border-none bg-rosso text-crema",
          "shadow-[0_4px_20px_rgba(196,30,30,0.4)] transition-[transform,box-shadow] duration-200",
          "hover:scale-[1.08] hover:shadow-[0_6px_28px_rgba(196,30,30,0.5)]"
        )}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Open chat"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <div
        className={cn(
          "fixed bottom-20 right-6 z-[99] flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl bg-crema",
          "origin-bottom-right shadow-[0_8px_48px_rgba(0,0,0,0.35)] transition-[transform,opacity] duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-[0.85] opacity-0"
        )}
      >
        <div className="flex shrink-0 items-center justify-between bg-rosso px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-[34px] items-center justify-center rounded-full bg-crema/20">
              <ChefHat size={18} className="text-crema" />
            </div>
            <div>
              <h4 className="font-dmsans text-[0.9rem] font-semibold leading-tight text-crema">
                Slice
              </h4>
              <span className="font-dmsans text-[0.7rem] font-light text-crema/70">
                <span className="mr-1 inline-block size-1.5 align-middle rounded-full bg-green-400" />
                PizzaTime Assistant
              </span>
            </div>
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center justify-center rounded border-none bg-transparent p-0.5 text-crema/80 transition-colors hover:text-crema"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </>
  )
}