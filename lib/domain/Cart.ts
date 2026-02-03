import type { Product } from "./Product";
import { isProduct } from "./Product";

/**
 * A cart line item.
 *
 * Invariants:
 * - `product` must match the canonical {@link Product} model.
 * - `quantity` must be a positive number (values <= 0 are invalid).
 */
export type CartItem = {
  product: Product;
  quantity: number;
};

/**
 * Minimal cart representation used for persistence and calculations.
 *
 * Notes:
 * - The cart is intentionally small: it stores the {@link Product} snapshot
 *   needed for totals + UX, and a `quantity`.
 */
export type Cart = {
  items: CartItem[];
};

/**
 * Runtime type guard for a cart item parsed from unknown input (e.g. localStorage).
 *
 * Validates:
 * - product shape via {@link isProduct}
 * - quantity is finite and > 0
 */
export function isCartItem(v: unknown): v is CartItem {
  const it = v as any;
  if (!it || typeof it !== "object") return false;
  if (!isProduct(it.product)) return false;

  const q = Number(it.quantity);
  if (!Number.isFinite(q) || q <= 0) return false;

  return true;
}

/**
 * Runtime type guard for a cart parsed from unknown input.
 *
 * A cart is valid when:
 * - it is an object
 * - `items` is an array
 * - every element passes {@link isCartItem}
 */
export function isCart(v: unknown): v is Cart {
  const c = v as any;
  if (!c || typeof c !== "object") return false;
  if (!Array.isArray(c.items)) return false;
  return c.items.every(isCartItem);
}

/**
 * Normalizes unknown quantity values into a safe integer.
 *
 * - Non-finite or non-positive values become `0`.
 * - Positive values are floored (e.g. 1.9 -> 1).
 */
function safeQty(q: unknown): number {
  const n = Number(q);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

/** Returns the total quantity across all cart items. */
export function getCartTotalQty(cart: Cart): number {
  return cart.items.reduce((acc, it) => acc + safeQty(it.quantity), 0);
}

/**
 * Returns the subtotal in cents (sum of `quantity * product.priceCents`).
 *
 * Safety:
 * - invalid/negative prices are ignored
 * - quantities are normalized via {@link safeQty}
 */
export function getCartSubtotalCents(cart: Cart): number {
  return cart.items.reduce((acc, it) => {
    const q = safeQty(it.quantity);
    const price = Number(it.product?.priceCents);
    if (!Number.isFinite(price) || price < 0) return acc;
    return acc + q * Math.floor(price);
  }, 0);
}
