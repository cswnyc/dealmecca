/**
 * Cache Busting Utilities for DealMecca
 * Ensures fresh data fetching and prevents stale cache issues
 */

export class CacheBuster {
  /**
   * Add cache-busting parameters to a URL
   */
  static addCacheBustingParams(url: string): string {
    const urlObj = new URL(url, window.location.origin)
    urlObj.searchParams.set('_t', Date.now().toString())
    urlObj.searchParams.set('_r', Math.random().toString(36).substring(7))
    return urlObj.toString()
  }

  /**
   * Create fetch options that prevent caching
   */
  static createFreshFetchOptions(additionalOptions: RequestInit = {}): RequestInit {
    return {
      ...additionalOptions,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...additionalOptions.headers
      }
    }
  }

  /**
   * Fetch with automatic cache busting
   */
  static async fetchFresh(url: string, options: RequestInit = {}): Promise<Response> {
    const freshUrl = this.addCacheBustingParams(url)
    const freshOptions = this.createFreshFetchOptions(options)
    
    console.log(`🔄 Fresh fetch: ${freshUrl}`)
    
    const response = await fetch(freshUrl, freshOptions)
    
    if (!response.ok) {
      console.error(`❌ Fetch failed: ${response.status} ${response.statusText}`)
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    
    console.log(`✅ Fresh data received from: ${url}`)
    return response
  }

  /**
   * Clear browser cache for specific patterns
   */
  static async clearCache(patterns: string[] = []) {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      
      for (const cacheName of cacheNames) {
        if (patterns.length === 0 || patterns.some(pattern => cacheName.includes(pattern))) {
          console.log(`🗑️ Clearing cache: ${cacheName}`)
          await caches.delete(cacheName)
        }
      }
    }
  }

  /**
   * Force service worker update
   */
  static async forceServiceWorkerUpdate() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        console.log('🔄 Forcing service worker update...')
        await registration.update()
        
        // If there's a waiting service worker, activate it
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }
    }
  }

  /**
   * Invalidate specific API cache
   */
  static async invalidateApiCache(apiPath: string) {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      
      for (const cacheName of cacheNames) {
        if (cacheName.includes('api') || cacheName.includes('dealmecca')) {
          const cache = await caches.open(cacheName)
          const keys = await cache.keys()
          
          for (const request of keys) {
            if (request.url.includes(apiPath)) {
              console.log(`🗑️ Invalidating cached request: ${request.url}`)
              await cache.delete(request)
            }
          }
        }
      }
    }
  }
}

// Export helper functions for easy use
export const fetchFresh = CacheBuster.fetchFresh.bind(CacheBuster)
export const clearCache = CacheBuster.clearCache.bind(CacheBuster)
export const invalidateApiCache = CacheBuster.invalidateApiCache.bind(CacheBuster)
