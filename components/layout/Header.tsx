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
          "cp-pill",
          scrolled ? "cp-glass-strong" : "cp-glass",
        ].join(" ")}
      >
        <Container className="flex h-14 items-center justify-between">
          <Link href="/" className="cp-brand">
            Market Place
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/" className="text-sm cp-navlink">
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
