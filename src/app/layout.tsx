import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/layout/Footer";
import { PageClient } from "@/components/layout/PageClient";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ['normal', 'italic']
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "PizzaTime",
  description: "AI Chatbot Pizza App to help with your online PizzaTime order.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-crema focus:px-4 focus:py-2 focus:font-medium focus:text-carbone focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-2 focus:ring-offset-carbone"
          >
            Skip to main content
          </a>
          <div className="flex-1">
            <PageClient />
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
