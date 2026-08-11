"use client"

import { useState } from "react"
import { Header } from "./Header"
import { CartDrawer } from "../cart/CartDrawer"
import { ChatWidget } from "../chat/ChatWidget"
import { useCart } from "@/hooks/useCart"
import { Sheet } from "@/components/ui/sheet"

export function PageClient() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <Header cartCount={cartCount} />
      <CartDrawer />
      <ChatWidget isCartOpen={cartOpen} />
    </Sheet>
  )
}
