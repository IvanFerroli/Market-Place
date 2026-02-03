/**
 * Error thrown by HTTP helpers when a request returns a non-2xx status.
 *
 * Includes:
 * - `status` HTTP status code
 * - `url` request URL
 * - `method` request method
 * - `bodyText` best-effort response body (useful for debugging)
 */
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

/**
 * Fetches JSON via GET and returns the parsed value typed as `T`.
 *
 * Throws:
 * - {@link HttpError} when the response is not ok (non-2xx)
 * - `Error` when the response body is not valid JSON
 */
export async function httpGet<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { ...init, method: "GET" });

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
 * Tries multiple URLs and returns the first OK JSON response.
 *
 * Useful for fallbacks, e.g.:
 * - prefer a route without `/api` in some environments
 * - or support alternate endpoints during migrations
 *
 * Behavior:
 * - Iterates `urls` in order
 * - On non-OK responses, stores a {@link HttpError} and continues
 * - On fetch exceptions, stores the error and continues
 * - If all fail, throws the last captured error (or a generic one)
 */
export async function fetchFirstOkJson<T>(
  urls: string[],
  init: RequestInit = {},
): Promise<T> {
  let lastErr: unknown = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, init);

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
