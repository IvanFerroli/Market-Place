"use client";

import { useRef } from "react";
import { useCartUI } from "./CartDrawerProvider";
import Button from "@/components/ui/Button";
import type { Product } from "@/lib/domain/Product";
import { useCartActions } from "@/lib/cart/store";

export default function CartButton({ product }: { product?: Product }) {
  const ui = useCartUI();
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
          ui.open();

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
    <Button variant="ghost" onClick={ui.open}>
      Cart
    </Button>
  );
}
