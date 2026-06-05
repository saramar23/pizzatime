import { ChatWidget } from "@/components/chat/ChatWidget";
import { MenuGrid } from "@/components/menu/MenuGrid";

export default function Home() {

    return (
        <main>
            <MenuGrid />
            <ChatWidget />
        </main>
    )
}