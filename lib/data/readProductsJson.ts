import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Product } from "@/lib/domain/Product";

const cacheBySource = new Map<string, Product[]>();

function normSource(source?: string) {
  const s = String(source ?? "")
    .trim()
    .toLowerCase();
  return s || "default";
}

async function tryReadUtf8(p: string) {
  try {
    return await readFile(p, "utf-8");
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function readProductsJson(source?: string): Promise<Product[]> {
  const key = normSource(source);
  const cached = cacheBySource.get(key);
  if (cached) return cached;

  const filename = key === "blackmarket" ? "blackmarket.json" : "products.json";

  const candidates =
    key === "blackmarket"
      ? [
          path.join(process.cwd(), "blackmarket.json"), // opcional (raiz)
          path.join(process.cwd(), "public", "data", "blackmarket.json"), // principal (dev/build)
        ]
      : [
          path.join(process.cwd(), "products.json"), // desafio (raiz)
          path.join(process.cwd(), "public", "data", "products.json"), // principal (dev/build)
        ];

  // 1) tenta FS (bom pra local/dev e build)
  let raw: string | null = null;
  for (const p of candidates) {
    raw = await tryReadUtf8(p);
    if (raw) break;
  }

  // 2) fallback Vercel-safe real: importa o JSON no bundle (sem depender de host/FS/public)
  if (raw == null) {
    try {
      if (key === "blackmarket") {
        const mod =
          (await import("../../public/data/blackmarket.json")) as JsonModule<unknown>;
        raw = JSON.stringify(unwrapJsonDefault(mod));
      } else {
        const mod =
          (await import("../../public/data/products.json")) as JsonModule<unknown>;
        raw = JSON.stringify(unwrapJsonDefault(mod));
      }
    } catch (err) {
      throw new Error(
        `Unable to read ${filename}. Tried: ${candidates.join(", ")}. ` +
          `Fallback import failed: public/data/${filename}. Last error: ${String(err)}`,
      );
    }
  }

  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error(`${filename} must be an array of products`);
  }

  const normalized = data.map(normalize);
  cacheBySource.set(key, normalized);
  return normalized;
}
