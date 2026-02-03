import type { Product } from "@/lib/domain/Product";
import { readProductsJson } from "./readProductsJson";

export async function listProducts(source?: string): Promise<Product[]> {
  return readProductsJson(source);
}

export async function getProductById(
  id: string,
  source?: string,
): Promise<Product | null> {
  const key = String(id ?? "").trim();
  if (!key) return null;

  const all = await readProductsJson(source);
  return all.find((p) => p.id === key) ?? null;
}
