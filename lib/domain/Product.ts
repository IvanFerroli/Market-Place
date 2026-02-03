/**
 * Canonical product model used across the app (UI, cart, API).
 *
 * Design notes:
 * - `id` is a canonical string identifier (never empty).
 * - `priceCents` is an integer amount in cents to avoid float rounding issues.
 * - `stock` is the available quantity (0 means out of stock).
 */
export type Product = {
  id: string; // canonical id (string)
  name: string;
  priceCents: number; // canonical money (int, in cents)
  description: string;
  image: string;
  category: string;
  stock: number;
};

/**
 * Runtime type guard for unknown input (e.g. parsed JSON).
 *
 * Returns `true` only when the value matches the {@link Product} shape and
 * passes basic sanity checks (non-empty id, non-negative cents/stock, etc).
 */
export function isProduct(v: unknown): v is Product {
  const p = v as any;
  if (!p || typeof p !== "object") return false;

  if (typeof p.id !== "string" || !p.id.trim()) return false;
  if (typeof p.name !== "string") return false;
  if (!Number.isFinite(p.priceCents) || p.priceCents < 0) return false;

  if (typeof p.description !== "string") return false;
  if (typeof p.image !== "string") return false;
  if (typeof p.category !== "string") return false;

  if (!Number.isFinite(p.stock) || p.stock < 0) return false;

  return true;
}
