import ProductImage from "./ProductImage";
import ProductPrice from "./ProductPrice";
import type { Product } from "@/lib/domain/Product";
import Badge from "@/components/ui/Badge";
import CartButton from "@/components/cart/CartButton";

import ProductQuickViewTrigger from "@/components/products/ProductQuickViewTrigger";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* clickable area */}
      <ProductQuickViewTrigger product={product}>
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
      </ProductQuickViewTrigger>

      {/* CTA (not inside Link) */}
      <div className="px-4 pb-4">
        <CartButton product={product} />
      </div>
    </div>
  );
}
