"use client";

import { usePathname } from "next/navigation";

export default function HomeBadge() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Ativo (na home): dot neon “aceso”
  if (isHome) {
    return (
      <span
        aria-hidden="true"
        className="absolute -right-2 -top-2 block h-2.5 w-2.5 rounded-full bg-[color:var(--cp-accent)] shadow-[0_0_18px_rgba(255,255,0,0.55)]"
        title="You are on Home"
      />
    );
  }

  // Fora da home: badge com ícone de voltar
  return (
    <span
      aria-hidden="true"
      className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[color:var(--cp-accent)] px-1 text-[10px] font-semibold text-black shadow-[0_0_16px_rgba(255,255,0,0.35)]"
      title="Back to home"
    >
      ⌂
    </span>
  );
}
