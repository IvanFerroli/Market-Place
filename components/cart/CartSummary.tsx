import type { Cart } from "@/lib/domain/Cart";
import { computeCartTotals } from "@/lib/cart/rules";

function fmt(vCents: number) {
  const v = (Number.isFinite(vCents) ? vCents : 0) / 100;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "BRL" }).format(
    v,
  );
}

export default function CartSummary({ cart }: { cart: Cart }) {
  const totals = computeCartTotals(cart);

  return (
    <div className="rounded-xl border p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">{fmt(totals.subtotal)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-gray-600">Total</span>
        <span className="font-semibold">{fmt(totals.total)}</span>
      </div>
    </div>
  );
}
