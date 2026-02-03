import type { Cart } from "@/lib/domain/Cart";

/**
 * Computes cart totals from a {@link Cart}.
 *
 * Returns canonical money values in cents.
 *
 * Current behavior:
 * - `subtotal` is the sum of `priceCents * quantity` for all items
 * - `total` currently equals `subtotal` (no discounts/shipping/taxes yet)
 *
 * Safety:
 * - Ignores items with non-finite price or quantity
 */
export function computeCartTotals(cart: Cart) {
  const subtotal = cart.items.reduce((sum, it) => {
    const price = Number(it.product.priceCents);
    const qty = Number(it.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum;
    return sum + price * qty;
  }, 0);

  return {
    subtotal,
    total: subtotal,
  };
}
