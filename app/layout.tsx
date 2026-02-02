import type { Metadata } from "next";

import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/ui/ToastProvider";
import CartToastProvider from "@/components/cart/MiniCartToastProvider";
import { listProducts } from "@/lib/data/productsStore";

export const metadata: Metadata = {
  title: {
    default: "NCART",
    template: "%s — NCART",
  },
  description: "NCART — Curated cyberware. Mini e-commerce (MVP) — Next.js + TS",

  icons: {
    icon: [
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon.ico" },
    ],
    apple: [{ url: "/brand/apple-touch-icon-180.png", sizes: "180x180" }],
  },

  openGraph: {
    title: "NCART",
    description: "Curated cyberware.",
    type: "website",
    images: [
      {
        url: "/brand/og-1200x630.png",
        width: 1200,
        height: 630,
        alt: "NCART — Curated cyberware",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "NCART",
    description: "Curated cyberware.",
    images: ["/brand/og-1200x630.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let categories: string[] = [];

  try {
    const products = await listProducts();
    categories = Array.from(
      new Set((products ?? []).map((p) => p.category).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  } catch {
    // fallback seguro: não quebra o app se der algo estranho na leitura do JSON
    categories = [];
  }

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen cp-body">
        <ToastProvider>
          <CartToastProvider>
            <Header categories={categories} />

            <main className="min-h-[70vh] pt-20">{children}</main>
            <Footer />
          </CartToastProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
