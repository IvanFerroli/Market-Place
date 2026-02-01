"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";

export default function SearchBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const [q, setQ] = useState("");

  return (
    <Input
      value={q}
      onChange={(v) => {
        setQ(v);
        onSearch?.(v);
      }}
      placeholder="Search products (stub)"
    />
  );
}
