/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import MiniCartToast from "@/components/cart/MiniCartToast";

const mockClear = jest.fn();
const mockCloseCart = jest.fn();
const mockCloseToast = jest.fn();

let cartState: any = { items: [] };

beforeAll(() => {
  // safety for environments that might not expose it
  if (!(globalThis as any).queueMicrotask) {
    (globalThis as any).queueMicrotask = (cb: any) => Promise.resolve().then(cb);
  }
});

jest.mock("@/lib/cart/store", () => ({
  useCartSnapshot: () => cartState,
  useCartActions: () => ({
    clear: (...args: any[]) => mockClear(...args),
  }),
}));

jest.mock("@/lib/cart/events", () => ({
  closeCart: () => mockCloseCart(),
}));

jest.mock("@/lib/toast/events", () => ({
  closeToast: (key: string) => mockCloseToast(key),
}));

describe("MiniCartToast", () => {
  beforeEach(() => {
    mockClear.mockReset();
    mockCloseCart.mockReset();
    mockCloseToast.mockReset();
    cartState = { items: [] };
  });

  test("renders empty state and 'Cart preview' when no productId", () => {
    render(<MiniCartToast />);

    expect(screen.getByText("Your cart")).toBeInTheDocument();
    expect(screen.getByText("Cart preview")).toBeInTheDocument();
    expect(screen.getByText("Cart is empty.")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Checkout" })).not.toBeInTheDocument();
  });

  test("shows 'Added <product>' when productId matches an item", () => {
    cartState = {
      items: [
        {
          product: {
            id: "p1",
            name: "Laser Arm",
            priceCents: 123,
            description: "x",
            image: "x",
            category: "weapons",
            stock: 3,
          },
          quantity: 2,
        },
      ],
    };

    render(<MiniCartToast productId="p1" />);

    expect(screen.getByText("Added")).toBeInTheDocument();
    expect(screen.getByText("Laser Arm", { selector: "span" })).toBeInTheDocument();
    expect(screen.queryByText("Cart preview")).not.toBeInTheDocument();
  });

  test("Close button calls closeToast('cart') and closeCart()", () => {
    cartState = {
      items: [
        {
          product: {
            id: "p1",
            name: "Laser Arm",
            priceCents: 123,
            description: "x",
            image: "x",
            category: "weapons",
            stock: 3,
          },
          quantity: 1,
        },
      ],
    };

    render(<MiniCartToast />);

    fireEvent.click(screen.getByLabelText("Close cart"));

    expect(mockCloseToast).toHaveBeenCalledWith("cart");
    expect(mockCloseCart).toHaveBeenCalledTimes(1);
  });

  test("Clear calls clear() once and guards double click in same tick", () => {
    cartState = {
      items: [
        {
          product: {
            id: "p1",
            name: "Laser Arm",
            priceCents: 123,
            description: "x",
            image: "x",
            category: "weapons",
            stock: 3,
          },
          quantity: 2,
        },
      ],
    };

    render(<MiniCartToast />);

    const btn = screen.getByRole("button", { name: "Clear" });
    fireEvent.click(btn);
    fireEvent.click(btn);

    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  test("Checkout mock clears cart and closes cart (no closeToast)", () => {
    cartState = {
      items: [
        {
          product: {
            id: "p1",
            name: "Laser Arm",
            priceCents: 123,
            description: "x",
            image: "x",
            category: "weapons",
            stock: 3,
          },
          quantity: 2,
        },
      ],
    };

    render(<MiniCartToast />);

    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));

    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockCloseCart).toHaveBeenCalledTimes(1);
    expect(mockCloseToast).toHaveBeenCalledTimes(0);
  });
});
