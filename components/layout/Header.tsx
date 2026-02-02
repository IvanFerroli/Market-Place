"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Container from "./Container";
import CartButton from "@/components/cart/CartButton";
import CartBadge from "@/components/cart/CartBadge";
import HomeButton from "@/components/cart/HomeButton";
import ScrollProgressBar from "./ScrollProgressBar";
import Image from "next/image";

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
    <header
      className={[
        "fixed inset-x-0 top-0 z-50",
        "border-b transition-all duration-300",
        scrolled ? "cp-glass-strong" : "cp-glass",
      ].join(" ")}
    >
      {/* altura total alinhada com teu body pt-[76px] */}
      <Container className="flex h-[64px] sm:h-[76px] max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3" aria-label="NCART home">
          {/* Mobile: mark (sempre visível) */}
          <Image
            src="/brand/mark.svg"
            alt="NCART"
            width={40}
            height={40}
            priority
            className="h-9 w-9 sm:hidden"
          />

          {/* Desktop: wordmark + tagline */}
          <div className="hidden sm:flex flex-col leading-none">
            <Image
              src="/brand/logo-flat.svg"
              alt="NCART"
              width={160}
              height={36}
              priority
              className="h-7 w-auto"
            />
            <span className="mt-1 text-[11px] tracking-[0.22em] uppercase text-white/60">
              Curated cyberware
            </span>
          </div>
        </Link>

        {/* Nav / Actions */}
        <nav className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <HomeButton />
          </div>

          <div className="relative">
            <CartButton />
            <CartBadge />
          </div>
        </nav>
      </Container>

      {/* progress bar agora funciona como “accent line” do header */}
      <ScrollProgressBar />
    </header>
  );
}
