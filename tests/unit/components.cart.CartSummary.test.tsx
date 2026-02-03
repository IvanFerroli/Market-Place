import { act, render, screen } from "@testing-library/react";
import CartSummary from "@/components/cart/CartSummary";
import type { Cart } from "@/lib/domain/Cart";

function P(priceCents: number) {
  return {
    id: "p1",
    name: "Laser Arm",
    priceCents,
    description: "x",
    image: "/x.png",
    category: "weapons",
    stock: 10,
  };
}

function cart(priceCents: number, quantity: number): Cart {
  return { items: [{ product: P(priceCents), quantity }] };
}

describe("CartSummary", () => {
  test("renders subtotal and total (BRL) and starts non-pulsing", () => {
    render(<CartSummary cart={cart(123, 2)} />); // 246

    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();

    const money246 = /R\$\s?2[.,]46/;
    const amounts = screen.getAllByText(money246);
    expect(amounts).toHaveLength(2);

    for (const el of amounts) {
      expect(el.className).toMatch(/opacity-95/);
      expect(el.className).toMatch(/translate-y-0/);
    }
  });

  test("pulses when totals change then settles back", () => {
    jest.useFakeTimers();

    const { rerender } = render(<CartSummary cart={cart(123, 2)} />); // 246
    rerender(<CartSummary cart={cart(123, 3)} />); // 369

    const money369 = /R\$\s?3[.,]69/;
    const amounts = screen.getAllByText(money369);
    expect(amounts).toHaveLength(2);

    for (const el of amounts) {
      expect(el.className).toMatch(/opacity-100/);
      expect(el.className).toMatch(/-translate-y-\[1px\]/);
    }

    act(() => {
      jest.advanceTimersByTime(200);
    });

    for (const el of amounts) {
      expect(el.className).toMatch(/opacity-95/);
      expect(el.className).toMatch(/translate-y-0/);
    }

    jest.useRealTimers();
  });

  test("empty cart shows zero totals", () => {
    render(<CartSummary cart={{ items: [] }} />);

    const money0 = /R\$\s?0[.,]00/;
    expect(screen.getAllByText(money0)).toHaveLength(2);
  });
});
