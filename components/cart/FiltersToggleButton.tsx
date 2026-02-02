"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function FiltersToggleButton() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const isOpen = sp.get("filters") === "1";

  return (
    <Button
      variant="ghost"
      aria-pressed={isOpen}
      onClick={() => {
        const params = new URLSearchParams(window.location.search);

        if (isOpen) params.delete("filters");
        else params.set("filters", "1");

        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }}
    >
      Filters
    </Button>
  );
}
