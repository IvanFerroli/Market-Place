import Image from "next/image";
import type { Product } from "@/lib/domain/Product";

export default function ProductImage({ product }: { product: Product }) {
  return (
    <div className="relative aspect-[4/3] bg-gray-100">
      <Image
        src={product.image || "https://picsum.photos/800"}
        alt={product.name}
        fill
        sizes="(max-width: 1024px) 100vw, 33vw"
        className="object-cover"
      />
    </div>
  );
}
