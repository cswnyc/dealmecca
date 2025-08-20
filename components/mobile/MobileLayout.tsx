'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import MobileBottomNav from './MobileBottomNav'

interface MobileLayoutProps {
  children: ReactNode
  showBottomNav?: boolean
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
  backgroundColor?: string
  safeAreaTop?: boolean
  safeAreaBottom?: boolean
}

export default function MobileLayout({
  children,
  showBottomNav = true,
  enablePullToRefresh = false,
  onRefresh,
  backgroundColor = 'bg-white',
  safeAreaTop = true,
  safeAreaBottom = true
}: MobileLayoutProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const layoutRef = useRef<HTMLDivElement>(null)

  // Performance optimization: Passive event listeners
  useEffect(() => {
    if (!enablePullToRefresh) return

    const element = layoutRef.current
    if (!element) return

    let touchStartY = 0
    let touchMoveY = 0
    let isAtTop = false

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      isAtTop = element.scrollTop === 0
      setStartY(touchStartY)
      setIsDragging(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !isAtTop) return

      touchMoveY = e.touches[0].clientY
      const diff = touchMoveY - touchStartY

      if (diff > 0 && diff < 150) {
        setPullDistance(diff)
        
        // Add haptic feedback at threshold
        if (diff > 80 && 'vibrate' in navigator) {
          navigator.vibrate(10)
        }
      }
    }

    const handleTouchEnd = async () => {
      setIsDragging(false)

      if (pullDistance > 80 && onRefresh) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        } finally {
          setIsRefreshing(false)
        }
      }

      setPullDistance(0)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enablePullToRefresh, onRefresh, isDragging, pullDistance])

  // Performance optimization: Prevent scroll bounce on iOS
  useEffect(() => {
    const preventBounce = (e: TouchEvent) => {
      const element = e.target as HTMLElement
      const isScrollable = element.scrollHeight > element.clientHeight
      
      if (!isScrollable) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', preventBounce, { passive: false })
    
    return () => {
      document.removeEventListener('touchmove', preventBounce)
    }
  }, [])

  // Performance optimization: Optimize font loading
  useEffect(() => {
    // Preload critical fonts
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = '/fonts/inter-var.woff2'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return (
    <div 
      ref={layoutRef}
      className={`min-h-screen ${backgroundColor} overflow-x-hidden ${
        safeAreaTop ? 'pt-safe' : ''
      } ${safeAreaBottom ? 'pb-safe' : ''}`}
      style={{
        // Performance optimization: Hardware acceleration
        willChange: isDragging ? 'transform' : 'auto',
        transform: `translateY(${pullDistance * 0.5}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to Refresh Indicator */}
      {enablePullToRefresh && (pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center z-50"
          style={{
            height: Math.max(pullDistance, isRefreshing ? 60 : 0),
            transition: isRefreshing ? 'height 0.3s ease-out' : 'none'
          }}
        >
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 border-2 border-blue-600 rounded-full ${
                isRefreshing ? 'animate-spin border-t-transparent' : ''
              }`}
              style={{
                transform: `rotate(${pullDistance * 2}deg)`,
                opacity: Math.min(pullDistance / 80, 1)
              }}
            />
            {pullDistance > 80 && !isRefreshing && (
              <span className="text-xs text-blue-600 mt-1 font-medium">
                Release to refresh
              </span>
            )}
            {isRefreshing && (
              <span className="text-xs text-blue-600 mt-1 font-medium">
                Refreshing...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <MobileBottomNav />}
    </div>
  )
}

// Performance optimized image component
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = '/images/placeholder.svg',
  lazy = true
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string
  lazy?: boolean
}) {
  const [imageSrc, setImageSrc] = useState(lazy ? fallback : src)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!lazy) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, lazy])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageSrc(fallback)}
        loading={lazy ? 'lazy' : 'eager'}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// Virtualized list component for performance
export function VirtualizedList({
  items,
  renderItem,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 5
}: {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  itemHeight?: number
  containerHeight?: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length
  )

  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length, visibleEnd + overscan)

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Smooth scroll helper
export function useSmoothScroll() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return { scrollToTop, scrollToElement }
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('Performance metric:', entry.name, entry.duration || 0)
        })
      })

      observer.observe({ entryTypes: ['measure', 'navigation'] })

      return () => observer.disconnect()
    }
  }, [])
}

// Haptic feedback helper
export function useHapticFeedback() {
  const lightImpact = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const mediumImpact = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  }

  const heavyImpact = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  }

  return { lightImpact, mediumImpact, heavyImpact }
}
