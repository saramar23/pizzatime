"use client"

import { useSessionId } from "@/hooks/useSessionId"
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import Link from "next/link"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {

  const sessionId = useSessionId();
  const { handleAdd, handleRemove, handleClear, cartItems, cartCount, subtotal } = useCart();

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
        fixed top-0 right-0 h-full w-80 bg-crema z-50
        transform transition-transform duration-300 ease-in-out
        flex flex-col shadow-2xl
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Header */}
        <div className="bg-rosso px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h2 className="font-semibold text-base">
              Your Cart {cartCount > 0 && `(${cartCount})`}
            </h2>
          </div>
          <button onClick={onClose} className="text-crema/80 hover:text-crema transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!sessionId || !cartItems ? (
            <p className="text-carbone/40 text-sm text-center mt-8">Loading cart...</p>
          ) : cartItems.length === 0 ? (
            <div className="text-center mt-12">
              <ShoppingCart size={40} className="mx-auto text-carbone/20 mb-3" />
              <p className="text-carbone/40 text-sm">Your cart is empty</p>
              <p className="text-carbone/30 text-xs mt-1">Ask Slice to add something!</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item._id}
                className="bg-white rounded-xl p-3 shadow-sm border border-black/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-carbone font-medium text-sm truncate">{item.itemName}</p>
                    <p className="text-gold text-sm font-medium mt-0.5">
                      ${item.itemPrice.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.menuItemId, item.quantity)}
                    className="text-carbone/30 hover:text-rosso transition-colors flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(item.menuItemId, 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-rosso/10 transition-colors"
                    >
                      <Minus size={14} className="text-black rounded rounded-full" />
                    </button>
                    <span className="text-carbone text-sm font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      className="w-6 h-6 rounded-full bg-carbone/08 flex items-center justify-center hover:bg-rosso/10 transition-colors"
                      onClick={() => handleAdd(item.menuItemId, + 1, item.itemName, item.itemPrice)}
                    >
                      <Plus size={14} className="text-black rounded rounded-full" />
                    </button>
                  </div>
                  <p className="text-carbone font-semibold text-sm">
                    ${(item.itemPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems && cartItems.length > 0 && (
          <div className="border-t border-black/08 px-4 py-4 space-y-3 flex-shrink-0 bg-crema">
            <div className="flex items-center justify-between">
              <span className="text-carbone/60 text-sm">Subtotal</span>
              <span className="text-carbone font-bold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <Link href={"/checkout"}
              className="py-3 block text-center w-full bg-rosso text-crema rounded-xl font-semibold text-sm hover:bg-rosso-dark transition-colors"
              onClick={onClose}
            >
              Checkout
            </Link>
            <button
              onClick={handleClear}
              className="w-full text-carbone/40 text-xs hover:text-rosso transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}