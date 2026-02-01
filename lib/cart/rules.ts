import type { Cart } from "@/lib/domain/Cart";

export function computeCartTotals(cart: Cart) {
  const subtotal = cart.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

  return {
    subtotal,
    total: subtotal,
  };
}
