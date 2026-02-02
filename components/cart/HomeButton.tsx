"use client";

import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function HomeButton() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Button
      variant="ghost"
      aria-current={isHome ? "page" : undefined}
      onClick={() => {
        if (isHome) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        router.push("/");
      }}
      className={isHome ? "opacity-90" : undefined}
    >
      Home
    </Button>
  );
}
