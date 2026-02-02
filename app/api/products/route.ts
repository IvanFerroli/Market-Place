import { NextResponse } from "next/server";
import { listProducts } from "@/lib/data/productsStore";

export const runtime = "nodejs";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products });
}
