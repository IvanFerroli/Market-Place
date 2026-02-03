import type { Product } from "@/lib/domain/Product";
import {
  cartActions,
  cartGetSnapshot,
  cartInitClient,
  cartResetForTests,
  cartFlushCommitForTests,
} from "@/lib/cart/store";

import { loadCart, saveCart } from "@/lib/cart/persist";

jest.mock("@/lib/cart/persist", () => ({
  loadCart: jest.fn(),
  saveCart: jest.fn(),
}));

const P = (id: unknown) =>
  ({ id, name: `P${String(id)}`, price: 100 }) as unknown as Product;

describe("cart store", () => {
  beforeEach(() => {
    cartResetForTests();
    (loadCart as jest.Mock).mockReset();
    (saveCart as jest.Mock).mockReset();
  });

  test("useCartStore hydrates once on mount and emits snapshot update", async () => {
    // (No teste, “mount” = primeira chamada de init)
    (loadCart as jest.Mock).mockReturnValue({ items: [{ product: P(1), quantity: 2 }] });

    cartInitClient();
    await cartFlushCommitForTests();

    expect(loadCart).toHaveBeenCalledTimes(1);
    expect(cartGetSnapshot().items).toHaveLength(1);

    // chamar init de novo não deve re-hidratar
    cartInitClient();
    await cartFlushCommitForTests();
    expect(loadCart).toHaveBeenCalledTimes(1);
  });

  test("addItem adds new item and clamps qty (floor, min 1)", async () => {
    (loadCart as jest.Mock).mockReturnValue({ items: [] });

    cartActions.addItem(P(1), 0);
    await cartFlushCommitForTests();
    expect(cartGetSnapshot().items[0].quantity).toBe(1);

    cartActions.addItem(P(2), 2.9);
    await cartFlushCommitForTests();
    expect(
      cartGetSnapshot().items.find((i) => String(i.product.id) === "2")?.quantity,
    ).toBe(2);
  });

  test("addItem increments existing and dedupes by String(product.id)", async () => {
    (loadCart as jest.Mock).mockReturnValue({ items: [] });

    cartActions.addItem(P(1), 1);
    cartActions.addItem(P("1"), 2);
    await cartFlushCommitForTests();

    const items = cartGetSnapshot().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  test("setQty floors positive values; qty <= 0 or non-finite removes item", async () => {
    (loadCart as jest.Mock).mockReturnValue({ items: [] });

    cartActions.addItem(P(1), 1);
    await cartFlushCommitForTests();

    cartActions.setQty("1", 3.7);
    await cartFlushCommitForTests();
    expect(cartGetSnapshot().items[0].quantity).toBe(3);

    cartActions.setQty("1", 0);
    await cartFlushCommitForTests();
    expect(cartGetSnapshot().items).toHaveLength(0);

    cartActions.addItem(P(2), 1);
    await cartFlushCommitForTests();

    cartActions.setQty("2", Number.POSITIVE_INFINITY);
    await cartFlushCommitForTests();
    expect(cartGetSnapshot().items).toHaveLength(0);
  });

  test("removeItem removes; clear empties cart", async () => {
    (loadCart as jest.Mock).mockReturnValue({ items: [] });

    cartActions.addItem(P(1), 1);
    cartActions.addItem(P(2), 1);
    await cartFlushCommitForTests();
    expect(cartGetSnapshot().items).toHaveLength(2);

    cartActions.removeItem("1");
    await cartFlushCommitForTests();
    expect(cartGetSnapshot().items).toHaveLength(1);

    cartActions.clear();
    await cartFlushCommitForTests();
    expect(cartGetSnapshot().items).toHaveLength(0);
  });

  test("batches multiple actions in same tick (single saveCart)", async () => {
    (loadCart as jest.Mock).mockReturnValue({ items: [] });

    cartActions.addItem(P(1), 1);
    cartActions.addItem(P(2), 1);
    cartActions.setQty("1", 2);

    expect(saveCart).toHaveBeenCalledTimes(0);

    await cartFlushCommitForTests();

    // 1 tick => 1 persist
    expect(saveCart).toHaveBeenCalledTimes(1);
  });

  test("hydrates via first action call (ensureHydrated)", async () => {
    (loadCart as jest.Mock).mockReturnValue({ items: [{ product: P(9), quantity: 1 }] });

    // sem init explícito: primeira action deve hidratar internamente
    cartActions.addItem(P(1), 1);
    await cartFlushCommitForTests();

    expect(loadCart).toHaveBeenCalledTimes(1);
    expect(cartGetSnapshot().items.length).toBeGreaterThanOrEqual(1);
  });
});
