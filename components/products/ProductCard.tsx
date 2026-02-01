import Link from "next/link";
import ProductImage from "./ProductImage";
import ProductPrice from "./ProductPrice";
import type { Product } from "@/lib/domain/Product";
import Badge from "@/components/ui/Badge";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-2xl border bg-white transition hover:shadow-sm"
    >
      <ProductImage product={product} />
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium group-hover:underline">{product.name}</h3>
          <ProductPrice value={product.price} compact />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>{product.category}</Badge>
          <Badge>Stock: {product.stock}</Badge>
        </div>

        <p className="line-clamp-2 text-sm text-gray-600">{product.description}</p>
      </div>
    </Link>
  );
}
