"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  // micro-animations (bonus: “Animações/transições no carrinho”)
  const [cardPop, setCardPop] = useState(true);
  const [addedPulse, setAddedPulse] = useState(false);
  const [summaryPulse, setSummaryPulse] = useState(false);

  // 1) Pop discreto ao montar (quando o toast aparece)
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setCardPop(false));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const addedProductName = useMemo(() => {
    if (!productId) return null;
    const hit = cart.items.find((it) => String(it.product.id) === String(productId));
    return hit?.product?.name ?? null;
  }, [cart.items, productId]);

  // 2) Pulse no “Added …” quando productId muda / chega
  const lastProductIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!productId) return;
    if (lastProductIdRef.current === productId) return;

    lastProductIdRef.current = productId;
    setAddedPulse(true);

    const id = window.setTimeout(() => setAddedPulse(false), 180);
    return () => window.clearTimeout(id);
  }, [productId]);
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

  // 3) Pulse no summary quando itens/quantidades mudam
  const itemsSig = useMemo(() => {
    // assume item.qty (padrão no teu store); se não existir, TS vai gritar e ajustamos na hora
    return cart.items.map((it) => `${it.product.id}:${it.quantity}`).join("|");
  }, [cart.items]);

  const prevSigRef = useRef(itemsSig);
  useEffect(() => {
    if (prevSigRef.current === itemsSig) return;
    prevSigRef.current = itemsSig;

    setSummaryPulse(true);
    const id = window.setTimeout(() => setSummaryPulse(false), 180);
    return () => window.clearTimeout(id);
  }, [itemsSig]);

  return (
    <div
      className={[
        "relative w-[380px] max-w-[92vw] cp-glass-strong cp-edge-soft rounded-3xl overflow-hidden",
        "transform-gpu will-change-transform will-change-opacity transition-[transform,opacity] duration-200 ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none",
        cardPop ? "opacity-95 scale-[0.99]" : "opacity-100 scale-100",
      ].join(" ")}
    >
      {/* header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-white/10">

        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/95">Your cart</div>
          <div className="text-xs text-white/65">
            {addedProductName ? (
              <>
                Added{" "}
                <span
                  className={[
                    "font-semibold text-white/95",
                    "transition-[transform,opacity] duration-200 ease-out inline-block",
                    "motion-reduce:transition-none motion-reduce:transform-none",
                    addedPulse ? "opacity-100 scale-[1.02]" : "opacity-90 scale-100",
                  ].join(" ")}
                >
                  {addedProductName}
                </span>
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
            <div className="max-h-[280px] overflow-auto pr-1 space-y-3 cp-scrollbar-soft">
              {cart.items.map((it) => (
                <CartItemRow key={String(it.product.id)} item={it} />
              ))}
            </div>

            <div
              className={[
                "transform-gpu transition-[transform,opacity] duration-200 ease-out",
                "motion-reduce:transition-none motion-reduce:transform-none",
                summaryPulse ? "opacity-100 scale-[1.01]" : "opacity-95 scale-100",
              ].join(" ")}
            >
              <CartSummary cart={cart} />
            </div>

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
