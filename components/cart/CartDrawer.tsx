"use client";

import { useCallback, useEffect, useRef } from "react";

import Drawer from "@/components/ui/Drawer";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import { useCartUI } from "./CartDrawerProvider";
import { useCartSnapshot, useCartActions } from "@/lib/cart/store";

export default function CartDrawer() {
  const ui = useCartUI();
  const cart = useCartSnapshot();
  const { clear } = useCartActions();

  // Guards: evita double-fire (double click / lag / click spam)
  const clearingRef = useRef(false);
  const checkoutRef = useRef(false);

  // Reset guards quando abrir o drawer (nova sessão do UI)
  useEffect(() => {
    if (!ui.isOpen) return;
    clearingRef.current = false;
    checkoutRef.current = false;
  }, [ui.isOpen]);

  const handleClear = useCallback(() => {
    if (clearingRef.current) return;
    clearingRef.current = true;

    try {
      clear();
    } finally {
      // libera no próximo tick (evita dupla ação no mesmo frame)
      queueMicrotask(() => {
        clearingRef.current = false;
      });
    }
  }, [clear]);

  const handleCheckoutMock = useCallback(() => {
    if (checkoutRef.current) return;
    checkoutRef.current = true;

    try {
      // placeholder checkout action
      clear();
      ui.close();
    } finally {
      queueMicrotask(() => {
        checkoutRef.current = false;
      });
    }
  }, [clear, ui]);

  return (
    <Drawer open={ui.isOpen} onClose={ui.close} title="Your cart">
      {cart.items.length === 0 ? (
        <div className="py-10 text-sm text-gray-600">Cart is empty.</div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {cart.items.map((it) => (
              <CartItemRow key={it.product.id} item={it} />
            ))}
          </div>

          <CartSummary cart={cart} />

          <div className="flex gap-2 pt-2">
            <button
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              onClick={handleClear}
            >
              Clear
            </button>

            <button
              className="ml-auto rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
              onClick={handleCheckoutMock}
            >
              Checkout (mock)
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
