import { NextResponse } from "next/server";
import { getProductById } from "@/lib/data/productsStore";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
