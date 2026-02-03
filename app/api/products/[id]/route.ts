import { NextResponse, type NextRequest } from "next/server";
import { getProductById } from "@/lib/data/productsStore";

export const runtime = "nodejs";

export const revalidate = 300;

const CACHE_CONTROL =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

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

  return NextResponse.json(
    { product },
    { headers: { "Cache-Control": CACHE_CONTROL } },
  );
}
