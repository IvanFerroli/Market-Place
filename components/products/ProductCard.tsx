import ProductImage from "./ProductImage";
import type { Product } from "@/lib/domain/Product";
import Badge from "@/components/ui/Badge";
import CartButton from "@/components/cart/CartButton";
import ProductQuickViewToastTrigger from "@/components/products/ProductQuickViewToastTrigger";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="cp-card group">
      {/* clickable area */}
      <ProductQuickViewToastTrigger product={product}>
        <div className="cp-media">
          <ProductImage product={product} />
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="cp-kicker">Cyberware</div>
              <h3 className="cp-text mt-1 font-semibold leading-tight truncate group-hover:underline">
                {product.name}
              </h3>
            </div>

            <div className="shrink-0 text-right">
              <div className="cp-price text-sm">
                R${product.price.toFixed(2)}
              </div>
              <div className="cp-dim text-[11px] mt-0.5">in stock</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{product.category}</Badge>
            <Badge>Stock: {product.stock}</Badge>
          </div>

          <p className="cp-muted line-clamp-2 text-sm leading-relaxed">
            {product.description}
          </p>
        </div>
      </ProductQuickViewToastTrigger>

      {/* CTA */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        <CartButton product={product} />
      </div>
    </div>
  );
}
