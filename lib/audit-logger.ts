import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { UserRole } from './permissions';

const prisma = new PrismaClient();

export type AuditAction = 
  // User management
  | 'user:created'
  | 'user:updated'
  | 'user:deleted'
  | 'user:role_changed'
  | 'user:login'
  | 'user:logout'
  | 'user:password_reset'
  | 'user:impersonated'
  
  // Data access
  | 'data:searched'
  | 'data:viewed'
  | 'data:exported'
  | 'data:bulk_exported'
  | 'data:imported'
  | 'data:modified'
  | 'data:deleted'
  
  // System administration
  | 'admin:settings_changed'
  | 'admin:cache_cleared'
  | 'admin:system_restart'
  | 'admin:backup_created'
  | 'admin:backup_restored'
  | 'admin:maintenance_mode'
  
  // Security events
  | 'security:unauthorized_access'
  | 'security:permission_denied'
  | 'security:suspicious_activity'
  | 'security:rate_limit_exceeded'
  | 'security:api_key_created'
  | 'security:api_key_revoked'
  
  // Team management
  | 'team:created'
  | 'team:member_added'
  | 'team:member_removed'
  | 'team:role_changed'
  | 'team:deleted'
  
  // Billing and subscription
  | 'billing:subscription_created'
  | 'billing:subscription_updated'
  | 'billing:subscription_cancelled'
  | 'billing:payment_success'
  | 'billing:payment_failed';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  targetUserId?: string;
  targetUserName?: string;
  resourceType?: string;
  resourceId?: string;
  details: Record<string, any>;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    sessionId?: string;
    requestId?: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  outcome: 'success' | 'failure' | 'partial';
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  tags: string[];
}

export interface AuditFilter {
  userId?: string;
  actions?: AuditAction[];
  resourceType?: string;
  severity?: ('low' | 'medium' | 'high' | 'critical')[];
  outcome?: ('success' | 'failure' | 'partial')[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalEvents: number;
  criticalEvents: number;
  failedEvents: number;
  topActions: Array<{ action: AuditAction; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  securityEvents: number;
  adminEvents: number;
  dataAccessEvents: number;
  recentCritical: AuditLogEntry[];
  trendAnalysis: {
    loginTrend: number;
    dataAccessTrend: number;
    securityIncidentTrend: number;
  };
}

/**
 * Comprehensive audit logging system for compliance and security
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private logQueue: AuditLogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    // Start background batch processing
    this.startBatchProcessor();
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'metadata'> & {
    metadata?: Partial<AuditLogEntry['metadata']>;
  }): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          timestamp: new Date(),
          severity: 'medium',
          ...entry.metadata
        }
      };

      // Add to queue for batch processing
      this.logQueue.push(auditEntry);

      // For critical events, log immediately
      if (auditEntry.metadata.severity === 'critical') {
        await this.flushQueue();
      }

      // Also log to application logger
      logger.info('audit', `${auditEntry.action}: ${auditEntry.outcome}`, {
        userId: auditEntry.userId,
        resourceId: auditEntry.resourceId,
        severity: auditEntry.metadata.severity
      });

    } catch (error) {
      logger.error('audit', 'Failed to queue audit log entry', { error, entry });
    }
  }

  /**
   * Log user management events
   */
  async logUserEvent(
    action: Extract<AuditAction, `user:${string}`>,
    userId: string,
    userName: string,
    userRole: UserRole,
    details: Record<string, any> = {},
    metadata: Partial<AuditLogEntry['metadata']> = {}
  ): Promise<void> {
    await this.logEvent({
      action,
      userId,
      userName,
      userRole,
      resourceType: 'user',
      resourceId: userId,
      details,
      metadata: {
        severity: action === 'user:role_changed' ? 'high' : 'medium',
        ...metadata
      },
      outcome: 'success',
      tags: ['user_management']
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    action: Extract<AuditAction, `data:${string}`>,
    userId: string,
    userName: string,
    userRole: UserRole,
    resourceType: string,
    resourceId?: string,
    details: Record<string, any> = {},
    metadata: Partial<AuditLogEntry['metadata']> = {}
  ): Promise<void> {
    const severity = action === 'data:exported' || action === 'data:bulk_exported' ? 'high' : 'low';
    
    await this.logEvent({
      action,
      userId,
      userName,
      userRole,
      resourceType,
      resourceId,
      details,
      metadata: { severity, ...metadata },
      outcome: 'success',
      tags: ['data_access']
    });
  }

  /**
   * Log security events
   */
  async logSecurityEvent(
    action: Extract<AuditAction, `security:${string}`>,
    details: Record<string, any> = {},
    userId?: string,
    userName?: string,
    metadata: Partial<AuditLogEntry['metadata']> = {}
  ): Promise<void> {
    await this.logEvent({
      action,
      userId,
      userName,
      resourceType: 'security',
      details,
      metadata: {
        severity: 'critical',
        ...metadata
      },
      outcome: action === 'security:unauthorized_access' ? 'failure' : 'success',
      tags: ['security', 'alert']
    });
  }

  /**
   * Log admin actions
   */
  async logAdminAction(
    action: Extract<AuditAction, `admin:${string}`>,
    adminUserId: string,
    adminUserName: string,
    details: Record<string, any> = {},
    targetUserId?: string,
    targetUserName?: string,
    metadata: Partial<AuditLogEntry['metadata']> = {}
  ): Promise<void> {
    await this.logEvent({
      action,
      userId: adminUserId,
      userName: adminUserName,
      userRole: 'ADMIN',
      targetUserId,
      targetUserName,
      resourceType: 'system',
      details,
      metadata: {
        severity: 'high',
        ...metadata
      },
      outcome: 'success',
      tags: ['admin', 'system']
    });
  }

  /**
   * Log role or permission changes with before/after state
   */
  async logPermissionChange(
    userId: string,
    userName: string,
    adminUserId: string,
    adminUserName: string,
    before: Record<string, any>,
    after: Record<string, any>,
    metadata: Partial<AuditLogEntry['metadata']> = {}
  ): Promise<void> {
    await this.logEvent({
      action: 'user:role_changed',
      userId: adminUserId,
      userName: adminUserName,
      targetUserId: userId,
      targetUserName: userName,
      resourceType: 'user_permissions',
      resourceId: userId,
      details: {
        changedBy: adminUserName,
        changeType: 'role_modification'
      },
      changes: { before, after },
      metadata: {
        severity: 'critical',
        ...metadata
      },
      outcome: 'success',
      tags: ['permissions', 'role_change', 'admin']
    });
  }

  /**
   * Search audit logs with filtering
   */
  async searchLogs(filter: AuditFilter = {}): Promise<{
    logs: AuditLogEntry[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const where: any = {};

      if (filter.userId) where.userId = filter.userId;
      if (filter.actions?.length) where.action = { in: filter.actions };
      if (filter.resourceType) where.resourceType = filter.resourceType;
      if (filter.outcome?.length) where.outcome = { in: filter.outcome };
      if (filter.dateFrom || filter.dateTo) {
        where.metadata = {
          path: ['timestamp'],
          ...filter.dateFrom && { gte: filter.dateFrom },
          ...filter.dateTo && { lte: filter.dateTo }
        };
      }

      if (filter.search) {
        where.OR = [
          { details: { search: filter.search } },
          { userName: { contains: filter.search, mode: 'insensitive' } },
          { targetUserName: { contains: filter.search, mode: 'insensitive' } }
        ];
      }

      if (filter.tags?.length) {
        where.tags = { hasSome: filter.tags };
      }

      if (filter.severity?.length) {
        where.metadata = {
          ...where.metadata,
          path: ['severity'],
          in: filter.severity
        };
      }

      const [logs, totalCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: filter.limit || 100,
          skip: filter.offset || 0
        }),
        prisma.auditLog.count({ where })
      ]);

      return {
        logs: logs.map(log => this.formatAuditLogEntry(log)),
        totalCount,
        hasMore: (filter.offset || 0) + logs.length < totalCount
      };

    } catch (error) {
      logger.error('audit', 'Failed to search audit logs', { error, filter });
      throw error;
    }
  }

  /**
   * Get audit summary for dashboard
   */
  async getAuditSummary(
    dateFrom: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateTo: Date = new Date()
  ): Promise<AuditSummary> {
    try {
      const where = {
        createdAt: { gte: dateFrom, lte: dateTo }
      };

      // Get basic counts
      const [totalEvents, criticalEvents, failedEvents, securityEvents] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.count({
          where: {
            ...where,
            metadata: { path: ['severity'], equals: 'critical' }
          }
        }),
        prisma.auditLog.count({
          where: { ...where, outcome: 'failure' }
        }),
        prisma.auditLog.count({
          where: { ...where, tags: { has: 'security' } }
        })
      ]);

      // Get top actions
      const topActions = await prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      });

      // Get top users
      const topUsers = await prisma.auditLog.groupBy({
        by: ['userId', 'userName'],
        where: { ...where, userId: { not: null } },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      });

      // Get recent critical events
      const recentCritical = await prisma.auditLog.findMany({
        where: {
          ...where,
          metadata: { path: ['severity'], equals: 'critical' }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const adminEvents = await prisma.auditLog.count({
        where: { ...where, tags: { has: 'admin' } }
      });

      const dataAccessEvents = await prisma.auditLog.count({
        where: { ...where, tags: { has: 'data_access' } }
      });

      // Calculate trends (simplified - in production, you'd compare with previous period)
      const trendAnalysis = {
        loginTrend: 5.2, // Percentage change
        dataAccessTrend: -2.1,
        securityIncidentTrend: 12.5
      };

      return {
        totalEvents,
        criticalEvents,
        failedEvents,
        securityEvents,
        adminEvents,
        dataAccessEvents,
        topActions: topActions.map(ta => ({
          action: ta.action as AuditAction,
          count: ta._count.action
        })),
        topUsers: topUsers.map(tu => ({
          userId: tu.userId!,
          userName: tu.userName || 'Unknown',
          count: tu._count.userId
        })),
        recentCritical: recentCritical.map(log => this.formatAuditLogEntry(log)),
        trendAnalysis
      };

    } catch (error) {
      logger.error('audit', 'Failed to generate audit summary', { error });
      throw error;
    }
  }

  /**
   * Export audit logs for compliance
   */
  async exportAuditLogs(
    filter: AuditFilter = {},
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.searchLogs({
        ...filter,
        limit: 10000 // Large export limit
      });

      if (format === 'csv') {
        return this.convertToCsv(logs);
      }

      return JSON.stringify(logs, null, 2);
    } catch (error) {
      logger.error('audit', 'Failed to export audit logs', { error, filter });
      throw error;
    }
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      
      const result = await prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          metadata: { path: ['severity'], not: 'critical' } // Keep critical logs longer
        }
      });

      logger.info('audit', 'Audit logs cleaned up', {
        deletedCount: result.count,
        retentionDays,
        cutoffDate
      });

      return result.count;
    } catch (error) {
      logger.error('audit', 'Failed to cleanup audit logs', { error });
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.logQueue.length >= this.batchSize || this.logQueue.length > 0) {
        await this.flushQueue();
      }
    }, this.flushInterval);
  }

  private async flushQueue(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const toProcess = [...this.logQueue];
    this.logQueue = [];

    try {
      await prisma.auditLog.createMany({
        data: toProcess.map(entry => ({
          id: entry.id,
          action: entry.action,
          userId: entry.userId,
          userName: entry.userName,
          userRole: entry.userRole,
          targetUserId: entry.targetUserId,
          targetUserName: entry.targetUserName,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          details: entry.details,
          metadata: entry.metadata,
          outcome: entry.outcome,
          changes: entry.changes,
          tags: entry.tags,
          createdAt: entry.metadata.timestamp
        }))
      });

      logger.info('audit', 'Audit logs batch processed', { count: toProcess.length });
    } catch (error) {
      logger.error('audit', 'Failed to flush audit log queue', { error, count: toProcess.length });
      // Re-queue failed entries
      this.logQueue.unshift(...toProcess);
    }
  }

  private formatAuditLogEntry(dbEntry: any): AuditLogEntry {
    return {
      id: dbEntry.id,
      action: dbEntry.action,
      userId: dbEntry.userId,
      userName: dbEntry.userName,
      userRole: dbEntry.userRole,
      targetUserId: dbEntry.targetUserId,
      targetUserName: dbEntry.targetUserName,
      resourceType: dbEntry.resourceType,
      resourceId: dbEntry.resourceId,
      details: dbEntry.details || {},
      metadata: dbEntry.metadata || { timestamp: dbEntry.createdAt, severity: 'medium' },
      outcome: dbEntry.outcome,
      changes: dbEntry.changes,
      tags: dbEntry.tags || []
    };
  }

  private convertToCsv(logs: AuditLogEntry[]): string {
    const headers = [
      'Timestamp', 'Action', 'User', 'Target User', 'Resource Type', 
      'Resource ID', 'Outcome', 'Severity', 'IP Address', 'Details'
    ];

    const rows = logs.map(log => [
      log.metadata.timestamp.toISOString(),
      log.action,
      log.userName || log.userId || '',
      log.targetUserName || log.targetUserId || '',
      log.resourceType || '',
      log.resourceId || '',
      log.outcome,
      log.metadata.severity,
      log.metadata.ipAddress || '',
      JSON.stringify(log.details)
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience functions for common audit logging patterns
export const logUserAction = (
  action: Extract<AuditAction, `user:${string}`>,
  userId: string,
  userName: string,
  userRole: UserRole,
  details?: Record<string, any>
) => auditLogger.logUserEvent(action, userId, userName, userRole, details);

export const logDataAccess = (
  action: Extract<AuditAction, `data:${string}`>,
  userId: string,
  userName: string,
  userRole: UserRole,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
) => auditLogger.logDataAccess(action, userId, userName, userRole, resourceType, resourceId, details);

export const logSecurityEvent = (
  action: Extract<AuditAction, `security:${string}`>,
  details?: Record<string, any>,
  userId?: string,
  userName?: string
) => auditLogger.logSecurityEvent(action, details, userId, userName);

export const logAdminAction = (
  action: Extract<AuditAction, `admin:${string}`>,
  adminUserId: string,
  adminUserName: string,
  details?: Record<string, any>
) => auditLogger.logAdminAction(action, adminUserId, adminUserName, details);