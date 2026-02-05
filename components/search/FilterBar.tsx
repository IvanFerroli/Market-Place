"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import type { Product } from "@/lib/domain/Product";

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
  const openParam = sp.get("filters") === "1";

  const urlCategory = sp.get("category") ?? "";
  const urlSort = sp.get("sort") ?? "";
  const urlInStock = isTruthy(norm(sp.get("inStock")));

  const urlSource = norm(sp.get("source")).toLowerCase();
  const isBlackmarket = urlSource === "blackmarket";

  const [autoCategories, setAutoCategories] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isBlackmarket) {
      setAutoCategories(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/products?source=blackmarket", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as unknown;

        // aceita tanto [products] quanto { products: [...] }
        const arr: Product[] = Array.isArray(json)
          ? (json as Product[])
          : (((json as any)?.products as Product[]) ?? []);

        const cats = Array.from(
          new Set(arr.map((p) => String(p.category ?? "").trim()).filter(Boolean)),
        ).sort((a, b) => a.localeCompare(b));

        if (!cancelled) setAutoCategories(cats);
      } catch {
        if (!cancelled) setAutoCategories([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isBlackmarket]);

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

  // ---- enter/exit animation (slide + fade + collapse)
  const MOTION_MS = 320;

  const [render, setRender] = useState(openParam);
  const [shown, setShown] = useState(openParam);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState(0);

  // mantém max-height alinhado quando estiver aberto (ex.: resize, fontes, etc.)
  useEffect(() => {
    if (!render) return;
    const el = boxRef.current;
    if (!el) return;

    const id = window.requestAnimationFrame(() => {
      setMaxH(el.scrollHeight);
    });

    return () => window.cancelAnimationFrame(id);
  }, [render, shown, category, sort, urlInStock, categories.length]);

  useEffect(() => {
    // ABRINDO
    if (openParam) {
      setRender(true);
      window.requestAnimationFrame(() => {
        const el = boxRef.current;
        setMaxH(el?.scrollHeight ?? 0);
        setShown(true);
      });
      return;
    }

    // FECHANDO (segura no DOM pra animar saída)
    if (!openParam && render) {
      const el = boxRef.current;
      const h = el?.scrollHeight ?? 0;

      setShown(false);
      setMaxH(h);

      // no próximo frame: colapsa (max-height -> 0)
      window.requestAnimationFrame(() => {
        setMaxH(0);
      });

      const t = window.setTimeout(() => {
        setRender(false);
      }, MOTION_MS);

      return () => window.clearTimeout(t);
    }
  }, [openParam, render]);

  const effectiveCategories = useMemo(() => {
    const base = isBlackmarket ? (autoCategories ?? []) : categories;

    return Array.from(new Set(base.map((c) => c.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [isBlackmarket, autoCategories, categories]);

  if (!render) return null;

  return (
    <div
      ref={boxRef}
      style={{ maxHeight: maxH }}
      className={[
        "overflow-hidden border-t border-white/10",
        "transform-gpu transition-[max-height,opacity,transform] duration-300 ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none",
        shown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      ].join(" ")}
    >
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
            {effectiveCategories.map((c) => (
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

        <Button
          type="button"
          variant="ghost"
          aria-pressed={isBlackmarket}
          onClick={() => {
            replaceParams((p) => {
              const next = !isBlackmarket;
              if (next) p.set("source", "blackmarket");
              else p.delete("source");

              // evita categoria "fantasma" ao trocar dataset
              p.delete("category");
            });
          }}
          className={[
            "cp-btn cp-btn-danger h-9 px-3 rounded-full text-xs",
            isBlackmarket ? "" : "opacity-70 hover:opacity-100",
          ].join(" ")}
          title="Edgerunners black market"
        >
          <span
            className={[
              "h-2 w-2 rounded-full",
              isBlackmarket ? "bg-[rgba(197,0,60,0.95)]" : "bg-white/30",
            ].join(" ")}
          />
          Edgerunners black market
        </Button>

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
