export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type JsonRecord = Record<string, unknown>;

export function isRecord(v: unknown): v is JsonRecord {
  return typeof v === "object" && v !== null;
}

export function pickFirstString(
  obj: JsonRecord,
  keys: string[],
  fallback: string | null = null,
): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return fallback;
}

export function pickFirstNumber(obj: JsonRecord, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

export function pickFirstBoolean(
  obj: JsonRecord,
  keys: string[],
  fallback: boolean,
): boolean {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "true") return true;
      if (s === "false") return false;
    }
  }
  return fallback;
}

type AirtableAttachment = {
  url?: unknown;
  thumbnails?: {
    large?: { url?: unknown };
    full?: { url?: unknown };
  };
};

/**
 * Accepts: string | JSON-string | attachment[] | attachmentObj
 * Returns: best-effort URL or null.
 */
export function pickUrl(v: unknown): string | null {
  if (!v) return null;

  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;

    // JSON-string fallback (ex: '[{"url":"..."}]')
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        return pickUrl(JSON.parse(s));
      } catch {
        return s;
      }
    }

    return s;
  }

  if (Array.isArray(v) && v.length > 0) return pickUrl(v[0]);

  if (isRecord(v)) {
    const o = v as AirtableAttachment;

    const url = o?.url;
    if (typeof url === "string" && url.trim()) return url.trim();

    const large = o?.thumbnails?.large?.url;
    if (typeof large === "string" && large.trim()) return large.trim();

    const full = o?.thumbnails?.full?.url;
    if (typeof full === "string" && full.trim()) return full.trim();
  }

  return null;
}
