"use client";

import { useRef, useState } from "react";
import { openCart, toggleCart } from "@/lib/cart/events";
import { asId } from "@/lib/utils/ids";

import Button from "@/components/ui/Button";
import type { Product } from "@/lib/domain/Product";
import { useCartActions, useCartSnapshot } from "@/lib/cart/store";

type Props = {
  product?: Product;
  openCartOnAdd?: boolean; // default: true (comportamento atual)
  onAdded?: () => void; // callback opcional (pra feedback no QuickView)
};

function getStockCap(product: Product): number | null {
  const n = Number((product as unknown as { stock?: unknown })?.stock);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}

export default function CartButton({ product, openCartOnAdd = true, onAdded }: Props) {
  const cart = useCartSnapshot();
  const { addItem } = useCartActions();

  // simple guard against accidental double click
  const addingRef = useRef(false);

  const [limitHit, setLimitHit] = useState(false);

  if (product) {
    const cap = getStockCap(product);
    const outOfStock = cap !== null && cap <= 0;

    const currentQty =
      cart.items.find((it) => String(it.product.id) === String(product.id))?.quantity ?? 0;

    const atLimit = cap !== null && currentQty >= cap;

    return (
      <Button
        variant={outOfStock ? "ghost" : undefined}
        disabled={outOfStock}
        className={outOfStock ? "opacity-50 cursor-not-allowed" : undefined}
        onClick={() => {
          if (outOfStock) return;

          // aviso quando tenta passar do estoque
          if (atLimit) {
            setLimitHit(true);
            window.setTimeout(() => setLimitHit(false), 900);
            return;
          }

          if (addingRef.current) return;
          addingRef.current = true;

          addItem(product, 1);

          onAdded?.();

          if (openCartOnAdd) {
            // abre via evento do cart (provider faz a ponte pra toast)
            openCart({
              source: "add_to_cart_button",
              productId: asId(product.id),
            });
          }

          window.setTimeout(() => {
            addingRef.current = false;
          }, 250);
        }}
      >
        {outOfStock
          ? "Out of stock"
          : limitHit
            ? cap !== null
              ? `Max ${cap} in stock`
              : "Stock limit reached"
            : "Add to cart"}
      </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={() => toggleCart()}>
      Cart
    </Button>
  );
}
