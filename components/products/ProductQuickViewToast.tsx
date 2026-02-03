"use client";

import Image from "next/image";
import type { Product } from "@/lib/domain/Product";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CartButton from "@/components/cart/CartButton";
import CartQuantityStepper from "@/components/cart/CartQuantityStepper";
import { useCartSnapshot } from "@/lib/cart/store";
import { closeToast } from "@/lib/toast/events";
import { useMemo, useState } from "react";
import ProductPrice from "@/components/products/ProductPrice";
import Link from "next/link";

export default function ProductQuickViewToast({ product }: { product: Product }) {
  const [justAdded, setJustAdded] = useState(false);

  const cart = useCartSnapshot();
  const productId = String(product.id);

  const qtyInCart = useMemo(() => {
    const hit = cart.items.find((it) => String(it.product.id) === productId);
    return hit?.quantity ?? 0;
  }, [cart.items, productId]);

  return (
    <div className="cp-glass-strong overflow-hidden rounded-3xl">
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/95 truncate">
            {product.name}
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge>{product.category}</Badge>
            <Badge>Stock: {product.stock}</Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => closeToast(`product:${product.id}`)}
          className="cp-btn cp-btn-danger h-9 px-3 rounded-full text-xs"
        >
          Close
        </Button>
      </div>

      {/* body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="relative aspect-[4/3] w-full bg-white/5">
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>

        <div className="p-5">
          <div className="text-2xl font-semibold text-white">
            <ProductPrice value={product.priceCents} />
          </div>

          <p className="mt-2 text-sm text-white/70 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {qtyInCart > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-white/60">
                  In cart:{" "}
                  <span className="text-white/85 font-semibold">{qtyInCart}</span>
                </div>

                <CartQuantityStepper productId={productId} quantity={qtyInCart} />
              </div>
            ) : (
              <CartButton
                product={product}
                openCartOnAdd={false}
                onAdded={() => {
                  setJustAdded(true);
                  window.setTimeout(() => setJustAdded(false), 1200);
                }}
              />
            )}

            {/* CTA secundário (PDP) */}
            <Link
              href={`/product/${product.id}`}
              onClick={() => closeToast(`product:${product.id}`)}
              className="cp-btn cp-btn-ghost h-10 w-full rounded-full text-sm !hidden md:!flex items-center justify-center"
              aria-label={`View details for ${product.name}`}
            >
              View details
            </Link>

            {justAdded ? (
              <div className="text-xs text-white/70">Added to cart ✓</div>
            ) : (
              <div className="text-xs text-white/50">Add more or tap Cart to review.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
