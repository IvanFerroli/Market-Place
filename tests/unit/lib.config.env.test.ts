import { getSiteUrl } from "@/lib/config/env";

describe("lib/config/env", () => {
  const KEY = "NEXT_PUBLIC_SITE_URL";
  const prev = process.env[KEY];

  afterEach(() => {
    if (prev === undefined) delete process.env[KEY];
    else process.env[KEY] = prev;
  });

  test("fallback: localhost quando env não existe", () => {
    delete process.env[KEY];
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  test("usa NEXT_PUBLIC_SITE_URL e aplica trim", () => {
    process.env[KEY] = "  https://example.com  ";
    expect(getSiteUrl()).toBe("https://example.com");
  });

  test("env vazio após trim cai no fallback", () => {
    process.env[KEY] = "   ";
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
