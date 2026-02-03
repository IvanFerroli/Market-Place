/**
 * Returns the canonical site URL used to build absolute links.
 *
 * Env:
 * - `NEXT_PUBLIC_SITE_URL` (recommended in production)
 *
 * Fallback:
 * - Defaults to `http://localhost:3000` for local dev.
 */
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}
