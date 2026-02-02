"use client";

import Image from "next/image";
import type { Product } from "@/lib/domain/Product";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CartButton from "@/components/cart/CartButton";
import { closeToast } from "@/lib/toast/events";

export default function ProductQuickViewToast({ product }: { product: Product }) {
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
            ${product.price.toFixed(2)}
          </div>

          <p className="mt-2 text-sm text-white/70 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-4">
            <CartButton product={product} />
          </div>

          <div className="mt-3 text-xs text-white/50">Quick view — sem redirect.</div>
        </div>
      </div>
    </div>
  );
}
