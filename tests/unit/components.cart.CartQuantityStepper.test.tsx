/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import CartQuantityStepper from "@/components/cart/CartQuantityStepper";

const mockSetQty = jest.fn();

jest.mock("@/lib/cart/store", () => ({
  useCartActions: () => ({
    setQty: (...args: any[]) => mockSetQty(...args),
  }),
}));

describe("CartQuantityStepper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetQty.mockReset();
  });

  test("renders current quantity", () => {
    render(<CartQuantityStepper productId="p1" quantity={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("increase calls setQty(productId, quantity+1)", () => {
    render(<CartQuantityStepper productId="p1" quantity={3} />);
    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(mockSetQty).toHaveBeenCalledWith("p1", 4);
  });

  test("decrease clamps to min 1", () => {
    render(<CartQuantityStepper productId="p1" quantity={1} />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(mockSetQty).toHaveBeenCalledWith("p1", 1);
  });

  test("decrease subtracts when quantity > 1", () => {
    render(<CartQuantityStepper productId="p1" quantity={5} />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(mockSetQty).toHaveBeenCalledWith("p1", 4);
  });
});
