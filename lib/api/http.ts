export class HttpError extends Error {
  status: number;
  url: string;
  method: string;
  bodyText?: string;

  constructor(opts: { status: number; url: string; method: string; bodyText?: string }) {
    super(`${opts.method} ${opts.url} failed: ${opts.status}`);
    this.status = opts.status;
    this.url = opts.url;
    this.method = opts.method;
    this.bodyText = opts.bodyText;
  }
}

async function tryReadText(res: Response): Promise<string | undefined> {
  try {
    return await res.text();
  } catch {
    return undefined;
  }
}

export async function httpGet<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { ...init, method: "GET", cache: init.cache ?? "no-store" });

  if (!res.ok) {
    const bodyText = await tryReadText(res);
    throw new HttpError({ status: res.status, url, method: "GET", bodyText });
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new Error(`GET ${url} returned invalid JSON`);
  }
}

/**
 * Try multiple URLs; returns the first ok JSON response.
 * Useful for fallbacks (/api/products, /api/products/:id, etc.)
 */
export async function fetchFirstOkJson<T>(
  urls: string[],
  init: RequestInit = {},
): Promise<T> {
  let lastErr: unknown = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, { ...init, cache: init.cache ?? "no-store" });

      if (!res.ok) {
        const bodyText = await tryReadText(res);
        lastErr = new HttpError({
          status: res.status,
          url,
          method: (init.method ?? "GET").toString(),
          bodyText,
        });
        continue;
      }

      return (await res.json()) as T;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Failed to fetch JSON");
}
