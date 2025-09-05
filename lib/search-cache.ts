import { LRUCache } from 'lru-cache'

// Search result cache configuration
const CACHE_CONFIG = {
  max: 1000, // Maximum number of cached entries
  ttl: 1000 * 60 * 15, // 15 minutes TTL
  maxSize: 50 * 1024 * 1024, // 50MB max size
  sizeCalculation: (value: any) => JSON.stringify(value).length,
  allowStale: true,
  updateAgeOnGet: true,
  updateAgeOnHas: false,
}

// Cache instance
const searchCache = new LRUCache<string, any>(CACHE_CONFIG)

// Cache statistics
interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  size: number
  calculatedSize: number
  entries: number
}

let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  size: 0,
  calculatedSize: 0,
  entries: 0
}

// Generate cache key from search parameters
export function generateCacheKey(
  searchType: string,
  params: Record<string, any>,
  userId?: string
): string {
  // Include user-specific data if needed
  const keyParts = [
    searchType,
    JSON.stringify(params, Object.keys(params).sort()),
    userId || 'anonymous'
  ]
  
  return Buffer.from(keyParts.join('|')).toString('base64')
}

// Cached search wrapper
export async function cachedSearch<T>(
  cacheKey: string,
  searchFn: () => Promise<T>,
  options: {
    ttl?: number
    skipCache?: boolean
    tags?: string[]
  } = {}
): Promise<{ result: T; cached: boolean; cacheKey: string }> {
  const { ttl = CACHE_CONFIG.ttl, skipCache = false, tags = [] } = options

  // Skip cache if requested
  if (skipCache) {
    const result = await searchFn()
    return { result, cached: false, cacheKey }
  }

  // Try to get from cache first
  const cachedResult = searchCache.get(cacheKey)
  
  if (cachedResult) {
    cacheStats.hits++
    updateCacheStats()
    console.log(`🎯 Cache HIT: ${cacheKey.slice(0, 16)}...`)
    return { result: cachedResult, cached: true, cacheKey }
  }

  // Cache miss - execute search and cache result
  cacheStats.misses++
  console.log(`❌ Cache MISS: ${cacheKey.slice(0, 16)}...`)
  
  const result = await searchFn()
  
  // Store in cache with metadata
  const cacheEntry = {
    data: result,
    timestamp: Date.now(),
    tags: tags,
    searchExecutedAt: new Date().toISOString()
  }
  
  searchCache.set(cacheKey, cacheEntry, { ttl })
  cacheStats.sets++
  updateCacheStats()
  
  console.log(`💾 Cached result: ${cacheKey.slice(0, 16)}...`)
  
  return { result: cacheEntry, cached: false, cacheKey }
}

// Cache invalidation by tags
export function invalidateByTag(tag: string): number {
  let invalidated = 0
  
  for (const [key, value] of searchCache.entries()) {
    if (value && value.tags && value.tags.includes(tag)) {
      searchCache.delete(key)
      invalidated++
      cacheStats.deletes++
    }
  }
  
  updateCacheStats()
  console.log(`🗑️ Invalidated ${invalidated} cache entries for tag: ${tag}`)
  
  return invalidated
}

// Cache invalidation by pattern
export function invalidateByPattern(pattern: RegExp): number {
  let invalidated = 0
  
  for (const key of searchCache.keys()) {
    if (pattern.test(key)) {
      searchCache.delete(key)
      invalidated++
      cacheStats.deletes++
    }
  }
  
  updateCacheStats()
  console.log(`🗑️ Invalidated ${invalidated} cache entries matching pattern: ${pattern}`)
  
  return invalidated
}

// Clear all cache
export function clearCache(): number {
  const size = searchCache.size
  searchCache.clear()
  cacheStats.deletes += size
  updateCacheStats()
  
  console.log(`🗑️ Cleared entire cache (${size} entries)`)
  
  return size
}

// Get cache statistics
export function getCacheStats(): CacheStats & {
  hitRate: number
  missRate: number
  totalRequests: number
  avgEntrySize: number
} {
  const totalRequests = cacheStats.hits + cacheStats.misses
  
  return {
    ...cacheStats,
    hitRate: totalRequests > 0 ? (cacheStats.hits / totalRequests) * 100 : 0,
    missRate: totalRequests > 0 ? (cacheStats.misses / totalRequests) * 100 : 0,
    totalRequests,
    avgEntrySize: cacheStats.entries > 0 ? cacheStats.calculatedSize / cacheStats.entries : 0
  }
}

// Update cache statistics
function updateCacheStats(): void {
  cacheStats.size = searchCache.size
  cacheStats.calculatedSize = searchCache.calculatedSize || 0
  cacheStats.entries = searchCache.size
}

// Cache warming functions
export async function warmCache(
  commonSearches: Array<{
    key: string
    searchFn: () => Promise<any>
    tags?: string[]
  }>
): Promise<number> {
  let warmed = 0
  
  console.log(`🔥 Warming cache with ${commonSearches.length} common searches...`)
  
  for (const { key, searchFn, tags = [] } of commonSearches) {
    try {
      await cachedSearch(key, searchFn, { tags })
      warmed++
    } catch (error) {
      console.error(`Failed to warm cache for key ${key}:`, error)
    }
  }
  
  console.log(`🔥 Cache warmed with ${warmed} entries`)
  
  return warmed
}

// Cache monitoring and cleanup
export function startCacheMonitoring(): void {
  // Log cache stats every 5 minutes
  setInterval(() => {
    const stats = getCacheStats()
    console.log('📊 Cache Statistics:', {
      entries: stats.entries,
      hitRate: `${stats.hitRate.toFixed(1)}%`,
      totalRequests: stats.totalRequests,
      sizeUsed: `${(stats.calculatedSize / 1024 / 1024).toFixed(1)} MB`
    })
  }, 5 * 60 * 1000)
  
  // Cleanup expired entries every hour
  setInterval(() => {
    const before = searchCache.size
    searchCache.purgeStale()
    const after = searchCache.size
    const purged = before - after
    
    if (purged > 0) {
      console.log(`🧹 Purged ${purged} stale cache entries`)
    }
  }, 60 * 60 * 1000)
}

// Cache health check
export function getCacheHealth(): {
  status: 'healthy' | 'warning' | 'critical'
  hitRate: number
  memoryUsage: number
  issues: string[]
} {
  const stats = getCacheStats()
  const issues: string[] = []
  
  let status: 'healthy' | 'warning' | 'critical' = 'healthy'
  
  // Check hit rate
  if (stats.hitRate < 30) {
    issues.push(`Low cache hit rate: ${stats.hitRate.toFixed(1)}%`)
    status = 'warning'
  }
  
  // Check memory usage
  const memoryUsagePercent = (stats.calculatedSize / CACHE_CONFIG.maxSize!) * 100
  
  if (memoryUsagePercent > 90) {
    issues.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`)
    status = 'critical'
  } else if (memoryUsagePercent > 75) {
    issues.push(`Moderate memory usage: ${memoryUsagePercent.toFixed(1)}%`)
    if (status === 'healthy') status = 'warning'
  }
  
  // Check if cache is growing too fast
  if (stats.entries > CACHE_CONFIG.max * 0.9) {
    issues.push(`Cache approaching capacity: ${stats.entries}/${CACHE_CONFIG.max}`)
    if (status === 'healthy') status = 'warning'
  }
  
  return {
    status,
    hitRate: stats.hitRate,
    memoryUsage: memoryUsagePercent,
    issues
  }
}

// Export cache instance for direct access if needed
export { searchCache }