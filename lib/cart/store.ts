"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { Cart } from "@/lib/domain/Cart";
import type { Product } from "@/lib/domain/Product";
import { loadCart, saveCart } from "./persist";

type State = Cart;

let state: State = { items: [] };
let listeners = new Set<() => void>();
let hydrated = false;

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function setState(next: State) {
  state = next;
  saveCart(state);
  emit();
}

export function useCartStore() {
  useEffect(() => {
    if (!hydrated) {
      state = loadCart();
      hydrated = true;
      emit();
    }
  }, []);
}

export function useCartSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useCartActions() {
  return useMemo(() => {
    const idEq = (a: number, b: string | number) => String(a) === String(b);

    return {
      addItem(product: Product, qty: number) {
        const existing = state.items.find((it) => idEq(it.product.id, product.id));
        if (!existing) {
          setState({ items: [...state.items, { product, quantity: qty }] });
          return;
        }
        setState({
          items: state.items.map((it) =>
            idEq(it.product.id, product.id) ? { ...it, quantity: it.quantity + qty } : it,
          ),
        });
      },

      setQty(productId: string, qty: number) {
        setState({
          items: state.items.map((it) =>
            idEq(it.product.id, productId) ? { ...it, quantity: qty } : it,
          ),
        });
      },

      removeItem(productId: string) {
        setState({
          items: state.items.filter((it) => !idEq(it.product.id, productId)),
        });
      },

      clear() {
        setState({ items: [] });
      },
    };
  }, []);
}
