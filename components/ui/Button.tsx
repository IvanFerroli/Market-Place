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
        // base (global)
        "cp-btn disabled:opacity-50 disabled:cursor-not-allowed",

        // variants
        variant === "solid" && "cp-btn-primary",
        variant === "ghost" && "cp-btn-ghost",

        className,
      )}
    >
      {children}
    </button>
  );
}
