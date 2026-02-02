"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export default function HeaderGlass({
  children,
  threshold = 48,
}: {
  children: React.ReactNode;
  threshold?: number;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [threshold]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-2">
      <div
        className={cn(
          "mx-auto w-full max-w-6xl",
          "rounded-[1.75rem] border transition-all duration-300",
          // base glass (hero feel)
          "bg-white/10 text-white backdrop-blur-xl border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.18)]",
          // after scroll: solid premium
          scrolled &&
            "bg-white/90 text-gray-900 border-black/10 shadow-[0_12px_35px_rgba(15,23,42,0.14)]",
        )}
      >
        {children}
      </div>
    </header>
  );
}
