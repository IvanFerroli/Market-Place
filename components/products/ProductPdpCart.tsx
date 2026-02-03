"use client";

import type { Product } from "@/lib/domain/Product";
import CartButton from "@/components/cart/CartButton";
import CartQuantityStepper from "@/components/cart/CartQuantityStepper";
import { useCartSnapshot } from "@/lib/cart/store";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ProductPdpCart({ product }: { product: Product }) {
  const [justAdded, setJustAdded] = useState(false);

  const cart = useCartSnapshot();
  const productId = String(product.id);

  const sp = useSearchParams();
  const source = (sp.get("source") ?? "").trim().toLowerCase();

  const pdpHref = source
    ? `/product/${product.id}?source=${encodeURIComponent(source)}`
    : `/product/${product.id}`;

  const qtyInCart = useMemo(() => {
    const hit = cart.items.find((it) => String(it.product.id) === productId);
    return hit?.quantity ?? 0;
  }, [cart.items, productId]);

  return (
    <div className="flex flex-col gap-2">
      {qtyInCart > 0 ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-white/60">
            In cart: <span className="text-white/85 font-semibold">{qtyInCart}</span>
          </div>

          <CartQuantityStepper productId={productId} quantity={qtyInCart} />
        </div>
      ) : (
        <CartButton
          product={product}
          onAdded={() => {
            setJustAdded(true);
            window.setTimeout(() => setJustAdded(false), 1200);
          }}
        />
      )}

      {justAdded ? (
        <div className="text-xs text-white/70">Added to cart ✓</div>
      ) : (
        <div className="text-xs text-white/50">Add more or tap Cart to review.</div>
      )}
    </div>
  );
}
