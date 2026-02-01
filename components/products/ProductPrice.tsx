export default function ProductPrice({
  value,
  compact,
}: {
  value: number; // 79.90
  compact?: boolean;
}) {
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return (
    <span className={compact ? "text-sm font-semibold" : "text-lg font-semibold"}>
      {formatted}
    </span>
  );
}
