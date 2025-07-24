/**
 * Production Error Logger
 * 
 * Centralized logging for API endpoints and frontend errors
 */

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  source: string;
  message: string;
  userId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  stack?: string;
  metadata?: Record<string, any>;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  
  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  log(entry: Omit<LogEntry, 'timestamp' | 'requestId'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    };

    // Console logging with structured format
    const prefix = this.getLogPrefix(entry.level);
    const context = `[${entry.source}]${logEntry.requestId ? ` [${logEntry.requestId}]` : ''}`;
    
    console.log(`${prefix} ${context} ${entry.message}`);
    
    if (entry.metadata) {
      console.log(`   📊 Metadata:`, JSON.stringify(entry.metadata, null, 2));
    }
    
    if (entry.stack && entry.level === 'error') {
      console.log(`   🔍 Stack:`, entry.stack);
    }

    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production' && entry.level === 'error') {
      this.sendToExternalLogger(logEntry);
    }
  }

  private getLogPrefix(level: string): string {
    switch (level) {
      case 'error': return '🚨';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🔍';
      default: return '📝';
    }
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    // Placeholder for external logging service integration
    // You could integrate with services like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - New Relic
    // - Custom webhook
    
    try {
      // Example webhook integration
      if (process.env.ERROR_WEBHOOK_URL) {
        await fetch(process.env.ERROR_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  // Convenience methods for different log levels
  error(source: string, message: string, metadata?: Record<string, any>, stack?: string): void {
    this.log({ level: 'error', source, message, metadata, stack });
  }

  warn(source: string, message: string, metadata?: Record<string, any>): void {
    this.log({ level: 'warn', source, message, metadata });
  }

  info(source: string, message: string, metadata?: Record<string, any>): void {
    this.log({ level: 'info', source, message, metadata });
  }

  debug(source: string, message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_LOGS === 'true') {
      this.log({ level: 'debug', source, message, metadata });
    }
  }

  // API-specific logging methods
  apiRequest(
    method: string,
    url: string,
    userId?: string,
    userAgent?: string,
    ip?: string
  ): void {
    this.log({
      level: 'info',
      source: 'api',
      message: `${method} ${url}`,
      userId,
      url,
      method,
      userAgent,
      ip,
      metadata: { type: 'request' }
    });
  }

  apiResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    this.log({
      level,
      source: 'api',
      message: `${method} ${url} - ${statusCode} (${duration}ms)`,
      userId,
      url,
      method,
      statusCode,
      duration,
      metadata: { ...metadata, type: 'response' }
    });
  }

  apiError(
    method: string,
    url: string,
    error: Error,
    userId?: string,
    statusCode?: number
  ): void {
    this.log({
      level: 'error',
      source: 'api',
      message: `${method} ${url} - ${error.message}`,
      userId,
      url,
      method,
      statusCode,
      stack: error.stack,
      metadata: { type: 'error', errorName: error.name }
    });
  }

  // Database logging
  dbQuery(query: string, duration: number, userId?: string): void {
    this.log({
      level: 'debug',
      source: 'database',
      message: `Query executed in ${duration}ms`,
      userId,
      duration,
      metadata: { query: query.substring(0, 100) + '...', type: 'query' }
    });
  }

  dbError(query: string, error: Error, userId?: string): void {
    this.log({
      level: 'error',
      source: 'database',
      message: `Query failed: ${error.message}`,
      userId,
      stack: error.stack,
      metadata: { query: query.substring(0, 100) + '...', type: 'error' }
    });
  }

  // Search logging
  searchQuery(query: string, resultsCount: number, duration: number, userId?: string): void {
    this.log({
      level: 'info',
      source: 'search',
      message: `Search "${query}" returned ${resultsCount} results in ${duration}ms`,
      userId,
      duration,
      metadata: { query, resultsCount, type: 'search' }
    });
  }

  // Authentication logging
  authEvent(event: string, userId?: string, metadata?: Record<string, any>): void {
    this.log({
      level: 'info',
      source: 'auth',
      message: `Auth event: ${event}`,
      userId,
      metadata: { ...metadata, type: 'auth', event }
    });
  }
}

// Export singleton instance
export const logger = ProductionLogger.getInstance();

// Utility function for API route logging
export function withLogging<T extends any[], R>(
  source: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.info(source, `Operation completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(source, `Operation failed after ${duration}ms: ${(error as Error).message}`, {}, (error as Error).stack);
      throw error;
    }
  };
} 