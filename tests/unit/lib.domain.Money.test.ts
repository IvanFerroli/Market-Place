import { MONEY_CURRENCIES, isMoney, makeMoney } from "@/lib/domain/Money";

describe("Money", () => {
  test("MONEY_CURRENCIES is stable", () => {
    expect(MONEY_CURRENCIES).toEqual(["USD", "BRL"]);
  });

  test("makeMoney truncates and defaults non-finite to 0", () => {
    expect(makeMoney("USD", 10.9)).toEqual({ currency: "USD", amountCents: 10 });
    expect(makeMoney("BRL", Number.NaN)).toEqual({ currency: "BRL", amountCents: 0 });
  });

  test("isMoney validates shape", () => {
    expect(isMoney({ currency: "USD", amountCents: 10 })).toBe(true);
    expect(isMoney({ currency: "EUR", amountCents: 10 })).toBe(false);
    expect(isMoney({ currency: "BRL", amountCents: 10.5 })).toBe(false);
    expect(isMoney(null)).toBe(false);
  });
});
