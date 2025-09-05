import { NextRequest, NextResponse } from 'next/server';
import { UserRole, Permission, hasPermission, hasAnyPermission } from '@/lib/permissions';
import { usageTracker, UsageAction } from '@/lib/usage-tracker';
import { logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
}

export interface RBACConfig {
  requiredPermissions?: Permission[];
  requireAnyPermission?: Permission[]; // User needs at least one of these
  requireAllPermissions?: Permission[]; // User needs all of these
  allowedRoles?: UserRole[];
  minRole?: UserRole;
  usageTracking?: {
    action: UsageAction;
    resourceType?: string;
  };
  rateLimiting?: {
    windowMs: number;
    maxRequests: number;
  };
  dataFilter?: (user: AuthenticatedUser, data: any) => any;
}

/**
 * Role-Based Access Control Middleware
 */
export class RBACMiddleware {
  private static instance: RBACMiddleware;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  static getInstance(): RBACMiddleware {
    if (!RBACMiddleware.instance) {
      RBACMiddleware.instance = new RBACMiddleware();
    }
    return RBACMiddleware.instance;
  }

  /**
   * Main RBAC middleware function
   */
  async protect(
    request: NextRequest,
    config: RBACConfig = {}
  ): Promise<{
    success: boolean;
    user?: AuthenticatedUser;
    error?: string;
    statusCode?: number;
    response?: NextResponse;
  }> {
    try {
      // 1. Authenticate user
      const authResult = await this.authenticateUser(request);
      if (!authResult.success || !authResult.user) {
        return {
          success: false,
          error: authResult.error || 'Authentication failed',
          statusCode: 401,
          response: NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        };
      }

      const user = authResult.user;

      // User is active by default (no isActive field in schema)

      // 3. Check role-based permissions
      const permissionResult = await this.checkPermissions(user, config);
      if (!permissionResult.success) {
        return {
          success: false,
          error: permissionResult.error,
          statusCode: 403,
          response: NextResponse.json(
            { 
              error: permissionResult.error,
              upgradeRequired: permissionResult.upgradeRequired,
              requiredPermissions: config.requiredPermissions
            },
            { status: 403 }
          )
        };
      }

      // 4. Check usage limits
      if (config.usageTracking) {
        const usageResult = await this.checkUsageLimits(user, config.usageTracking);
        if (!usageResult.success) {
          return {
            success: false,
            error: usageResult.error,
            statusCode: 429,
            response: NextResponse.json(
              { 
                error: usageResult.error,
                currentUsage: usageResult.currentUsage,
                limit: usageResult.limit,
                upgradeRequired: true
              },
              { status: 429 }
            )
          };
        }
      }

      // 5. Check rate limiting
      if (config.rateLimiting) {
        const rateLimitResult = this.checkRateLimit(user.id, config.rateLimiting);
        if (!rateLimitResult.success) {
          return {
            success: false,
            error: 'Rate limit exceeded',
            statusCode: 429,
            response: NextResponse.json(
              { 
                error: 'Too many requests',
                retryAfter: rateLimitResult.retryAfter
              },
              { 
                status: 429,
                headers: {
                  'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
                }
              }
            )
          };
        }
      }

      // 6. Track usage if configured
      if (config.usageTracking) {
        await this.trackUsage(user, config.usageTracking, request);
      }

      return {
        success: true,
        user
      };

    } catch (error) {
      logger.error('rbac', 'RBAC middleware error', { error });
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500,
        response: NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      };
    }
  }

  /**
   * Authenticate user from request
   */
  private async authenticateUser(request: NextRequest): Promise<{
    success: boolean;
    user?: AuthenticatedUser;
    error?: string;
  }> {
    try {
      // Try to get user info from headers (set by auth middleware)
      const userId = request.headers.get('x-user-id');
      const userEmail = request.headers.get('x-user-email');
      const userRole = request.headers.get('x-user-role') as UserRole;

      if (!userId || !userEmail || !userRole) {
        return {
          success: false,
          error: 'Missing authentication headers'
        };
      }

      // Get full user data from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || 'Unknown',
          role: user.role as UserRole
        }
      };

    } catch (error) {
      logger.error('rbac', 'Authentication error', { error });
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Check user permissions against config
   */
  private async checkPermissions(
    user: AuthenticatedUser,
    config: RBACConfig
  ): Promise<{
    success: boolean;
    error?: string;
    upgradeRequired?: boolean;
  }> {
    // Check allowed roles
    if (config.allowedRoles && !config.allowedRoles.includes(user.role)) {
      return {
        success: false,
        error: `Access denied. Required role: ${config.allowedRoles.join(' or ')}`,
        upgradeRequired: true
      };
    }

    // Check minimum role level
    if (config.minRole) {
      const userLevel = this.getRoleLevel(user.role);
      const minLevel = this.getRoleLevel(config.minRole);
      
      if (userLevel < minLevel) {
        return {
          success: false,
          error: `Access denied. Minimum role required: ${config.minRole}`,
          upgradeRequired: true
        };
      }
    }

    // Check specific permissions
    if (config.requiredPermissions) {
      for (const permission of config.requiredPermissions) {
        if (!hasPermission(user.role, permission)) {
          return {
            success: false,
            error: `Missing required permission: ${permission}`,
            upgradeRequired: true
          };
        }
      }
    }

    // Check "any permission" requirement
    if (config.requireAnyPermission) {
      if (!hasAnyPermission(user.role, config.requireAnyPermission)) {
        return {
          success: false,
          error: `Missing any of required permissions: ${config.requireAnyPermission.join(', ')}`,
          upgradeRequired: true
        };
      }
    }

    // Check "all permissions" requirement
    if (config.requireAllPermissions) {
      for (const permission of config.requireAllPermissions) {
        if (!hasPermission(user.role, permission)) {
          return {
            success: false,
            error: `Missing required permission: ${permission}`,
            upgradeRequired: true
          };
        }
      }
    }

    return { success: true };
  }

  /**
   * Check usage limits
   */
  private async checkUsageLimits(
    user: AuthenticatedUser,
    usageConfig: NonNullable<RBACConfig['usageTracking']>
  ): Promise<{
    success: boolean;
    error?: string;
    currentUsage?: number;
    limit?: number;
  }> {
    try {
      const canPerform = await usageTracker.canPerformAction(
        user.id,
        user.role,
        usageConfig.action
      );

      if (!canPerform.allowed) {
        return {
          success: false,
          error: canPerform.reason || 'Usage limit exceeded',
          currentUsage: canPerform.currentUsage,
          limit: canPerform.limit
        };
      }

      return { success: true };
    } catch (error) {
      logger.error('rbac', 'Usage limit check error', { error, userId: user.id });
      // Be permissive on errors
      return { success: true };
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(
    userId: string,
    rateConfig: NonNullable<RBACConfig['rateLimiting']>
  ): {
    success: boolean;
    retryAfter?: number;
  } {
    const now = Date.now();
    const key = `rate_${userId}`;
    const existing = this.rateLimitStore.get(key);

    // Clean up expired entries
    if (existing && now > existing.resetTime) {
      this.rateLimitStore.delete(key);
    }

    const current = this.rateLimitStore.get(key) || {
      count: 0,
      resetTime: now + rateConfig.windowMs
    };

    if (current.count >= rateConfig.maxRequests) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      return {
        success: false,
        retryAfter
      };
    }

    // Increment counter
    current.count++;
    this.rateLimitStore.set(key, current);

    return { success: true };
  }

  /**
   * Track usage after successful request
   */
  private async trackUsage(
    user: AuthenticatedUser,
    usageConfig: NonNullable<RBACConfig['usageTracking']>,
    request: NextRequest
  ): Promise<void> {
    try {
      await usageTracker.trackUsage(
        user.id,
        usageConfig.action,
        usageConfig.resourceType,
        {
          endpoint: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent')
        }
      );
    } catch (error) {
      logger.error('rbac', 'Usage tracking error', { error, userId: user.id });
      // Don't fail the request if usage tracking fails
    }
  }

  /**
   * Filter response data based on user role
   */
  filterResponseData(user: AuthenticatedUser, data: any, config: RBACConfig): any {
    if (config.dataFilter) {
      return config.dataFilter(user, data);
    }

    // Apply default data filtering based on role
    return this.applyDefaultDataFiltering(user, data);
  }

  /**
   * Apply default data filtering rules
   */
  private applyDefaultDataFiltering(user: AuthenticatedUser, data: any): any {
    if (!data) return data;

    // For FREE users, limit sensitive data
    if (user.role === 'FREE') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeDataForFreeUser(item));
      } else {
        return this.sanitizeDataForFreeUser(data);
      }
    }

    // For PRO users, allow basic contact info
    if (user.role === 'PRO') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeDataForProUser(item));
      } else {
        return this.sanitizeDataForProUser(data);
      }
    }

    // TEAM, ENTERPRISE, ADMIN get full access
    return data;
  }

  /**
   * Sanitize data for FREE users
   */
  private sanitizeDataForFreeUser(item: any): any {
    if (!item) return item;

    const sanitized = { ...item };
    
    // Remove sensitive contact information
    delete sanitized.email;
    delete sanitized.phone;
    delete sanitized.linkedinUrl;
    
    // Limit company details
    if (sanitized.company) {
      delete sanitized.company.website;
      delete sanitized.company.description;
    }

    return sanitized;
  }

  /**
   * Sanitize data for PRO users
   */
  private sanitizeDataForProUser(item: any): any {
    if (!item) return item;

    const sanitized = { ...item };
    
    // Remove phone for PRO users (email is allowed)
    delete sanitized.phone;
    
    return sanitized;
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
}

// Export singleton instance
export const rbacMiddleware = RBACMiddleware.getInstance();

// Utility functions for common RBAC patterns
export function requirePermission(permission: Permission) {
  return { requiredPermissions: [permission] };
}

export function requireAnyPermission(...permissions: Permission[]) {
  return { requireAnyPermission: permissions };
}

export function requireAllPermissions(...permissions: Permission[]) {
  return { requireAllPermissions: permissions };
}

export function requireRole(...roles: UserRole[]) {
  return { allowedRoles: roles };
}

export function requireMinRole(role: UserRole) {
  return { minRole: role };
}

export function trackUsage(action: UsageAction, resourceType?: string) {
  return { usageTracking: { action, resourceType } };
}

export function rateLimit(maxRequests: number, windowMs: number = 60000) {
  return { rateLimiting: { maxRequests, windowMs } };
}

// Common RBAC configurations
export const RBAC_CONFIGS = {
  // Search configurations
  BASIC_SEARCH: {
    ...requirePermission('search:basic'),
    ...trackUsage('search:performed', 'basic_search')
  },
  
  ADVANCED_SEARCH: {
    ...requirePermission('search:advanced'),
    ...trackUsage('search:performed', 'advanced_search')
  },
  
  EXPORT_CONTACTS: {
    ...requirePermission('contacts:export'),
    ...trackUsage('contact:exported'),
    ...rateLimit(10, 60000) // 10 exports per minute
  },
  
  VIEW_PREMIUM_DATA: {
    ...requirePermission('contacts:view_premium'),
    ...trackUsage('contact:viewed', 'premium')
  },
  
  // Admin configurations
  USER_MANAGEMENT: {
    ...requirePermission('admin:user_management'),
    ...requireMinRole('ADMIN')
  },
  
  SYSTEM_SETTINGS: {
    ...requirePermission('admin:system_settings'),
    ...requireRole('ADMIN', 'SUPER_ADMIN')
  },
  
  // API configurations
  API_ACCESS: {
    ...requirePermission('data:api_access'),
    ...trackUsage('api:request'),
    ...rateLimit(100, 60000) // 100 requests per minute
  }
};

// Higher-order function for protecting API routes
export function withRBAC(config: RBACConfig) {
  return async function rbacWrapper(
    request: NextRequest,
    handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const protection = await rbacMiddleware.protect(request, config);
    
    if (!protection.success) {
      return protection.response!;
    }

    try {
      const response = await handler(request, protection.user!);
      
      // Apply data filtering to response if configured
      if (config.dataFilter) {
        const responseData = await response.json();
        const filteredData = rbacMiddleware.filterResponseData(
          protection.user!, 
          responseData, 
          config
        );
        return NextResponse.json(filteredData, {
          status: response.status,
          headers: response.headers
        });
      }
      
      return response;
    } catch (error) {
      logger.error('rbac', 'Protected route handler error', { error });
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}