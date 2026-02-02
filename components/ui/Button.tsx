"use client";

import { cn } from "@/lib/utils/cn";

export default function Button({
  children,
  onClick,
  variant = "solid",
  className,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",

        variant === "solid" && "bg-black text-white hover:opacity-90",
        variant === "ghost" && "border bg-white hover:bg-gray-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
