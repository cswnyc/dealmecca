import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory = 'auth' | 'search' | 'forum' | 'api' | 'database' | 'code-generation' | 'system' | 'user' | 'performance';

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: Date;
  stack?: string;
  url?: string;
  userAgent?: string;
}

export interface LogFilter {
  level?: LogLevel[];
  category?: LogCategory[];
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Production-ready logging system for dealmecca
 * Handles structured logging, error tracking, and debugging
 */
export class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];
  private bufferSize = 100;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    // Start periodic flush to database
    if (typeof window === 'undefined') { // Server-side only
      setInterval(() => {
        this.flushToDatabase().catch(console.error);
      }, this.flushInterval);
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log debug information (development only)
   */
  debug(category: LogCategory, message: string, data?: any, context?: Partial<LogEntry>): void {
    if (this.isDevelopment) {
      this.log('debug', category, message, data, context);
    }
  }

  /**
   * Log general information
   */
  info(category: LogCategory, message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log('info', category, message, data, context);
  }

  /**
   * Log warnings that need attention
   */
  warn(category: LogCategory, message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log('warn', category, message, data, context);
  }

  /**
   * Log errors that should be investigated
   */
  error(category: LogCategory, message: string, error?: Error | any, context?: Partial<LogEntry>): void {
    const logData: any = {};
    
    if (error instanceof Error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      logData.data = error;
    }

    this.log('error', category, message, logData, {
      ...context,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  /**
   * Log critical errors that require immediate attention
   */
  critical(category: LogCategory, message: string, error?: Error | any, context?: Partial<LogEntry>): void {
    const logData: any = {};
    
    if (error instanceof Error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      logData.data = error;
    }

    this.log('critical', category, message, logData, {
      ...context,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Send immediate alert for critical errors
    this.sendCriticalAlert(message, error, context).catch(console.error);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, category: LogCategory, message: string, data?: any, context?: Partial<LogEntry>): void {
    const logEntry: LogEntry = {
      level,
      category,
      message,
      data: data ? (typeof data === 'object' ? data : { value: data }) : undefined,
      timestamp: new Date(),
      ...context,
    };

    // Console output for development
    if (this.isDevelopment) {
      this.consoleLog(logEntry);
    }

    // Add to buffer for database storage
    this.logBuffer.push(logEntry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.bufferSize) {
      this.flushToDatabase().catch(console.error);
    }

    // For critical errors, flush immediately
    if (level === 'critical') {
      this.flushToDatabase().catch(console.error);
    }
  }

  /**
   * Console logging with color coding
   */
  private consoleLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(`🔍 ${prefix}`, entry.message, entry.data || '');
        break;
      case 'info':
        console.info(`ℹ️ ${prefix}`, entry.message, entry.data || '');
        break;
      case 'warn':
        console.warn(`⚠️ ${prefix}`, entry.message, entry.data || '');
        break;
      case 'error':
        console.error(`❌ ${prefix}`, entry.message, entry.data || '', entry.stack || '');
        break;
      case 'critical':
        console.error(`🚨 ${prefix}`, entry.message, entry.data || '', entry.stack || '');
        break;
    }
  }

  /**
   * Flush log buffer to database
   */
  private async flushToDatabase(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Create logs table if it doesn't exist
      await this.ensureLogTableExists();

      // Batch insert logs
      for (const log of logsToFlush) {
        await prisma.$executeRaw`
          INSERT INTO application_logs (
            level,
            category,
            message,
            data,
            user_id,
            session_id,
            request_id,
            stack_trace,
            url,
            user_agent,
            timestamp
          ) VALUES (
            ${log.level},
            ${log.category},
            ${log.message},
            ${log.data ? JSON.stringify(log.data) : null},
            ${log.userId || null},
            ${log.sessionId || null},
            ${log.requestId || null},
            ${log.stack || null},
            ${log.url || null},
            ${log.userAgent || null},
            ${log.timestamp}
          )
        `;
      }
    } catch (error) {
      // If database logging fails, fall back to console
      console.error('Failed to flush logs to database:', error);
      logsToFlush.forEach(log => this.consoleLog(log));
    }
  }

  /**
   * Ensure log table exists
   */
  private async ensureLogTableExists(): Promise<void> {
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS application_logs (
          id SERIAL PRIMARY KEY,
          level VARCHAR(20) NOT NULL,
          category VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          user_id VARCHAR(255),
          session_id VARCHAR(255),
          request_id VARCHAR(255),
          stack_trace TEXT,
          url TEXT,
          user_agent TEXT,
          timestamp TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_application_logs_level_timestamp 
        ON application_logs (level, timestamp DESC)
      `;

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_application_logs_category_timestamp 
        ON application_logs (category, timestamp DESC)
      `;

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_application_logs_user_timestamp 
        ON application_logs (user_id, timestamp DESC)
        WHERE user_id IS NOT NULL
      `;
    } catch (error) {
      console.error('Failed to create log table:', error);
    }
  }

  /**
   * Send critical alert
   */
  private async sendCriticalAlert(message: string, error?: any, context?: any): Promise<void> {
    try {
      // Implement your alerting mechanism here
      console.error('🚨 CRITICAL ALERT:', {
        message,
        error: error instanceof Error ? error.message : error,
        context,
        timestamp: new Date().toISOString(),
      });

      // You could integrate with:
      // - Slack/Discord webhooks
      // - Email notifications
      // - PagerDuty
      // - SMS alerts
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }

  /**
   * Search logs with filters
   */
  async searchLogs(filter: LogFilter): Promise<{
    logs: any[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      await this.ensureLogTableExists();
      
      const { 
        level, 
        category, 
        userId, 
        startDate, 
        endDate, 
        search, 
        limit = 50, 
        offset = 0 
      } = filter;

      let whereConditions = ['1=1'];
      const params: any[] = [];
      let paramIndex = 1;

      // Level filter
      if (level && level.length > 0) {
        whereConditions.push(`level = ANY($${paramIndex})`);
        params.push(level);
        paramIndex++;
      }

      // Category filter
      if (category && category.length > 0) {
        whereConditions.push(`category = ANY($${paramIndex})`);
        params.push(category);
        paramIndex++;
      }

      // User filter
      if (userId) {
        whereConditions.push(`user_id = $${paramIndex}`);
        params.push(userId);
        paramIndex++;
      }

      // Date range filter
      if (startDate) {
        whereConditions.push(`timestamp >= $${paramIndex}`);
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereConditions.push(`timestamp <= $${paramIndex}`);
        params.push(endDate);
        paramIndex++;
      }

      // Search filter
      if (search) {
        whereConditions.push(`(message ILIKE $${paramIndex} OR data::text ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');

      // Get logs
      const logs = await prisma.$queryRawUnsafe(`
        SELECT 
          id,
          level,
          category,
          message,
          data,
          user_id,
          session_id,
          request_id,
          stack_trace,
          url,
          user_agent,
          timestamp
        FROM application_logs
        WHERE ${whereClause}
        ORDER BY timestamp DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, ...params, limit, offset);

      // Get total count
      const countResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as total
        FROM application_logs
        WHERE ${whereClause}
      `, ...params) as any[];

      const total = parseInt(countResult[0]?.total || '0');
      const hasMore = offset + limit < total;

      return { logs: logs as any[], total, hasMore };
    } catch (error) {
      console.error('Failed to search logs:', error);
      return { logs: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get log statistics
   */
  async getLogStats(days: number = 7): Promise<{
    totalLogs: number;
    errorCount: number;
    criticalCount: number;
    topCategories: Array<{ category: string; count: number }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;
  }> {
    try {
      await this.ensureLogTableExists();

      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*) as total_logs,
          COUNT(*) FILTER (WHERE level = 'error') as error_count,
          COUNT(*) FILTER (WHERE level = 'critical') as critical_count
        FROM application_logs
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
      `;

      const categories = await prisma.$queryRaw<any[]>`
        SELECT 
          category,
          COUNT(*) as count
        FROM application_logs
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `;

      const hourlyDist = await prisma.$queryRaw<any[]>`
        SELECT 
          EXTRACT(HOUR FROM timestamp) as hour,
          COUNT(*) as count
        FROM application_logs
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY hour
      `;

      return {
        totalLogs: parseInt(stats[0]?.total_logs || '0'),
        errorCount: parseInt(stats[0]?.error_count || '0'),
        criticalCount: parseInt(stats[0]?.critical_count || '0'),
        topCategories: categories.map(c => ({
          category: c.category,
          count: parseInt(c.count),
        })),
        hourlyDistribution: hourlyDist.map(h => ({
          hour: parseInt(h.hour),
          count: parseInt(h.count),
        })),
      };
    } catch (error) {
      console.error('Failed to get log stats:', error);
      return {
        totalLogs: 0,
        errorCount: 0,
        criticalCount: 0,
        topCategories: [],
        hourlyDistribution: [],
      };
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupOldLogs(retentionDays: number = 30): Promise<number> {
    try {
      await this.ensureLogTableExists();

      const result = await prisma.$executeRaw`
        DELETE FROM application_logs
        WHERE timestamp < NOW() - INTERVAL '${retentionDays} days'
      `;

      return Number(result);
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return 0;
    }
  }

  /**
   * Force flush all pending logs
   */
  async flush(): Promise<void> {
    await this.flushToDatabase();
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience methods for common logging patterns
export const logAuth = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.info('auth', message, data, context);

export const logSearch = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.info('search', message, data, context);

export const logForum = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.info('forum', message, data, context);

export const logAPI = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.info('api', message, data, context);

export const logDatabase = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.info('database', message, data, context);

export const logCodeGeneration = (message: string, data?: any, context?: Partial<LogEntry>) => 
  logger.info('code-generation', message, data, context);

export const logError = (category: LogCategory, message: string, error?: Error, context?: Partial<LogEntry>) => 
  logger.error(category, message, error, context);

export const logCritical = (category: LogCategory, message: string, error?: Error, context?: Partial<LogEntry>) => 
  logger.critical(category, message, error, context);