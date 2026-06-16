"use client"

import { useEffect, useRef } from "react"
import type { Message } from "./ChatWidget"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown';

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-3 overflow-y-auto bg-crema p-4",
        "[scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.1)_transparent]"
      )}
    >
      {messages.map(msg => {
        if (msg.role === "assistant" && !msg.content.trim()) return null

        return (
        <div
          key={msg.id}
          className={cn(
            "flex items-end gap-2",
            msg.role === "user" && "flex-row-reverse"
          )}
        >
          <div
            className={cn(
              "max-w-[78%] break-words rounded-[14px] px-[0.9rem] py-[0.65rem] font-dmsans text-[0.83rem] leading-[1.55]",
              msg.role === "assistant" &&
                "rounded-bl-[4px] bg-white text-carbone shadow-[0_1px_4px_rgba(0,0,0,0.07)]",
              msg.role === "user" && "rounded-br-[4px] bg-rosso text-crema"
            )}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>
        )
      })}

      {isLoading && (
        <div className="flex items-end gap-2">
          <div className="flex w-fit items-center gap-1 rounded-[14px] rounded-bl-[4px] bg-white px-[0.9rem] py-[0.65rem] shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
            <div className="size-1.5 animate-bounce rounded-full bg-rosso opacity-40" />
            <div className="size-1.5 animate-bounce rounded-full bg-rosso opacity-40 [animation-delay:200ms]" />
            <div className="size-1.5 animate-bounce rounded-full bg-rosso opacity-40 [animation-delay:400ms]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
