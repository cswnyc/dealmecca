import { logger } from './logger';

export type UserRole = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE' | 'ADMIN' | 'SUPER_ADMIN';

export type Permission = 
  // Basic search permissions
  | 'search:basic'
  | 'search:advanced'
  | 'search:export'
  | 'search:bulk_export'
  
  // Contact and company access
  | 'contacts:view'
  | 'contacts:view_email'
  | 'contacts:view_phone'
  | 'contacts:view_premium'
  | 'contacts:export'
  | 'companies:view'
  | 'companies:view_details'
  | 'companies:export'
  
  // Search features
  | 'saved_searches:create'
  | 'saved_searches:unlimited'
  | 'search_alerts:create'
  | 'search_analytics:view'
  | 'search_analytics:advanced'
  
  // Data features
  | 'data:verified_only'
  | 'data:premium_insights'
  | 'data:bulk_operations'
  | 'data:api_access'
  
  // Team and collaboration
  | 'team:create'
  | 'team:manage_members'
  | 'team:share_searches'
  | 'team:analytics'
  
  // Admin features
  | 'admin:user_management'
  | 'admin:data_management'
  | 'admin:system_settings'
  | 'admin:audit_logs'
  | 'admin:billing_management'
  | 'admin:impersonate_users'
  
  // Super admin
  | 'super_admin:all';

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: Permission[];
  limits: {
    searchesPerMonth: number;
    savedSearches: number;
    exportRecordsPerMonth: number;
    teamMembers: number;
    dataRetentionDays: number;
    apiRequestsPerMonth: number;
  };
  features: {
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    whiteLabel: boolean;
    customIntegrations: boolean;
    dedicatedManager: boolean;
    onboarding: boolean;
  };
}

/**
 * Comprehensive role-based access control system
 */
export class PermissionSystem {
  private static instance: PermissionSystem;
  
  // Role definitions with permissions and limits
  private readonly roleDefinitions: Record<UserRole, RoleDefinition> = {
    FREE: {
      name: 'Free',
      description: 'Basic access with essential features',
      permissions: [
        'search:basic',
        'contacts:view',
        'companies:view',
        'saved_searches:create'
      ],
      limits: {
        searchesPerMonth: 100,
        savedSearches: 3,
        exportRecordsPerMonth: 50,
        teamMembers: 1,
        dataRetentionDays: 30,
        apiRequestsPerMonth: 0
      },
      features: {
        prioritySupport: false,
        advancedAnalytics: false,
        whiteLabel: false,
        customIntegrations: false,
        dedicatedManager: false,
        onboarding: false
      }
    },
    
    PRO: {
      name: 'Professional',
      description: 'Enhanced features for individual professionals',
      permissions: [
        'search:basic',
        'search:advanced',
        'search:export',
        'contacts:view',
        'contacts:view_email',
        'contacts:export',
        'companies:view',
        'companies:view_details',
        'companies:export',
        'saved_searches:create',
        'search_alerts:create',
        'search_analytics:view',
        'data:verified_only'
      ],
      limits: {
        searchesPerMonth: 1000,
        savedSearches: 25,
        exportRecordsPerMonth: 1000,
        teamMembers: 1,
        dataRetentionDays: 90,
        apiRequestsPerMonth: 1000
      },
      features: {
        prioritySupport: true,
        advancedAnalytics: true,
        whiteLabel: false,
        customIntegrations: false,
        dedicatedManager: false,
        onboarding: true
      }
    },
    
    TEAM: {
      name: 'Team',
      description: 'Collaboration features for small teams',
      permissions: [
        'search:basic',
        'search:advanced',
        'search:export',
        'contacts:view',
        'contacts:view_email',
        'contacts:view_phone',
        'contacts:export',
        'companies:view',
        'companies:view_details',
        'companies:export',
        'saved_searches:create',
        'saved_searches:unlimited',
        'search_alerts:create',
        'search_analytics:view',
        'data:verified_only',
        'team:create',
        'team:manage_members',
        'team:share_searches',
        'data:api_access'
      ],
      limits: {
        searchesPerMonth: 5000,
        savedSearches: 100,
        exportRecordsPerMonth: 5000,
        teamMembers: 10,
        dataRetentionDays: 180,
        apiRequestsPerMonth: 10000
      },
      features: {
        prioritySupport: true,
        advancedAnalytics: true,
        whiteLabel: false,
        customIntegrations: true,
        dedicatedManager: false,
        onboarding: true
      }
    },
    
    ENTERPRISE: {
      name: 'Enterprise',
      description: 'Full-featured solution for large organizations',
      permissions: [
        'search:basic',
        'search:advanced',
        'search:export',
        'search:bulk_export',
        'contacts:view',
        'contacts:view_email',
        'contacts:view_phone',
        'contacts:view_premium',
        'contacts:export',
        'companies:view',
        'companies:view_details',
        'companies:export',
        'saved_searches:create',
        'saved_searches:unlimited',
        'search_alerts:create',
        'search_analytics:view',
        'search_analytics:advanced',
        'data:verified_only',
        'data:premium_insights',
        'data:bulk_operations',
        'data:api_access',
        'team:create',
        'team:manage_members',
        'team:share_searches',
        'team:analytics'
      ],
      limits: {
        searchesPerMonth: -1, // Unlimited
        savedSearches: -1, // Unlimited
        exportRecordsPerMonth: -1, // Unlimited
        teamMembers: 100,
        dataRetentionDays: 365,
        apiRequestsPerMonth: 100000
      },
      features: {
        prioritySupport: true,
        advancedAnalytics: true,
        whiteLabel: true,
        customIntegrations: true,
        dedicatedManager: true,
        onboarding: true
      }
    },
    
    ADMIN: {
      name: 'Administrator',
      description: 'Administrative access for platform management',
      permissions: [
        'search:basic',
        'search:advanced',
        'search:export',
        'search:bulk_export',
        'contacts:view',
        'contacts:view_email',
        'contacts:view_phone',
        'contacts:view_premium',
        'contacts:export',
        'companies:view',
        'companies:view_details',
        'companies:export',
        'saved_searches:create',
        'saved_searches:unlimited',
        'search_alerts:create',
        'search_analytics:view',
        'search_analytics:advanced',
        'data:verified_only',
        'data:premium_insights',
        'data:bulk_operations',
        'data:api_access',
        'team:create',
        'team:manage_members',
        'team:share_searches',
        'team:analytics',
        'admin:user_management',
        'admin:data_management',
        'admin:system_settings',
        'admin:audit_logs',
        'admin:billing_management'
      ],
      limits: {
        searchesPerMonth: -1,
        savedSearches: -1,
        exportRecordsPerMonth: -1,
        teamMembers: -1,
        dataRetentionDays: -1,
        apiRequestsPerMonth: -1
      },
      features: {
        prioritySupport: true,
        advancedAnalytics: true,
        whiteLabel: true,
        customIntegrations: true,
        dedicatedManager: true,
        onboarding: true
      }
    },
    
    SUPER_ADMIN: {
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: ['super_admin:all'],
      limits: {
        searchesPerMonth: -1,
        savedSearches: -1,
        exportRecordsPerMonth: -1,
        teamMembers: -1,
        dataRetentionDays: -1,
        apiRequestsPerMonth: -1
      },
      features: {
        prioritySupport: true,
        advancedAnalytics: true,
        whiteLabel: true,
        customIntegrations: true,
        dedicatedManager: true,
        onboarding: true
      }
    }
  };

  static getInstance(): PermissionSystem {
    if (!PermissionSystem.instance) {
      PermissionSystem.instance = new PermissionSystem();
    }
    return PermissionSystem.instance;
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(userRole: UserRole, permission: Permission): boolean {
    try {
      // Super admin has all permissions
      if (userRole === 'SUPER_ADMIN') {
        return true;
      }

      const roleDefinition = this.roleDefinitions[userRole];
      if (!roleDefinition) {
        logger.warn('permissions', 'Unknown role', { userRole });
        return false;
      }

      return roleDefinition.permissions.includes(permission);
    } catch (error) {
      logger.error('permissions', 'Error checking permission', { userRole, permission, error });
      return false;
    }
  }

  /**
   * Check if a user has any of the specified permissions
   */
  hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Check if a user has all of the specified permissions
   */
  hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(userRole: UserRole): Permission[] {
    const roleDefinition = this.roleDefinitions[userRole];
    if (!roleDefinition) {
      return [];
    }

    if (userRole === 'SUPER_ADMIN') {
      // Return all possible permissions for super admin
      return this.getAllPermissions();
    }

    return roleDefinition.permissions;
  }

  /**
   * Get role definition with limits and features
   */
  getRoleDefinition(userRole: UserRole): RoleDefinition | null {
    return this.roleDefinitions[userRole] || null;
  }

  /**
   * Get usage limits for a role
   */
  getRoleLimits(userRole: UserRole): RoleDefinition['limits'] | null {
    const roleDefinition = this.roleDefinitions[userRole];
    return roleDefinition ? roleDefinition.limits : null;
  }

  /**
   * Get features available for a role
   */
  getRoleFeatures(userRole: UserRole): RoleDefinition['features'] | null {
    const roleDefinition = this.roleDefinitions[userRole];
    return roleDefinition ? roleDefinition.features : null;
  }

  /**
   * Check if a user is within their usage limits
   */
  checkUsageLimit(
    userRole: UserRole, 
    limitType: keyof RoleDefinition['limits'], 
    currentUsage: number
  ): { withinLimit: boolean; limit: number; percentage: number } {
    const limits = this.getRoleLimits(userRole);
    if (!limits) {
      return { withinLimit: false, limit: 0, percentage: 100 };
    }

    const limit = limits[limitType];
    
    // -1 means unlimited
    if (limit === -1) {
      return { withinLimit: true, limit: -1, percentage: 0 };
    }

    const withinLimit = currentUsage <= limit;
    const percentage = limit > 0 ? Math.round((currentUsage / limit) * 100) : 100;

    return { withinLimit, limit, percentage };
  }

  /**
   * Get upgrade path for a role
   */
  getUpgradePath(currentRole: UserRole): { nextRole: UserRole; benefits: string[] } | null {
    const upgradePaths: Record<UserRole, { nextRole: UserRole; benefits: string[] } | null> = {
      FREE: {
        nextRole: 'PRO',
        benefits: [
          'Advanced search filters',
          'Email addresses and contact details',
          '1,000 searches per month',
          '25 saved searches',
          'Export up to 1,000 records',
          'Search alerts',
          'Basic analytics'
        ]
      },
      PRO: {
        nextRole: 'TEAM',
        benefits: [
          'Team collaboration features',
          'Phone numbers and premium data',
          '5,000 searches per month',
          'Unlimited saved searches',
          'API access',
          'Team sharing',
          '10 team members'
        ]
      },
      TEAM: {
        nextRole: 'ENTERPRISE',
        benefits: [
          'Unlimited searches and exports',
          'Premium insights and data',
          'Advanced analytics dashboard',
          'White-label options',
          'Dedicated customer success manager',
          '100 team members',
          'Custom integrations'
        ]
      },
      ENTERPRISE: null,
      ADMIN: null,
      SUPER_ADMIN: null
    };

    return upgradePaths[currentRole] || null;
  }

  /**
   * Get all available permissions (for super admin)
   */
  private getAllPermissions(): Permission[] {
    const allPermissions: Permission[] = [];
    
    Object.values(this.roleDefinitions).forEach(role => {
      role.permissions.forEach(permission => {
        if (!allPermissions.includes(permission)) {
          allPermissions.push(permission);
        }
      });
    });

    return allPermissions;
  }

  /**
   * Get role hierarchy level (for comparison)
   */
  getRoleLevel(userRole: UserRole): number {
    const levels: Record<UserRole, number> = {
      FREE: 1,
      PRO: 2,
      TEAM: 3,
      ENTERPRISE: 4,
      ADMIN: 5,
      SUPER_ADMIN: 6
    };
    
    return levels[userRole] || 0;
  }

  /**
   * Check if one role is higher than another
   */
  isRoleHigherThan(roleA: UserRole, roleB: UserRole): boolean {
    return this.getRoleLevel(roleA) > this.getRoleLevel(roleB);
  }

  /**
   * Validate role transition
   */
  canTransitionToRole(currentRole: UserRole, targetRole: UserRole, isAdmin: boolean = false): boolean {
    // Admins can change any role
    if (isAdmin && (currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN')) {
      return true;
    }

    // Users can only upgrade, not downgrade (except admin actions)
    const currentLevel = this.getRoleLevel(currentRole);
    const targetLevel = this.getRoleLevel(targetRole);

    // Prevent transitions to admin roles unless already admin
    if ((targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN') && 
        (currentRole !== 'ADMIN' && currentRole !== 'SUPER_ADMIN')) {
      return false;
    }

    return targetLevel >= currentLevel || isAdmin;
  }

  /**
   * Get feature comparison between roles
   */
  getRoleComparison(roles: UserRole[]): Record<string, Record<UserRole, boolean | number | string>> {
    const comparison: Record<string, Record<UserRole, boolean | number | string>> = {};

    // Compare limits
    const limitKeys: (keyof RoleDefinition['limits'])[] = [
      'searchesPerMonth', 'savedSearches', 'exportRecordsPerMonth', 
      'teamMembers', 'dataRetentionDays', 'apiRequestsPerMonth'
    ];

    limitKeys.forEach(key => {
      comparison[key] = {};
      roles.forEach(role => {
        const limits = this.getRoleLimits(role);
        const value = limits?.[key] || 0;
        comparison[key][role] = value === -1 ? 'Unlimited' : value;
      });
    });

    // Compare features
    const featureKeys: (keyof RoleDefinition['features'])[] = [
      'prioritySupport', 'advancedAnalytics', 'whiteLabel', 
      'customIntegrations', 'dedicatedManager', 'onboarding'
    ];

    featureKeys.forEach(key => {
      comparison[key] = {};
      roles.forEach(role => {
        const features = this.getRoleFeatures(role);
        comparison[key][role] = features?.[key] || false;
      });
    });

    return comparison;
  }
}

// Export singleton instance and utilities
export const permissionSystem = PermissionSystem.getInstance();

// Utility functions for common permission checks
export const hasPermission = (role: UserRole, permission: Permission): boolean => 
  permissionSystem.hasPermission(role, permission);

export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean =>
  permissionSystem.hasAnyPermission(role, permissions);

export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean =>
  permissionSystem.hasAllPermissions(role, permissions);

export const getRoleDefinition = (role: UserRole): RoleDefinition | null =>
  permissionSystem.getRoleDefinition(role);

export const checkUsageLimit = (role: UserRole, limitType: keyof RoleDefinition['limits'], usage: number) =>
  permissionSystem.checkUsageLimit(role, limitType, usage);