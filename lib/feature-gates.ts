import { UserRole, Permission, hasPermission, getRoleDefinition } from './permissions';
import { usageTracker, UsageAction } from './usage-tracker';
import { auditLogger } from './audit-logger';
import { logger } from './logger';

export interface FeatureGateConfig {
  requiredPermissions?: Permission[];
  requireAnyPermission?: Permission[];
  minRole?: UserRole;
  usageCheck?: {
    action: UsageAction;
    resourceType?: string;
  };
  customCheck?: (user: FeatureGateUser) => Promise<boolean>;
  gracePeriod?: boolean; // Allow access during grace period for recently downgraded users
}

export interface FeatureGateUser {
  id: string;
  role: UserRole;
  email?: string;
  isActive: boolean;
  teamId?: string;
}

export interface FeatureGateResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: number;
  limit?: number;
  remainingUsage?: number;
  gracePeriodEnds?: Date;
  suggestedAction?: 'upgrade' | 'contact_sales' | 'wait' | 'enable_team';
}

/**
 * Feature gating system that controls access to features based on user roles and usage limits
 */
export class FeatureGateSystem {
  private static instance: FeatureGateSystem;

  static getInstance(): FeatureGateSystem {
    if (!FeatureGateSystem.instance) {
      FeatureGateSystem.instance = new FeatureGateSystem();
    }
    return FeatureGateSystem.instance;
  }

  /**
   * Check if a user can access a specific feature
   */
  async checkFeatureAccess(
    user: FeatureGateUser,
    featureName: string,
    config: FeatureGateConfig
  ): Promise<FeatureGateResult> {
    try {
      // 1. Check user status
      if (!user.isActive) {
        await auditLogger.logEvent({
          action: 'feature_access_denied',
          userId: user.id,
          details: { feature: featureName, reason: 'inactive_account' }
        });

        return {
          allowed: false,
          reason: 'Your account is inactive. Please contact support.',
          suggestedAction: 'contact_sales'
        };
      }

      // 2. Check minimum role requirement
      if (config.minRole) {
        const currentRoleLevel = this.getRoleLevel(user.role);
        const requiredRoleLevel = this.getRoleLevel(config.minRole);

        if (currentRoleLevel < requiredRoleLevel) {
          await auditLogger.logEvent({
            action: 'feature_access_denied',
            userId: user.id,
            details: { 
              feature: featureName, 
              reason: 'insufficient_role',
              currentRole: user.role,
              requiredRole: config.minRole
            }
          });

          return {
            allowed: false,
            reason: `This feature requires ${config.minRole} plan or higher.`,
            upgradeRequired: true,
            suggestedAction: this.getSuggestedUpgradeAction(user.role)
          };
        }
      }

      // 3. Check specific permissions
      if (config.requiredPermissions) {
        for (const permission of config.requiredPermissions) {
          if (!hasPermission(user.role, permission)) {
            await auditLogger.logEvent({
              action: 'feature_access_denied',
              userId: user.id,
              details: { 
                feature: featureName, 
                reason: 'missing_permission',
                requiredPermission: permission
              }
            });

            return {
              allowed: false,
              reason: `This feature requires additional permissions. Upgrade your plan to access it.`,
              upgradeRequired: true,
              suggestedAction: this.getSuggestedUpgradeAction(user.role)
            };
          }
        }
      }

      // 4. Check "any permission" requirement
      if (config.requireAnyPermission) {
        const hasAnyRequired = config.requireAnyPermission.some(permission =>
          hasPermission(user.role, permission)
        );

        if (!hasAnyRequired) {
          return {
            allowed: false,
            reason: `This feature requires higher plan permissions.`,
            upgradeRequired: true,
            suggestedAction: this.getSuggestedUpgradeAction(user.role)
          };
        }
      }

      // 5. Check usage limits
      if (config.usageCheck) {
        const usageResult = await usageTracker.canPerformAction(
          user.id,
          user.role,
          config.usageCheck.action
        );

        if (!usageResult.allowed) {
          // Check for grace period
          if (config.gracePeriod) {
            const gracePeriodResult = await this.checkGracePeriod(user, featureName);
            if (gracePeriodResult.inGracePeriod) {
              await auditLogger.logEvent({
                action: 'feature_access_granted_grace_period',
                userId: user.id,
                details: { 
                  feature: featureName,
                  gracePeriodEnds: gracePeriodResult.endsAt
                }
              });

              return {
                allowed: true,
                gracePeriodEnds: gracePeriodResult.endsAt,
                reason: `Access granted during grace period until ${gracePeriodResult.endsAt.toLocaleDateString()}`
              };
            }
          }

          await auditLogger.logEvent({
            action: 'feature_access_denied',
            userId: user.id,
            details: { 
              feature: featureName, 
              reason: 'usage_limit_exceeded',
              currentUsage: usageResult.currentUsage,
              limit: usageResult.limit
            }
          });

          return {
            allowed: false,
            reason: usageResult.reason,
            upgradeRequired: usageResult.upgradeRequired,
            currentUsage: usageResult.currentUsage,
            limit: usageResult.limit,
            remainingUsage: usageResult.limit && usageResult.currentUsage 
              ? Math.max(0, usageResult.limit - usageResult.currentUsage) 
              : 0,
            suggestedAction: this.getSuggestedUpgradeAction(user.role)
          };
        }
      }

      // 6. Run custom checks
      if (config.customCheck) {
        const customResult = await config.customCheck(user);
        if (!customResult) {
          return {
            allowed: false,
            reason: 'Feature access denied by custom validation.',
            suggestedAction: 'contact_sales'
          };
        }
      }

      // Feature access granted
      await auditLogger.logEvent({
        action: 'feature_accessed',
        userId: user.id,
        details: { 
          feature: featureName,
          userRole: user.role
        }
      });

      return { allowed: true };

    } catch (error) {
      logger.error('featureGates', 'Feature access check error', { 
        error, 
        userId: user.id, 
        feature: featureName 
      });

      return {
        allowed: false,
        reason: 'Unable to verify feature access. Please try again.',
        suggestedAction: 'contact_sales'
      };
    }
  }

  /**
   * Get remaining usage for a specific action
   */
  async getRemainingUsage(
    userId: string,
    userRole: UserRole,
    action: UsageAction
  ): Promise<{
    current: number;
    limit: number;
    remaining: number;
    unlimited: boolean;
  }> {
    const roleDefinition = getRoleDefinition(userRole);
    if (!roleDefinition) {
      return { current: 0, limit: 0, remaining: 0, unlimited: false };
    }

    // Map actions to role limits
    const actionLimitMap: Record<UsageAction, keyof typeof roleDefinition.limits> = {
      'search:performed': 'searchesPerMonth',
      'contact:viewed': 'searchesPerMonth', // Use search limit for contact views
      'contact:exported': 'exportRecordsPerMonth',
      'company:viewed': 'searchesPerMonth',
      'company:exported': 'exportRecordsPerMonth',
      'api:request': 'apiRequestsPerMonth',
      'search:saved': 'savedSearches',
      'team:invite_sent': 'teamMembers',
      'data:premium_access': 'searchesPerMonth',
      'bulk:operation': 'exportRecordsPerMonth'
    };

    const limitKey = actionLimitMap[action];
    const limit = roleDefinition.limits[limitKey];
    
    if (limit === -1) {
      return { current: 0, limit: -1, remaining: -1, unlimited: true };
    }

    const usage = await usageTracker.getCurrentUsage(userId, action);
    return {
      current: usage,
      limit,
      remaining: Math.max(0, limit - usage),
      unlimited: false
    };
  }

  /**
   * Check if user is in grace period for recently downgraded features
   */
  private async checkGracePeriod(
    user: FeatureGateUser,
    featureName: string
  ): Promise<{ inGracePeriod: boolean; endsAt?: Date }> {
    // This could be implemented with a database table tracking grace periods
    // For now, return false (no grace period)
    return { inGracePeriod: false };
  }

  /**
   * Get role hierarchy level for comparison
   */
  private getRoleLevel(role: UserRole): number {
    const levels: Record<UserRole, number> = {
      FREE: 1,
      PRO: 2,
      TEAM: 3,
      ENTERPRISE: 4,
      ADMIN: 5,
      SUPER_ADMIN: 6
    };
    return levels[role] || 0;
  }

  /**
   * Get suggested upgrade action based on current role
   */
  private getSuggestedUpgradeAction(currentRole: UserRole): FeatureGateResult['suggestedAction'] {
    switch (currentRole) {
      case 'FREE':
        return 'upgrade';
      case 'PRO':
        return 'upgrade';
      case 'TEAM':
        return 'upgrade';
      case 'ENTERPRISE':
        return 'contact_sales';
      default:
        return 'contact_sales';
    }
  }

  /**
   * Bulk check multiple features for a user
   */
  async checkMultipleFeatures(
    user: FeatureGateUser,
    features: Record<string, FeatureGateConfig>
  ): Promise<Record<string, FeatureGateResult>> {
    const results: Record<string, FeatureGateResult> = {};

    await Promise.all(
      Object.entries(features).map(async ([featureName, config]) => {
        results[featureName] = await this.checkFeatureAccess(user, featureName, config);
      })
    );

    return results;
  }

  /**
   * Get feature summary for a user (all available features and their status)
   */
  async getFeatureSummary(user: FeatureGateUser): Promise<{
    availableFeatures: string[];
    restrictedFeatures: string[];
    usageSummary: Record<UsageAction, {
      current: number;
      limit: number;
      remaining: number;
      unlimited: boolean;
    }>;
    upgradeRecommendation?: {
      targetRole: UserRole;
      benefits: string[];
    };
  }> {
    const roleDefinition = getRoleDefinition(user.role);
    const availableFeatures = roleDefinition?.permissions || [];
    
    // Get usage summary for key actions
    const keyActions: UsageAction[] = [
      'search:performed',
      'contact:exported',
      'api:request',
      'search:saved'
    ];

    const usageSummary: Record<string, any> = {};
    for (const action of keyActions) {
      usageSummary[action] = await this.getRemainingUsage(user.id, user.role, action);
    }

    return {
      availableFeatures,
      restrictedFeatures: [], // Would need to compare against all possible features
      usageSummary,
      upgradeRecommendation: this.getUpgradeRecommendation(user.role)
    };
  }

  /**
   * Get upgrade recommendation for a role
   */
  private getUpgradeRecommendation(currentRole: UserRole): {
    targetRole: UserRole;
    benefits: string[];
  } | undefined {
    const recommendations: Record<UserRole, { targetRole: UserRole; benefits: string[] } | undefined> = {
      FREE: {
        targetRole: 'PRO',
        benefits: [
          'Advanced search filters',
          '1,000 searches per month',
          'Email addresses included',
          'Export up to 1,000 records',
          'Search alerts and analytics'
        ]
      },
      PRO: {
        targetRole: 'TEAM',
        benefits: [
          'Team collaboration features',
          '5,000 searches per month',
          'Phone numbers and premium data',
          'API access',
          'Unlimited saved searches'
        ]
      },
      TEAM: {
        targetRole: 'ENTERPRISE',
        benefits: [
          'Unlimited searches and exports',
          'Advanced analytics dashboard',
          'White-label options',
          'Dedicated customer success manager',
          'Custom integrations'
        ]
      },
      ENTERPRISE: undefined,
      ADMIN: undefined,
      SUPER_ADMIN: undefined
    };

    return recommendations[currentRole];
  }
}

// Export singleton instance
export const featureGates = FeatureGateSystem.getInstance();

// Common feature configurations
export const FEATURE_CONFIGS = {
  // Search Features
  BASIC_SEARCH: {
    requiredPermissions: ['search:basic' as Permission]
  },
  
  ADVANCED_SEARCH: {
    requiredPermissions: ['search:advanced' as Permission],
    usageCheck: { action: 'search:performed' as UsageAction }
  },
  
  EXPORT_CONTACTS: {
    requiredPermissions: ['contacts:export' as Permission],
    usageCheck: { action: 'contact:exported' as UsageAction }
  },
  
  VIEW_CONTACT_EMAIL: {
    requiredPermissions: ['contacts:view_email' as Permission],
    usageCheck: { action: 'contact:viewed' as UsageAction }
  },
  
  VIEW_CONTACT_PHONE: {
    requiredPermissions: ['contacts:view_phone' as Permission],
    minRole: 'TEAM' as UserRole
  },
  
  PREMIUM_DATA_ACCESS: {
    requiredPermissions: ['contacts:view_premium' as Permission],
    minRole: 'ENTERPRISE' as UserRole,
    usageCheck: { action: 'data:premium_access' as UsageAction }
  },
  
  // API Features
  API_ACCESS: {
    requiredPermissions: ['data:api_access' as Permission],
    minRole: 'TEAM' as UserRole,
    usageCheck: { action: 'api:request' as UsageAction }
  },
  
  // Team Features
  CREATE_TEAM: {
    requiredPermissions: ['team:create' as Permission],
    minRole: 'TEAM' as UserRole
  },
  
  MANAGE_TEAM_MEMBERS: {
    requiredPermissions: ['team:manage_members' as Permission],
    minRole: 'TEAM' as UserRole
  },
  
  // Analytics and Advanced Features
  ADVANCED_ANALYTICS: {
    requiredPermissions: ['search_analytics:advanced' as Permission],
    minRole: 'ENTERPRISE' as UserRole
  },
  
  BULK_OPERATIONS: {
    requiredPermissions: ['data:bulk_operations' as Permission],
    minRole: 'ENTERPRISE' as UserRole,
    usageCheck: { action: 'bulk:operation' as UsageAction }
  },
  
  // Admin Features
  USER_MANAGEMENT: {
    requiredPermissions: ['admin:user_management' as Permission],
    minRole: 'ADMIN' as UserRole
  },
  
  SYSTEM_SETTINGS: {
    requiredPermissions: ['admin:system_settings' as Permission],
    minRole: 'ADMIN' as UserRole
  }
};

// Utility functions for common feature checks
export async function canUserAccessFeature(
  user: FeatureGateUser,
  featureName: keyof typeof FEATURE_CONFIGS
): Promise<FeatureGateResult> {
  const config = FEATURE_CONFIGS[featureName];
  return featureGates.checkFeatureAccess(user, featureName, config);
}

export async function getUserFeatureSummary(user: FeatureGateUser) {
  return featureGates.getFeatureSummary(user);
}

export async function getRemainingUsageForUser(
  userId: string,
  userRole: UserRole,
  action: UsageAction
) {
  return featureGates.getRemainingUsage(userId, userRole, action);
}