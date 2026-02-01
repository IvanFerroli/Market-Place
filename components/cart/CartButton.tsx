"use client";

import { useCartUI } from "./CartDrawerProvider";
import Button from "@/components/ui/Button";
import type { Product } from "@/lib/domain/Product";
import { useCartActions } from "@/lib/cart/store";

export default function CartButton({ product }: { product?: Product }) {
  const ui = useCartUI();
  const { addItem } = useCartActions();

  if (product) {
    return (
      <Button
        onClick={() => {
          addItem(product, 1);
          ui.open();
        }}
      >
        Add to cart
      </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={ui.open}>
      Cart
    </Button>
  );
}
