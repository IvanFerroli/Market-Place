import Image from "next/image";
import Link from "next/link";

import { notFound } from "next/navigation";
import ProductPrice from "@/components/products/ProductPrice";
import AddToCartButton from "@/components/cart/CartButton";
import { getProductById } from "@/lib/data/productsStore";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) return notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="mb-4">
        <Link
          href="/?restore=1"
          scroll={false}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back to products
        </Link>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={product.image || "https://picsum.photos/900"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <ProductPrice value={product.price} />
        <p className="text-gray-700">{product.description}</p>

        <div className="text-sm text-gray-600">
          Category: <span className="font-medium">{product.category}</span> • Stock:{" "}
          <span className="font-medium">{product.stock}</span>
        </div>

        <div className="pt-2">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
