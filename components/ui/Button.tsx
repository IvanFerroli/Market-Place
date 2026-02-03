"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost";
};

export default function Button({
  children,
  variant = "solid",
  className,
  type = "button",
  ...props
}: ButtonProps & { children: ReactNode }) {
  return (
    <button
      type={type}
      {...props}
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
