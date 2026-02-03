/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import MiniCartToastProvider, { useCartUI } from "@/components/cart/MiniCartToastProvider";
import { CART_OPEN_EVENT, CART_CLOSE_EVENT, CART_TOGGLE_EVENT } from "@/lib/cart/events";
import {
  TOAST_OPEN_EVENT,
  TOAST_CLOSE_EVENT,
  openToast,
  closeToast,
} from "@/lib/toast/events";
import { useCartStore } from "@/lib/cart/store";

const mockUseCartStore = jest.fn();
const mockOpenToast = jest.fn();
const mockCloseToast = jest.fn();

jest.mock("@/lib/cart/store", () => ({
  useCartStore: () => mockUseCartStore(),
}));

jest.mock("@/lib/toast/events", () => ({
  TOAST_OPEN_EVENT: "mp:toast:open",
  TOAST_CLOSE_EVENT: "mp:toast:close",
  openToast: (p: any) => mockOpenToast(p),
  closeToast: (key: string) => mockCloseToast(key),
}));

jest.mock("@/components/cart/MiniCartToast", () => (props: any) => {
  return <div data-testid="mini-cart-toast">{String(props?.productId ?? "")}</div>;
});

function Probe() {
  const ui = useCartUI();
  return (
    <div>
      <div data-testid="is-open">{String(ui.isOpen)}</div>

      <button type="button" onClick={() => ui.open({ productId: "p1" })}>
        open
      </button>
      <button type="button" onClick={() => ui.close()}>
        close
      </button>
      <button type="button" onClick={() => ui.toggle()}>
        toggle
      </button>
    </div>
  );
}

describe("MiniCartToastProvider", () => {
  beforeEach(() => {
    mockUseCartStore.mockReset();
    mockOpenToast.mockReset();
    mockCloseToast.mockReset();
  });

  test("calls useCartStore on mount (init persistence)", () => {
    render(
      <MiniCartToastProvider>
        <Probe />
      </MiniCartToastProvider>,
    );

    expect(useCartStore).toBeDefined();
    expect(mockUseCartStore).toHaveBeenCalledTimes(1);
  });

  test("context open() calls openToast with cart key and passes trimmed productId", () => {
    render(
      <MiniCartToastProvider>
        <Probe />
      </MiniCartToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "open" }));

    expect(mockOpenToast).toHaveBeenCalledTimes(1);
    const payload = mockOpenToast.mock.calls[0][0];

    expect(payload.key).toBe("cart");
    expect(payload.placement).toBe("bottom-right");
    expect(payload.node?.props?.productId).toBe("p1");

    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
  });

  test("context close() calls closeToast('cart') and sets isOpen=false", () => {
    render(
      <MiniCartToastProvider>
        <Probe />
      </MiniCartToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "open" }));
    fireEvent.click(screen.getByRole("button", { name: "close" }));

    expect(mockCloseToast).toHaveBeenCalledWith("cart");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  test("context toggle() opens when closed and closes when open", () => {
    render(
      <MiniCartToastProvider>
        <Probe />
      </MiniCartToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(mockOpenToast).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(mockCloseToast).toHaveBeenCalledWith("cart");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  test("responds to global cart events (open/close/toggle)", () => {
    render(
      <MiniCartToastProvider>
        <Probe />
      </MiniCartToastProvider>,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(CART_OPEN_EVENT, { detail: { productId: "  p2  " } }),
      );
    });

    expect(mockOpenToast).toHaveBeenCalledTimes(1);
    expect(mockOpenToast.mock.calls[0][0].node?.props?.productId).toBe("p2");
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");

    act(() => {
      window.dispatchEvent(new CustomEvent(CART_TOGGLE_EVENT));
    });
    expect(mockCloseToast).toHaveBeenCalledWith("cart");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");

    act(() => {
      window.dispatchEvent(new CustomEvent(CART_CLOSE_EVENT));
    });
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  test("tracks TOAST open/close events for the cart key only", () => {
    render(
      <MiniCartToastProvider>
        <Probe />
      </MiniCartToastProvider>,
    );

    act(() => {
      window.dispatchEvent(new CustomEvent(TOAST_OPEN_EVENT, { detail: { key: "other" } }));
    });
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");

    act(() => {
      window.dispatchEvent(new CustomEvent(TOAST_OPEN_EVENT, { detail: { key: "cart" } }));
    });
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");

    act(() => {
      window.dispatchEvent(new CustomEvent(TOAST_CLOSE_EVENT, { detail: { key: "cart" } }));
    });
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });
});
