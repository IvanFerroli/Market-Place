import {
  selectCartDistinctCount,
  selectCartIsEmpty,
  selectCartItems,
  selectCartQuantityTotal,
  selectCartTotals,
} from "../../lib/cart/selectors";

describe("cart selectors", () => {
  it("selectCartItems returns items reference", () => {
    const cart: any = { items: [{ a: 1 }, { a: 2 }] };
    expect(selectCartItems(cart)).toBe(cart.items);
  });

  it("selectCartDistinctCount returns length", () => {
    const cart: any = { items: [{}, {}, {}] };
    expect(selectCartDistinctCount(cart)).toBe(3);
  });

  it("selectCartQuantityTotal sums only finite numeric quantities", () => {
    const cart: any = {
      items: [
        { quantity: 2 },
        { quantity: 3 },
        { quantity: NaN }, // ignore
        { quantity: "4" }, // ignore (Number.isFinite("4") === false)
        { quantity: Infinity }, // ignore
      ],
    };

    expect(selectCartQuantityTotal(cart)).toBe(5);
  });

  it("selectCartTotals delegates to computeCartTotals result shape", () => {
    const cart: any = {
      items: [
        { product: { priceCents: 100 }, quantity: 2 }, // 200
        { product: { priceCents: 50 }, quantity: 1 }, // 50
      ],
    };

    expect(selectCartTotals(cart)).toEqual({ subtotal: 250, total: 250 });
  });

  it("selectCartIsEmpty checks empty state", () => {
    expect(selectCartIsEmpty({ items: [] } as any)).toBe(true);
    expect(selectCartIsEmpty({ items: [{},] } as any)).toBe(false);
  });
});
