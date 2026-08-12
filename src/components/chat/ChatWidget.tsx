"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog } from "radix-ui"
import { MessageCircle, X, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"
import { useSessionId } from "@/hooks/useSessionId"
import { useChatMessages } from "@/hooks/useChatMessages"
import { useMediaQuery } from "@/hooks/useMediaQuery"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatWidget({ isCartOpen = false }: { isCartOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, setMessages, isHydrated } = useChatMessages();
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useSessionId();
  const notificationReady = useRef(false);
  const [notificationCount, setNotificationCount] = useState(0);
  // The panel only covers the whole screen on small viewports, so it is a modal
  // dialog there and a non-modal companion panel on desktop.
  const isDesktop = useMediaQuery("(min-width: 48rem)");

  // One modal at a time: cart owns the screen, so chat must close and leave the tree.
  useEffect(() => {
    if (isCartOpen) {
      setIsOpen(false);
    }
  }, [isCartOpen]);

  // Skip until saved messages are restored, then skip that restore once.
  // After that, only a new `messages` update can bump the badge.
  useEffect(() => {
    if (!isHydrated) return;

    if (!notificationReady.current) {
      notificationReady.current = true;
      return;
    }

    const lastMessage = messages.at(-1)?.role === "assistant";
    if (lastMessage && !isOpen) {
      setNotificationCount(count => count + 1);
    }
  }, [messages, isHydrated])

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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) return;

    setNotificationCount(0);
    if (messages.length === 1 && sessionId) {
      weatherRecommendation();
    }
  }

  const triggerLabel = isOpen
    ? "Close chat"
    : notificationCount > 0
      ? `Open chat, ${notificationCount} new message${notificationCount > 1 ? "s" : ""}`
      : "Open chat"

  const notificationStatus =
    !isOpen && notificationCount > 0
      ? `${notificationCount} new message${notificationCount > 1 ? "s" : ""} from Slice`
      : ""

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {notificationStatus}
      </div>
      {!isCartOpen && (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange} modal={!isDesktop}>
      <div className="fixed bottom-10 right-4 z-[98]">
        <Dialog.Trigger asChild>
          <Button
            type="button"
            size="icon-lg"
            className={cn(
              "relative size-12 rounded-full border-none bg-rosso text-crema",
              "shadow-[0_4px_20px_color-mix(in_srgb,var(--rosso)_40%,transparent)] transition-[transform,box-shadow] duration-200",
              "hover:scale-[1.08] hover:bg-rosso-dark hover:shadow-[0_6px_28px_color-mix(in_srgb,var(--rosso)_50%,transparent)]"
            )}
            aria-label={triggerLabel}
          >
            {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
          </Button>
        </Dialog.Trigger>
        {
          notificationCount > 0 && (
            <span aria-hidden="true" className="absolute text-center text-sm -top-1 -right-1 bg-verde text-crema rounded-full size-5">{notificationCount}</span>
          )
        }
      </div>

      <Dialog.Portal>
        {!isDesktop && (
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-[98] bg-carbone/40",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
            )}
          />
        )}
        <Dialog.Content
          // On desktop the chat is non-modal, so clicking the page must not close it.
          onInteractOutside={event => {
            if (isDesktop) event.preventDefault();
          }}
          className={cn(
            "fixed w-full h-[80dvh] bottom-0 right-0 z-[99] md:w-100 md:h-120 md:bottom-20 md:right-10 flex flex-col overflow-hidden rounded-2xl bg-crema pb-[env(safe-area-inset-bottom,_16px)]",
            "origin-bottom-right shadow-[0_8px_48px_color-mix(in_srgb,var(--carbone)_35%,transparent)] duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-90"
          )}
        >
          <div className="flex shrink-0 items-center justify-between bg-rosso px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-[34px] items-center justify-center rounded-full bg-crema/20">
                <ChefHat size={18} className="text-crema" aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="font-dmsans text-[0.9rem] font-semibold leading-tight text-crema">
                  Slice
                </Dialog.Title>
                <Dialog.Description className="font-dmsans text-[0.7rem] font-light text-crema/70">
                  <span className="mr-1 inline-block size-1.5 align-middle rounded-full bg-verde" aria-hidden="true" />
                  PizzaTime Assistant
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-crema/80 hover:bg-crema/20 hover:text-crema"
              >
                <X size={18} aria-hidden="true" />
                <span className="sr-only">Close chat</span>
              </Button>
            </Dialog.Close>
          </div>

          <ChatMessages messages={messages} isLoading={isLoading} />

          <ChatInput onSend={sendMessage} isLoading={isLoading || !sessionId} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
      )}
    </>
  )
}
