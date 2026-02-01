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

import CartDrawer from "./CartDrawer";
import { useCartStore } from "@/lib/cart/store";

import { CART_OPEN_EVENT, CART_CLOSE_EVENT, CART_TOGGLE_EVENT } from "@/lib/cart/events";

// Back-compat: se algum lugar já importava esses consts do Provider
export { CART_OPEN_EVENT, CART_CLOSE_EVENT, CART_TOGGLE_EVENT } from "@/lib/cart/events";

type CartUiCtx = {
  open: () => void;
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

// debug helper (easy to delete later)
const dbg = (...args: unknown[]) => {
  const enabled =
    process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_CART_DEBUG === "1";
  if (enabled) console.log(...args);
};

export default function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // init cart persistence once on client
  useCartStore();

  // guards (avoid double open/close spam)
  const isOpenRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const open = useCallback(() => {
    if (isOpenRef.current) return;
    dbg("[CartDrawerProvider] open()");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!isOpenRef.current) return;
    dbg("[CartDrawerProvider] close()");
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    dbg("[CartDrawerProvider] toggle()");
    setIsOpen((v) => !v);
  }, []);

  // Global events (optional, but very reusable)
  useEffect(() => {
    const onOpen = (_e: Event) => open();
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

  // NOTE:
  // - no scroll lock here
  // - no ESC listener here
  // Drawer.tsx already handles ESC + scroll lock + focus restore

  const value = useMemo<CartUiCtx>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}
