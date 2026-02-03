/**
 * @jest-environment node
 */

import { loadCart, saveCart } from "@/lib/cart/persist";

describe("cart persist (server)", () => {
  test("loadCart returns empty on server", () => {
    expect(loadCart()).toEqual({ items: [] });
  });

  test("saveCart is a no-op on server", () => {
    expect(() => saveCart({ items: [] })).not.toThrow();
  });
});
