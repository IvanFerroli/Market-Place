import Link from "next/link";

import { notFound } from "next/navigation";
import ProductPrice from "@/components/products/ProductPrice";
import { getProductById } from "@/lib/data/productsStore";
import Badge from "@/components/ui/Badge";
import ProductPdpCart from "@/components/products/ProductPdpCart";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
};

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { id } = await params;

  const sp = (await searchParams) ?? {};
  const source = first(sp.source).trim().toLowerCase() || undefined;

  const product = await getProductById(id, source);

  if (!product) return notFound();

  const inStock = (product.stock ?? 0) > 0;

  return (
    <div className="fixed inset-[35px] overflow-hidden">
      <div className="h-full w-full">
        <div className="cp-card group h-full w-full overflow-hidden rounded-none md:rounded-3xl">
          <div className="grid h-full grid-rows-[42svh_1fr] md:grid-rows-1 md:grid-cols-2 gap-0">
            {/* media (full height) */}
            <div className="relative w-full h-full bg-white/5">
              <img
                src={product.image || "https://picsum.photos/900"}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            {/* content */}
            <div className="min-h-0 p-6 flex flex-col">
              <div className="mb-4">
                <Link
                  href={
                    source
                      ? `/?restore=1&source=${encodeURIComponent(source)}`
                      : "/?restore=1"
                  }
                  scroll={false}
                  className="cp-navlink text-sm"
                  aria-label="Back to products"
                >
                  ← Back to products
                </Link>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="cp-kicker">Cyberware</div>
                  <h1 className="cp-text mt-1 text-3xl font-semibold leading-tight truncate">
                    {product.name}
                  </h1>
                </div>

                <div className="shrink-0 text-right">
                  <div className="cp-price text-sm">
                    <ProductPrice value={product.priceCents} />
                  </div>
                  <div className="cp-dim text-[11px] mt-0.5">
                    {inStock ? "in stock" : "out of stock"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{product.category}</Badge>
                <Badge>Stock: {product.stock}</Badge>
              </div>

              <p className="mt-4 cp-muted text-sm leading-relaxed line-clamp-6">
                {product.description}
              </p>

              <div className="mt-auto pt-4 border-t border-white/10">
                <ProductPdpCart product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
