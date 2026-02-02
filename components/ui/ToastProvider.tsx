"use client";

import React, { useEffect, useMemo, useState } from "react";
import { closeToast, subscribeToToasts, type ToastOpenPayload } from "@/lib/toast/events";

type ToastItem = ToastOpenPayload & { createdAt: number };

function upsert(list: ToastItem[], next: ToastItem) {
  const idx = list.findIndex((t) => t.key === next.key);
  if (idx === -1) return [next, ...list];
  const copy = [...list];
  copy[idx] = next;
  return copy;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToToasts({
      onOpen: (p) => {
        const item: ToastItem = {
          ...p,
          placement: p.placement ?? "bottom-right",
          createdAt: Date.now(),
        };

        setToasts((prev) => upsert(prev, item));

        if (p.durationMs && p.durationMs > 0) {
          window.setTimeout(() => closeToast(p.key), p.durationMs);
        }
      },
      onClose: (key) => {
        setToasts((prev) => prev.filter((t) => t.key !== key));
      },
    });
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      toasts.forEach((t) => closeToast(t.key));
    };

    const onPointerDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;

      // clicou dentro de algum toast -> não fecha
      if (el?.closest?.('[data-mp-toast-root="1"]')) return;

      // "clicar fora sem ser num botão" -> se for botão fora, ignora
      if (el?.closest?.("button")) return;

      toasts.forEach((t) => closeToast(t.key));
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [toasts]);

  const center = useMemo(() => toasts.filter((t) => t.placement === "center"), [toasts]);
  const br = useMemo(
    () => toasts.filter((t) => (t.placement ?? "bottom-right") === "bottom-right"),
    [toasts],
  );

  const hasCenter = center.length > 0;

  return (
    <>
      {children}

      {/* CENTER overlay (GLASS) */}
      {hasCenter && (
        <button
          aria-label="Close overlay"
          onClick={() => {
            // fecha todos os center
            center.forEach((t) => closeToast(t.key));
          }}
          className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-md"
        />
      )}

      {/* CENTER toasts (panel style) */}
      <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-4">
        {center.map((t) => (
          <div
            key={t.key}
            data-mp-toast-root="1"
            className="pointer-events-auto w-full max-w-[920px] rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-2xl"
          >
            {t.node}
          </div>
        ))}
      </div>

      {/* Bottom-right stack (toast style) */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {br.map((t) => (
          <div
            key={t.key}
            data-mp-toast-root="1"
            className="pointer-events-auto rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl"
          >
            {t.node}
          </div>
        ))}
      </div>
    </>
  );
}
