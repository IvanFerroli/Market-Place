"use client";

import type { ReactNode } from "react";

export type ToastPlacement = "bottom-right" | "center";

export type ToastOpenPayload = {
  key: string; // dedupe/update
  placement?: ToastPlacement;
  // render livre (JSX)
  node: ReactNode;
  // opcional: auto close
  durationMs?: number;
};

export const TOAST_OPEN_EVENT = "__mp_toast_open__";
export const TOAST_CLOSE_EVENT = "__mp_toast_close__";

export function openToast(payload: ToastOpenPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_OPEN_EVENT, { detail: payload }));
}

export function closeToast(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_CLOSE_EVENT, { detail: { key } }));
}

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
    const ce = e as CustomEvent;
    const key = String((ce as any).detail?.key ?? "");
    if (key) handlers.onClose(key);
  };

  window.addEventListener(TOAST_OPEN_EVENT, onOpen);
  window.addEventListener(TOAST_CLOSE_EVENT, onClose);

  return () => {
    window.removeEventListener(TOAST_OPEN_EVENT, onOpen);
    window.removeEventListener(TOAST_CLOSE_EVENT, onClose);
  };
}
