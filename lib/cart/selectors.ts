import type { Cart } from "@/lib/domain/Cart";
import { computeCartTotals } from "./rules";

/**
 * Selector helpers for deriving UI-friendly values from a {@link Cart}.
 *
 * These are intentionally tiny and pure so they are:
 * - easy to test
 * - safe to reuse across UI/components
 */
export function selectCartItems(cart: Cart) {
  return cart.items;
}

/** Returns the number of distinct items (lines) in the cart. */
export function selectCartDistinctCount(cart: Cart) {
  return cart.items.length;
}

/**
 * Returns the total quantity across all items.
 *
 * Safety:
 * - ignores non-finite quantities (treats them as 0)
 */
export function selectCartQuantityTotal(cart: Cart) {
  return cart.items.reduce(
    (sum, it) => sum + (Number.isFinite(it.quantity) ? it.quantity : 0),
    0,
  );
}

/** Returns computed totals (see {@link computeCartTotals}). */
export function selectCartTotals(cart: Cart) {
  return computeCartTotals(cart);
}

/** True when the cart has no items. */
export function selectCartIsEmpty(cart: Cart) {
  return cart.items.length === 0;
}
