"use client";

import { createContext, useContext, useMemo, useState } from "react";
import CartDrawer from "./CartDrawer";
import { useCartStore } from "@/lib/cart/store";

type CartUiCtx = {
  open: () => void;
  close: () => void;
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
    }),
    [isOpen],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}
