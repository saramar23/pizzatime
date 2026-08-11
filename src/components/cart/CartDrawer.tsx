"use client"

import { useSessionId } from "@/hooks/useSessionId"
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function CartDrawer() {

  const sessionId = useSessionId();
  const { handleAdd, handleRemove, handleClear, cartItems, cartCount, subtotal } = useCart();

  return (
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 bg-crema text-carbone data-[side=right]:w-80"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between gap-2 bg-rosso px-5 py-4 text-crema">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} aria-hidden="true" />
            <SheetTitle className="font-dmsans text-base font-semibold text-crema">
              Your Cart {cartCount > 0 && `(${cartCount})`}
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Review the items in your cart, change quantities, and continue to checkout.
          </SheetDescription>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-crema/80 hover:bg-crema/10 hover:text-crema"
            >
              <X size={20} aria-hidden="true" />
              <span className="sr-only">Close cart</span>
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!sessionId || !cartItems ? (
            <p className="text-carbone/40 text-sm text-center mt-8" role="status" aria-live="polite">
              Loading cart...
            </p>
          ) : cartItems.length === 0 ? (
            <div className="text-center mt-12">
              <ShoppingCart size={40} className="mx-auto text-carbone/20 mb-3" aria-hidden="true" />
              <p className="text-carbone/40 text-sm">Your cart is empty</p>
              <p className="text-carbone/30 text-xs mt-1">Ask Slice to add something!</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item._id}
                className="rounded-xl border border-carbone/5 bg-crema p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-carbone font-medium text-sm truncate">{item.itemName}</p>
                    <p className="text-gold text-sm font-medium mt-0.5">
                      ${item.itemPrice} each
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(item.menuItemId, item.quantity)}
                    className="shrink-0 text-carbone/30 hover:bg-rosso/10 hover:text-rosso"
                    aria-label={`Remove ${item.itemName} from cart`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </Button>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemove(item.menuItemId, 1)}
                      className="rounded-full text-carbone hover:bg-rosso/10"
                      aria-label={`Decrease quantity of ${item.itemName}`}
                    >
                      <Minus size={14} aria-hidden="true" />
                    </Button>
                    <span className="text-carbone text-sm font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-full bg-carbone/10 text-carbone hover:bg-verde/20"
                      onClick={() => handleAdd(item.menuItemId, + 1, item.itemName, item.itemPrice)}
                      aria-label={`Increase quantity of ${item.itemName}`}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="text-carbone font-semibold text-sm">
                    ${(item.itemPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems && cartItems.length > 0 && (
          <SheetFooter className="gap-3 border-t border-carbone/10 bg-crema px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-carbone/60 text-sm">Subtotal</span>
              <span className="text-carbone font-bold text-lg">${subtotal}</span>
            </div>
            <SheetClose asChild>
              <Button
                asChild
                className="h-auto w-full rounded-xl bg-rosso py-3 text-sm font-semibold text-crema hover:bg-rosso-dark"
              >
                <Link href="/checkout">
                  Checkout
                </Link>
              </Button>
            </SheetClose>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full text-xs text-carbone/40 hover:bg-transparent hover:text-rosso"
            >
              Clear cart
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
  )
}
