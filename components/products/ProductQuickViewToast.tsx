"use client";

import Image from "next/image";
import type { Product } from "@/lib/domain/Product";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CartButton from "@/components/cart/CartButton";
import { closeToast } from "@/lib/toast/events";

export default function ProductQuickViewToast({ product }: { product: Product }) {
	return (
		<div className="overflow-hidden rounded-2xl">
			{/* header */}
			<div className="flex items-center justify-between gap-3 border-b border-white/40 bg-white/60 backdrop-blur-xl px-5 py-4">
				<div className="min-w-0">
					<div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
					<div className="mt-1 flex flex-wrap gap-2">
						<Badge>{product.category}</Badge>
						<Badge>Stock: {product.stock}</Badge>
					</div>
				</div>

				<Button variant="ghost" onClick={() => closeToast(`product:${product.id}`)}>
					Close
				</Button>
			</div>

			{/* body */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white/50 backdrop-blur-xl">
				<div className="relative aspect-[4/3] w-full bg-white/50">
					<Image
						src={product.image}
						alt={product.name}
						fill
						unoptimized
						className="object-cover"
					/>
				</div>

				<div className="p-5">
					<div className="text-2xl font-semibold text-gray-900">
						${product.price.toFixed(2)}
					</div>

					<p className="mt-2 text-sm text-gray-700 leading-relaxed">
						{product.description}
					</p>

					<div className="mt-4">
						<CartButton product={product} />
					</div>

					<div className="mt-3 text-xs text-gray-500">
						Quick view — sem redirect.
					</div>
				</div>
			</div>
		</div>
	);
}
