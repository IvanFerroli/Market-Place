import ProductGrid from "@/components/products/ProductGrid";
import ProductCarouselSSR from "@/components/products/ProductCarouselSSR";
import { listProducts } from "@/lib/data/productsStore";

export const metadata = {
  title: "NCART - Curated Cyberware",
};

export default async function HomePage() {
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <ProductCarouselSSR products={products} title="Featured products" />
      <ProductGrid products={products} />
    </div>
  );
}
