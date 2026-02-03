export type Product = {
  id: string; // canonical id (string)
  name: string;
  priceCents: number; // canonical money (int, in cents)
  description: string;
  image: string;
  category: string;
  stock: number;
};

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
