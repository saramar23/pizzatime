"use client"

import { useState } from "react"
import { Header } from "./Header"
import { CartDrawer } from "../cart/CartDrawer"
import { ChatWidget } from "../chat/ChatWidget"
import { useCart } from "@/hooks/useCart"

export function PageClient() {
  // Cart here or in Nav?
  const [ cartOpen, setCartOpen ] = useState(false);
  const { cartCount } = useCart();
  
  return (
    <>
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)} 
      />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
      <ChatWidget />
    </>
  )
}