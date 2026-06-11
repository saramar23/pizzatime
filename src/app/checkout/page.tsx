"use client"

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Checkout() {
    const { cartItems, subtotal } = useCart();

    return (
        <>
            {cartItems === undefined ?
                (
                    <div className="flex flex-col items-center justify-center text-gold mx-auto max-w-md px-4 py-12 space-y-3">
                        <p className="text-xl" role="status" aria-live="polite">Loading cart...</p>
                        <Loader2 size={36} className="animate-spin" aria-hidden="true" />
                    </div>
                ) : cartItems.length === 0 ?
                    (
                        <div className="flex flex-col items-center justify-center mx-auto max-w-md px-4 py-12 space-y-3">
                            <h2 className="text-3xl mb-6 font-bold uppercase">Cart</h2>
                            <p>Your cart is empty.</p>
                            <Link href="/" className="bg-rosso p-2 rounded">Order here</Link>
                        </div>
                    ) :
                    (
                        <div className="p-2">
                            <div className="mx-auto max-w-md px-4 py-12">
                                <h1 className="font-playfair text-2xl font-bold text-crema mb-6">Order Summary</h1>
                                <ul className="space-y-3">
                                    {cartItems.map(item => (
                                        <li key={item._id} className="flex items-center justify-between bg-crema/10 rounded-xl px-4 py-3">
                                            <div>
                                                <p className="text-crema font-medium text-sm">{item.itemName}</p>
                                                <p className="text-crema text-sm">x{item.quantity}</p>
                                            </div>
                                            <p className="text-gold font-semibold text-sm">${(item.itemPrice * item.quantity).toFixed(2)}</p>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center justify-between bg-crema rounded-xl px-4 py-3 my-3">
                                    <span className="text-carbone font-bold text-lg">Subtotal</span>
                                    <span className="text-carbone font-bold text-lg">${subtotal.toFixed(2)}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="default"
                                    className="w-full h-12 bg-rosso text-crema rounded-xl py-3 font-semibold text-md hover:bg-rosso-dark transition-colors"
                                >
                                    Place order
                                </Button>
                            </div>
                        </div>
                    )
                }
        </>
    )
}