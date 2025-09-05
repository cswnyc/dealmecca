import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { UserRole, permissionSystem, RoleDefinition } from './permissions';

const prisma = new PrismaClient();

export interface UsageRecord {
  id: string;
  userId: string;
  action: UsageAction;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  month: string; // YYYY-MM format for monthly tracking
}

export type UsageAction = 
  | 'search:performed'
  | 'search:saved'
  | 'contact:viewed'
  | 'contact:exported'
  | 'company:viewed' 
  | 'company:exported'
  | 'api:request'
  | 'team:member_added'
  | 'bulk:export'
  | 'alert:triggered';

export interface UsageSummary {
  userId: string;
  userRole: UserRole;
  period: string; // YYYY-MM
  limits: RoleDefinition['limits'];
  usage: {
    searches: number;
    savedSearches: number;
    contactsViewed: number;
    contactsExported: number;
    companiesViewed: number;
    companiesExported: number;
    apiRequests: number;
    teamMembers: number;
    bulkExports: number;
  };
  utilizationPercentages: {
    searches: number;
    savedSearches: number;
    exports: number;
    apiRequests: number;
  };
  warnings: Array<{
    type: 'approaching_limit' | 'limit_exceeded';
    resource: string;
    current: number;
    limit: number;
    message: string;
  }>;
  upgradeRecommendation?: {
    suggestedRole: UserRole;
    benefits: string[];
    reasoning: string;
  };
}

export interface TeamUsageSummary {
  teamId: string;
  teamRole: UserRole;
  period: string;
  members: Array<{
    userId: string;
    name: string;
    email: string;
    usage: UsageSummary['usage'];
  }>;
  aggregatedUsage: UsageSummary['usage'];
  costOptimization: Array<{
    suggestion: string;
    potentialSavings: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Comprehensive usage tracking and limit enforcement system
 */
export class UsageTracker {
  private static instance: UsageTracker;
  private usageCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  /**
   * Track a usage event
   */
  async trackUsage(
    userId: string,
    action: UsageAction,
    resourceId?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await prisma.usageRecord.create({
        data: {
          userId,
          action,
          resourceId,
          metadata,
          timestamp: now,
          month
        }
      });

      // Clear cache for this user to ensure fresh data
      const cacheKey = `usage_${userId}_${month}`;
      this.usageCache.delete(cacheKey);

      logger.info('usage', 'Usage tracked', {
        userId,
        action,
        resourceId,
        month
      });
    } catch (error) {
      logger.error('usage', 'Failed to track usage', {
        userId,
        action,
        error
      });
      // Don't throw - usage tracking failure shouldn't break functionality
    }
  }

  /**
   * Check if user can perform an action based on limits
   */
  async canPerformAction(
    userId: string,
    userRole: UserRole,
    action: UsageAction,
    count: number = 1
  ): Promise<{
    allowed: boolean;
    reason?: string;
    currentUsage?: number;
    limit?: number;
    upgradeRequired?: boolean;
  }> {
    try {
      const limits = permissionSystem.getRoleLimits(userRole);
      if (!limits) {
        return { allowed: false, reason: 'Invalid user role' };
      }

      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentUsage = await this.getUsageSummary(userId, userRole, month);

      // Check specific action limits
      switch (action) {
        case 'search:performed':
          if (limits.searchesPerMonth === -1) return { allowed: true };
          const searchesAfter = currentUsage.usage.searches + count;
          if (searchesAfter > limits.searchesPerMonth) {
            return {
              allowed: false,
              reason: 'Monthly search limit exceeded',
              currentUsage: currentUsage.usage.searches,
              limit: limits.searchesPerMonth,
              upgradeRequired: true
            };
          }
          break;

        case 'search:saved':
          if (limits.savedSearches === -1) return { allowed: true };
          const savedSearchesAfter = currentUsage.usage.savedSearches + count;
          if (savedSearchesAfter > limits.savedSearches) {
            return {
              allowed: false,
              reason: 'Saved searches limit exceeded',
              currentUsage: currentUsage.usage.savedSearches,
              limit: limits.savedSearches,
              upgradeRequired: true
            };
          }
          break;

        case 'contact:exported':
        case 'company:exported':
          if (limits.exportRecordsPerMonth === -1) return { allowed: true };
          const exportsAfter = (currentUsage.usage.contactsExported + currentUsage.usage.companiesExported) + count;
          if (exportsAfter > limits.exportRecordsPerMonth) {
            return {
              allowed: false,
              reason: 'Monthly export limit exceeded',
              currentUsage: currentUsage.usage.contactsExported + currentUsage.usage.companiesExported,
              limit: limits.exportRecordsPerMonth,
              upgradeRequired: true
            };
          }
          break;

        case 'api:request':
          if (limits.apiRequestsPerMonth === -1) return { allowed: true };
          const apiRequestsAfter = currentUsage.usage.apiRequests + count;
          if (apiRequestsAfter > limits.apiRequestsPerMonth) {
            return {
              allowed: false,
              reason: 'API requests limit exceeded',
              currentUsage: currentUsage.usage.apiRequests,
              limit: limits.apiRequestsPerMonth,
              upgradeRequired: true
            };
          }
          break;

        case 'team:member_added':
          if (limits.teamMembers === -1) return { allowed: true };
          const teamMembersAfter = currentUsage.usage.teamMembers + count;
          if (teamMembersAfter > limits.teamMembers) {
            return {
              allowed: false,
              reason: 'Team members limit exceeded',
              currentUsage: currentUsage.usage.teamMembers,
              limit: limits.teamMembers,
              upgradeRequired: true
            };
          }
          break;
      }

      return { allowed: true };
    } catch (error) {
      logger.error('usage', 'Failed to check usage limits', { userId, userRole, action, error });
      // Be permissive on errors
      return { allowed: true };
    }
  }

  /**
   * Get comprehensive usage summary for a user
   */
  async getUsageSummary(
    userId: string,
    userRole: UserRole,
    period?: string
  ): Promise<UsageSummary> {
    const currentPeriod = period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const cacheKey = `usage_${userId}_${currentPeriod}`;
    
    // Check cache
    const cached = this.usageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const limits = permissionSystem.getRoleLimits(userRole);
      if (!limits) {
        throw new Error('Invalid user role');
      }

      // Get usage records for the period
      const usageRecords = await prisma.usageRecord.findMany({
        where: {
          userId,
          month: currentPeriod
        }
      });

      // Get current saved searches count
      const savedSearchesCount = await prisma.savedSearch.count({
        where: { userId, isActive: true }
      });

      // Get current team members count
      const teamMembersCount = await prisma.teamMember.count({
        where: { 
          team: { ownerId: userId },
          isActive: true
        }
      });

      // Aggregate usage data
      const usage = {
        searches: usageRecords.filter(r => r.action === 'search:performed').length,
        savedSearches: savedSearchesCount,
        contactsViewed: usageRecords.filter(r => r.action === 'contact:viewed').length,
        contactsExported: usageRecords.filter(r => r.action === 'contact:exported').reduce((sum, r) => 
          sum + (r.metadata?.count as number || 1), 0),
        companiesViewed: usageRecords.filter(r => r.action === 'company:viewed').length,
        companiesExported: usageRecords.filter(r => r.action === 'company:exported').reduce((sum, r) => 
          sum + (r.metadata?.count as number || 1), 0),
        apiRequests: usageRecords.filter(r => r.action === 'api:request').length,
        teamMembers: teamMembersCount,
        bulkExports: usageRecords.filter(r => r.action === 'bulk:export').length
      };

      // Calculate utilization percentages
      const utilizationPercentages = {
        searches: this.calculatePercentage(usage.searches, limits.searchesPerMonth),
        savedSearches: this.calculatePercentage(usage.savedSearches, limits.savedSearches),
        exports: this.calculatePercentage(
          usage.contactsExported + usage.companiesExported, 
          limits.exportRecordsPerMonth
        ),
        apiRequests: this.calculatePercentage(usage.apiRequests, limits.apiRequestsPerMonth)
      };

      // Generate warnings
      const warnings = this.generateUsageWarnings(usage, limits);

      // Generate upgrade recommendation
      const upgradeRecommendation = this.generateUpgradeRecommendation(
        userRole, 
        usage, 
        limits, 
        utilizationPercentages
      );

      const summary: UsageSummary = {
        userId,
        userRole,
        period: currentPeriod,
        limits,
        usage,
        utilizationPercentages,
        warnings,
        upgradeRecommendation
      };

      // Cache the summary
      this.usageCache.set(cacheKey, { data: summary, timestamp: Date.now() });

      return summary;
    } catch (error) {
      logger.error('usage', 'Failed to get usage summary', { userId, userRole, period, error });
      throw error;
    }
  }

  /**
   * Get team usage summary
   */
  async getTeamUsageSummary(
    teamId: string,
    teamRole: UserRole,
    period?: string
  ): Promise<TeamUsageSummary> {
    try {
      const currentPeriod = period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

      // Get team members
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId, isActive: true },
        include: { user: true }
      });

      const memberUsageSummaries = await Promise.all(
        teamMembers.map(async (member) => {
          const usage = await this.getUsageSummary(member.userId, teamRole, currentPeriod);
          return {
            userId: member.userId,
            name: member.user.name || 'Unknown',
            email: member.user.email || 'Unknown',
            usage: usage.usage
          };
        })
      );

      // Aggregate usage across all team members
      const aggregatedUsage = memberUsageSummaries.reduce(
        (total, member) => ({
          searches: total.searches + member.usage.searches,
          savedSearches: total.savedSearches + member.usage.savedSearches,
          contactsViewed: total.contactsViewed + member.usage.contactsViewed,
          contactsExported: total.contactsExported + member.usage.contactsExported,
          companiesViewed: total.companiesViewed + member.usage.companiesViewed,
          companiesExported: total.companiesExported + member.usage.companiesExported,
          apiRequests: total.apiRequests + member.usage.apiRequests,
          teamMembers: total.teamMembers + member.usage.teamMembers,
          bulkExports: total.bulkExports + member.usage.bulkExports
        }),
        {
          searches: 0,
          savedSearches: 0,
          contactsViewed: 0,
          contactsExported: 0,
          companiesViewed: 0,
          companiesExported: 0,
          apiRequests: 0,
          teamMembers: 0,
          bulkExports: 0
        }
      );

      // Generate cost optimization suggestions
      const costOptimization = this.generateCostOptimization(memberUsageSummaries, teamRole);

      return {
        teamId,
        teamRole,
        period: currentPeriod,
        members: memberUsageSummaries,
        aggregatedUsage,
        costOptimization
      };
    } catch (error) {
      logger.error('usage', 'Failed to get team usage summary', { teamId, teamRole, period, error });
      throw error;
    }
  }

  /**
   * Get usage analytics for admin dashboard
   */
  async getUsageAnalytics(period?: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    usageByRole: Record<UserRole, { users: number; totalSearches: number; totalExports: number }>;
    topUsers: Array<{ userId: string; userName: string; totalUsage: number; role: UserRole }>;
    growthMetrics: { searchGrowth: number; userGrowth: number; exportGrowth: number };
  }> {
    try {
      const currentPeriod = period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      
      // This would need to be implemented based on your User model
      // For now, returning placeholder data
      return {
        totalUsers: 0,
        activeUsers: 0,
        usageByRole: {} as any,
        topUsers: [],
        growthMetrics: { searchGrowth: 0, userGrowth: 0, exportGrowth: 0 }
      };
    } catch (error) {
      logger.error('usage', 'Failed to get usage analytics', { period, error });
      throw error;
    }
  }

  /**
   * Reset usage for a user (admin function)
   */
  async resetUserUsage(userId: string, period?: string): Promise<void> {
    try {
      const currentPeriod = period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      
      await prisma.usageRecord.deleteMany({
        where: { userId, month: currentPeriod }
      });

      // Clear cache
      const cacheKey = `usage_${userId}_${currentPeriod}`;
      this.usageCache.delete(cacheKey);

      logger.info('usage', 'User usage reset', { userId, period: currentPeriod });
    } catch (error) {
      logger.error('usage', 'Failed to reset user usage', { userId, period, error });
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private calculatePercentage(current: number, limit: number): number {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min(Math.round((current / limit) * 100), 100);
  }

  private generateUsageWarnings(
    usage: UsageSummary['usage'], 
    limits: RoleDefinition['limits']
  ): UsageSummary['warnings'] {
    const warnings: UsageSummary['warnings'] = [];

    // Check each limit
    if (limits.searchesPerMonth !== -1) {
      const percentage = this.calculatePercentage(usage.searches, limits.searchesPerMonth);
      if (percentage >= 100) {
        warnings.push({
          type: 'limit_exceeded',
          resource: 'searches',
          current: usage.searches,
          limit: limits.searchesPerMonth,
          message: 'Monthly search limit exceeded'
        });
      } else if (percentage >= 80) {
        warnings.push({
          type: 'approaching_limit',
          resource: 'searches',
          current: usage.searches,
          limit: limits.searchesPerMonth,
          message: 'Approaching monthly search limit'
        });
      }
    }

    if (limits.savedSearches !== -1) {
      const percentage = this.calculatePercentage(usage.savedSearches, limits.savedSearches);
      if (percentage >= 100) {
        warnings.push({
          type: 'limit_exceeded',
          resource: 'saved_searches',
          current: usage.savedSearches,
          limit: limits.savedSearches,
          message: 'Saved searches limit exceeded'
        });
      } else if (percentage >= 80) {
        warnings.push({
          type: 'approaching_limit',
          resource: 'saved_searches',
          current: usage.savedSearches,
          limit: limits.savedSearches,
          message: 'Approaching saved searches limit'
        });
      }
    }

    const totalExports = usage.contactsExported + usage.companiesExported;
    if (limits.exportRecordsPerMonth !== -1) {
      const percentage = this.calculatePercentage(totalExports, limits.exportRecordsPerMonth);
      if (percentage >= 100) {
        warnings.push({
          type: 'limit_exceeded',
          resource: 'exports',
          current: totalExports,
          limit: limits.exportRecordsPerMonth,
          message: 'Monthly export limit exceeded'
        });
      } else if (percentage >= 80) {
        warnings.push({
          type: 'approaching_limit',
          resource: 'exports',
          current: totalExports,
          limit: limits.exportRecordsPerMonth,
          message: 'Approaching monthly export limit'
        });
      }
    }

    return warnings;
  }

  private generateUpgradeRecommendation(
    currentRole: UserRole,
    usage: UsageSummary['usage'],
    limits: RoleDefinition['limits'],
    utilization: UsageSummary['utilizationPercentages']
  ): UsageSummary['upgradeRecommendation'] {
    // Don't recommend upgrades for admin roles
    if (currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN') {
      return undefined;
    }

    const upgradePath = permissionSystem.getUpgradePath(currentRole);
    if (!upgradePath) {
      return undefined;
    }

    // Check if user is hitting limits or using a high percentage
    const highUtilization = Object.values(utilization).some(percentage => percentage >= 70);
    const hasWarnings = this.generateUsageWarnings(usage, limits).length > 0;

    if (highUtilization || hasWarnings) {
      let reasoning = 'Based on your usage patterns, upgrading would provide: ';
      const reasons = [];

      if (utilization.searches >= 70) reasons.push('more monthly searches');
      if (utilization.savedSearches >= 70) reasons.push('unlimited saved searches');
      if (utilization.exports >= 70) reasons.push('higher export limits');
      if (utilization.apiRequests >= 70) reasons.push('increased API access');

      reasoning += reasons.join(', ');

      return {
        suggestedRole: upgradePath.nextRole,
        benefits: upgradePath.benefits,
        reasoning
      };
    }

    return undefined;
  }

  private generateCostOptimization(
    memberUsage: TeamUsageSummary['members'],
    teamRole: UserRole
  ): TeamUsageSummary['costOptimization'] {
    const suggestions: TeamUsageSummary['costOptimization'] = [];

    // Find underutilized members
    const underutilized = memberUsage.filter(member => 
      member.usage.searches < 50 && member.usage.contactsViewed < 20
    );

    if (underutilized.length > 0) {
      suggestions.push({
        suggestion: `${underutilized.length} team members have low usage - consider training or role adjustment`,
        potentialSavings: 'Up to 20% on team plan costs',
        impact: 'medium'
      });
    }

    // Check for high API usage
    const highApiUsers = memberUsage.filter(member => member.usage.apiRequests > 1000);
    if (highApiUsers.length > 0) {
      suggestions.push({
        suggestion: 'Consider API optimization for high-usage members',
        potentialSavings: 'Avoid overage charges',
        impact: 'high'
      });
    }

    return suggestions;
  }
}

// Export singleton instance
export const usageTracker = UsageTracker.getInstance();