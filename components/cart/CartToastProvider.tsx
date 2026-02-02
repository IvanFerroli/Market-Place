"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useCartStore } from "@/lib/cart/store";
import {
  CART_OPEN_EVENT,
  CART_CLOSE_EVENT,
  CART_TOGGLE_EVENT,
  type OpenCartPayload,
} from "@/lib/cart/events";

import {
  openToast,
  closeToast,
  TOAST_OPEN_EVENT,
  TOAST_CLOSE_EVENT,
  type ToastOpenPayload,
} from "@/lib/toast/events";

import CartToast from "./CartToast";

// Back-compat: se algum lugar já importava esses consts do Provider
export { CART_OPEN_EVENT, CART_CLOSE_EVENT, CART_TOGGLE_EVENT } from "@/lib/cart/events";

type CartUiCtx = {
  open: (p?: OpenCartPayload) => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
};

const Ctx = createContext<CartUiCtx | null>(null);

export function useCartUI() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCartUI must be used within CartDrawerProvider");
  return v;
}

const TOAST_KEY = "cart";

export default function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  // init cart persistence once on client
  useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const onToastOpen = (e: Event) => {
      const ce = e as CustomEvent<ToastOpenPayload>;
      if (ce.detail?.key === TOAST_KEY) setIsOpen(true);
    };

    const onToastClose = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      const k = String((ce as any).detail?.key ?? "");
      if (k === TOAST_KEY) setIsOpen(false);
    };

    window.addEventListener(TOAST_OPEN_EVENT, onToastOpen as EventListener);
    window.addEventListener(TOAST_CLOSE_EVENT, onToastClose as EventListener);

    return () => {
      window.removeEventListener(TOAST_OPEN_EVENT, onToastOpen as EventListener);
      window.removeEventListener(TOAST_CLOSE_EVENT, onToastClose as EventListener);
    };
  }, []);

  const open = useCallback((payload?: OpenCartPayload) => {
    const productId = String(payload?.productId ?? "").trim();
    openToast({
      key: TOAST_KEY,
      placement: "bottom-right",
      node: <CartToast productId={productId || undefined} />,
    });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    closeToast(TOAST_KEY);
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpenRef.current) close();
    else open();
  }, [close, open]);

  // Global events (source of truth)
  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<OpenCartPayload>;
      open(ce.detail);
    };
    const onClose = (_e: Event) => close();
    const onToggle = (_e: Event) => toggle();

    window.addEventListener(CART_OPEN_EVENT, onOpen as EventListener);
    window.addEventListener(CART_CLOSE_EVENT, onClose as EventListener);
    window.addEventListener(CART_TOGGLE_EVENT, onToggle as EventListener);

    return () => {
      window.removeEventListener(CART_OPEN_EVENT, onOpen as EventListener);
      window.removeEventListener(CART_CLOSE_EVENT, onClose as EventListener);
      window.removeEventListener(CART_TOGGLE_EVENT, onToggle as EventListener);
    };
  }, [open, close, toggle]);

  const value = useMemo<CartUiCtx>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
