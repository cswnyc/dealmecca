import { PrismaClient } from '@prisma/client';
import { getPerformanceMonitor } from './performance-monitor';

const prisma = new PrismaClient();
const performanceMonitor = getPerformanceMonitor(prisma);

// Database optimization utilities
export interface QueryAnalysis {
  query: string;
  avgDuration: number;
  executionCount: number;
  totalTime: number;
  slowestExecution: number;
  errorRate: number;
  recommendations: string[];
  indexSuggestions: string[];
}

export interface DatabaseHealth {
  tableStats: TableStats[];
  indexEfficiency: IndexEfficiency[];
  slowQueries: QueryAnalysis[];
  connectionPoolHealth: {
    activeConnections: number;
    idleConnections: number;
    maxConnections: number;
    utilizationPercent: number;
  };
  recommendations: string[];
}

interface TableStats {
  tableName: string;
  rowCount: number;
  sizeBytes: number;
  sizeMB: number;
  indexSize: number;
  indexSizeMB: number;
  vacuumStats: {
    lastVacuum: Date | null;
    lastAutoVacuum: Date | null;
  };
}

interface IndexEfficiency {
  tableName: string;
  indexName: string;
  scans: number;
  tuplesRead: number;
  tuplesReturned: number;
  efficiency: number; // percentage
  recommendation: string;
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  // Analyze database health and performance
  async analyzeDatabaseHealth(): Promise<DatabaseHealth> {
    console.log('🔍 Starting comprehensive database analysis...');

    const [tableStats, indexEfficiency, slowQueries, connectionStats] = await Promise.all([
      this.getTableStatistics(),
      this.getIndexEfficiency(),
      this.analyzeSlowQueries(),
      this.getConnectionPoolStats()
    ]);

    const recommendations = this.generateRecommendations(tableStats, indexEfficiency, slowQueries);

    return {
      tableStats,
      indexEfficiency,
      slowQueries,
      connectionPoolHealth: connectionStats,
      recommendations
    };
  }

  // Get detailed table statistics
  private async getTableStatistics(): Promise<TableStats[]> {
    try {
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins + n_tup_upd + n_tup_del as total_operations,
          n_live_tup as row_count,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
          pg_indexes_size(schemaname||'.'||tablename) as index_size,
          last_vacuum,
          last_autovacuum
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC;
      `;

      return stats.map(stat => ({
        tableName: stat.tablename,
        rowCount: parseInt(stat.row_count) || 0,
        sizeBytes: parseInt(stat.size_bytes) || 0,
        sizeMB: Math.round((parseInt(stat.size_bytes) || 0) / 1024 / 1024 * 100) / 100,
        indexSize: parseInt(stat.index_size) || 0,
        indexSizeMB: Math.round((parseInt(stat.index_size) || 0) / 1024 / 1024 * 100) / 100,
        vacuumStats: {
          lastVacuum: stat.last_vacuum,
          lastAutoVacuum: stat.last_autovacuum
        }
      }));
    } catch (error) {
      console.error('Failed to get table statistics:', error);
      return [];
    }
  }

  // Analyze index efficiency
  private async getIndexEfficiency(): Promise<IndexEfficiency[]> {
    try {
      const indexStats = await prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_returned
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC;
      `;

      return indexStats.map(stat => {
        const scans = parseInt(stat.scans) || 0;
        const tuplesRead = parseInt(stat.tuples_read) || 0;
        const tuplesReturned = parseInt(stat.tuples_returned) || 0;
        
        const efficiency = tuplesRead > 0 ? (tuplesReturned / tuplesRead) * 100 : 0;
        
        let recommendation = 'Index performing well';
        if (scans === 0) {
          recommendation = 'Consider dropping - never used';
        } else if (efficiency < 10) {
          recommendation = 'Poor efficiency - consider optimizing';
        } else if (efficiency < 50) {
          recommendation = 'Moderate efficiency - monitor usage';
        }

        return {
          tableName: stat.tablename,
          indexName: stat.indexname,
          scans,
          tuplesRead,
          tuplesReturned,
          efficiency: Math.round(efficiency * 100) / 100,
          recommendation
        };
      });
    } catch (error) {
      console.error('Failed to get index efficiency:', error);
      return [];
    }
  }

  // Analyze slow queries from performance monitor
  private async analyzeSlowQueries(): Promise<QueryAnalysis[]> {
    const queryMetrics = performanceMonitor.getQueryMetrics(1000);
    const queryStats = new Map<string, {
      durations: number[];
      errors: number;
      totalExecutions: number;
    }>();

    // Group metrics by query type
    queryMetrics.forEach(metric => {
      const key = metric.query;
      if (!queryStats.has(key)) {
        queryStats.set(key, {
          durations: [],
          errors: 0,
          totalExecutions: 0
        });
      }
      
      const stats = queryStats.get(key)!;
      stats.durations.push(metric.duration);
      stats.totalExecutions++;
      if (metric.errorMessage) {
        stats.errors++;
      }
    });

    const analyses: QueryAnalysis[] = [];

    queryStats.forEach((stats, query) => {
      const avgDuration = stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length;
      const slowestExecution = Math.max(...stats.durations);
      const errorRate = (stats.errors / stats.totalExecutions) * 100;
      
      const recommendations: string[] = [];
      const indexSuggestions: string[] = [];

      // Generate recommendations based on performance
      if (avgDuration > 1000) {
        recommendations.push('Query is consistently slow - consider optimization');
      }
      if (slowestExecution > 5000) {
        recommendations.push('Worst-case performance is poor - add monitoring');
      }
      if (errorRate > 5) {
        recommendations.push(`High error rate (${errorRate.toFixed(1)}%) - investigate failures`);
      }

      // Suggest indexes based on query patterns
      if (query.includes('searchContacts')) {
        indexSuggestions.push('Consider composite index on (department, seniority, verified)');
      }
      if (query.includes('searchCompanies')) {
        indexSuggestions.push('Consider composite index on (companyType, industry, city)');
      }

      analyses.push({
        query,
        avgDuration: Math.round(avgDuration * 100) / 100,
        executionCount: stats.totalExecutions,
        totalTime: Math.round(stats.durations.reduce((a, b) => a + b, 0)),
        slowestExecution: Math.round(slowestExecution * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        recommendations,
        indexSuggestions
      });
    });

    return analyses.sort((a, b) => b.avgDuration - a.avgDuration);
  }

  // Get connection pool statistics
  private async getConnectionPoolStats(): Promise<{
    activeConnections: number;
    idleConnections: number;
    maxConnections: number;
    utilizationPercent: number;
  }> {
    try {
      const poolStats = await prisma.$queryRaw<any[]>`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity 
        WHERE datname = current_database();
      `;

      const stats = poolStats[0];
      const active = parseInt(stats.active_connections) || 0;
      const idle = parseInt(stats.idle_connections) || 0;
      const max = parseInt(stats.max_connections) || 100;

      return {
        activeConnections: active,
        idleConnections: idle,
        maxConnections: max,
        utilizationPercent: Math.round((active / max) * 100 * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get connection pool stats:', error);
      return {
        activeConnections: 0,
        idleConnections: 0,
        maxConnections: 100,
        utilizationPercent: 0
      };
    }
  }

  // Generate optimization recommendations
  private generateRecommendations(
    tableStats: TableStats[],
    indexStats: IndexEfficiency[],
    slowQueries: QueryAnalysis[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze table sizes
    const largestTables = tableStats.filter(t => t.sizeMB > 100);
    if (largestTables.length > 0) {
      recommendations.push(
        `Large tables detected: ${largestTables.map(t => `${t.tableName} (${t.sizeMB}MB)`).join(', ')} - consider partitioning`
      );
    }

    // Analyze index usage
    const unusedIndexes = indexStats.filter(i => i.scans === 0);
    if (unusedIndexes.length > 0) {
      recommendations.push(
        `Unused indexes found: ${unusedIndexes.length} indexes never used - consider dropping to improve write performance`
      );
    }

    const inefficientIndexes = indexStats.filter(i => i.efficiency < 10 && i.scans > 0);
    if (inefficientIndexes.length > 0) {
      recommendations.push(
        `Inefficient indexes detected: ${inefficientIndexes.length} indexes with <10% efficiency - review and optimize`
      );
    }

    // Analyze slow queries
    const criticalSlowQueries = slowQueries.filter(q => q.avgDuration > 2000);
    if (criticalSlowQueries.length > 0) {
      recommendations.push(
        `Critical slow queries: ${criticalSlowQueries.length} queries averaging >2s - immediate optimization needed`
      );
    }

    // Vacuum recommendations
    const needsVacuum = tableStats.filter(t => {
      const lastVacuum = t.vacuumStats.lastAutoVacuum || t.vacuumStats.lastVacuum;
      if (!lastVacuum) return true;
      const daysSince = (Date.now() - lastVacuum.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    });

    if (needsVacuum.length > 0) {
      recommendations.push(
        `Tables need vacuum: ${needsVacuum.map(t => t.tableName).join(', ')} - schedule maintenance`
      );
    }

    return recommendations;
  }

  // Run automatic optimization
  async runOptimization(): Promise<{
    indexesCreated: string[];
    statisticsUpdated: boolean;
    recommendations: string[];
  }> {
    console.log('🚀 Running automatic database optimization...');

    const results = {
      indexesCreated: [],
      statisticsUpdated: false,
      recommendations: []
    };

    try {
      // Update table statistics
      await prisma.$executeRaw`ANALYZE;`;
      results.statisticsUpdated = true;
      console.log('✅ Updated table statistics');

      // Get analysis for recommendations
      const health = await this.analyzeDatabaseHealth();
      results.recommendations = health.recommendations;

      console.log('✅ Database optimization completed');
    } catch (error) {
      console.error('Failed to run optimization:', error);
      results.recommendations.push('Failed to complete optimization - check logs');
    }

    return results;
  }

  // Monitor query performance in real-time
  async startQueryMonitoring(): Promise<void> {
    console.log('📊 Starting real-time query monitoring...');

    // Check for slow queries every minute
    setInterval(async () => {
      try {
        const slowQueries = await prisma.$queryRaw<any[]>`
          SELECT 
            query,
            mean_exec_time,
            calls,
            total_exec_time,
            rows,
            100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
          FROM pg_stat_statements 
          WHERE mean_exec_time > 1000
          ORDER BY mean_exec_time DESC 
          LIMIT 10;
        `;

        if (slowQueries.length > 0) {
          console.warn('🐌 Slow queries detected:', slowQueries.map(q => ({
            query: q.query.substring(0, 100) + '...',
            avgTime: Math.round(q.mean_exec_time),
            calls: q.calls
          })));
        }
      } catch (error) {
        // pg_stat_statements extension may not be available
        console.log('📊 Query monitoring requires pg_stat_statements extension');
      }
    }, 60000); // Check every minute
  }
}

// Export singleton instance
export const databaseOptimizer = DatabaseOptimizer.getInstance();