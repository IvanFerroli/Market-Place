import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Product } from "@/lib/domain/Product";

let cache: Product[] | null = null;

function normalize(raw: any): Product {
  if (raw == null) throw new Error("Invalid product: null/undefined");

  const id = String(raw.id ?? "").trim();
  if (!id) throw new Error("Invalid product.id");

  const price = Number(raw.price);
  if (!Number.isFinite(price)) throw new Error("Invalid product.price (number)");

  const priceCents = Math.round(price * 100);
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    throw new Error("Invalid product.priceCents");
  }

  const stock = Number(raw.stock ?? 0);
  if (!Number.isFinite(stock)) throw new Error("Invalid product.stock");

  return {
    id,
    name: String(raw.name ?? ""),
    priceCents,
    description: String(raw.description ?? ""),
    image: String(raw.image ?? ""),
    category: String(raw.category ?? ""),
    stock,
  };
}

export async function readProductsJson(): Promise<Product[]> {
  if (cache) return cache;

  const filePath = path.join(process.cwd(), "public", "data", "products.json");
  const raw = await readFile(filePath, "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("products.json must be an array of products");
  }

  cache = data.map(normalize);
  return cache;
}
