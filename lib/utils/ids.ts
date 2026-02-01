export function asId(v: unknown) {
  return String(v ?? "");
}

/**
 * Best-effort normalizer.
 * - trims
 * - returns null if empty
 */
export function normalizeId(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : String(v ?? "").trim();
  return s.length ? s : null;
}
