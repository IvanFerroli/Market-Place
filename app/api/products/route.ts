import { NextResponse } from "next/server";
import { listProducts } from "@/lib/data/productsStore";

/**
 * Products API (collection).
 *
 * Route: `GET /api/products`
 *
 * Response:
 * - `200 { products: Product[] }`
 *
 * Caching:
 * - Sets `Cache-Control` with `s-maxage` and `stale-while-revalidate` for CDN friendliness.
 * - Also exports `revalidate` to allow incremental revalidation.
 */
export const runtime = "nodejs";

/**
 * Next.js revalidation window (seconds).
 * Keep aligned with `s-maxage` strategy where possible.
 */
export const revalidate = 300;

const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

/**
 * Lists all products.
 *
 * Note:
 * - Data comes from the local products store (`listProducts`), which reads/normalizes the JSON source.
 */
export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products }, { headers: { "Cache-Control": CACHE_CONTROL } });
}
