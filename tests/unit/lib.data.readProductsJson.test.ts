import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";

async function withTempCwd<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const original = process.cwd();
  const dir = await mkdtemp(path.join(os.tmpdir(), "mp-tests-"));

  process.chdir(dir);
  try {
    return await fn(dir);
  } finally {
    process.chdir(original);
    await rm(dir, { recursive: true, force: true });
  }
}

async function loadModule() {
  // zera cache de módulo (porque readProductsJson tem cache interno)
  jest.resetModules();
  return await import("@/lib/data/readProductsJson");
}

describe("readProductsJson", () => {
  it("reads from root products.json when available and normalizes fields", async () => {
    await withTempCwd(async (dir) => {
      await writeFile(
        path.join(dir, "products.json"),
        JSON.stringify([
          {
            id: "  abc  ",
            name: "Product A",
            price: 10.0,
            description: "desc",
            image: "img",
            category: "cat",
            stock: 3,
          },
        ]),
        "utf-8",
      );

      const { readProductsJson } = await loadModule();
      const res = await readProductsJson();

      expect(res).toEqual([
        {
          id: "abc",
          name: "Product A",
          priceCents: 1000,
          description: "desc",
          image: "img",
          category: "cat",
          stock: 3,
        },
      ]);
    });
  });

  it("falls back to public/data/products.json if root is missing", async () => {
    await withTempCwd(async (dir) => {
      await mkdir(path.join(dir, "public", "data"), { recursive: true });
      await writeFile(
        path.join(dir, "public", "data", "products.json"),
        JSON.stringify([{ id: "x", name: "X", price: 1.23, stock: 0 }]),
        "utf-8",
      );

      const { readProductsJson } = await loadModule();
      const res = await readProductsJson();

      expect(res[0].id).toBe("x");
      expect(res[0].priceCents).toBe(123);
    });
  });

  it("throws a helpful error if both candidates fail", async () => {
    await withTempCwd(async () => {
      const { readProductsJson } = await loadModule();

      await expect(readProductsJson()).rejects.toThrow(/Unable to read products\.json/);
      await expect(readProductsJson()).rejects.toThrow(/Tried:/);
    });
  });

  it("throws if JSON is not an array", async () => {
    await withTempCwd(async (dir) => {
      await writeFile(path.join(dir, "products.json"), JSON.stringify({ hello: "world" }), "utf-8");

      const { readProductsJson } = await loadModule();
      await expect(readProductsJson()).rejects.toThrow("products.json must be an array of products");
    });
  });

  it("caches results (does not read file twice in same module instance)", async () => {
    await withTempCwd(async (dir) => {
      await writeFile(
        path.join(dir, "products.json"),
        JSON.stringify([
          { id: "a", name: "A", price: 2, stock: 1 },
          { id: "b", name: "B", price: 3, stock: 2 },
        ]),
        "utf-8",
      );

      const { readProductsJson } = await loadModule();

      const first = await readProductsJson();
      const second = await readProductsJson();

      expect(second).toBe(first); // mesma referência por causa do cache
      expect(second).toHaveLength(2);
    });
  });

  it("normalizes price rounding to cents (Math.round)", async () => {
    await withTempCwd(async (dir) => {
      await writeFile(
        path.join(dir, "products.json"),
        JSON.stringify([{ id: "a", name: "A", price: 10.005, stock: 0 }]),
        "utf-8",
      );

      const { readProductsJson } = await loadModule();
      const res = await readProductsJson();

      expect(res[0].priceCents).toBe(1001);
    });
  });

  it("throws on invalid products (id empty / price NaN / price negative / stock NaN)", async () => {
    await withTempCwd(async (dir) => {
      await writeFile(path.join(dir, "products.json"), JSON.stringify([{ id: "   ", price: 1 }]), "utf-8");
      const { readProductsJson } = await loadModule();
      await expect(readProductsJson()).rejects.toThrow("Invalid product.id");
    });

    await withTempCwd(async (dir) => {
      await writeFile(path.join(dir, "products.json"), JSON.stringify([{ id: "a", price: "nope" }]), "utf-8");
      const { readProductsJson } = await loadModule();
      await expect(readProductsJson()).rejects.toThrow("Invalid product.price (number)");
    });

    await withTempCwd(async (dir) => {
      await writeFile(path.join(dir, "products.json"), JSON.stringify([{ id: "a", price: -1 }]), "utf-8");
      const { readProductsJson } = await loadModule();
      await expect(readProductsJson()).rejects.toThrow("Invalid product.priceCents");
    });

    await withTempCwd(async (dir) => {
      await writeFile(path.join(dir, "products.json"), JSON.stringify([{ id: "a", price: 1, stock: "nope" }]), "utf-8");
      const { readProductsJson } = await loadModule();
      await expect(readProductsJson()).rejects.toThrow("Invalid product.stock");
    });
  });
});
