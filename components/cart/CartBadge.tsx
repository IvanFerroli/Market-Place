"use client";

import { useEffect, useRef, useState } from "react";
import { useCartSnapshot } from "@/lib/cart/store";

export default function CartBadge() {
  const cart = useCartSnapshot();
  const qty = cart.items.reduce((sum, it) => sum + it.quantity, 0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const prevQtyRef = useRef(qty);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (prevQtyRef.current === qty) return;
    prevQtyRef.current = qty;

    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 160);
    return () => window.clearTimeout(id);
  }, [qty]);

  if (!mounted) return null;
  if (qty <= 0) return null;

  return (
    <span
      className={[
        "absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-xs text-white",
        "transform-gpu transition-[transform,opacity] duration-150 ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none",
        pulse ? "scale-110 opacity-100" : "scale-100 opacity-95",
      ].join(" ")}
    >
      {qty}
    </span>
  );
}
