import { NextResponse } from "next/server";
import { listProducts } from "@/lib/data/productsStore";

export const runtime = "nodejs";

export const revalidate = 300;

const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products }, { headers: { "Cache-Control": CACHE_CONTROL } });
}
