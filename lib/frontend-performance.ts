import { useState, useEffect, useCallback, useMemo } from 'react'

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )
    
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan)
    }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])
  
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  }
}

// Debounced search hook
export function useDebouncedSearch(
  searchFn: (query: string) => Promise<any>,
  delay = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      setError(null)
      return
    }
    
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      
      try {
        const searchResults = await searchFn(query)
        setResults(searchResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }, delay)
    
    return () => clearTimeout(timer)
  }, [query, delay, searchFn])
  
  return {
    query,
    setQuery,
    results,
    loading,
    error
  }
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) {
  const [targetRef, setTargetRef] = useState<Element | null>(null)
  
  useEffect(() => {
    if (!targetRef) return
    
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry)
    }, options)
    
    observer.observe(targetRef)
    
    return () => observer.disconnect()
  }, [targetRef, callback, options])
  
  return setTargetRef
}

// Pagination hook with performance optimizations
export function usePagination<T>({
  data,
  itemsPerPage = 50,
  preloadPages = 2
}: {
  data: T[]
  itemsPerPage?: number
  preloadPages?: number
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]))
  
  const totalPages = Math.ceil(data.length / itemsPerPage)
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return data.slice(start, end)
  }, [data, currentPage, itemsPerPage])
  
  // Preload adjacent pages
  useEffect(() => {
    const pagesToPreload = []
    
    for (let i = currentPage - preloadPages; i <= currentPage + preloadPages; i++) {
      if (i > 0 && i <= totalPages && !loadedPages.has(i)) {
        pagesToPreload.push(i)
      }
    }
    
    if (pagesToPreload.length > 0) {
      setLoadedPages(prev => new Set([...prev, ...pagesToPreload]))
    }
  }, [currentPage, preloadPages, totalPages, loadedPages])
  
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])
  
  return {
    currentPage,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    loadedPages: Array.from(loadedPages)
  }
}

// Performance monitoring hooks
export function usePerformanceMonitor(componentName: string) {
  const [renderTimes, setRenderTimes] = useState<number[]>([])
  const [memoryUsage, setMemoryUsage] = useState<number[]>([])
  
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      setRenderTimes(prev => [...prev.slice(-9), renderTime])
      
      // Monitor memory if available
      if ('memory' in performance) {
        const memory = (performance as any).memory.usedJSHeapSize
        setMemoryUsage(prev => [...prev.slice(-9), memory])
      }
      
      // Log slow renders
      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  })
  
  const avgRenderTime = renderTimes.length > 0 
    ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
    : 0
  
  const avgMemoryUsage = memoryUsage.length > 0
    ? memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length
    : 0
  
  return {
    renderTimes,
    memoryUsage,
    avgRenderTime,
    avgMemoryUsage,
    lastRenderTime: renderTimes[renderTimes.length - 1] || 0
  }
}

// Bundle size monitoring utility
export function getBundleInfo() {
  if (typeof window === 'undefined') return null
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  const jsResources = resources.filter(r => 
    r.name.includes('.js') && !r.name.includes('hot-update')
  )
  
  const cssResources = resources.filter(r => r.name.includes('.css'))
  
  const totalJSSize = jsResources.reduce((total, resource) => {
    return total + (resource.encodedBodySize || 0)
  }, 0)
  
  const totalCSSSize = cssResources.reduce((total, resource) => {
    return total + (resource.encodedBodySize || 0)
  }, 0)
  
  return {
    totalJSSize: Math.round(totalJSSize / 1024), // KB
    totalCSSSize: Math.round(totalCSSSize / 1024), // KB
    jsResourceCount: jsResources.length,
    cssResourceCount: cssResources.length,
    loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)
  }
}

// Image optimization utilities
export function optimizeImageLoading() {
  // Add loading="lazy" to images below the fold
  const images = document.querySelectorAll('img:not([loading])')
  
  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect()
    const isAboveFold = rect.top < window.innerHeight
    
    if (!isAboveFold) {
      img.setAttribute('loading', 'lazy')
    }
  })
  
  // Preload critical images
  const criticalImages = document.querySelectorAll('img[data-priority="high"]')
  
  criticalImages.forEach(img => {
    const src = img.getAttribute('src')
    if (src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    }
  })
}

// Web Vitals monitoring
export function initWebVitalsMonitoring() {
  // Monitor Core Web Vitals
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      console.log('📊 LCP:', Math.round(lastEntry.startTime), 'ms')
      
      // Track in analytics if available
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          metric: 'LCP',
          value: Math.round(lastEntry.startTime),
        })
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.log('📊 FID:', Math.round(entry.processingStart - entry.startTime), 'ms')
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            metric: 'FID',
            value: Math.round(entry.processingStart - entry.startTime),
          })
        }
      })
    }).observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift (CLS)
    let clsScore = 0
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      })
      
      console.log('📊 CLS Score:', clsScore.toFixed(3))
      
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          metric: 'CLS',
          value: clsScore,
        })
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// Memory leak detection
export function detectMemoryLeaks() {
  if (typeof window === 'undefined') return
  
  let initialMemory = 0
  let checkCount = 0
  
  const checkMemory = () => {
    if ('memory' in performance) {
      const currentMemory = (performance as any).memory.usedJSHeapSize
      
      if (initialMemory === 0) {
        initialMemory = currentMemory
      }
      
      const memoryIncrease = currentMemory - initialMemory
      const increasePercent = (memoryIncrease / initialMemory) * 100
      
      checkCount++
      
      if (checkCount > 10 && increasePercent > 50) {
        console.warn('🚨 Potential memory leak detected:', {
          initialMemory: Math.round(initialMemory / 1024 / 1024) + 'MB',
          currentMemory: Math.round(currentMemory / 1024 / 1024) + 'MB',
          increase: Math.round(memoryIncrease / 1024 / 1024) + 'MB',
          increasePercent: Math.round(increasePercent) + '%'
        })
      }
    }
  }
  
  // Check memory every 30 seconds
  const interval = setInterval(checkMemory, 30000)
  
  // Cleanup
  return () => clearInterval(interval)
}