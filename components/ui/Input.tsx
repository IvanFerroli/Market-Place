"use client";

import { cn } from "@/lib/utils/cn";

export default function Input({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20",
        className,
      )}
    />
  );
}
