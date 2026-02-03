jest.mock("@/lib/api/http", () => ({
  httpGet: jest.fn(),
}));

describe("lib/api/productsClient", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("fetchProducts: usa cache dentro do TTL e não refaz request", async () => {
    let now = 1_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);

    const { httpGet } = await import("@/lib/api/http");
    const httpGetMock = httpGet as unknown as jest.MockedFunction<any>;

    const payload = { products: [{ id: "p1" }] } as any;
    httpGetMock.mockResolvedValueOnce(payload);

    const { fetchProducts } = await import("@/lib/api/productsClient");

    const a = await fetchProducts();
    const b = await fetchProducts();

    expect(a).toBe(payload);
    expect(b).toBe(payload);
    expect(httpGetMock).toHaveBeenCalledTimes(1);
    expect(httpGetMock).toHaveBeenCalledWith("/api/products");

    nowSpy.mockRestore();
  });

  test("fetchProducts: de-dupe de in-flight (2 chamadas antes de resolver = 1 request)", async () => {
    let now = 2_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);

    const { httpGet } = await import("@/lib/api/http");
    const httpGetMock = httpGet as unknown as jest.MockedFunction<any>;

    let resolve!: (v: any) => void;
    const deferred = new Promise<any>((r) => (resolve = r));

    httpGetMock.mockReturnValueOnce(deferred);

    const { fetchProducts } = await import("@/lib/api/productsClient");

    const p1 = fetchProducts();
    const p2 = fetchProducts();

    expect(httpGetMock).toHaveBeenCalledTimes(1);

    const payload = { products: [{ id: "p2" }] } as any;
    resolve(payload);

    await expect(p1).resolves.toBe(payload);
    await expect(p2).resolves.toBe(payload);

    nowSpy.mockRestore();
  });

  test("fetchProducts: após expirar TTL, refaz request", async () => {
    let now = 3_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);

    const { httpGet } = await import("@/lib/api/http");
    const httpGetMock = httpGet as unknown as jest.MockedFunction<any>;

    const aPayload = { products: [{ id: "a" }] } as any;
    const bPayload = { products: [{ id: "b" }] } as any;

    httpGetMock.mockResolvedValueOnce(aPayload).mockResolvedValueOnce(bPayload);

    const { fetchProducts } = await import("@/lib/api/productsClient");

    const a = await fetchProducts();
    expect(a).toBe(aPayload);

    now += 60_000 + 1; // TTL_PRODUCTS_MS + 1

    const b = await fetchProducts();
    expect(b).toBe(bPayload);

    expect(httpGetMock).toHaveBeenCalledTimes(2);
    expect(httpGetMock.mock.calls[0][0]).toBe("/api/products");
    expect(httpGetMock.mock.calls[1][0]).toBe("/api/products");

    nowSpy.mockRestore();
  });

  test("fetchProductById: valida id (erro em vazio)", async () => {
    const { fetchProductById } = await import("@/lib/api/productsClient");
    await expect(fetchProductById("")).rejects.toThrow("missing id");
    await expect(fetchProductById("   ")).rejects.toThrow("missing id");
  });

  test("fetchProductById: encode no path + cache por key trimada", async () => {
    let now = 4_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);

    const { httpGet } = await import("@/lib/api/http");
    const httpGetMock = httpGet as unknown as jest.MockedFunction<any>;

    const payload = { product: { id: "x" } } as any;
    httpGetMock.mockResolvedValueOnce(payload);

    const { fetchProductById } = await import("@/lib/api/productsClient");

    const a = await fetchProductById("  abc/def  ");
    const b = await fetchProductById("abc/def");

    expect(a).toBe(payload);
    expect(b).toBe(payload);
    expect(httpGetMock).toHaveBeenCalledTimes(1);
    expect(httpGetMock).toHaveBeenCalledWith("/api/products/abc%2Fdef");

    nowSpy.mockRestore();
  });

  test("fetchProductById: de-dupe de in-flight por id", async () => {
    let now = 5_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);

    const { httpGet } = await import("@/lib/api/http");
    const httpGetMock = httpGet as unknown as jest.MockedFunction<any>;

    let resolve!: (v: any) => void;
    const deferred = new Promise<any>((r) => (resolve = r));
    httpGetMock.mockReturnValueOnce(deferred);

    const { fetchProductById } = await import("@/lib/api/productsClient");

    const p1 = fetchProductById("p 1");
    const p2 = fetchProductById("p 1");

    expect(httpGetMock).toHaveBeenCalledTimes(1);
    expect(httpGetMock).toHaveBeenCalledWith("/api/products/p%201");

    const payload = { product: { id: "p 1" } } as any;
    resolve(payload);

    await expect(p1).resolves.toBe(payload);
    await expect(p2).resolves.toBe(payload);

    nowSpy.mockRestore();
  });

  test("fetchProductById: após expirar TTL, refaz request", async () => {
    let now = 6_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);

    const { httpGet } = await import("@/lib/api/http");
    const httpGetMock = httpGet as unknown as jest.MockedFunction<any>;

    const aPayload = { product: { id: "1", v: "a" } } as any;
    const bPayload = { product: { id: "1", v: "b" } } as any;

    httpGetMock.mockResolvedValueOnce(aPayload).mockResolvedValueOnce(bPayload);

    const { fetchProductById } = await import("@/lib/api/productsClient");

    const a = await fetchProductById("1");
    expect(a).toBe(aPayload);

    now += 300_000 + 1; // TTL_PRODUCT_MS + 1

    const b = await fetchProductById("1");
    expect(b).toBe(bPayload);

    expect(httpGetMock).toHaveBeenCalledTimes(2);
    expect(httpGetMock.mock.calls[0][0]).toBe("/api/products/1");
    expect(httpGetMock.mock.calls[1][0]).toBe("/api/products/1");

    nowSpy.mockRestore();
  });
});
