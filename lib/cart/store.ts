"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { Cart } from "@/lib/domain/Cart";
import type { Product } from "@/lib/domain/Product";
import { loadCart, saveCart } from "./persist";

type State = Cart;

let state: State = { items: [] };
let listeners = new Set<() => void>();
let hydrated = false;

// ✅ batching: múltiplas actions no mesmo tick => 1 save + 1 emit
let commitScheduled = false;

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

function ensureHydrated() {
  if (!hydrated) {
    state = loadCart();
    hydrated = true;
  }
}

function scheduleCommit() {
  if (commitScheduled) return;
  commitScheduled = true;

  queueMicrotask(() => {
    commitScheduled = false;
    saveCart(state);
    emit();
  });
}

function setState(next: State) {
  state = next;
  scheduleCommit();
}

function clampQty(qty: number) {
  const n = Number(qty);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.floor(n));
}

/**
 * ✅ Dedupe key (simples e consistente)
 * - por enquanto, a key é sempre product.id
 * - se um dia houver variantes, vamos introduzir um `itemKey` explícito no CartItem
 */

function getItemKeyFromProduct(product: Product): string {
  return String(product.id);
}

function getItemKeyFromId(productId: string): string {
  return String(productId);
}

export function useCartStore() {
  useEffect(() => {
    // init cart persistence once on client
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
    return {
      addItem(product: Product, qty: number) {
        ensureHydrated();

        const q = clampQty(qty);
        const key = getItemKeyFromProduct(product);

        const existing = state.items.find(
          (it) => getItemKeyFromProduct(it.product) === key,
        );
        if (!existing) {
          setState({ items: [...state.items, { product, quantity: q }] });
          return;
        }

        setState({
          items: state.items.map((it) =>
            getItemKeyFromProduct(it.product) === key
              ? { ...it, quantity: clampQty(it.quantity + q) }
              : it,
          ),
        });
      },

      setQty(productId: string, qty: number) {
        ensureHydrated();

        const key = getItemKeyFromId(productId);
        const n = Number(qty);

        // ✅ qty <= 0 => remove (evita “0 item” bugando UI)
        if (!Number.isFinite(n) || n <= 0) {
          setState({
            items: state.items.filter((it) => getItemKeyFromProduct(it.product) !== key),
          });
          return;
        }

        const q = clampQty(n);

        setState({
          items: state.items.map((it) =>
            getItemKeyFromProduct(it.product) === key ? { ...it, quantity: q } : it,
          ),
        });
      },

      removeItem(productId: string) {
        ensureHydrated();

        const key = getItemKeyFromId(productId);
        setState({
          items: state.items.filter((it) => getItemKeyFromProduct(it.product) !== key),
        });
      },

      clear() {
        ensureHydrated();
        setState({ items: [] });
      },
    };
  }, []);
}
