"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function BlackMarketMode() {
  const sp = useSearchParams();
  const source = (sp.get("source") ?? "").trim().toLowerCase();
  const on = source === "blackmarket";

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("bm-mode", on);

    return () => {
      el.classList.remove("bm-mode");
    };
  }, [on]);

  return null;
}
