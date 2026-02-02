"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";

type Props = {
  paramKey?: string; // default: "q"
  targetPath?: string; // default: "/"
  debounceMs?: number; // default: 120
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  paramKey = "q",
  targetPath = "/",
  debounceMs = 120,
  placeholder = "Search products…",
  className,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlValue = useMemo(
    () => searchParams.get(paramKey) ?? "",
    [searchParams, paramKey],
  );
  const [q, setQ] = useState(urlValue);

  // mantém input sincronizado com back/forward ou navegação
  useEffect(() => {
    setQ(urlValue);
  }, [urlValue]);

  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, []);

  const pushToUrl = (next: string) => {
    if (tRef.current) clearTimeout(tRef.current);

    tRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const v = next.trim();

      if (!v) params.delete(paramKey);
      else params.set(paramKey, v);

      const qs = params.toString();
      router.replace(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false });
    }, debounceMs);
  };

  return (
    <Input
      value={q}
      onChange={(v) => {
        setQ(v);
        pushToUrl(v);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}
