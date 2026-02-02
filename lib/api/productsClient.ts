import { httpGet } from "./http";
import type { Product } from "@/lib/domain/Product";

type ProductsPayload = { products: Product[] };
type ProductPayload = { product: Product };

// Alinhar com teu Cache-Control da API:
// - lista: max-age=60
// - item: s-maxage/revalidate=300 (aqui usamos 300s no client)
const TTL_PRODUCTS_MS = 60_000;
const TTL_PRODUCT_MS = 300_000;

// cache lista
let productsCache: { at: number; data: ProductsPayload } | null = null;
let productsInFlight: Promise<ProductsPayload> | null = null;

// cache por id
const productCache = new Map<string, { at: number; data: ProductPayload }>();
const productInFlight = new Map<string, Promise<ProductPayload>>();

export async function fetchProducts(): Promise<ProductsPayload> {
  const now = Date.now();

  if (productsCache && now - productsCache.at < TTL_PRODUCTS_MS) {
    return productsCache.data;
  }

  if (productsInFlight) return productsInFlight;

  productsInFlight = httpGet<ProductsPayload>("/api/products")
    .then((data) => {
      productsCache = { at: Date.now(), data };
      return data;
    })
    .finally(() => {
      productsInFlight = null;
    });

  return productsInFlight;
}

export async function fetchProductById(id: string): Promise<ProductPayload> {
  const key = String(id ?? "").trim();
  if (!key) throw new Error("fetchProductById: missing id");

  const now = Date.now();

  const cached = productCache.get(key);
  if (cached && now - cached.at < TTL_PRODUCT_MS) {
    return cached.data;
  }

  const inflight = productInFlight.get(key);
  if (inflight) return inflight;

  const safeId = encodeURIComponent(key);

  const req = httpGet<ProductPayload>(`/api/products/${safeId}`)
    .then((data) => {
      productCache.set(key, { at: Date.now(), data });
      return data;
    })
    .finally(() => {
      productInFlight.delete(key);
    });

  productInFlight.set(key, req);
  return req;
}
