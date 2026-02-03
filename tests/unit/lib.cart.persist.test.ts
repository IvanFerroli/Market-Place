/**
 * @jest-environment jsdom
 */

import { loadCart, saveCart } from "@/lib/cart/persist";

const KEY = "mp_cart_v2";

const P = (id: unknown) => ({ id, name: `P${String(id)}`, price: 100 }) as any;

describe("cart persist (browser)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  test("loadCart returns empty when nothing stored", () => {
    expect(loadCart()).toEqual({ items: [] });
  });

  test("saveCart writes JSON under expected key", () => {
    const cart = { items: [{ product: P(1), quantity: 2 }] };

    saveCart(cart);

    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify(cart));
  });

  test("loadCart returns empty on invalid JSON", () => {
    window.localStorage.setItem(KEY, "{not-json");

    expect(loadCart()).toEqual({ items: [] });
  });

  test("loadCart filters invalid items and normalizes non-finite quantity to 1", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        items: [
          { product: P(1), quantity: 2 },
          { product: P(2), quantity: null }, // JSON não suporta Infinity/NaN; null vira qty=1
          { product: null, quantity: 1 }, // drop
          { product: P(3) as any }, // drop (sem quantity)
        ],
      }),
    );

    const cart = loadCart();

    expect(cart.items).toHaveLength(2);
    expect(cart.items.find((i) => String(i.product.id) === "1")?.quantity).toBe(2);
    expect(cart.items.find((i) => String(i.product.id) === "2")?.quantity).toBe(1);
  });

  test("saveCart ignores localStorage errors", () => {
    const spy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => saveCart({ items: [{ product: P(1), quantity: 1 }] })).not.toThrow();

    spy.mockRestore();
  });
});
