"use client";

import React, { useEffect, useMemo, useState } from "react";
import { closeToast, subscribeToToasts, type ToastOpenPayload } from "@/lib/toast/events";

type UiState = "enter" | "open" | "leave";

type ToastItem = ToastOpenPayload & {
  createdAt: number;
  uiState: UiState;
  leavingAt?: number;
};

const MOTION_MS = 260;

function motionClass(state: UiState, variant: "center" | "br") {
  const base =
    "transform-gpu will-change-transform will-change-opacity transition-[transform,opacity] duration-300 ease-out";

  const enter =
    variant === "center"
      ? "opacity-0 translate-y-3 scale-[0.985]"
      : "opacity-0 translate-y-2 scale-[0.99]";
  const open = "opacity-100 translate-y-0 scale-100";
  const leave =
    variant === "center"
      ? "opacity-0 translate-y-3 scale-[0.985] pointer-events-none"
      : "opacity-0 translate-y-2 scale-[0.99] pointer-events-none";

  if (state === "enter") return `${base} ${enter}`;
  if (state === "leave") return `${base} ${leave}`;
  return `${base} ${open}`;
}

function upsert(list: ToastItem[], next: ToastItem) {
  const idx = list.findIndex((t) => t.key === next.key);
  if (idx === -1) return [next, ...list];

  const prev = list[idx];
  const copy = [...list];

  // se estava saindo e reabriu, “ressuscita” e limpa leavingAt
  copy[idx] = {
    ...prev,
    ...next,
    uiState: next.uiState ?? prev.uiState,
    leavingAt: undefined,
  };

  return copy;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [overlayMounted, setOverlayMounted] = useState(false);

  useEffect(() => {
    return subscribeToToasts({
      onOpen: (p) => {
        const now = Date.now();

        const item: ToastItem = {
          ...p,
          placement: p.placement ?? "bottom-right",
          createdAt: now,
          uiState: "enter",
        };

        setToasts((prev) => upsert(prev, item));

        // promove enter -> open no próximo frame (gatilho da transição)
        window.requestAnimationFrame(() => {
          setToasts((prev) =>
            prev.map((t) =>
              t.key === p.key ? { ...t, uiState: "open", leavingAt: undefined } : t,
            ),
          );
        });

        if (p.durationMs && p.durationMs > 0) {
          window.setTimeout(() => closeToast(p.key), p.durationMs);
        }
      },

      onClose: (key) => {
        const leavingAt = Date.now();

        setToasts((prev) =>
          prev.map((t) => (t.key === key ? { ...t, uiState: "leave", leavingAt } : t)),
        );

        window.setTimeout(() => {
          setToasts((prev) =>
            prev.filter(
              (t) =>
                !(t.key === key && t.uiState === "leave" && t.leavingAt === leavingAt),
            ),
          );
        }, MOTION_MS);
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

  const centerHasAny = center.length > 0;
  const centerVisible = center.some((t) => t.uiState !== "leave");

  useEffect(() => {
    if (centerHasAny) {
      setOverlayMounted(true);
      return;
    }

    if (!overlayMounted) return;

    const id = window.setTimeout(() => setOverlayMounted(false), MOTION_MS);
    return () => window.clearTimeout(id);
  }, [centerHasAny, overlayMounted]);

  return (
    <>
      {children}

      {/* CENTER overlay (GLASS) */}
      {overlayMounted && (
        <button
          aria-label="Close overlay"
          onClick={() => {
            // fecha todos os center
            center.forEach((t) => closeToast(t.key));
          }}
          className={[
            "fixed inset-0 z-[9998] bg-black/10 backdrop-blur-md",
            "transition-opacity duration-300 ease-out",

            centerVisible ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
        />
      )}

      {/* CENTER toasts (panel style) */}
      <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-4">
        {center.map((t) => (
          <div
            key={t.key}
            data-mp-toast-root="1"
            className={[
              "pointer-events-auto w-full max-w-[920px] rounded-2xl cp-glass-strong shadow-2xl",
              motionClass(t.uiState, "center"),
            ].join(" ")}
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
            className={[
              "pointer-events-auto rounded-2xl cp-glass-strong shadow-xl",
              motionClass(t.uiState, "br"),
            ].join(" ")}
          >
            {t.node}
          </div>
        ))}
      </div>
    </>
  );
}
