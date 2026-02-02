"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";

function norm(v: string | null) {
  return (v ?? "").trim();
}

function isTruthy(v: string) {
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

export default function HideWhenQueryActive({ children }: { children: ReactNode }) {
  const sp = useSearchParams();

  const q = norm(sp.get("q"));
  const category = norm(sp.get("category"));
  const sort = norm(sp.get("sort"));
  const inStock = isTruthy(norm(sp.get("inStock")));
  const filtersOpen = isTruthy(norm(sp.get("filters")));

  const active = Boolean(filtersOpen || q || category || sort || inStock);

  if (active) return null;
  return <>{children}</>;
}
