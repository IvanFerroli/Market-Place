"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import CartDrawer from "./CartDrawer";
import { useCartStore } from "@/lib/cart/store";

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

export default function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // init cart persistence once on client
  useCartStore();

  const value = useMemo<CartUiCtx>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
    }),
    [isOpen],
  );

  // UX: lock scroll quando drawer aberto (evita página "mexer" atrás)
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // UX: ESC fecha drawer (comportamento de modal padrão)
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}
