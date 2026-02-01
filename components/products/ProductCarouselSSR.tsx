import type { Product } from "@/lib/domain/Product";
import { listProducts } from "@/lib/data/productsStore";
import ProductCarousel from "./ProductCarousel";

type Props = {
  products?: Product[];
  limit?: number;
  title?: string;
};

export default async function ProductCarouselSSR({
  products,
  limit = 12,
  title = "Featured",
}: Props) {
  const all = products ?? (await listProducts());
  const items = Array.isArray(all) ? all.slice(0, limit) : [];

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">Swipe or use arrows</p>
      </div>

      <ProductCarousel products={items} />
    </section>
  );
}
