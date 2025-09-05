/**
 * Mobile Performance Optimization Utilities
 * Handles large dataset rendering, virtualization, and mobile-specific optimizations
 */

export interface MobileOptimizationConfig {
  maxInitialRender: number;
  batchSize: number;
  scrollThreshold: number;
  debounceMs: number;
  enableVirtualization: boolean;
  lazyLoadImages: boolean;
}

export interface VirtualizedItem {
  id: string | number;
  height?: number;
  data: any;
}

export interface InfiniteScrollState {
  items: any[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  page: number;
  totalCount: number;
}

export class MobilePerformanceOptimizer {
  private config: MobileOptimizationConfig;
  private isMobile: boolean;
  private isTouch: boolean;
  private viewport: { width: number; height: number };

  constructor(config: Partial<MobileOptimizationConfig> = {}) {
    this.config = {
      maxInitialRender: 50,
      batchSize: 20,
      scrollThreshold: 0.8,
      debounceMs: 150,
      enableVirtualization: true,
      lazyLoadImages: true,
      ...config
    };

    this.isMobile = this.detectMobile();
    this.isTouch = this.detectTouch();
    this.viewport = this.getViewportSize();
  }

  /**
   * Detect if device is mobile
   */
  private detectMobile(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(max-width: 768px)').matches ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect if device supports touch
   */
  private detectTouch(): boolean {
    if (typeof window === 'undefined') return false;
    
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get viewport dimensions
   */
  private getViewportSize(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 375, height: 667 }; // Default mobile size
    }
    
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Optimize dataset for mobile rendering
   */
  public optimizeDataset<T>(
    dataset: T[], 
    currentPage: number = 1
  ): {
    visibleItems: T[];
    totalPages: number;
    hasMore: boolean;
    optimizationApplied: string[];
  } {
    const optimizations: string[] = [];
    
    if (!this.isMobile) {
      return {
        visibleItems: dataset,
        totalPages: 1,
        hasMore: false,
        optimizationApplied: ['no-optimization-desktop']
      };
    }

    // Apply mobile-specific optimizations
    let optimizedDataset = [...dataset];
    
    // 1. Limit initial render
    const maxItems = this.config.maxInitialRender;
    const startIndex = (currentPage - 1) * this.config.batchSize;
    const endIndex = startIndex + this.config.batchSize;
    
    if (dataset.length > maxItems) {
      optimizedDataset = dataset.slice(startIndex, endIndex);
      optimizations.push('pagination-applied');
    }

    // 2. Sort by relevance/priority if applicable
    if (this.hasRelevanceScore(optimizedDataset)) {
      optimizedDataset.sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
      optimizations.push('relevance-sorted');
    }

    // 3. Calculate pagination
    const totalPages = Math.ceil(dataset.length / this.config.batchSize);
    const hasMore = currentPage < totalPages;

    if (this.config.enableVirtualization && dataset.length > 100) {
      optimizations.push('virtualization-enabled');
    }

    return {
      visibleItems: optimizedDataset,
      totalPages,
      hasMore,
      optimizationApplied: optimizations
    };
  }

  /**
   * Check if dataset items have relevance scores
   */
  private hasRelevanceScore(dataset: any[]): boolean {
    return dataset.length > 0 && 
           typeof dataset[0] === 'object' && 
           'relevanceScore' in dataset[0];
  }

  /**
   * Create infinite scroll handler
   */
  public createInfiniteScrollHandler(
    loadMoreCallback: (page: number) => Promise<any[]>
  ): {
    handleScroll: (event: Event) => void;
    state: InfiniteScrollState;
    loadMore: () => Promise<void>;
  } {
    let state: InfiniteScrollState = {
      items: [],
      hasMore: true,
      loading: false,
      error: null,
      page: 1,
      totalCount: 0
    };

    const loadMore = async (): Promise<void> => {
      if (state.loading || !state.hasMore) return;
      
      state.loading = true;
      state.error = null;
      
      try {
        const newItems = await loadMoreCallback(state.page);
        
        if (newItems.length === 0) {
          state.hasMore = false;
        } else {
          state.items = [...state.items, ...newItems];
          state.page += 1;
          state.totalCount = state.items.length;
        }
      } catch (error) {
        state.error = error instanceof Error ? error.message : 'Failed to load more items';
      } finally {
        state.loading = false;
      }
    };

    const handleScroll = this.debounce((event: Event) => {
      if (!this.isMobile) return;
      
      const target = event.target as Element;
      const scrollPosition = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      
      const scrollPercentage = (scrollPosition + clientHeight) / scrollHeight;
      
      if (scrollPercentage >= this.config.scrollThreshold) {
        loadMore();
      }
    }, this.config.debounceMs);

    return { handleScroll, state, loadMore };
  }

  /**
   * Optimize images for mobile
   */
  public optimizeImageLoading(
    imageUrls: string[],
    containerRef: React.RefObject<HTMLElement>
  ): {
    lazyLoadImages: (entries: IntersectionObserverEntry[]) => void;
    preloadCriticalImages: (criticalCount: number) => void;
  } {
    const preloadCriticalImages = (criticalCount: number) => {
      const criticalImages = imageUrls.slice(0, criticalCount);
      
      criticalImages.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    const lazyLoadImages = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
        }
      });
    };

    return { lazyLoadImages, preloadCriticalImages };
  }

  /**
   * Virtual scrolling implementation
   */
  public createVirtualScroller<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
  ): {
    visibleRange: { start: number; end: number };
    getVisibleItems: (scrollTop: number) => T[];
    getTotalHeight: () => number;
    getItemOffset: (index: number) => number;
  } {
    const getTotalHeight = () => items.length * itemHeight;
    
    const getVisibleRange = (scrollTop: number) => {
      const start = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const end = Math.min(start + visibleCount + 2, items.length); // +2 for buffer
      
      return { start: Math.max(0, start - 1), end }; // -1 for buffer
    };

    const getVisibleItems = (scrollTop: number): T[] => {
      const { start, end } = getVisibleRange(scrollTop);
      return items.slice(start, end);
    };

    const getItemOffset = (index: number) => index * itemHeight;

    return {
      visibleRange: getVisibleRange(0),
      getVisibleItems,
      getTotalHeight,
      getItemOffset
    };
  }

  /**
   * Debounce utility
   */
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle utility
   */
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Memory optimization for large datasets
   */
  public optimizeMemoryUsage<T>(
    items: T[],
    visibleIndices: number[]
  ): T[] {
    if (!this.isMobile || items.length < 1000) {
      return items;
    }

    // Keep only visible items plus buffer in memory
    const bufferSize = 50;
    const minIndex = Math.max(0, Math.min(...visibleIndices) - bufferSize);
    const maxIndex = Math.min(items.length - 1, Math.max(...visibleIndices) + bufferSize);

    return items.slice(minIndex, maxIndex + 1);
  }

  /**
   * Touch gesture optimization
   */
  public optimizeTouch(): {
    disableZoom: () => void;
    enableFastClick: () => void;
    preventScrollBounce: () => void;
  } {
    const disableZoom = () => {
      if (typeof document !== 'undefined') {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute(
            'content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          );
        }
      }
    };

    const enableFastClick = () => {
      if (typeof document !== 'undefined') {
        document.addEventListener('touchstart', () => {}, { passive: true });
      }
    };

    const preventScrollBounce = () => {
      if (typeof document !== 'undefined') {
        document.body.style.overscrollBehavior = 'none';
      }
    };

    return { disableZoom, enableFastClick, preventScrollBounce };
  }

  /**
   * Performance monitoring
   */
  public measurePerformance<T>(
    operation: () => T,
    operationName: string
  ): { result: T; duration: number; memoryUsage?: number } {
    const start = performance.now();
    let startMemory: number | undefined;
    
    if ('memory' in performance) {
      startMemory = (performance as any).memory.usedJSHeapSize;
    }
    
    const result = operation();
    
    const duration = performance.now() - start;
    let memoryUsage: number | undefined;
    
    if (startMemory && 'memory' in performance) {
      memoryUsage = (performance as any).memory.usedJSHeapSize - startMemory;
    }
    
    console.log(`[Mobile Perf] ${operationName}: ${duration.toFixed(2)}ms${
      memoryUsage ? `, Memory: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : ''
    }`);
    
    return { result, duration, memoryUsage };
  }

  /**
   * Get device-specific configuration
   */
  public getDeviceConfig(): {
    isMobile: boolean;
    isTouch: boolean;
    viewport: { width: number; height: number };
    pixelRatio: number;
    connectionType?: string;
    recommendedBatchSize: number;
  } {
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    const connection = typeof navigator !== 'undefined' && 'connection' in navigator 
      ? (navigator as any).connection 
      : null;
    
    const connectionType = connection?.effectiveType || 'unknown';
    
    // Adjust batch size based on connection
    let recommendedBatchSize = this.config.batchSize;
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      recommendedBatchSize = 10;
    } else if (connectionType === '3g') {
      recommendedBatchSize = 15;
    }
    
    return {
      isMobile: this.isMobile,
      isTouch: this.isTouch,
      viewport: this.viewport,
      pixelRatio,
      connectionType,
      recommendedBatchSize
    };
  }
}

// Default instance
export const mobileOptimizer = new MobilePerformanceOptimizer();

// React hooks for mobile optimization
export const useMobileOptimization = () => {
  const [deviceInfo, setDeviceInfo] = React.useState(() => ({
    isMobile: false,
    isTouch: false,
    viewport: { width: 1024, height: 768 },
    pixelRatio: 1,
    connectionType: 'unknown',
    recommendedBatchSize: 20
  }));
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    setDeviceInfo(mobileOptimizer.getDeviceConfig());
    
    const handleResize = () => {
      setDeviceInfo(mobileOptimizer.getDeviceConfig());
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return {
    deviceInfo,
    isMobile: mounted ? deviceInfo.isMobile : false,
    optimizeDataset: mobileOptimizer.optimizeDataset.bind(mobileOptimizer),
    createInfiniteScroll: mobileOptimizer.createInfiniteScrollHandler.bind(mobileOptimizer),
    measurePerformance: mobileOptimizer.measurePerformance.bind(mobileOptimizer)
  };
};

// Add React import for hooks
import React from 'react';