"use client";

import type { CartItem } from "@/lib/domain/Cart";
import ProductPrice from "@/components/products/ProductPrice";
import CartQuantityStepper from "./CartQuantityStepper";
import { useCartActions } from "@/lib/cart/store";
import { useCallback, useEffect, useRef, useState } from "react";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem } = useCartActions();

  const MOTION_MS = 180;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<number | undefined>(undefined);
  const [leaving, setLeaving] = useState(false);

  // mede altura real (pra animar max-height -> 0)
  useEffect(() => {
    if (leaving) return;
    const el = wrapRef.current;
    if (!el) return;

    const id = window.requestAnimationFrame(() => {
      setMaxH(el.scrollHeight);
    });

    return () => window.cancelAnimationFrame(id);
  }, [leaving, item.quantity, item.product.id]);

  const handleRemove = useCallback(() => {
    if (leaving) return;

    const el = wrapRef.current;
    setMaxH(el?.scrollHeight ?? 0);

    setLeaving(true);

    window.setTimeout(() => {
      removeItem(String(item.product.id));
    }, MOTION_MS);
  }, [leaving, removeItem, item.product.id]);

  return (
    <div
      ref={wrapRef}
      style={{
        maxHeight: leaving ? 0 : maxH,
        // space-y-3 aplica margin-top com seletor mais forte; inline ganha e evita “buraco” durante a animação
        marginTop: leaving ? 0 : undefined,
      }}
      className={[
        "overflow-hidden rounded-xl",
        "transition-[max-height,transform,opacity,margin] duration-200 ease-out",
        "motion-reduce:transition-none",
        leaving
          ? "opacity-0 translate-x-3 pointer-events-none"
          : "opacity-100 translate-x-0",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{item.product.name}</div>
          <div className="mt-1 text-sm text-white/70">
            <ProductPrice value={item.product.priceCents} compact />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CartQuantityStepper
            productId={String(item.product.id)}
            quantity={item.quantity}
          />
          <button
            type="button"
            className="cp-btn cp-btn-danger h-8 px-3 rounded-full text-xs"
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
