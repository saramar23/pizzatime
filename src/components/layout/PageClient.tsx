"use client"

import { useState } from "react"
import { Header } from "./Header"
import { CartDrawer } from "../cart/CartDrawer"
import { ChatWidget } from "../chat/ChatWidget"
import { useSessionId } from "@/hooks/useSessionId"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

export function PageClient() {
  const [cartOpen, setCartOpen] = useState(false)
  const sessionId = useSessionId()
  const cartItems = useQuery(api.cart.getCart, sessionId ? { sessionId } : "skip")
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ChatWidget />
    </>
  )
}