import type { Product } from "./Product";
import { isProduct } from "./Product";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
};

export function isCartItem(v: unknown): v is CartItem {
  const it = v as any;
  if (!it || typeof it !== "object") return false;
  if (!isProduct(it.product)) return false;

  const q = Number(it.quantity);
  if (!Number.isFinite(q) || q <= 0) return false;

  return true;
}

export function isCart(v: unknown): v is Cart {
  const c = v as any;
  if (!c || typeof c !== "object") return false;
  if (!Array.isArray(c.items)) return false;
  return c.items.every(isCartItem);
}

function safeQty(q: unknown): number {
  const n = Number(q);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

export function getCartTotalQty(cart: Cart): number {
  return cart.items.reduce((acc, it) => acc + safeQty(it.quantity), 0);
}

export function getCartSubtotalCents(cart: Cart): number {
  return cart.items.reduce((acc, it) => {
    const q = safeQty(it.quantity);
    const price = Number(it.product?.priceCents);
    if (!Number.isFinite(price) || price < 0) return acc;
    return acc + q * Math.floor(price);
  }, 0);
}
