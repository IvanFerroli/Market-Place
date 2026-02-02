import { computeCartTotals } from "@/lib/cart/rules";
import type { Cart } from "@/lib/domain/Cart";

function asCart(v: any): Cart {
  return v as unknown as Cart;
}

describe("computeCartTotals", () => {
  it("sums priceCents * quantity and mirrors subtotal into total", () => {
    const cart = asCart({
      items: [
        { product: { priceCents: 100 }, quantity: 2 }, // 200
        { product: { priceCents: 250 }, quantity: 1 }, // 250
      ],
    });

    const totals = computeCartTotals(cart);

    expect(totals).toEqual({
      subtotal: 450,
      total: 450,
    });
  });

  it("coerces numeric strings (priceCents and quantity)", () => {
    const cart = asCart({
      items: [{ product: { priceCents: "199" }, quantity: "3" }], // 597
    });

    const totals = computeCartTotals(cart);

    expect(totals.subtotal).toBe(597);
    expect(totals.total).toBe(597);
  });

  it("ignores items with non-finite price or qty", () => {
    const cart = asCart({
      items: [
        { product: { priceCents: 100 }, quantity: 2 }, // valid => 200
        { product: { priceCents: NaN }, quantity: 5 }, // ignored
        { product: { priceCents: 50 }, quantity: Infinity }, // ignored
        { product: { priceCents: "nope" }, quantity: 1 }, // Number("nope") => NaN => ignored
      ],
    });

    const totals = computeCartTotals(cart);

    expect(totals.subtotal).toBe(200);
    expect(totals.total).toBe(200);
  });

  it("handles empty cart", () => {
    const cart = asCart({ items: [] });

    const totals = computeCartTotals(cart);

    expect(totals).toEqual({ subtotal: 0, total: 0 });
  });
});
