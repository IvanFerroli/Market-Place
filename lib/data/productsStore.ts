import { readProductsJson } from "./readProductsJson";
import type { Product } from "@/lib/domain/Product";

export async function listProducts(): Promise<Product[]> {
  return readProductsJson();
}

export async function getProductById(id: string): Promise<Product | null> {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;

  const all = await readProductsJson();
  return all.find((p) => p.id === num) ?? null;
}
