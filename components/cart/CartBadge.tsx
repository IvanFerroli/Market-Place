"use client";

import { useCartSnapshot } from "@/lib/cart/store";

export default function CartBadge() {
  const cart = useCartSnapshot();
  const qty = cart.items.reduce((sum, it) => sum + it.quantity, 0);

  if (qty <= 0) return null;

  return (
    <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-xs text-white">
      {qty}
    </span>
  );
}
