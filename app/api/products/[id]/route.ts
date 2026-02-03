import { NextResponse, type NextRequest } from "next/server";
import { getProductById } from "@/lib/data/productsStore";

/**
 * Products API (single resource).
 *
 * Route: `GET /api/products/:id`
 *
 * Params:
 * - `id` (string) product identifier (trimmed)
 *
 * Responses:
 * - `200 { product: Product }`
 * - `404 { error: "not_found" }`
 *
 * Caching:
 * - Sets `Cache-Control` with `s-maxage` and `stale-while-revalidate`.
 * - Also exports `revalidate` for incremental revalidation.
 */
export const runtime = "nodejs";

/**
 * Next.js revalidation window (seconds).
 * Keep aligned with `s-maxage` strategy where possible.
 */
export const revalidate = 300;

const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

/**
 * Fetches a product by id.
 *
 * Note:
 * - Uses `params: Promise<{ id: string }>` to satisfy Next's route type validator.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const productId = String(id ?? "").trim();
  const product = await getProductById(productId);

  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ product }, { headers: { "Cache-Control": CACHE_CONTROL } });
}
