"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

function norm(v: string | null) {
  return (v ?? "").trim();
}
function isTruthy(v: string) {
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

export default function FilterBar({ categories = [] }: { categories?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const open = sp.get("filters") === "1";

  const urlCategory = sp.get("category") ?? "";
  const urlSort = sp.get("sort") ?? "";
  const urlInStock = isTruthy(norm(sp.get("inStock")));

  const [category, setCategory] = useState(urlCategory);
  const [sort, setSort] = useState(urlSort);

  // sync back/forward
  useEffect(() => setCategory(urlCategory), [urlCategory]);
  useEffect(() => setSort(urlSort), [urlSort]);

  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const replaceParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(window.location.search);
    mutate(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const setCategoryDebounced = (next: string) => {
    setCategory(next);
    if (tRef.current) clearTimeout(tRef.current);

    tRef.current = setTimeout(() => {
      replaceParams((p) => {
        const v = next.trim();
        if (!v) p.delete("category");
        else p.set("category", v);
      });
    }, 120);
  };

  const onResetFilters = () => {
    replaceParams((p) => {
      // mantém q (search) — só limpa filtros da barra
      p.delete("category");
      p.delete("sort");
      p.delete("inStock");
    });
  };

  if (!open) return null;

  return (
    <div className="border-t border-white/10">
      <Container className="flex flex-wrap items-center gap-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/70">Category</span>

          <select
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              replaceParams((p) => {
                if (!v) p.delete("category");
                else p.set("category", v);
              });
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)))
              .sort((a, b) => a.localeCompare(b))
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/70">Sort</span>
          <select
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              setSort(v);
              replaceParams((p) => {
                if (!v) p.delete("sort");
                else p.set("sort", v);
              });
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Default</option>
            <option value="name_asc">Name (A→Z)</option>
            <option value="price_asc">Price (low→high)</option>
            <option value="price_desc">Price (high→low)</option>
            <option value="stock_desc">Stock (high→low)</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={urlInStock}
            onChange={(e) => {
              const on = e.target.checked;
              replaceParams((p) => {
                if (!on) p.delete("inStock");
                else p.set("inStock", "1");
              });
            }}
          />
          <span className="text-white/80">In stock only</span>
        </label>

        <div className="flex-1" />

        <Button variant="ghost" className="cp-btn cp-btn-danger" onClick={onResetFilters}>
          Reset filters
        </Button>

        <Button
          variant="ghost"
          className="cp-btn cp-btn-danger"
          onClick={() => {
            replaceParams((p) => p.delete("filters"));
          }}
        >
          Close
        </Button>
      </Container>
    </div>
  );
}
