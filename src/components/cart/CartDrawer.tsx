"use client"

import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useSessionId } from "@/hooks/useSessionId"
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel"
import { useCart } from "@/hooks/useCart"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const sessionId = useSessionId()
  const cartItems = useQuery(api.cart.getCart, sessionId ? { sessionId } : "skip")
  const { handleAdd, handleRemove, handleClear } = useCart();

  const total = cartItems?.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity, 0
  ) ?? 0

  const totalItems = cartItems?.reduce(
    (sum, item) => sum + item.quantity, 0
  ) ?? 0

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-[#FAF6EE] z-50
        transform transition-transform duration-300 ease-in-out
        flex flex-col shadow-2xl
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Header */}
        <div className="bg-[#C41E1E] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} color="#FAF6EE" />
            <h2 className="text-[#FAF6EE] font-semibold text-base">
              Your Cart {totalItems > 0 && `(${totalItems})`}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#FAF6EE]/80 hover:text-[#FAF6EE] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!sessionId || !cartItems ? (
            <p className="text-[#1A1008]/40 text-sm text-center mt-8">Loading cart...</p>
          ) : cartItems.length === 0 ? (
            <div className="text-center mt-12">
              <ShoppingCart size={40} className="mx-auto text-[#1A1008]/20 mb-3" />
              <p className="text-[#1A1008]/40 text-sm">Your cart is empty</p>
              <p className="text-[#1A1008]/30 text-xs mt-1">Ask Slice to add something!</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item._id}
                className="bg-white rounded-xl p-3 shadow-sm border border-black/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1008] font-medium text-sm truncate">{item.itemName}</p>
                    <p className="text-[#C9973A] text-sm font-medium mt-0.5">
                      ${item.itemPrice.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.menuItemId, item.quantity)}
                    className="text-[#1A1008]/30 hover:text-[#C41E1E] transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(item.menuItemId, 1)}
                      className="w-6 h-6 rounded-full bg-[#1A1008]/08 flex items-center justify-center hover:bg-[#C41E1E]/10 transition-colors"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-[#1A1008] text-sm font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      className="w-6 h-6 rounded-full bg-[#1A1008]/08 flex items-center justify-center hover:bg-[#C41E1E]/10 transition-colors"
                      onClick={() => handleAdd(item.menuItemId, + 1, item.itemName, item.itemPrice)}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <p className="text-[#1A1008] font-semibold text-sm">
                    ${(item.itemPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems && cartItems.length > 0 && (
          <div className="border-t border-black/08 px-4 py-4 space-y-3 flex-shrink-0 bg-[#FAF6EE]">
            <div className="flex items-center justify-between">
              <span className="text-[#1A1008]/60 text-sm">Subtotal</span>
              <span className="text-[#1A1008] font-bold text-lg">${total.toFixed(2)}</span>
            </div>

            <button
              className="w-full bg-[#C41E1E] text-[#FAF6EE] rounded-xl py-3 font-semibold text-sm hover:bg-[#8B0000] transition-colors"
            >
              Place Order
            </button>

            <button
              onClick={handleClear}
              className="w-full text-[#1A1008]/40 text-xs hover:text-[#C41E1E] transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}