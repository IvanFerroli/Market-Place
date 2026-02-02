"use client";

import { useRef } from "react";
import { openCart } from "@/lib/cart/events";
import { asId } from "@/lib/utils/ids";

import Button from "@/components/ui/Button";
import type { Product } from "@/lib/domain/Product";
import { useCartActions } from "@/lib/cart/store";

type Props = {
  product?: Product;
  openCartOnAdd?: boolean; // default: true (comportamento atual)
  onAdded?: () => void; // callback opcional (pra feedback no QuickView)
};

export default function CartButton({ product, openCartOnAdd = true, onAdded }: Props) {
  const { addItem } = useCartActions();

  // simple guard against accidental double click
  const addingRef = useRef(false);

  if (product) {
    return (
      <Button
        onClick={() => {
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
        Add to cart
      </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={() => openCart({ source: "header" })}>
      Cart
    </Button>
  );
}
