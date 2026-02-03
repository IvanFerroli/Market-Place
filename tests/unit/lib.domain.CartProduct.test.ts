import type { Product } from "@/lib/domain/Product";
import { isProduct } from "@/lib/domain/Product";
import {
  getCartSubtotalCents,
  getCartTotalQty,
  isCart,
  isCartItem,
} from "@/lib/domain/Cart";

const P = (id: string, priceCents = 100, stock = 10): Product => ({
  id,
  name: `P-${id}`,
  priceCents,
  description: "d",
  image: "i",
  category: "c",
  stock,
});

describe("domain helpers (Cart/Product)", () => {
  test("isProduct true for valid product; false for invalid", () => {
    expect(isProduct(P("1"))).toBe(true);

    expect(isProduct(null)).toBe(false);
    expect(isProduct({})).toBe(false);
    expect(isProduct({ ...P("1"), id: "   " })).toBe(false);
    expect(isProduct({ ...P("1"), priceCents: Number.NaN })).toBe(false);
    expect(isProduct({ ...P("1"), stock: -1 })).toBe(false);
  });

  test("isCartItem / isCart validate shape", () => {
    const item = { product: P("1"), quantity: 2 };
    expect(isCartItem(item)).toBe(true);
    expect(isCart({ items: [item] })).toBe(true);

    expect(isCartItem({ product: P("1"), quantity: 0 })).toBe(false);
    expect(isCart({ items: [{ product: P("1"), quantity: 0 }] })).toBe(false);
  });

  test("getCartTotalQty and getCartSubtotalCents are safe", () => {
    const cart = {
      items: [
        { product: P("1", 100), quantity: 2.9 }, // floor => 2
        { product: P("2", 250), quantity: Number.POSITIVE_INFINITY }, // => 0
      ],
    };

    expect(getCartTotalQty(cart)).toBe(2);
    expect(getCartSubtotalCents(cart)).toBe(200);
  });
});
