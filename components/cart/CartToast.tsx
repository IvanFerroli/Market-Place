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
    // fecha o toast direto (independe de provider)
    closeToast("cart");
    // mantém o “cart ui state” coerente (se você estiver usando openCart/closeCart)
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
      // mock checkout: limpa e fecha
      clear();
      closeCart();
    } finally {
      queueMicrotask(() => {
        checkoutRef.current = false;
      });
    }
  }, [clear]);

  return (
    <div className="w-[380px] max-w-[92vw]">
      {/* header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-black/5">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">Your cart</div>
          <div className="text-xs text-gray-600">
            {addedProductName ? (
              <>
                Added{" "}
                <span className="font-semibold text-gray-900">{addedProductName}</span>
              </>
            ) : (
              <>Cart preview</>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-white"
          aria-label="Close cart"
        >
          Close
        </button>
      </div>

      {/* body */}
      <div className="px-4 py-4">
        {cart.items.length === 0 ? (
          <div className="py-6 text-sm text-gray-700">Cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {/* items (scroll if many) */}
            <div className="max-h-[280px] overflow-auto pr-1 space-y-3">
              {cart.items.map((it) => (
                <CartItemRow key={it.product.id} item={it} />
              ))}
            </div>

            <CartSummary cart={cart} />

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm hover:bg-white"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleCheckoutMock}
                className="ml-auto rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
              >
                Checkout (mock)
              </button>
            </div>

            <div className="text-[11px] text-gray-500">
              (MVP) Checkout real depois — aqui a gente só mantém tudo na mesma página.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
