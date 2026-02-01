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
    <div className="flex items-center overflow-hidden rounded-lg border">
      <button
        className="px-2 py-1 text-sm hover:bg-gray-50"
        onClick={() => setQty(productId, Math.max(1, quantity - 1))}
      >
        –
      </button>
      <span className="min-w-8 px-2 py-1 text-center text-sm">{quantity}</span>
      <button
        className="px-2 py-1 text-sm hover:bg-gray-50"
        onClick={() => setQty(productId, quantity + 1)}
      >
        +
      </button>
    </div>
  );
}
