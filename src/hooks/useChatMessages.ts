import { useState, useEffect, useRef } from "react";
import { Message } from "@/components/chat/ChatWidget";

export function useChatMessages() {
    const initialized = useRef(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Ciao! 👋 I'm Slice, your PizzaTime assistant. I can help you explore the menu, check calories, manage your cart, and estimate wait times. What can I get you?",
        },
    ]);

    useEffect(() => {
        const sessionMessages = sessionStorage.getItem("pt-messages");
        if (sessionMessages) {
            const messageToObj: Message[] = JSON.parse(sessionMessages);
            setMessages(messageToObj);
        }
        initialized.current = true;
    }, [])

    useEffect(() => {
        if (!initialized.current) {
            return;
        } else {
            const messageToString: string = JSON.stringify(messages);
            sessionStorage.setItem("pt-messages", messageToString);
        }
    }, [messages])
    return { messages, setMessages }
}