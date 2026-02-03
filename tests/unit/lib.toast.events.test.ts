/**
 * @jest-environment jsdom
 */

import {
  TOAST_OPEN_EVENT,
  TOAST_CLOSE_EVENT,
  openToast,
  closeToast,
  subscribeToToasts,
} from "@/lib/toast/events";

describe("lib/toast/events", () => {
  test("openToast dispatcha TOAST_OPEN_EVENT com detail", () => {
    const spy = jest.fn();
    window.addEventListener(TOAST_OPEN_EVENT, spy as EventListener);

    openToast({ key: "k1", placement: "bottom-right", node: null });

    expect(spy).toHaveBeenCalledTimes(1);
    const ev = spy.mock.calls[0][0] as CustomEvent;
    expect(ev.type).toBe(TOAST_OPEN_EVENT);
    expect(ev.detail).toMatchObject({ key: "k1", placement: "bottom-right" });

    window.removeEventListener(TOAST_OPEN_EVENT, spy as EventListener);
  });

  test("closeToast dispatcha TOAST_CLOSE_EVENT com { key }", () => {
    const spy = jest.fn();
    window.addEventListener(TOAST_CLOSE_EVENT, spy as EventListener);

    closeToast("cart");

    expect(spy).toHaveBeenCalledTimes(1);
    const ev = spy.mock.calls[0][0] as CustomEvent;
    expect(ev.type).toBe(TOAST_CLOSE_EVENT);
    expect(ev.detail).toStrictEqual({ key: "cart" });

    window.removeEventListener(TOAST_CLOSE_EVENT, spy as EventListener);
  });

  test("subscribeToToasts: chama handlers e desinscreve", () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();

    const unsub = subscribeToToasts({ onOpen, onClose });

    window.dispatchEvent(
      new CustomEvent(TOAST_OPEN_EVENT, {
        detail: { key: "k2", placement: "center", node: null },
      }),
    );

    window.dispatchEvent(
      new CustomEvent(TOAST_CLOSE_EVENT, {
        detail: { key: "k2" },
      }),
    );

    // close sem key não deve chamar
    window.dispatchEvent(
      new CustomEvent(TOAST_CLOSE_EVENT, {
        detail: { key: "" },
      }),
    );

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ key: "k2", placement: "center" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("k2");

    unsub();

    window.dispatchEvent(
      new CustomEvent(TOAST_OPEN_EVENT, {
        detail: { key: "k3", placement: "center", node: null },
      }),
    );

    expect(onOpen).toHaveBeenCalledTimes(1); // não incrementa
  });
});
