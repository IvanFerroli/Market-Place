export default function ProductPrice({
  value,
  compact,
}: {
  value: number; // cents (ex: 7990)
  compact?: boolean;
}) {
  const cents = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

  return (
    <span className={compact ? "text-sm font-semibold" : "text-lg font-semibold"}>
      {formatted}
    </span>
  );
}
