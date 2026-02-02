import type { Product } from "@/lib/domain/Product";
import { readProductsJson } from "./readProductsJson";

export async function listProducts(): Promise<Product[]> {
  return readProductsJson();
}

export async function getProductById(id: string): Promise<Product | null> {
  const key = String(id ?? "").trim();
  if (!key) return null;

  const all = await readProductsJson();
  return all.find((p) => p.id === key) ?? null;
}
