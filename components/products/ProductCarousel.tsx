"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/domain/Product";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // drag-to-scroll (desktop mouse)
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false);

  const update = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    update();

    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // touch usa swipe nativo
    const el = scrollerRef.current;
    if (!el) return;

    isDownRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;

    el.setPointerCapture?.(e.pointerId);
    e.preventDefault(); // evita seleção de texto no drag
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    if (e.pointerType !== "mouse") return;

    const el = scrollerRef.current;
    if (!el) return;

    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) movedRef.current = true; // threshold anti-click

    el.scrollLeft = startScrollLeftRef.current - dx;
  };

  const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    isDownRef.current = false;

    if (e?.pointerType === "mouse") {
      const el = scrollerRef.current;
      el?.releasePointerCapture?.(e.pointerId);
    }

    // solta o bloqueio de click no próximo tick
    setTimeout(() => {
      movedRef.current = false;
    }, 0);
  };

  if (!products?.length) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.id}
            onClickCapture={(e) => {
              if (movedRef.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] md:w-[320px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollByDir(-1)}
        disabled={!canLeft}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow-sm transition disabled:opacity-40"
      >
        ‹
      </button>

      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByDir(1)}
        disabled={!canRight}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow-sm transition disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
