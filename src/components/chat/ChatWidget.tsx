"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"
import { useSessionId } from "@/hooks/useSessionId"
import { useChatMessages } from "@/hooks/useChatMessages"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, setMessages } = useChatMessages();
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useSessionId();
  const notificationReady = useRef(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // If not ready" = "if still on first run."
  useEffect(() => {
    if (!notificationReady.current) {
      notificationReady.current = true;
      return;
    }

    const lastMessage = messages.at(-1)?.role === "assistant";
    if (lastMessage && !isOpen) {
      setNotificationCount(count => count + 1);
    }
  }, [messages])

  const weatherRecommendation = async () => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages,
          isWeatherRequest: true
        }),
      })

      if (!res.ok) {
        throw new Error("Error fetching message.");
      }

      if (!res.body) {
        throw new Error("Response body not available.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessageId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (!assistantMessageId) {
          assistantMessageId = crypto.randomUUID();
          const id = assistantMessageId
          setMessages(prev => [
            ...prev,
            { id, role: "assistant", content: chunk },
          ])
        } else {
          const id = assistantMessageId
          setMessages(prev =>
            prev.map(msg =>
              msg.id === id ? { ...msg, content: msg.content + chunk } : msg
            )
          )
        }
      }
    }
    catch (error) {
      console.error("Error fetching weather recommendation message.");
    }
    finally {
      setIsLoading(false);
    }

  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          sessionId,
        }),
      })

      if (!res.ok) {
        const errorText = (await res.text()).trim();
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              errorText ||
              (res.status === 429
                ? "I'm temporarily unavailable (API rate limit). Try again later."
                : "Sorry, something went wrong. Please try again!"),
          },
        ])
        return
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (!assistantMessageId) {
          assistantMessageId = crypto.randomUUID();
          const id = assistantMessageId
          setMessages(prev => [
            ...prev,
            { id, role: "assistant", content: chunk },
          ])
        } else {
          const id = assistantMessageId
          setMessages(prev =>
            prev.map(msg =>
              msg.id === id ? { ...msg, content: msg.content + chunk } : msg
            )
          )
        }
      }

      if (!assistantMessageId) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, I didn't get a response. Please try again.",
          },
        ])
      }
    } catch {
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

  const handleChatToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(prev => !prev);
    setNotificationCount(0);
    if (!isOpen && messages.length === 1 && sessionId) {
      weatherRecommendation();
    }
  }

  return (
    <>
      <div className="fixed bottom-10 right-4 z-[98]">
        <button
          type="button"
          className={cn(
            "relative flex size-12 cursor-pointer items-center justify-center rounded-full border-none bg-rosso text-crema",
            "shadow-[0_4px_20px_rgba(196,30,30,0.4)] transition-[transform,box-shadow] duration-200",
            "hover:scale-[1.08] hover:shadow-[0_6px_28px_rgba(196,30,30,0.5)]"
          )}
          onClick={handleChatToggle}
          aria-label="Open chat"
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
        {
          notificationCount > 0 && (
            <span className="absolute text-center text-sm -top-1 -right-1 bg-verde text-crema rounded-full size-5">{notificationCount}</span>
          )
        }
      </div>
      <div
        className={cn(
          "fixed w-full h-[80dvh] bottom-0 right-0 z-[99] md:w-100 md:h-120 md:bottom-20 md:right-10 flex flex-col overflow-hidden rounded-2xl bg-crema pb-[env(safe-area-inset-bottom,_16px)]",
          "origin-bottom-right shadow-[0_8px_48px_rgba(0,0,0,0.35)] transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
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

        <ChatMessages messages={messages} isLoading={isLoading} />

        <ChatInput onSend={sendMessage} isLoading={isLoading || !sessionId} />
      </div>
    </>
  )
}
