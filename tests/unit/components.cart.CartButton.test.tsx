/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import CartButton from "@/components/cart/CartButton";
import { openCart, toggleCart } from "@/lib/cart/events";

const mockAddItem = jest.fn();

jest.mock("@/lib/cart/events", () => ({
  openCart: jest.fn(),
}));

jest.mock("@/lib/cart/store", () => ({
  useCartActions: () => ({
    addItem: (...args: any[]) => mockAddItem(...args),
  }),
}));

describe("CartButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddItem.mockReset();
  });

  test("header mode: opens cart with source=header", () => {
    render(<CartButton />);
    fireEvent.click(screen.getByRole("button", { name: "Cart" }));
    expect(openCart).toHaveBeenCalledWith({ source: "header" });
  });

  test("product mode: adds item and opens cart (default)", () => {
    const product = {
      id: "abc",
      name: "Neuro-Link",
      priceCents: 1234,
      description: "x",
      image: "x",
      category: "x",
      stock: 10,
    };

    render(<CartButton product={product as any} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(mockAddItem).toHaveBeenCalledWith(product, 1);
    expect(openCart).toHaveBeenCalledWith({
      source: "add_to_cart_button",
      productId: "abc",
    });
  });

  test("product mode: does not open cart when openCartOnAdd=false", () => {
    const product = {
      id: "abc",
      name: "Neuro-Link",
      priceCents: 1234,
      description: "x",
      image: "x",
      category: "x",
      stock: 10,
    };

    render(<CartButton product={product as any} openCartOnAdd={false} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(mockAddItem).toHaveBeenCalledWith(product, 1);
    expect(openCart).not.toHaveBeenCalled();
  });

  test("guards accidental double click (250ms window)", () => {
    jest.useFakeTimers();

    const product = {
      id: "abc",
      name: "Neuro-Link",
      priceCents: 1234,
      description: "x",
      image: "x",
      category: "x",
      stock: 10,
    };

    render(<CartButton product={product as any} />);

    const btn = screen.getByRole("button", { name: /add to cart/i });

    fireEvent.click(btn);
    fireEvent.click(btn);

    expect(mockAddItem).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(300);

    fireEvent.click(btn);
    expect(mockAddItem).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  test("calls onAdded callback when provided", () => {
    const product = {
      id: "abc",
      name: "Neuro-Link",
      priceCents: 1234,
      description: "x",
      image: "x",
      category: "x",
      stock: 10,
    };

    const onAdded = jest.fn();

    render(<CartButton product={product as any} onAdded={onAdded} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(onAdded).toHaveBeenCalledTimes(1);
  });
});
