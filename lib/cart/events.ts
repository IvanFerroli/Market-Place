"use client";

import { normalizeId } from "@/lib/utils/ids";

export type CartSource =
  | "header"
  | "product_page"
  | "product_card"
  | "add_to_cart_button"
  | "unknown";

export type OpenCartPayload = {
  source?: CartSource;
  productId?: string; // opcional (telemetria/debug)
};

export const CART_OPEN_EVENT = "mp:cart:open";
export const CART_CLOSE_EVENT = "mp:cart:close";
export const CART_TOGGLE_EVENT = "mp:cart:toggle";

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

export function closeCart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_CLOSE_EVENT));
}

export function toggleCart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_TOGGLE_EVENT));
}
