import { PrismaClient } from '@prisma/client';

// Performance metrics types
export interface QueryMetrics {
  id: string;
  query: string;
  duration: number;
  timestamp: Date;
  route: string;
  userId?: string;
  resultCount?: number;
  errorMessage?: string;
}

export interface APIMetrics {
  id: string;
  method: string;
  route: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  errorMessage?: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'SLOW_QUERY' | 'HIGH_MEMORY' | 'ERROR_RATE' | 'CONNECTION_POOL';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: Date;
  resolved: boolean;
}

// In-memory storage for development (in production, use Redis or database)
const queryMetrics: QueryMetrics[] = [];
const apiMetrics: APIMetrics[] = [];
const performanceAlerts: PerformanceAlert[] = [];

// Configuration thresholds
const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY_MS: 1000,
  SLOW_API_MS: 2000,
  HIGH_MEMORY_MB: 512,
  ERROR_RATE_PERCENT: 5,
  MAX_METRICS_HISTORY: 10000,
};

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  static getInstance(prisma?: PrismaClient): PerformanceMonitor {
    if (!PerformanceMonitor.instance && prisma) {
      PerformanceMonitor.instance = new PerformanceMonitor(prisma);
    }
    return PerformanceMonitor.instance;
  }

  // Track database query performance
  async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    context: { route: string; userId?: string }
  ): Promise<T> {
    const startTime = performance.now();
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let result: T;
    let error: Error | null = null;
    let resultCount = 0;

    try {
      result = await queryFn();
      
      // Try to determine result count
      if (Array.isArray(result)) {
        resultCount = result.length;
      } else if (result && typeof result === 'object' && 'length' in result) {
        resultCount = (result as any).length;
      }
      
    } catch (err) {
      error = err as Error;
      throw err;
    } finally {
      const duration = performance.now() - startTime;
      
      const metrics: QueryMetrics = {
        id: queryId,
        query: queryName,
        duration,
        timestamp: new Date(),
        route: context.route,
        userId: context.userId,
        resultCount,
        errorMessage: error?.message,
      };

      this.recordQueryMetrics(metrics);
      
      // Check for performance issues
      if (duration > PERFORMANCE_THRESHOLDS.SLOW_QUERY_MS) {
        this.createAlert('SLOW_QUERY', `Slow query: ${queryName}`, PERFORMANCE_THRESHOLDS.SLOW_QUERY_MS, duration);
      }

      // Log performance data
      if (error) {
        console.error(`🐌 Query Error: ${queryName} in ${duration.toFixed(2)}ms - ${error.message}`);
      } else if (duration > PERFORMANCE_THRESHOLDS.SLOW_QUERY_MS) {
        console.warn(`🐌 Slow Query: ${queryName} took ${duration.toFixed(2)}ms (${resultCount} results)`);
      } else {
        console.log(`⚡ Query: ${queryName} completed in ${duration.toFixed(2)}ms (${resultCount} results)`);
      }
    }

    return result!;
  }

  // Track API response times
  trackAPICall(metrics: Omit<APIMetrics, 'id' | 'timestamp'>): void {
    const apiMetric: APIMetrics = {
      ...metrics,
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      memoryUsage: process.memoryUsage(),
    };

    this.recordAPIMetrics(apiMetric);

    // Check for performance issues
    if (metrics.duration > PERFORMANCE_THRESHOLDS.SLOW_API_MS) {
      this.createAlert('HIGH_MEMORY', `Slow API: ${metrics.route}`, PERFORMANCE_THRESHOLDS.SLOW_API_MS, metrics.duration);
    }

    const memoryMB = apiMetric.memoryUsage!.heapUsed / 1024 / 1024;
    if (memoryMB > PERFORMANCE_THRESHOLDS.HIGH_MEMORY_MB) {
      this.createAlert('HIGH_MEMORY', `High memory usage: ${memoryMB.toFixed(2)}MB`, PERFORMANCE_THRESHOLDS.HIGH_MEMORY_MB, memoryMB);
    }

    // Log API performance
    const memoryInfo = `Memory: ${memoryMB.toFixed(2)}MB`;
    if (metrics.statusCode >= 400) {
      console.error(`🚨 API Error: ${metrics.method} ${metrics.route} - ${metrics.statusCode} in ${metrics.duration.toFixed(2)}ms (${memoryInfo})`);
    } else if (metrics.duration > PERFORMANCE_THRESHOLDS.SLOW_API_MS) {
      console.warn(`🐌 Slow API: ${metrics.method} ${metrics.route} took ${metrics.duration.toFixed(2)}ms (${memoryInfo})`);
    } else {
      console.log(`⚡ API: ${metrics.method} ${metrics.route} completed in ${metrics.duration.toFixed(2)}ms (${memoryInfo})`);
    }
  }

  // Get database connection pool stats
  async getConnectionPoolStats(): Promise<any> {
    try {
      // Note: This is Prisma-specific and may need adjustment based on your setup
      const stats = await this.prisma.$queryRaw`SELECT * FROM pg_stat_activity WHERE datname = current_database()`;
      return {
        activeConnections: Array.isArray(stats) ? stats.length : 0,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to get connection pool stats:', error);
      return {
        activeConnections: 0,
        timestamp: new Date(),
        error: (error as Error).message,
      };
    }
  }

  // Performance analytics methods
  getQueryMetrics(limit: number = 100): QueryMetrics[] {
    return queryMetrics
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAPIMetrics(limit: number = 100): APIMetrics[] {
    return apiMetrics
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getPerformanceAlerts(limit: number = 50): PerformanceAlert[] {
    return performanceAlerts
      .filter(alert => !alert.resolved)
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get performance summary
  getPerformanceSummary(timeWindowHours: number = 24): {
    queries: { total: number; avgDuration: number; slowQueries: number };
    apis: { total: number; avgDuration: number; slowAPIs: number; errorRate: number };
    alerts: { total: number; unresolved: number };
    memory: { current: number; peak: number };
  } {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    
    const recentQueries = queryMetrics.filter(m => m.timestamp > cutoffTime);
    const recentAPIs = apiMetrics.filter(m => m.timestamp > cutoffTime);
    const recentAlerts = performanceAlerts.filter(a => a.timestamp > cutoffTime);

    const currentMemory = process.memoryUsage();
    const peakMemory = Math.max(
      ...apiMetrics
        .filter(m => m.timestamp > cutoffTime && m.memoryUsage)
        .map(m => m.memoryUsage!.heapUsed)
    );

    return {
      queries: {
        total: recentQueries.length,
        avgDuration: recentQueries.length > 0 
          ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length 
          : 0,
        slowQueries: recentQueries.filter(q => q.duration > PERFORMANCE_THRESHOLDS.SLOW_QUERY_MS).length,
      },
      apis: {
        total: recentAPIs.length,
        avgDuration: recentAPIs.length > 0 
          ? recentAPIs.reduce((sum, a) => sum + a.duration, 0) / recentAPIs.length 
          : 0,
        slowAPIs: recentAPIs.filter(a => a.duration > PERFORMANCE_THRESHOLDS.SLOW_API_MS).length,
        errorRate: recentAPIs.length > 0 
          ? (recentAPIs.filter(a => a.statusCode >= 400).length / recentAPIs.length) * 100 
          : 0,
      },
      alerts: {
        total: recentAlerts.length,
        unresolved: recentAlerts.filter(a => !a.resolved).length,
      },
      memory: {
        current: currentMemory.heapUsed / 1024 / 1024,
        peak: peakMemory / 1024 / 1024,
      },
    };
  }

  // Private methods
  private recordQueryMetrics(metrics: QueryMetrics): void {
    queryMetrics.push(metrics);
    
    // Limit memory usage by keeping only recent metrics
    if (queryMetrics.length > PERFORMANCE_THRESHOLDS.MAX_METRICS_HISTORY) {
      queryMetrics.splice(0, queryMetrics.length - PERFORMANCE_THRESHOLDS.MAX_METRICS_HISTORY);
    }
  }

  private recordAPIMetrics(metrics: APIMetrics): void {
    apiMetrics.push(metrics);
    
    // Limit memory usage
    if (apiMetrics.length > PERFORMANCE_THRESHOLDS.MAX_METRICS_HISTORY) {
      apiMetrics.splice(0, apiMetrics.length - PERFORMANCE_THRESHOLDS.MAX_METRICS_HISTORY);
    }
  }

  private createAlert(
    type: PerformanceAlert['type'],
    message: string,
    threshold: number,
    actualValue: number
  ): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      threshold,
      actualValue,
      timestamp: new Date(),
      resolved: false,
    };

    performanceAlerts.push(alert);
    
    // Limit alerts history
    if (performanceAlerts.length > 1000) {
      performanceAlerts.splice(0, performanceAlerts.length - 1000);
    }

    // In production, you might want to send notifications here
    console.warn(`🚨 Performance Alert: ${message} (${actualValue} > ${threshold})`);
  }

  // Resolve alerts
  resolveAlert(alertId: string): boolean {
    const alert = performanceAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }
}

// Singleton instance
let performanceMonitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(prisma?: PrismaClient): PerformanceMonitor {
  if (!performanceMonitorInstance && prisma) {
    performanceMonitorInstance = new PerformanceMonitor(prisma);
  }
  if (!performanceMonitorInstance) {
    throw new Error('PerformanceMonitor not initialized. Call with Prisma instance first.');
  }
  return performanceMonitorInstance;
}