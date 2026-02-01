import Image from "next/image";
import type { Product } from "@/lib/domain/Product";

export default function ProductImage({ product }: { product: Product }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <Image
        src={product.image || "https://picsum.photos/800"}
        alt={product.name}
        fill
        sizes="(max-width: 1024px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* subtle overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

