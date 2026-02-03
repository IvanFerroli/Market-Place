import type { Product } from "@/lib/domain/Product";
import { getProductById, listProducts } from "@/lib/data/productsStore";
import { readProductsJson } from "@/lib/data/readProductsJson";

jest.mock("@/lib/data/readProductsJson", () => ({
  readProductsJson: jest.fn(),
}));

const P = (id: string): Product => ({
  id,
  name: `P-${id}`,
  priceCents: 100,
  description: "d",
  image: "i",
  category: "c",
  stock: 1,
});

describe("productsStore", () => {
  beforeEach(() => {
    (readProductsJson as jest.Mock).mockReset();
  });

  test("listProducts proxies readProductsJson", async () => {
    (readProductsJson as jest.Mock).mockResolvedValue([P("1")]);

    const res = await listProducts();
    expect(res).toHaveLength(1);
    expect(readProductsJson).toHaveBeenCalledTimes(1);
  });

  test("getProductById returns null for empty/blank id without reading", async () => {
    const r1 = await getProductById("");
    const r2 = await getProductById("   ");
    expect(r1).toBeNull();
    expect(r2).toBeNull();
    expect(readProductsJson).toHaveBeenCalledTimes(0);
  });

  test("getProductById trims id and finds product", async () => {
    (readProductsJson as jest.Mock).mockResolvedValue([P("1"), P("abc")]);

    const found = await getProductById("  abc  ");
    expect(found?.id).toBe("abc");
    expect(readProductsJson).toHaveBeenCalledTimes(1);
  });

  test("getProductById returns null when not found", async () => {
    (readProductsJson as jest.Mock).mockResolvedValue([P("1")]);

    const found = await getProductById("nope");
    expect(found).toBeNull();
  });
});
