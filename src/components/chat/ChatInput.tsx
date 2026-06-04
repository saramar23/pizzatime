"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!value.trim() || isLoading) return
    onSend(value.trim())
    setValue("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="shrink-0 bg-crema">
      <div className="flex items-end gap-2.5 border-t border-black/7 px-4 py-3">
        <textarea
          ref={inputRef}
          className="max-h-[100px] flex-1 resize-none overflow-y-auto rounded-[10px] border border-black/12 bg-white px-[0.8rem] py-[0.6rem] font-dmsans text-[0.83rem] leading-normal text-carbone outline-none transition-[border-color] duration-150 placeholder:text-carbone/35 focus:border-rosso disabled:opacity-60"
          placeholder="Ask me anything about the menu..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button
          type="button"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-rosso text-crema transition-[background,transform] duration-150 enabled:hover:bg-rosso-dark enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-rosso/35"
          onClick={handleSend}
          disabled={isLoading || !value.trim()}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
      <p className="bg-crema pb-1.5 text-center font-dmsans text-[0.65rem] text-carbone/30">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
