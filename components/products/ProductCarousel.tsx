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
  const capturedRef = useRef(false);

  // 1.0 = 1px mouse -> 1px scroll (fica “pesado”)
  // 1.4–2.2 costuma ficar ótimo
  const DRAG_SPEED = 1.8;

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
    if (e.button !== 0) return; // só botão esquerdo

    const el = scrollerRef.current;
    if (!el) return;

    isDownRef.current = true;
    movedRef.current = false;
    capturedRef.current = false;

    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;

    // NÃO dar preventDefault aqui, senão click do card/botões morre.
    // Também NÃO usar pointer capture aqui, senão quebra click de botões dentro do card.
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    if (e.pointerType !== "mouse") return;

    const el = scrollerRef.current;
    if (!el) return;

    const dx = (e.clientX - startXRef.current) * DRAG_SPEED;

    if (!movedRef.current && Math.abs(dx) > 6) {
      movedRef.current = true; // threshold anti-click
      // Agora sim: captura o pointer só quando virou drag de verdade
      el.setPointerCapture?.(e.pointerId);
      capturedRef.current = true;
    }

    if (movedRef.current) e.preventDefault(); // só durante drag (evita seleção/drag nativo)
    el.scrollLeft = startScrollLeftRef.current - dx;
  };

  const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    isDownRef.current = false;

    if (e?.pointerType === "mouse" && capturedRef.current) {
      const el = scrollerRef.current;
      el?.releasePointerCapture?.(e.pointerId);
      capturedRef.current = false;
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
        onDragStartCapture={(e) => e.preventDefault()} // impede “arrastar a imagem” (ghost drag)
        onClickCapture={(e) => {
          // Se virou drag, mata o click “fantasma” que poderia abrir QuickView sem querer
          if (movedRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [touch-action:pan-x]"
      >
        {products.map((p) => (
          <div
            key={p.id}
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
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border color-black bg-[color:var(--cp-yellow)] p-2 shadow-sm transition disabled:opacity-40"
      >
       ←
      </button>

      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByDir(1)}
        disabled={!canRight}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full color-black border bg-[color:var(--cp-yellow)] p-2 shadow-sm transition disabled:opacity-40"
      >
         →
      </button>
    </div>
  );
}
