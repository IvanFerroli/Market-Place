import type { Cart } from "@/lib/domain/Cart";

/**
 * localStorage key for persisted cart state.
 *
 * Bump the suffix (`_v2`, `_v3`, ...) when the persisted shape changes in a
 * non-backward-compatible way.
 */
const KEY = "mp_cart_v2";

/**
 * Loads the cart from localStorage.
 *
 * SSR/edge safety:
 * - Returns an empty cart when `window` is not available.
 *
 * Robustness:
 * - Tolerates malformed JSON and "dirty" storage values.
 * - Enforces a minimal item shape (product object + quantity).
 * - Normalizes quantity into a positive integer (defaults to 1).
 */
export function loadCart(): Cart {
  if (typeof window === "undefined") return { items: [] };

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw) as any;
    const items = Array.isArray(parsed?.items) ? parsed.items : [];

    // valida shape mínimo + tolerância a lixo no storage
    const safeItems = items
      .filter(
        (it: any) =>
          it &&
          typeof it === "object" &&
          it.product &&
          typeof it.product === "object" &&
          "quantity" in it,
      )
      .map((it: any) => {
        const rawQty = Number(it.quantity);
        const quantity = Number.isFinite(rawQty) && rawQty > 0 ? Math.floor(rawQty) : 1;

        return {
          product: it.product,
          quantity,
        };
      });

    return { items: safeItems };
  } catch {
    return { items: [] };
  }
}

/**
 * Saves the cart to localStorage.
 *
 * SSR/edge safety:
 * - No-op when `window` is not available.
 *
 * Failure handling:
 * - Swallows storage errors (quota, privacy mode, etc.) to avoid breaking UX.
 */
export function saveCart(cart: Cart) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}
