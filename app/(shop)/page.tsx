import ProductCarouselSSR from "@/components/products/ProductCarouselSSR";
import { listProducts } from "@/lib/data/productsStore";
import ProductFiltersClient from "@/components/search/ProductFiltersClient";
import HideWhenQueryActive from "@/components/search/HideWhenQueryActive";
import { Suspense } from "react";

export const metadata = {
  title: "NCART - Curated Cyberware",
};

export default async function HomePage() {
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <HideWhenQueryActive>
          <ProductCarouselSSR products={products} title="Featured products" />
        </HideWhenQueryActive>
      </Suspense>

      <Suspense fallback={null}>
        <ProductFiltersClient products={products} />
      </Suspense>
    </div>
  );
}
