type Deferred<T> = {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (e?: any) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void;
  let reject!: (e?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function loadClient(httpGetMock: jest.Mock) {
  jest.resetModules();

  // productsClient importa "./http" -> mesmo arquivo físico que "../../lib/api/http"
  jest.doMock("../../lib/api/http", () => ({
    httpGet: (...args: any[]) => httpGetMock(...args),
  }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("../../lib/api/productsClient") as typeof import("../../lib/api/productsClient");
}

describe("lib/api/productsClient", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("fetchProducts", () => {
    test("faz GET /api/products e cacheia dentro do TTL", async () => {
      const payload = { products: [{ id: "p1" }] } as any;
      const httpGetMock = jest.fn().mockResolvedValueOnce(payload);
      const { fetchProducts } = loadClient(httpGetMock);

      const now = jest.spyOn(Date, "now");
      now.mockReturnValue(1_000);

      const r1 = await fetchProducts();
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith("/api/products");
      expect(r1).toBe(payload);

      now.mockReturnValue(10_000);
      const r2 = await fetchProducts();
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(r2).toBe(r1); // mesma referência (cache)
    });

    test("expirando TTL, refaz request", async () => {
      const payload1 = { products: [{ id: "p1" }] } as any;
      const payload2 = { products: [{ id: "p2" }] } as any;

      const httpGetMock = jest.fn()
        .mockResolvedValueOnce(payload1)
        .mockResolvedValueOnce(payload2);

      const { fetchProducts } = loadClient(httpGetMock);

      const now = jest.spyOn(Date, "now");
      now.mockReturnValue(1_000);

      const r1 = await fetchProducts();
      expect(r1).toBe(payload1);
      expect(httpGetMock).toHaveBeenCalledTimes(1);

      // TTL_PRODUCTS_MS = 60_000
      now.mockReturnValue(1_000 + 60_001);

      const r2 = await fetchProducts();
      expect(r2).toBe(payload2);
      expect(httpGetMock).toHaveBeenCalledTimes(2);
    });

    test("de-dupe de in-flight: 2 chamadas antes de resolver = 1 request", async () => {
      const d = deferred<any>();
      const payload = { products: [{ id: "pX" }] } as any;

      const httpGetMock = jest.fn().mockReturnValueOnce(d.promise);
      const { fetchProducts } = loadClient(httpGetMock);

      jest.spyOn(Date, "now").mockReturnValue(1_000);

      const p1 = fetchProducts();
      const p2 = fetchProducts();

      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith("/api/products");

      d.resolve(payload);

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toStrictEqual(payload);
      expect(r2).toStrictEqual(payload);

      // depois de resolver, cache vale (sem novo request)
      const r3 = await fetchProducts();
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(r3).toBe(payload);
    });

    test("se in-flight falhar, limpa e permite retry", async () => {
      const d = deferred<any>();
      const httpGetMock = jest.fn().mockReturnValueOnce(d.promise);
      const { fetchProducts } = loadClient(httpGetMock);

      jest.spyOn(Date, "now").mockReturnValue(1_000);

      const p1 = fetchProducts();
      const p2 = fetchProducts();

      expect(httpGetMock).toHaveBeenCalledTimes(1);

      d.reject(new Error("boom"));

      await expect(p1).rejects.toThrow("boom");
      await expect(p2).rejects.toThrow("boom");

      httpGetMock.mockResolvedValueOnce({ products: [] });

      const r = await fetchProducts();
      expect(httpGetMock).toHaveBeenCalledTimes(2);
      expect(r).toStrictEqual({ products: [] });
    });
  });

  describe("fetchProductById", () => {
    test("erro quando id vazio", async () => {
      const httpGetMock = jest.fn();
      const { fetchProductById } = loadClient(httpGetMock);

      await expect(fetchProductById("")).rejects.toThrow("fetchProductById: missing id");
      await expect(fetchProductById("   ")).rejects.toThrow("fetchProductById: missing id");
      expect(httpGetMock).toHaveBeenCalledTimes(0);
    });

    test("faz GET /api/products/:id com encodeURIComponent", async () => {
      const payload = { product: { id: "p 1" } } as any;
      const httpGetMock = jest.fn().mockResolvedValueOnce(payload);
      const { fetchProductById } = loadClient(httpGetMock);

      jest.spyOn(Date, "now").mockReturnValue(1_000);

      const r = await fetchProductById("p 1");
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith("/api/products/p%201");
      expect(r).toBe(payload);
    });

    test("cache por id dentro do TTL", async () => {
      const payload = { product: { id: "abc" } } as any;
      const httpGetMock = jest.fn().mockResolvedValueOnce(payload);
      const { fetchProductById } = loadClient(httpGetMock);

      const now = jest.spyOn(Date, "now");
      now.mockReturnValue(1_000);

      const r1 = await fetchProductById("abc");
      expect(httpGetMock).toHaveBeenCalledTimes(1);

      now.mockReturnValue(10_000);
      const r2 = await fetchProductById("abc");
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(r2).toBe(r1);
    });

    test("de-dupe de in-flight por id (inclui trim)", async () => {
      const d = deferred<any>();
      const payload = { product: { id: "p 1" } } as any;

      const httpGetMock = jest.fn().mockReturnValueOnce(d.promise);
      const { fetchProductById } = loadClient(httpGetMock);

      jest.spyOn(Date, "now").mockReturnValue(1_000);

      const p1 = fetchProductById("p 1");
      const p2 = fetchProductById("   p 1   ");

      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(httpGetMock).toHaveBeenCalledWith("/api/products/p%201");

      d.resolve(payload);

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toStrictEqual(payload);
      expect(r2).toStrictEqual(payload);

      // depois, cache vale (sem novo request)
      const r3 = await fetchProductById("p 1");
      expect(httpGetMock).toHaveBeenCalledTimes(1);
      expect(r3).toBe(payload);
    });

    test("ids diferentes fazem requests diferentes", async () => {
      const httpGetMock = jest
        .fn()
        .mockResolvedValueOnce({ product: { id: "a" } })
        .mockResolvedValueOnce({ product: { id: "b" } });

      const { fetchProductById } = loadClient(httpGetMock);

      jest.spyOn(Date, "now").mockReturnValue(1_000);

      await fetchProductById("a");
      await fetchProductById("b");

      expect(httpGetMock).toHaveBeenCalledTimes(2);
      expect(httpGetMock).toHaveBeenNthCalledWith(1, "/api/products/a");
      expect(httpGetMock).toHaveBeenNthCalledWith(2, "/api/products/b");
    });

    test("se in-flight por id falhar, remove do map e permite retry", async () => {
      const d = deferred<any>();
      const httpGetMock = jest.fn().mockReturnValueOnce(d.promise);
      const { fetchProductById } = loadClient(httpGetMock);

      jest.spyOn(Date, "now").mockReturnValue(1_000);

      const p1 = fetchProductById("x");
      const p2 = fetchProductById("x");

      expect(httpGetMock).toHaveBeenCalledTimes(1);

      d.reject(new Error("nope"));
      await expect(p1).rejects.toThrow("nope");
      await expect(p2).rejects.toThrow("nope");

      httpGetMock.mockResolvedValueOnce({ product: { id: "x" } });

      const r = await fetchProductById("x");
      expect(httpGetMock).toHaveBeenCalledTimes(2);
      expect(r).toStrictEqual({ product: { id: "x" } });
    });
  });
});
