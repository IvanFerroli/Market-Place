"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartActions, useCartSnapshot } from "@/lib/cart/store";

function getStockCap(stock: unknown): number | null {
  const n = Number(stock);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}

export default function CartQuantityStepper({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) {
  const cart = useCartSnapshot();
  const { setQty } = useCartActions();

  const [limitHit, setLimitHit] = useState(false);

  const cap = useMemo(() => {
    const it = cart.items.find((x) => String(x.product.id) === String(productId));
    return getStockCap((it as unknown as { product?: { stock?: unknown } })?.product?.stock);
  }, [cart.items, productId]);

  useEffect(() => {
    if (!limitHit) return;
    const id = window.setTimeout(() => setLimitHit(false), 900);
    return () => window.clearTimeout(id);
  }, [limitHit]);

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <button
          type="button"
          className="h-10 w-10 grid place-items-center text-sm text-white/90 hover:bg-white/10 active:bg-white/15"
          onClick={() => setQty(productId, Math.max(1, quantity - 1))}
          aria-label="Decrease quantity"
        >
          –
        </button>

        <span className="min-w-10 px-3 text-center text-sm font-semibold text-white/90">
          {quantity}
        </span>

        <button
          type="button"
          className="h-10 w-10 grid place-items-center text-sm text-white/90 hover:bg-white/10 active:bg-white/15"
          onClick={() => {
            // aviso quando tenta passar do estoque
            if (cap !== null && quantity >= cap) {
              setLimitHit(true);
              return;
            }
            setQty(productId, quantity + 1);
          }}
          aria-label="Increase quantity"
          title={cap !== null ? `Max ${cap} in stock` : undefined}
        >
          +
        </button>
      </div>

      {limitHit ? (
        <span className="text-[11px] text-white/60">
          {cap !== null ? `Max ${cap} in stock` : "Stock limit reached"}
        </span>
      ) : null}
    </div>
  );
}
