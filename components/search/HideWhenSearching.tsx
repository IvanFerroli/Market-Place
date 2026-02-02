"use client";

import { useSearchParams } from "next/navigation";

export default function HideWhenSearching({
  children,
  paramKey = "q",
}: {
  children: React.ReactNode;
  paramKey?: string;
}) {
  const sp = useSearchParams();
  const q = (sp.get(paramKey) ?? "").trim();

  if (q) return null;
  return <>{children}</>;
}
