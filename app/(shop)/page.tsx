import ProductGrid from "@/components/products/ProductGrid";
import ProductCarouselSSR from "@/components/products/ProductCarouselSSR";
import { listProducts } from "@/lib/data/productsStore";

export const metadata = {
  title: "Products — Market Place",
};

export default async function HomePage() {
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="text-gray-600">
          Minimal shop skeleton — you’ll swap components later.
        </p>
      </header>
      <ProductCarouselSSR products={products} title="Featured products" />
      <ProductGrid products={products} />
    </div>
  );
}
