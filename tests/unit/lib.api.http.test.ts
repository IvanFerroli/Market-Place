import { HttpError, fetchFirstOkJson, httpGet } from "@/lib/api/http";

type MockRes = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
};

function resOk(payload: any): MockRes {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

function resNotOk(status: number, bodyText = "err"): MockRes {
  return {
    ok: false,
    status,
    json: async () => {
      throw new Error("should not be called");
    },
    text: async () => bodyText,
  };
}

describe("lib/api/http", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("HttpError", () => {
    test("sets message and fields", () => {
      const e = new HttpError({
        status: 418,
        url: "https://x.test",
        method: "GET",
        bodyText: "teapot",
      });

      expect(e.message).toBe("GET https://x.test failed: 418");
      expect(e.status).toBe(418);
      expect(e.url).toBe("https://x.test");
      expect(e.method).toBe("GET");
      expect(e.bodyText).toBe("teapot");
    });
  });

  describe("httpGet", () => {
    test("returns parsed JSON on ok", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;
      fetchMock.mockResolvedValue(resOk({ a: 1 }));

      const out = await httpGet<{ a: number }>("https://api.test/items", {
        headers: { "x-test": "1" },
      });

      expect(out).toEqual({ a: 1 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/items");
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: "GET",
        headers: { "x-test": "1" },
      });
    });

    test("throws HttpError with bodyText on non-ok", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;
      fetchMock.mockResolvedValue(resNotOk(404, "not found"));

      await expect(httpGet("https://api.test/missing")).rejects.toBeInstanceOf(HttpError);

      try {
        await httpGet("https://api.test/missing");
      } catch (e) {
        const err = e as HttpError;
        expect(err.status).toBe(404);
        expect(err.url).toBe("https://api.test/missing");
        expect(err.method).toBe("GET");
        expect(err.bodyText).toBe("not found");
      }
    });

    test("throws HttpError with undefined bodyText if res.text fails", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;

      const badTextRes: MockRes = {
        ok: false,
        status: 500,
        json: async () => ({ nope: true }),
        text: async () => {
          throw new Error("boom");
        },
      };

      fetchMock.mockResolvedValue(badTextRes);

      try {
        await httpGet("https://api.test/bad");
        throw new Error("expected throw");
      } catch (e) {
        const err = e as HttpError;
        expect(err.status).toBe(500);
        expect(err.url).toBe("https://api.test/bad");
        expect(err.method).toBe("GET");
        expect(err.bodyText).toBeUndefined();
      }
    });

    test("throws a clear error when JSON is invalid", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;

      const invalidJsonRes: MockRes = {
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("invalid json");
        },
        text: async () => "not json",
      };

      fetchMock.mockResolvedValue(invalidJsonRes);

      await expect(httpGet("https://api.test/invalid")).rejects.toThrow(
        "GET https://api.test/invalid returned invalid JSON",
      );
    });
  });

  describe("fetchFirstOkJson", () => {
    test("returns the first OK JSON, after skipping non-ok responses", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;

      fetchMock
        .mockResolvedValueOnce(resNotOk(503, "down"))
        .mockResolvedValueOnce(resOk({ ok: true }));

      const out = await fetchFirstOkJson<{ ok: boolean }>(
        ["https://a.test", "https://b.test"],
        { method: "POST" },
      );

      expect(out).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toBe("https://a.test");
      expect(fetchMock.mock.calls[1][0]).toBe("https://b.test");
      expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST" });
    });

    test("stores HttpError on non-ok and throws last HttpError if all fail", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;

      fetchMock
        .mockResolvedValueOnce(resNotOk(401, "nope"))
        .mockResolvedValueOnce(resNotOk(500, "still nope"));

      const err = await fetchFirstOkJson(["https://a.test", "https://b.test"]).catch(
        (e) => e,
      );

      expect(err).toBeInstanceOf(HttpError);

      const he = err as HttpError;
      expect(he.status).toBe(500);
      expect(he.url).toBe("https://b.test");
      expect(he.method).toBe("GET"); // default quando init.method não existe
      expect(he.bodyText).toBe("still nope");
    });

    test("throws last captured Error if fetch throws and all fail", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;

      fetchMock
        .mockRejectedValueOnce(new Error("network"))
        .mockResolvedValueOnce(resNotOk(500, "server"));

      await expect(
        fetchFirstOkJson(["https://a.test", "https://b.test"]),
      ).rejects.toBeInstanceOf(HttpError);
    });

    test("throws generic error if last error is not an Error instance", async () => {
      const fetchMock = global.fetch as unknown as jest.Mock;
      fetchMock.mockImplementation(() => {
        throw "nope"; // string
      });

      await expect(fetchFirstOkJson(["https://a.test"])).rejects.toThrow(
        "Failed to fetch JSON",
      );
    });
  });
});
