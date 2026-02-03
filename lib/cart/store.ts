"use client";

/**
 * Cart store (client-only) implemented with `useSyncExternalStore`.
 *
 * Why this exists:
 * - Keeps cart state outside React so any UI can subscribe without prop-drilling.
 * - Hydrates from localStorage on first use.
 * - Batches multiple mutations within the same tick into a single save + emit (microtask).
 *
 * Public surface:
 * - `cartInitClient`, `cartSubscribe`, `cartGetSnapshot` (non-React, test-friendly)
 * - `cartActions` (mutations)
 * - React wrappers: `useCartSnapshot`, `useCartActions`
 */
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
    state = normalizeCart(loadCart());
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
  state = normalizeCart(next);
  scheduleCommit();
}

function clampQty(qty: number) {
  const n = Number(qty);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.floor(n));
}

function normalizeCart(input: unknown): State {
  const coerceItems = (arr: any[]): State["items"] =>
    arr
      .filter((it) => it && it.product)
      .map((it) => ({
        product: it.product as Product,
        quantity: clampQty((it as any).quantity ?? (it as any).qty ?? 1),
      }));

  if (Array.isArray(input)) return { items: coerceItems(input) };

  const maybe = input as any;
  if (maybe && Array.isArray(maybe.items)) return { items: coerceItems(maybe.items) };

  return { items: [] };
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

// -------------------------
// ✅ API sem React (testável)
// -------------------------

/**
 * Ensures the store is hydrated on the client.
 *
 * Call this once on app boot (or inside a React effect). Safe to call multiple times.
 */
export function cartInitClient() {
  // equivalente ao antigo useEffect do useCartStore
  if (!hydrated) {
    state = normalizeCart(loadCart());
    hydrated = true;
    emit();
  }
}

/**
 * Subscribes to cart changes.
 *
 * Used by React via `useSyncExternalStore`, but also usable in non-React contexts.
 */
export function cartSubscribe(listener: () => void) {
  return subscribe(listener);
}

/**
 * Returns the current cart snapshot.
 *
 * In React, this is the `getSnapshot` function passed to `useSyncExternalStore`.
 */
export function cartGetSnapshot() {
  return getSnapshot();
}

/**
 * Cart mutation API.
 *
 * Notes:
 * - All mutations are normalized and persisted (batched via microtask).
 * - `setQty` treats qty <= 0 as removal (prevents "0-qty items" from breaking UI).
 * - Currently the dedupe key is `product.id`. If variants are introduced, we should
 *   switch to an explicit `itemKey` on CartItem.
 */
export const cartActions = {
  addItem(product: Product, qty: number) {
    ensureHydrated();

    const q = clampQty(qty);
    const key = getItemKeyFromProduct(product);

    const existing = state.items.find((it) => getItemKeyFromProduct(it.product) === key);
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

// -------------------------
// ✅ Helpers de teste
// -------------------------

/**
 * Test helper: resets the store to a clean initial state.
 *
 * Useful for unit tests to avoid state leaking between cases.
 */
export function cartResetForTests() {
  state = { items: [] };
  listeners = new Set();
  hydrated = false;
  commitScheduled = false;
}

/**
 * Test helper: waits for the scheduled microtask commit to run.
 *
 * This lets tests assert against persisted/normalized state after mutations.
 */
export function cartFlushCommitForTests() {
  // garante que o queueMicrotask() do scheduleCommit rodou
  return new Promise<void>((resolve) => queueMicrotask(() => resolve()));
}

// -------------------------
// Hooks (wrappers finos)
// -------------------------

/**
 * React helper that performs client hydration on mount.
 *
 * Prefer using this once at a high level (e.g. provider/root layout).
 */
export function useCartStore() {
  useEffect(() => {
    cartInitClient();
  }, []);
}

/**
 * React hook to read the cart state.
 *
 * Uses `useSyncExternalStore` so updates are consistent with React concurrent rendering.
 */
export function useCartSnapshot() {
  return useSyncExternalStore(cartSubscribe, cartGetSnapshot, cartGetSnapshot);
}

/**
 * React hook that returns a stable reference to {@link cartActions}.
 */
export function useCartActions() {
  return useMemo(() => cartActions, []);
}
