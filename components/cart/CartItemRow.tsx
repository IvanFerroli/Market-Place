"use client";

import type { CartItem } from "@/lib/domain/Cart";
import ProductPrice from "@/components/products/ProductPrice";
import CartQuantityStepper from "./CartQuantityStepper";
import { useCartActions } from "@/lib/cart/store";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem } = useCartActions();

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0">
        <div className="truncate font-medium">{item.product.name}</div>
        <div className="mt-1 text-sm text-gray-600">
          <ProductPrice value={item.product.priceCents} compact />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CartQuantityStepper
          productId={String(item.product.id)}
          quantity={item.quantity}
        />
        <button
          className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
          onClick={() => removeItem(String(item.product.id))}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
