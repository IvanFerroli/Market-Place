import type { Cart } from "@/lib/domain/Cart";

const KEY = "mp_cart_v2";

export function loadCart(): Cart {
  if (typeof window === "undefined") return { items: [] };

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw) as any;
    const items = Array.isArray(parsed?.items) ? parsed.items : [];

    // valida shape mínimo
    const safeItems = items
      .filter(
        (it: any) =>
          it && typeof it === "object" && it.product && typeof it.quantity === "number",
      )
      .map((it: any) => ({
        product: it.product,
        quantity: Number.isFinite(it.quantity) ? it.quantity : 1,
      }));

    return { items: safeItems };
  } catch {
    return { items: [] };
  }
}

export function saveCart(cart: Cart) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}
