import type { Cart } from "@/lib/domain/Cart";
import { computeCartTotals } from "@/lib/cart/rules";
import { useEffect, useMemo, useRef, useState } from "react";

function fmt(vCents: number) {
  const v = (Number.isFinite(vCents) ? vCents : 0) / 100;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "BRL" }).format(
    v,
  );
}

export default function CartSummary({ cart }: { cart: Cart }) {
  const totals = computeCartTotals(cart);

  const sig = useMemo(
    () => `${totals.subtotal}|${totals.total}`,
    [totals.subtotal, totals.total],
  );
  const prevSigRef = useRef(sig);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (prevSigRef.current === sig) return;
    prevSigRef.current = sig;

    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 160);
    return () => window.clearTimeout(id);
  }, [sig]);

  const valueCls = [
    "transform-gpu transition-[transform,opacity] duration-150 ease-out",
    "motion-reduce:transition-none motion-reduce:transform-none",
    pulse ? "opacity-100 -translate-y-[1px]" : "opacity-95 translate-y-0",
  ].join(" ");

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-white/70">Subtotal</span>
        <span className={["font-medium", valueCls].join(" ")}>
          {fmt(totals.subtotal)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-white/70">Total</span>
        <span className={["font-semibold cp-price", valueCls].join(" ")}>
          {fmt(totals.total)}
        </span>
      </div>
    </div>
  );
}
