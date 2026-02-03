import {
  safeJsonParse,
  isRecord,
  pickFirstString,
  pickFirstNumber,
  pickFirstBoolean,
  pickUrl,
  type JsonRecord,
} from "@/lib/utils/safe";

describe("lib/utils/safe", () => {
  describe("safeJsonParse", () => {
    test("parse ok", () => {
      expect(safeJsonParse('{"a":1}', { a: 0 } as any)).toStrictEqual({ a: 1 });
    });

    test("parse falha -> fallback", () => {
      expect(safeJsonParse("{", { ok: true } as any)).toStrictEqual({ ok: true });
    });
  });

  describe("isRecord", () => {
    test("true para objeto não-null", () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ a: 1 })).toBe(true);
    });

    test("false para null e não-objetos", () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord(undefined)).toBe(false);
      expect(isRecord("x")).toBe(false);
      expect(isRecord(123)).toBe(false);
      expect(isRecord(true)).toBe(false);
    });

    test("array também é object (então é true)", () => {
      // comportamento atual (e intencional aqui): arrays passam como record
      expect(isRecord([])).toBe(true);
    });
  });

  describe("pickFirstString", () => {
    test("pega a primeira string não vazia, com trim", () => {
      const obj: JsonRecord = { a: "   ", b: "  ok  ", c: "later" };
      expect(pickFirstString(obj, ["a", "b", "c"])).toBe("ok");
    });

    test("retorna fallback quando não acha", () => {
      const obj: JsonRecord = { a: "   ", b: 2 };
      expect(pickFirstString(obj, ["a", "b"], null)).toBeNull();
      expect(pickFirstString(obj, ["a", "b"], "x")).toBe("x");
    });
  });

  describe("pickFirstNumber", () => {
    test("pega o primeiro number finito", () => {
      const obj: JsonRecord = { a: NaN, b: Infinity, c: 7 };
      expect(pickFirstNumber(obj, ["a", "b", "c"])).toBe(7);
    });

    test("retorna null quando não acha", () => {
      const obj: JsonRecord = { a: "1", b: null };
      expect(pickFirstNumber(obj, ["a", "b"])).toBeNull();
    });
  });

  describe("pickFirstBoolean", () => {
    test("pega boolean direto", () => {
      const obj: JsonRecord = { a: true };
      expect(pickFirstBoolean(obj, ["a"], false)).toBe(true);
    });

    test("number: 0=false, !=0=true", () => {
      expect(pickFirstBoolean({ a: 0 } as any, ["a"], true)).toBe(false);
      expect(pickFirstBoolean({ a: 2 } as any, ["a"], false)).toBe(true);
    });

    test("string: 'true'/'false' (case/trim)", () => {
      expect(pickFirstBoolean({ a: "  TRUE " } as any, ["a"], false)).toBe(true);
      expect(pickFirstBoolean({ a: " false" } as any, ["a"], true)).toBe(false);
    });

    test("fallback quando não interpreta", () => {
      expect(pickFirstBoolean({ a: "yes" } as any, ["a"], true)).toBe(true);
      expect(pickFirstBoolean({ a: " " } as any, ["a"], false)).toBe(false);
    });

    test("ordem: pega a primeira chave válida", () => {
      const obj: JsonRecord = { a: "false", b: true };
      expect(pickFirstBoolean(obj, ["a", "b"], true)).toBe(false);
    });
  });

  describe("pickUrl", () => {
    test("null/undefined/empty -> null", () => {
      expect(pickUrl(null)).toBeNull();
      expect(pickUrl(undefined)).toBeNull();
      expect(pickUrl("   ")).toBeNull();
    });

    test("string normal -> trim", () => {
      expect(pickUrl("  https://x.com  ")).toBe("https://x.com");
    });

    test("string que parece JSON: se parse falhar retorna a própria string", () => {
      // termina com ] mas JSON inválido -> cai no catch e retorna s
      const s = '[{"url":';
      expect(pickUrl(s)).toBe(s);
    });

    test("JSON-string com attachment[]", () => {
      const s = '[{"url":"https://img.com/a.png"}]';
      expect(pickUrl(s)).toBe("https://img.com/a.png");
    });

    test("array: pega primeiro elemento", () => {
      expect(pickUrl([{ url: "https://img.com/1.png" }, { url: "x" }])).toBe(
        "https://img.com/1.png",
      );
    });

    test("obj: prioriza url, depois thumbnails.large, depois thumbnails.full", () => {
      expect(pickUrl({ url: " https://u " })).toBe("https://u");

      expect(
        pickUrl({
          url: "   ",
          thumbnails: { large: { url: " https://large " }, full: { url: "https://full" } },
        }),
      ).toBe("https://large");

      expect(
        pickUrl({
          url: "   ",
          thumbnails: { large: { url: "   " }, full: { url: " https://full " } },
        }),
      ).toBe("https://full");
    });

    test("obj sem nada válido -> null", () => {
      expect(pickUrl({ url: 123 })).toBeNull();
      expect(pickUrl({ thumbnails: { large: { url: 0 } } })).toBeNull();
    });
  });
});
