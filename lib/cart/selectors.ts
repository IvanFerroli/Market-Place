import type { Cart } from "@/lib/domain/Cart";
import { computeCartTotals } from "./rules";

export function selectCartItems(cart: Cart) {
  return cart.items;
}

export function selectCartDistinctCount(cart: Cart) {
  return cart.items.length;
}

export function selectCartQuantityTotal(cart: Cart) {
  return cart.items.reduce((sum, it) => sum + (Number.isFinite(it.quantity) ? it.quantity : 0), 0);
}

export function selectCartTotals(cart: Cart) {
  return computeCartTotals(cart);
}

export function selectCartIsEmpty(cart: Cart) {
  return cart.items.length === 0;
}
