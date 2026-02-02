"use client";

import { useCartActions } from "@/lib/cart/store";

export default function CartQuantityStepper({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) {
  const { setQty } = useCartActions();

  return (
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
        onClick={() => setQty(productId, quantity + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
