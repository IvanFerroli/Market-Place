"use client";

import type { ReactNode } from "react";

/**
 * Toast event bus.
 *
 * Purpose:
 * - Decouple toast producers (any component) from the toast renderer/provider.
 * - Support "dedupe/update" behavior via a stable `key`.
 *
 * Events:
 * - {@link TOAST_OPEN_EVENT}  (detail: {@link ToastOpenPayload})
 * - {@link TOAST_CLOSE_EVENT} (detail: `{ key: string }`)
 */
export type ToastPlacement = "bottom-right" | "center";

/**
 * Payload dispatched by {@link openToast}.
 *
 * Notes:
 * - `key` is used for dedupe/update (open with same key replaces content).
 * - `node` is arbitrary React content rendered by the toast provider.
 * - `durationMs` can be used by the provider for auto-close behavior.
 */
export type ToastOpenPayload = {
  key: string; // dedupe/update
  placement?: ToastPlacement;
  // render livre (JSX)
  node: ReactNode;
  // opcional: auto close
  durationMs?: number;
};

/** Dispatched to request opening (or updating) a toast. */
export const TOAST_OPEN_EVENT = "__mp_toast_open__";
/** Dispatched to request closing a toast by key. */
export const TOAST_CLOSE_EVENT = "__mp_toast_close__";

/**
 * Dispatches {@link TOAST_OPEN_EVENT}.
 *
 * SSR safety:
 * - No-op when `window` is not available.
 */
export function openToast(payload: ToastOpenPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_OPEN_EVENT, { detail: payload }));
}

/**
 * Dispatches {@link TOAST_CLOSE_EVENT}.
 *
 * SSR safety:
 * - No-op when `window` is not available.
 */
export function closeToast(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_CLOSE_EVENT, { detail: { key } }));
}

/**
 * Subscribes to toast events.
 *
 * Used by the toast provider to react to open/close requests.
 * Returns an unsubscribe function.
 *
 * SSR safety:
 * - In non-browser environments, returns a no-op unsubscribe.
 */
export function subscribeToToasts(handlers: {
  onOpen: (p: ToastOpenPayload) => void;
  onClose: (key: string) => void;
}) {
  if (typeof window === "undefined") return () => {};

  const onOpen = (e: Event) => {
    const ce = e as CustomEvent;
    handlers.onOpen(ce.detail as ToastOpenPayload);
  };

  const onClose = (e: Event) => {
    const ce = e as CustomEvent<{ key?: string }>;
    const key = String(ce.detail?.key ?? "");

    if (key) handlers.onClose(key);
  };

  window.addEventListener(TOAST_OPEN_EVENT, onOpen);
  window.addEventListener(TOAST_CLOSE_EVENT, onClose);

  return () => {
    window.removeEventListener(TOAST_OPEN_EVENT, onOpen);
    window.removeEventListener(TOAST_CLOSE_EVENT, onClose);
  };
}
