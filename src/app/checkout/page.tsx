"use client"

import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useSessionId } from "@/hooks/useSessionId";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Loader2, Pizza } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

type CheckoutStep = "summary" | "processing" | "confirmed";

export default function Checkout() {
    const { cartItems, subtotal, handleClear } = useCart();
    const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("summary");
    const sessionId = useSessionId();
    const createOrder = useMutation(api.orders.createOrder);
    const [error, setError] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<number | null>(null);
    const [confirmedWaitMinutes, setConfirmedWaitMinutes] = useState<number | null>(null);

    const waitItems =
        cartItems?.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
        })
    ) ?? [];

    const estimatedWaitMinutes = useQuery(
        api.orders.getEstimatedWaitMinutes,
        cartItems ? { items: waitItems } : "skip"
    );

    const handlePlaceOrder = async () => {
        setError(null);
        if (!sessionId || cartItems === undefined || cartItems.length === 0) return;
        if (estimatedWaitMinutes === undefined) return;
        setCheckoutStep("processing");
        const items = cartItems.map(item => {
            return {
                menuItemId: item.menuItemId,
                name: item.itemName,
                quantity: item.quantity,
                priceEach: item.itemPrice
            }
        })

        try {
            const result = await createOrder({
                items,
                sessionId,
                subtotal,
                estimatedWaitMinutes
            })
            setOrderNumber(result.orderNumber);
            setConfirmedWaitMinutes(result.estimatedWaitMinutes);
            handleClear();
            setCheckoutStep("confirmed");
        } catch (err: unknown) {
            setError("Oops, something went wrong. Couldn't place your order. Please try again.");
            setCheckoutStep("summary");
        }
    }

    // Loading cart
    if (!sessionId || cartItems === undefined) return (
        <CheckoutShell>
            <div className="flex flex-col justify-center items-center px-4 py-12">
                <p className="text-xl" role="status" aria-live="polite">Loading cart...</p>
                <Loader2 size={22} className="animate-spin" aria-hidden="true" />
            </div>
        </CheckoutShell>
    )

    // Processing order
    if (checkoutStep === "processing") return (
        <CheckoutShell>
            <div className="flex flex-col justify-center items-center space-y-3" role="status" aria-live="polite">
                <h2 className="text-xl font-bold">In progress</h2>
                <p>Processing your order...</p>
                <Loader2 size={22} className="animate-spin" aria-hidden="true" />
            </div>
        </CheckoutShell>
    )

    // Order confirmed
    if (checkoutStep === "confirmed") return (
        <CheckoutShell>
            <div className="flex flex-col justify-center items-center" role="status" aria-live="polite">
                <h2 className="text-xl font-bold">Order confirmed!</h2>
                <p className="font-bold">Order number:
                    <span className="font-light px-2">{orderNumber}</span>
                </p>
                <p className="font-bold">Estimated wait time:
                    <span className="font-light px-2">{confirmedWaitMinutes} minutes</span>
                </p>
                <Button
                    asChild
                    className="my-2 h-auto rounded-md bg-rosso p-2 text-crema hover:bg-rosso-dark"
                >
                    <Link href="/">
                        Place a new order
                        <Pizza aria-hidden="true" size={20} className="ml-2" />
                    </Link>
                </Button>
            </div>
        </CheckoutShell>
    )

    // Empty cart
    if (cartItems.length === 0) return (
        <CheckoutShell>
            <div className="flex flex-col justify-center items-center space-y-3">
                <h2 className="text-3xl mb-12 font-bold uppercase">Cart</h2>
                <p>Your cart is empty.</p>
                <Button
                    asChild
                    className="h-auto rounded bg-rosso p-2 text-crema hover:bg-rosso-dark"
                >
                    <Link href="/">
                        Order here
                        <span className="ml-2">
                            <ArrowRight aria-hidden="true" size={20} className="animate-pulse" />
                        </span>
                    </Link>
                </Button>
            </div>
        </CheckoutShell>
    )

    if (checkoutStep === "summary") return (
        <CheckoutShell>
            <div className="p-2 w-full px-6">
                <h1 className="font-playfair text-center text-2xl font-bold mb-6 py-3">Order Summary</h1>
                {error && <p role="alert" className="bg-rosso rounded-xl text-crema p-2 my-2">{error}</p>}
                <ul className="space-y-3">
                    {cartItems.map(item => (
                        <li key={item._id} className="flex items-center justify-between bg-crema rounded-xl px-4 py-3">
                            <div>
                                <p className="font-medium">{item.itemName}</p>
                                <p className="text-sm">x{item.quantity}</p>
                            </div>
                            <p className="text-gold font-semibold">${(item.itemPrice * item.quantity)}</p>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center justify-between px-4 py-3 my-3">
                    <span className="font-semibold text-lg">Subtotal</span>
                    <span className="font-semibold text-lg">${subtotal}</span>
                </div>
                <div className="flex flex-col justify-between py-3 my-3">
                    <label htmlFor="notes">Instructions</label>
                    <textarea
                        name="notes"
                        id="notes"
                        placeholder="Add special instructions here..."
                        maxLength={150}
                        className="rounded-xl bg-crema p-3 outline-none focus-visible:border focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-crema-dark"
                    />
                </div>
                <Button
                    type="button"
                    variant="default"
                    className="w-full h-12 bg-rosso text-crema rounded-xl py-3 mt-6 font-semibold text-md hover:bg-rosso-dark transition-colors"
                    onClick={handlePlaceOrder}
                >
                    Place order
                </Button>
            </div>
        </CheckoutShell>
    )
}