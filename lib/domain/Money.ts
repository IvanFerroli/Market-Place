/**
 * Supported currencies for the app.
 *
 * Keep this list small and explicit — it is used as a runtime allowlist
 * in {@link isMoney}.
 */
export const MONEY_CURRENCIES = ["USD", "BRL"] as const;

/** Union type derived from {@link MONEY_CURRENCIES}. */
export type MoneyCurrency = (typeof MONEY_CURRENCIES)[number];

/**
 * Canonical money representation (integer cents).
 *
 * Notes:
 * - `amountCents` is an integer to avoid float rounding issues.
 * - Negative values are allowed at the type level (e.g. discounts), but most
 *   app flows may choose to clamp/validate elsewhere.
 */
export type Money = {
  currency: MoneyCurrency;
  amountCents: number;
};

/**
 * Safe constructor that normalizes the amount into an integer.
 *
 * - Non-finite values become `0`.
 * - Finite values are truncated (towards zero).
 */
export function makeMoney(currency: MoneyCurrency, amountCents: number): Money {
  const n = Number(amountCents);
  return {
    currency,
    amountCents: Number.isFinite(n) ? Math.trunc(n) : 0,
  };
}

/**
 * Runtime type guard for unknown values.
 *
 * Ensures:
 * - `currency` is one of {@link MONEY_CURRENCIES}
 * - `amountCents` is a finite integer number
 */
export function isMoney(v: unknown): v is Money {
  if (!v || typeof v !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = v as any;
  return (
    MONEY_CURRENCIES.includes(obj.currency) &&
    typeof obj.amountCents === "number" &&
    Number.isFinite(obj.amountCents) &&
    Number.isInteger(obj.amountCents)
  );
}
