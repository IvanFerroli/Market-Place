import ProductCarouselSSR from "@/components/products/ProductCarouselSSR";
import { listProducts } from "@/lib/data/productsStore";
import ProductFiltersClient from "@/components/search/ProductFiltersClient";
import HideWhenQueryActive from "@/components/search/HideWhenQueryActive";
import { Suspense } from "react";

export const metadata = {
  title: "NCART - Curated Cyberware",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const source = first(sp.source).trim().toLowerCase() || undefined;

  const products = await listProducts(source);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <HideWhenQueryActive>
          <ProductCarouselSSR
            products={products}
            title={source === "blackmarket" ? "Black market drops" : "Featured products"}
          />
        </HideWhenQueryActive>
      </Suspense>

      <Suspense fallback={null}>
        <ProductFiltersClient products={products} />
      </Suspense>
    </div>
  );
}
