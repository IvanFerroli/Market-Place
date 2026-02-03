"use client";

import { normalizeId } from "@/lib/utils/ids";

/**
 * Cart UI event bus.
 *
 * Purpose:
 * - Decouple "open/close/toggle cart UI" actions from specific components.
 * - Allow any UI element (header button, product card, etc.) to trigger cart behavior
 *   without directly importing cart UI providers.
 *
 * Events:
 * - {@link CART_OPEN_EVENT}  (detail: {@link OpenCartPayload})
 * - {@link CART_CLOSE_EVENT} (no detail)
 * - {@link CART_TOGGLE_EVENT} (no detail)
 */
export type CartSource =
  | "header"
  | "product_page"
  | "product_card"
  | "add_to_cart_button"
  | "unknown";

/**
 * Payload for {@link openCart}.
 *
 * `productId` is optional and used only for telemetry/debugging (e.g. which product triggered the open).
 */
export type OpenCartPayload = {
  source?: CartSource;
  productId?: string; // opcional (telemetria/debug)
};

/** Dispatched when the cart UI should open. */
export const CART_OPEN_EVENT = "mp:cart:open";
/** Dispatched when the cart UI should close. */
export const CART_CLOSE_EVENT = "mp:cart:close";
/** Dispatched when the cart UI should toggle (open <-> close). */
export const CART_TOGGLE_EVENT = "mp:cart:toggle";

/**
 * Dispatches {@link CART_OPEN_EVENT}.
 *
 * SSR safety:
 * - No-op when `window` is not available.
 *
 * Normalization:
 * - `productId` is normalized via {@link normalizeId} and omitted if invalid.
 * - `source` defaults to `"unknown"`.
 */
export function openCart(payload: OpenCartPayload = {}) {
  if (typeof window === "undefined") return;

  const productId = normalizeId(payload.productId);

  window.dispatchEvent(
    new CustomEvent<OpenCartPayload>(CART_OPEN_EVENT, {
      detail: {
        source: payload.source ?? "unknown",
        ...(productId ? { productId } : {}),
      },
    }),
  );
}

/**
 * Dispatches {@link CART_CLOSE_EVENT}.
 *
 * SSR safety:
 * - No-op when `window` is not available.
 */
export function closeCart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_CLOSE_EVENT));
}

/**
 * Dispatches {@link CART_TOGGLE_EVENT}.
 *
 * SSR safety:
 * - No-op when `window` is not available.
 */
export function toggleCart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_TOGGLE_EVENT));
}
