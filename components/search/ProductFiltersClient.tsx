"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/domain/Product";
import ProductGrid from "@/components/products/ProductGrid";

const PAGE_SIZE = 9;

function norm(s: string) {
  return (s ?? "").trim().toLowerCase();
}

function applySort(items: Product[], sort: string) {
  const arr = [...items];
  switch (sort) {
    case "price_asc":
      arr.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price_desc":
      arr.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "name_asc":
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "stock_desc":
      arr.sort((a, b) => b.stock - a.stock);
      break;
  }
  return arr;
}

export default function ProductFiltersClient({ products }: { products: Product[] }) {
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const sort = sp.get("sort") ?? "";
  const inStockParam = sp.get("inStock") ?? "";
  const inStock = inStockParam === "1" || norm(inStockParam) === "true";

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // quando mudar qualquer filtro, reseta paginação
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [q, category, sort, inStock]);

  const filtered = useMemo(() => {
    const nq = norm(q);
    const nc = norm(category);

    const base = (products ?? []).filter((p) => {
      if (inStock && (p.stock ?? 0) <= 0) return false;

      if (nc) {
        if (!norm(p.category).includes(nc)) return false;
      }

      if (nq) {
        const hay = `${p.name} ${p.description} ${p.category}`.toLowerCase();
        if (!hay.includes(nq)) return false;
      }

      return true;
    });

    return applySort(base, sort);
  }, [products, q, category, sort, inStock]);

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-black">{filtered.length}</span> results
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-600 py-10">No products found.</p>
      ) : (
        <ProductGrid products={visible} />
      )}

      {canLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            className="hg-btn-secondary"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
