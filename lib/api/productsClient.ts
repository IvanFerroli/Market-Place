import { httpGet } from "./http";

export async function fetchProducts() {
  return httpGet<{ products: any[] }>("/api/products");
}
