import type { Cart } from "@/lib/domain/Cart";

export function computeCartTotals(cart: Cart) {
  const subtotal = cart.items.reduce((sum, it) => {
    const price = Number(it.product.price);
    const qty = Number(it.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum;
    return sum + price * qty;
  }, 0);

  return {
    subtotal,
    total: subtotal,
  };
}

