type CacheEntry<T> = {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL = 60 * 1000 // 1 minute

export function getCached<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null

  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key)
    return null
  }

  return entry.data
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function invalidateCache(key: string): void {
  cache.delete(key)
}

export function invalidatePattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

export function clearAllCache(): void {
  cache.clear()
}