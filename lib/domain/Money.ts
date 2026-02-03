export const MONEY_CURRENCIES = ["USD", "BRL"] as const;
export type MoneyCurrency = (typeof MONEY_CURRENCIES)[number];

export type Money = {
  currency: MoneyCurrency;
  amountCents: number;
};

export function makeMoney(currency: MoneyCurrency, amountCents: number): Money {
  const n = Number(amountCents);
  return {
    currency,
    amountCents: Number.isFinite(n) ? Math.trunc(n) : 0,
  };
}

export function isMoney(v: unknown): v is Money {
  if (!v || typeof v !== "object") return false;
  const obj = v as any;
  return (
    MONEY_CURRENCIES.includes(obj.currency) &&
    typeof obj.amountCents === "number" &&
    Number.isFinite(obj.amountCents) &&
    Number.isInteger(obj.amountCents)
  );
}
