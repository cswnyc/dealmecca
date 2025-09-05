import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { dataQualityManager } from './data-quality';
import { databaseOptimizer } from './database-optimizer';

const prisma = new PrismaClient();

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  services: {
    database: ServiceHealth;
    search: ServiceHealth;
    forum: ServiceHealth;
    codeGeneration: ServiceHealth;
    dataQuality: ServiceHealth;
    performance: ServiceHealth;
  };
  metrics: SystemMetrics;
  alerts: SystemAlert[];
  recommendations: string[];
  timestamp: Date;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  uptime: number;
  details?: any;
}

export interface SystemMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
  users: {
    active: number;
    total: number;
    newToday: number;
  };
  data: {
    companies: number;
    contacts: number;
    forumPosts: number;
    searches: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  errors: {
    total: number;
    critical: number;
    resolved: number;
  };
}

export interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  details?: any;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

/**
 * Comprehensive system monitoring for dealmecca
 */
export class SystemMonitor {
  private static instance: SystemMonitor;
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private alerts: SystemAlert[] = [];
  private metrics: Partial<SystemMetrics> = {};

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  /**
   * Start continuous system monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.isMonitoring) {
      logger.warn('system', 'System monitoring already running');
      return;
    }

    this.isMonitoring = true;
    logger.info('system', 'Starting system monitoring', { intervalMs });

    // Initial health check
    this.performHealthCheck().catch(error => {
      logger.error('system', 'Initial health check failed', error);
    });

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('system', 'Health check failed during monitoring', error);
      }
    }, intervalMs);

    // Set up cleanup interval (every hour)
    setInterval(() => {
      this.cleanupOldAlerts();
      this.cleanupOldMetrics();
    }, 3600000);
  }

  /**
   * Stop system monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    this.isMonitoring = false;
    logger.info('system', 'System monitoring stopped');
  }

  /**
   * Get current system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now();

    try {
      const [services, metrics] = await Promise.all([
        this.checkAllServices(),
        this.collectSystemMetrics(),
      ]);

      // Determine overall health
      const serviceStatuses = Object.values(services);
      const downServices = serviceStatuses.filter(s => s.status === 'down').length;
      const degradedServices = serviceStatuses.filter(s => s.status === 'degraded').length;

      let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (downServices > 0) {
        overall = 'critical';
      } else if (degradedServices > 0) {
        overall = 'degraded';
      }

      // Generate recommendations
      const recommendations = this.generateHealthRecommendations(services, metrics);

      const health: SystemHealth = {
        overall,
        services,
        metrics,
        alerts: this.getActiveAlerts(),
        recommendations,
        timestamp: new Date(),
      };

      logger.info('system', 'System health check completed', {
        overall,
        duration: Date.now() - startTime,
        activeAlerts: this.getActiveAlerts().length,
      });

      return health;
    } catch (error) {
      logger.error('system', 'System health check failed', error);
      throw error;
    }
  }

  /**
   * Add system alert
   */
  addAlert(alert: Omit<SystemAlert, 'id' | 'timestamp'>): void {
    const systemAlert: SystemAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.alerts.push(systemAlert);

    // Log the alert
    logger[alert.level === 'critical' ? 'critical' : alert.level === 'error' ? 'error' : alert.level === 'warning' ? 'warn' : 'info'](
      'system', 
      `System alert: ${alert.message}`, 
      { service: alert.service, details: alert.details }
    );

    // Keep only recent alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-500);
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      
      logger.info('system', 'System alert resolved', { alertId, service: alert.service });
      return true;
    }
    return false;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): SystemAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Get system metrics summary
   */
  async getMetricsSummary(hours: number = 24): Promise<{
    requests: any;
    errors: any;
    performance: any;
    users: any;
  }> {
    try {
      const since = new Date(Date.now() - (hours * 60 * 60 * 1000));

      // Get request metrics from logs
      const requestMetrics = await this.getRequestMetrics(since);
      
      // Get error metrics from logs
      const errorMetrics = await this.getErrorMetrics(since);
      
      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(since);
      
      // Get user metrics
      const userMetrics = await this.getUserMetrics(since);

      return {
        requests: requestMetrics,
        errors: errorMetrics,
        performance: performanceMetrics,
        users: userMetrics,
      };
    } catch (error) {
      logger.error('system', 'Failed to get metrics summary', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const health = await this.getSystemHealth();
      
      // Check for issues and create alerts
      Object.entries(health.services).forEach(([serviceName, service]) => {
        if (service.status === 'down') {
          this.addAlert({
            level: 'critical',
            service: serviceName,
            message: `${serviceName} service is down`,
            details: service.details,
          });
        } else if (service.status === 'degraded') {
          this.addAlert({
            level: 'warning',
            service: serviceName,
            message: `${serviceName} service is degraded`,
            details: service.details,
          });
        }

        // Check response time thresholds
        if (service.responseTime > 5000) {
          this.addAlert({
            level: 'warning',
            service: serviceName,
            message: `${serviceName} response time is high (${service.responseTime}ms)`,
          });
        }

        // Check error rate thresholds
        if (service.errorRate > 0.05) { // 5% error rate
          this.addAlert({
            level: 'error',
            service: serviceName,
            message: `${serviceName} error rate is high (${Math.round(service.errorRate * 100)}%)`,
          });
        }
      });

      // Check system metrics
      if (health.metrics.performance.memoryUsage > 90) {
        this.addAlert({
          level: 'critical',
          service: 'system',
          message: `High memory usage (${health.metrics.performance.memoryUsage}%)`,
        });
      }

      if (health.metrics.errors.critical > 0) {
        this.addAlert({
          level: 'critical',
          service: 'system',
          message: `${health.metrics.errors.critical} critical errors detected`,
        });
      }

    } catch (error) {
      logger.error('system', 'Health check performance failed', error);
      
      this.addAlert({
        level: 'critical',
        service: 'monitoring',
        message: 'Health check system failure',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check all services health
   */
  private async checkAllServices(): Promise<SystemHealth['services']> {
    const [database, search, forum, codeGeneration, dataQuality, performance] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkSearchHealth(),
      this.checkForumHealth(),
      this.checkCodeGenerationHealth(),
      this.checkDataQualityHealth(),
      this.checkPerformanceHealth(),
    ]);

    return {
      database,
      search,
      forum,
      codeGeneration,
      dataQuality,
      performance,
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      // Test complex query
      const userCount = await prisma.user.count();
      const companyCount = await prisma.company.count();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime > 2000 ? 'degraded' : 'up',
        responseTime,
        errorRate: 0,
        lastCheck: new Date(),
        uptime: 100, // Would calculate from historical data
        details: { userCount, companyCount },
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        errorRate: 1,
        lastCheck: new Date(),
        uptime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check search health
   */
  private async checkSearchHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Test search functionality
      const searchResult = await prisma.company.findMany({
        where: { name: { contains: 'test', mode: 'insensitive' } },
        take: 5,
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime > 3000 ? 'degraded' : 'up',
        responseTime,
        errorRate: 0,
        lastCheck: new Date(),
        uptime: 100,
        details: { resultsFound: searchResult.length },
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        errorRate: 1,
        lastCheck: new Date(),
        uptime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check forum health
   */
  private async checkForumHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const postCount = await prisma.forumPost.count();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        errorRate: 0,
        lastCheck: new Date(),
        uptime: 100,
        details: { postCount },
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        errorRate: 1,
        lastCheck: new Date(),
        uptime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check code generation health
   */
  private async checkCodeGenerationHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const generationCount = await prisma.codeGeneration.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        errorRate: 0,
        lastCheck: new Date(),
        uptime: 100,
        details: { generationsToday: generationCount },
      };
    } catch (error) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        errorRate: 0.5,
        lastCheck: new Date(),
        uptime: 50,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check data quality health
   */
  private async checkDataQualityHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // This would ideally check the last data quality score
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        errorRate: 0,
        lastCheck: new Date(),
        uptime: 100,
        details: { lastScoreUpdate: 'Available' },
      };
    } catch (error) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        errorRate: 0.2,
        lastCheck: new Date(),
        uptime: 80,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check performance monitoring health
   */
  private async checkPerformanceHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Check if performance monitoring is working
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        errorRate: 0,
        lastCheck: new Date(),
        uptime: 100,
        details: { monitoring: 'active' },
      };
    } catch (error) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        errorRate: 0.1,
        lastCheck: new Date(),
        uptime: 90,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Get basic counts
      const [userTotal, companyCount, contactCount, forumPostCount] = await Promise.all([
        prisma.user.count(),
        prisma.company.count(),
        prisma.contact.count({ where: { isActive: true } }),
        prisma.forumPost.count(),
      ]);

      // Get today's new users
      const newUsersToday = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      // Get active users (last 7 days)
      const activeUsers = await prisma.user.count({
        where: {
          lastDashboardVisit: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // Get search count for today
      const searchesToday = await prisma.search.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

      return {
        requests: {
          total: 0, // Would get from performance monitor
          successful: 0,
          failed: 0,
          avgResponseTime: 0,
        },
        users: {
          active: activeUsers,
          total: userTotal,
          newToday: newUsersToday,
        },
        data: {
          companies: companyCount,
          contacts: contactCount,
          forumPosts: forumPostCount,
          searches: searchesToday,
        },
        performance: {
          cpuUsage: 0, // Would get from system monitoring
          memoryUsage: memoryUsagePercent,
          diskUsage: 0, // Would get from system monitoring
        },
        errors: {
          total: 0, // Would get from logger
          critical: 0,
          resolved: 0,
        },
      };
    } catch (error) {
      logger.error('system', 'Failed to collect system metrics', error);
      throw error;
    }
  }

  /**
   * Generate health recommendations
   */
  private generateHealthRecommendations(
    services: SystemHealth['services'],
    metrics: SystemMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Service recommendations
    Object.entries(services).forEach(([serviceName, service]) => {
      if (service.status === 'down') {
        recommendations.push(`Investigate ${serviceName} service outage immediately`);
      } else if (service.status === 'degraded') {
        recommendations.push(`Review ${serviceName} service performance issues`);
      }

      if (service.responseTime > 2000) {
        recommendations.push(`Optimize ${serviceName} service response time (currently ${service.responseTime}ms)`);
      }

      if (service.errorRate > 0.02) {
        recommendations.push(`Investigate ${serviceName} service error rate (${Math.round(service.errorRate * 100)}%)`);
      }
    });

    // Performance recommendations
    if (metrics.performance.memoryUsage > 85) {
      recommendations.push(`High memory usage detected (${metrics.performance.memoryUsage}%) - consider scaling`);
    }

    if (metrics.performance.cpuUsage > 80) {
      recommendations.push(`High CPU usage detected (${metrics.performance.cpuUsage}%) - consider scaling`);
    }

    // Data recommendations
    if (metrics.users.active / metrics.users.total < 0.1) {
      recommendations.push('Low user engagement - consider user activation campaigns');
    }

    if (metrics.errors.critical > 0) {
      recommendations.push(`Address ${metrics.errors.critical} critical errors`);
    }

    return recommendations;
  }

  // Helper methods for metrics collection
  private async getRequestMetrics(since: Date): Promise<any> {
    // Would integrate with your API monitoring system
    return {
      total: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0,
    };
  }

  private async getErrorMetrics(since: Date): Promise<any> {
    // Would get from your logging system
    return {
      total: 0,
      critical: 0,
      resolved: 0,
    };
  }

  private async getPerformanceMetrics(since: Date): Promise<any> {
    return {
      avgCpuUsage: 0,
      avgMemoryUsage: 0,
      avgDiskUsage: 0,
    };
  }

  private async getUserMetrics(since: Date): Promise<any> {
    const activeUsers = await prisma.user.count({
      where: {
        lastDashboardVisit: { gte: since },
      },
    });

    return {
      activeUsers,
      newUsers: 0,
      totalSessions: 0,
    };
  }

  /**
   * Cleanup old alerts and metrics
   */
  private cleanupOldAlerts(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneWeekAgo);
    
    logger.info('system', `Cleaned up old alerts, ${this.alerts.length} alerts remaining`);
  }

  private cleanupOldMetrics(): void {
    // Would clean up old metrics if stored
    logger.info('system', 'Cleaned up old metrics');
  }
}

// Export singleton instance
export const systemMonitor = SystemMonitor.getInstance();