/**
 * R2/CDN Data Fetch Utility
 *
 * Fetches game data JSON from the R2 CDN at runtime instead of bundling
 * large JSON files into the Worker (solving the 3 MiB Worker size limit).
 *
 * Data is cached at module level for the lifetime of the Worker instance,
 * so subsequent requests within the same Worker get instant responses.
 *
 * Uses: NEXT_PUBLIC_R2_DATA_URL env var (defaults to https://cdn.taskbarherohub.wiki)
 */

const R2_CDN_BASE = process.env.NEXT_PUBLIC_R2_DATA_URL || "https://cdn.taskbarherohub.wiki";

// Module-level cache — shared across all requests in the same Worker instance
const cache = new Map<string, unknown>();
const pendingFetches = new Map<string, Promise<unknown>>();

let isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";

function cdnUrl(path: string): string {
  const cleanPath = path.replace(/^\//, "");
  return `${R2_CDN_BASE}/${cleanPath}`;
}

/**
 * Fetch JSON from the R2 CDN. Results are cached at module level.
 * Concurrent requests for the same path are deduplicated.
 */
export async function fetchR2Json<T>(path: string): Promise<T> {
  // Return cached data immediately (across requests in same Worker)
  if (cache.has(path)) {
    return cache.get(path) as T;
  }

  // Deduplicate concurrent fetches for the same path
  if (pendingFetches.has(path)) {
    return pendingFetches.get(path) as Promise<T>;
  }

  const promise = _doFetch<T>(path);
  pendingFetches.set(path, promise);

  try {
    return await promise;
  } finally {
    pendingFetches.delete(path);
  }
}

async function _doFetch<T>(path: string): Promise<T> {
  const url = cdnUrl(path);
  let lastError: unknown;

  // Retry once on failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`R2 fetch failed: ${url} (HTTP ${response.status})`);
      }
      const data = await response.json();
      cache.set(path, data);
      return data as T;
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        // No delay in Workers environment as it counts against CPU time limit
      }
    }
  }

  throw lastError;
}

/**
 * Check if data for a given path is already cached in memory.
 */
export function isR2Cached(path: string): boolean {
  return cache.has(path);
}

/**
 * Preload multiple paths in parallel. Failures are silently ignored
 * so a single missing file doesn't block the entire preload.
 */
export async function preloadR2Data(paths: string[]): Promise<void> {
  const results = await Promise.allSettled(
    paths.map((path) => fetchR2Json(path)),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.warn(
      `R2 preload: ${failed.length}/${paths.length} paths failed to load`,
    );
  }
}

/**
 * Synchronously get cached data. Returns undefined if not yet loaded.
 * Use this after ensureGameData() has completed.
 */
export function getR2Cached<T>(path: string): T | undefined {
  return cache.get(path) as T | undefined;
}

/**
 * The CDN base URL for constructing data URLs externally.
 */
export function r2DataUrl(path: string): string {
  return cdnUrl(path);
}
