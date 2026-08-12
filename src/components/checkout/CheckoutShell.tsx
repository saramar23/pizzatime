import type { PropsWithChildren } from "react";

export function CheckoutShell({ children }: PropsWithChildren) {
  return (
    <main
      id="main-content"
      className="flex flex-col items-center justify-center bg-crema-dark rounded-xl mx-auto max-w-lg my-12 py-6"
    >
      {children}
    </main>
  );
}
