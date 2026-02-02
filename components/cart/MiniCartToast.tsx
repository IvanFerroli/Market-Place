"use client";

import { useCallback, useMemo, useRef } from "react";

import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";

import { useCartSnapshot, useCartActions } from "@/lib/cart/store";
import { closeCart } from "@/lib/cart/events";
import { closeToast } from "@/lib/toast/events";

type Props = {
  productId?: string;
};

export default function CartToast({ productId }: Props) {
  const cart = useCartSnapshot();
  const { clear } = useCartActions();

  const clearingRef = useRef(false);
  const checkoutRef = useRef(false);

  const addedProductName = useMemo(() => {
    if (!productId) return null;
    const hit = cart.items.find((it) => String(it.product.id) === String(productId));
    return hit?.product?.name ?? null;
  }, [cart.items, productId]);

  const handleClose = useCallback(() => {
    closeToast("cart");
    closeCart();
  }, []);

  const handleClear = useCallback(() => {
    if (clearingRef.current) return;
    clearingRef.current = true;

    try {
      clear();
    } finally {
      queueMicrotask(() => {
        clearingRef.current = false;
      });
    }
  }, [clear]);

  const handleCheckoutMock = useCallback(() => {
    if (checkoutRef.current) return;
    checkoutRef.current = true;

    try {
      clear();
      closeCart();
    } finally {
      queueMicrotask(() => {
        checkoutRef.current = false;
      });
    }
  }, [clear]);

  return (
    <div className="relative w-[380px] max-w-[92vw] cp-glass-strong rounded-3xl overflow-hidden">
      {/* header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-white/10">
        <div className="absolute left-0 top-0 h-[2px] w-full" />

        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/95">Your cart</div>
          <div className="text-xs text-white/65">
            {addedProductName ? (
              <>
                Added{" "}
                <span className="font-semibold text-white/95">{addedProductName}</span>
              </>
            ) : (
              <>Cart preview</>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="cp-btn cp-btn-danger h-9 px-3 rounded-full text-xs"
          aria-label="Close cart"
        >
          Close
        </button>
      </div>

      {/* body */}
      <div className="px-4 py-4">
        {cart.items.length === 0 ? (
          <div className="py-6 text-sm text-white/70">Cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {/* items (scroll if many) */}
            <div className="max-h-[280px] overflow-auto pr-1 space-y-3">
              {cart.items.map((it) => (
                <CartItemRow key={String(it.product.id)} item={it} />
              ))}
            </div>

            <CartSummary cart={cart} />

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="cp-btn cp-btn-danger h-10 px-4"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleCheckoutMock}
                className="cp-btn cp-btn-primary h-10 px-4 ml-auto"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
