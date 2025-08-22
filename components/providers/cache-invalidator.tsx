'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Component to handle cache invalidation on route changes
 * Prevents stale data when navigating between pages
 */
export function CacheInvalidator() {
  const router = useRouter()

  useEffect(() => {
    // Force clear API caches on page load
    const clearStaleCache = async () => {
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          // Clear service worker API cache
          const cacheNames = await caches.keys()
          for (const cacheName of cacheNames) {
            if (cacheName.includes('dealmecca-api') || cacheName.includes('api')) {
              console.log(`🗑️ Clearing stale API cache: ${cacheName}`)
              await caches.delete(cacheName)
            }
          }
          
          // Force service worker update
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration()
            if (registration) {
              await registration.update()
            }
          }
        } catch (error) {
          console.log('Cache clearing failed:', error)
        }
      }
    }

    clearStaleCache()
  }, [])

  // Clear local storage cache on unmount
  useEffect(() => {
    return () => {
      // Clear any localStorage cached data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('companies_') || key.startsWith('contacts_') || key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }, [])

  return null
}
