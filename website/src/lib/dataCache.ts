const PREFIX = 'fi2t:v10:'

interface CacheEntry<T> {
  data: T
  expires: number
}

const memory = new Map<string, CacheEntry<unknown>>()

export const CACHE_TTL = {
  api: 5 * 60 * 1000,
  settings: 10 * 60 * 1000,
} as const

export function readCache<T>(key: string): T | null {
  const mem = memory.get(key)
  if (mem && mem.expires > Date.now()) return mem.data as T

  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (entry.expires > Date.now()) {
      memory.set(key, entry as CacheEntry<unknown>)
      return entry.data
    }
    localStorage.removeItem(`${PREFIX}${key}`)
  } catch {
    /* ignore corrupt cache */
  }
  return null
}

export function writeCache<T>(key: string, data: T, ttlMs: number): void {
  const entry: CacheEntry<T> = { data, expires: Date.now() + ttlMs }
  memory.set(key, entry as CacheEntry<unknown>)
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry))
  } catch {
    /* quota exceeded — memory cache still works */
  }
}

export function invalidateCache(key: string): void {
  memory.delete(key)
  try {
    localStorage.removeItem(`${PREFIX}${key}`)
  } catch {
    /* ignore */
  }
}

/** Return cached data instantly; refresh in background when stale or on first load. */
export async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = CACHE_TTL.api,
): Promise<T> {
  const cached = readCache<T>(key)
  if (cached !== null) {
    fetcher()
      .then(data => writeCache(key, data, ttlMs))
      .catch(() => {})
    return cached
  }
  const data = await fetcher()
  writeCache(key, data, ttlMs)
  return data
}

export function preloadImages(urls: string[]): void {
  const seen = new Set<string>()
  for (const url of urls) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    const img = new Image()
    img.decoding = 'async'
    img.src = url
  }
}
