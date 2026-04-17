/** Default Time-To-Live: 5 minutes in milliseconds. */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/** Envelope stored alongside every cached value. */
interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Unix timestamp (ms)
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflightCache = new Map<string, Promise<unknown>>();

function getStorageKey(key: string) {
  return `bluebook:${key}`;
}

// ---------------------------------------------------------------------------
// getClientCache
// ---------------------------------------------------------------------------

/**
 * Returns the cached value for `key` if it exists and has not expired.
 * Expired entries are evicted from both the in-memory map and sessionStorage.
 */
export function getClientCache<T>(key: string): T | undefined {
  // --- In-memory check ---
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry !== undefined) {
    if (Date.now() < memoryEntry.expiresAt) {
      return memoryEntry.value;
    }
    // Expired — evict from memory.
    memoryCache.delete(key);
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  // --- SessionStorage fallback ---
  try {
    const rawValue = window.sessionStorage.getItem(getStorageKey(key));
    if (!rawValue) {
      return undefined;
    }

    const entry = JSON.parse(rawValue) as CacheEntry<T>;

    if (Date.now() >= entry.expiresAt) {
      // Expired — evict from sessionStorage.
      window.sessionStorage.removeItem(getStorageKey(key));
      return undefined;
    }

    // Repopulate the in-memory map for faster subsequent reads.
    memoryCache.set(key, entry);
    return entry.value;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// setClientCache
// ---------------------------------------------------------------------------

/**
 * Stores `value` under `key` with an optional TTL (defaults to 5 minutes).
 */
export function setClientCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };

  memoryCache.set(key, entry);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch {
    // Ignore storage write failures — in-memory cache still works.
  }
}

// ---------------------------------------------------------------------------
// clearClientCache
// ---------------------------------------------------------------------------

/**
 * Removes all cache entries whose key starts with `keyPrefix`.
 * If no prefix is provided, clears the entire cache.
 *
 * Example: `clearClientCache("dashboard:")` invalidates all dashboard data
 * after a test submission so the user sees fresh scores on their next visit.
 */
export function clearClientCache(keyPrefix?: string) {
  // --- Clear in-memory entries ---
  if (!keyPrefix) {
    memoryCache.clear();
    inflightCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(keyPrefix)) {
        memoryCache.delete(key);
      }
    }

    for (const key of inflightCache.keys()) {
      if (key.startsWith(keyPrefix)) {
        inflightCache.delete(key);
      }
    }
  }

  if (typeof window === "undefined") {
    return;
  }

  // --- Clear matching sessionStorage entries ---
  try {
    const storagePrefix = getStorageKey(keyPrefix ?? "");
    const keysToRemove: string[] = [];

    for (let i = 0; i < window.sessionStorage.length; i++) {
      const storageKey = window.sessionStorage.key(i);
      if (storageKey && (!keyPrefix || storageKey.startsWith(storagePrefix))) {
        keysToRemove.push(storageKey);
      }
    }

    keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
    // Ignore storage errors.
  }
}

/**
 * Returns a cached value when available and otherwise shares a single in-flight
 * loader promise for the same key across all callers.
 */
export async function readThroughClientCache<T>(
  key: string,
  load: () => Promise<T>,
  options?: {
    forceRefresh?: boolean;
    ttlMs?: number;
  },
) {
  if (!options?.forceRefresh) {
    const cached = getClientCache<T>(key);
    if (cached !== undefined) {
      return cached;
    }
  }

  const existingInflight = inflightCache.get(key) as Promise<T> | undefined;
  if (existingInflight) {
    return existingInflight;
  }

  const nextPromise = load()
    .then((value) => {
      setClientCache(key, value, options?.ttlMs);
      return value;
    })
    .finally(() => {
      inflightCache.delete(key);
    });

  inflightCache.set(key, nextPromise);
  return nextPromise;
}
