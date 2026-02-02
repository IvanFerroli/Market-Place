"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Container from "./Container";
import CartButton from "@/components/cart/CartButton";
import CartBadge from "@/components/cart/CartBadge";
import ScrollProgressBar from "./ScrollProgressBar";

const SCROLL_THRESHOLD = 24;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > SCROLL_THRESHOLD);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
      <div
        className={[
          "mx-auto w-full max-w-6xl overflow-hidden",
          "rounded-[9999px] border transition-all duration-300",
          "backdrop-blur-xl",
          scrolled
            ? "bg-white/90 text-gray-900 shadow-sm border-gray-200/80"
            : "bg-white/60 text-gray-900 shadow-[0_12px_35px_rgba(15,23,42,0.10)] border-white/60",
        ].join(" ")}
      >
        <Container className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            Market Place
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-700 hover:text-black">
              Home
            </Link>

            <div className="relative">
              <CartButton />
              <CartBadge />
            </div>
          </nav>
        </Container>

        {/* mantém tua barra de progresso, mas agora “presa” no pill */}
        <ScrollProgressBar />
      </div>
    </header>
  );
}
