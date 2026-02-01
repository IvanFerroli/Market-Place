import { httpGet } from "./http";
import type { Product } from "@/lib/domain/Product";

export async function fetchProducts() {
  return httpGet<{ products: Product[] }>("/api/products");
}

export async function fetchProductById(id: string) {
  const safeId = encodeURIComponent(id);
  return httpGet<{ product: Product }>(`/api/products/${safeId}`);
}
