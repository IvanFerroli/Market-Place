import type { Money } from "@/lib/domain/Money";

export function formatMoney(m: Money) {
  const value = m.amountCents / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: m.currency,
  }).format(value);
}
