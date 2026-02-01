"use client";

import { useEffect, useId, useRef } from "react";

export default function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // ESC + scroll lock + restore focus (HealGuid-style)
  useEffect(() => {
    if (!open) return;

    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    queueMicrotask(() => closeBtnRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;

      // restore focus
      try {
        lastActiveRef.current?.focus?.();
      } catch {
        // ignore
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div id={titleId} className="font-semibold">
            {title ?? "Drawer"}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="rounded-lg border px-2 py-1 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
