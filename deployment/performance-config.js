
// Performance monitoring setup for production
export const performanceConfig = {
  // Core Web Vitals tracking
  vitals: {
    trackCLS: true,
    trackFID: true,
    trackFCP: true,
    trackLCP: true,
    trackTTFB: true,
  },
  
  // Custom metrics
  customMetrics: {
    apiResponseTimes: true,
    databaseQueryTimes: true,
    searchPerformance: true,
    userInteractionLatency: true,
  },
  
  // Error tracking
  errorTracking: {
    captureConsoleErrors: true,
    captureUnhandledRejections: true,
    captureApiErrors: true,
    sampleRate: 1.0,
  },
  
  // Performance budgets
  budgets: {
    maxBundleSize: '500kb',
    maxInitialLoadTime: '2s',
    maxApiResponseTime: '500ms',
    maxDatabaseQueryTime: '100ms',
  },
}
