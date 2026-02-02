"use client";

import React from "react";
import type { Product } from "@/lib/domain/Product";
import { openToast } from "@/lib/toast/events";
import { closeCart } from "@/lib/cart/events";
import ProductQuickViewToast from "@/components/products/ProductQuickViewToast";

export default function ProductQuickViewToastTrigger({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        closeCart();
        openToast({
          key: `product:${product.id}`,
          placement: "center",
          node: <ProductQuickViewToast product={product} />,
        });
      }}
      className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
      aria-label={`Quick view ${product.name}`}
    >
      {children}
    </button>
  );
}
