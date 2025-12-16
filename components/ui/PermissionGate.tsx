'use client';

import React, { ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { Permission, UserRole, hasPermission, hasAnyPermission } from '@/lib/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Zap, ArrowRight } from 'lucide-react';

interface BasePermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  customMessage?: string;
}

interface PermissionRequiredProps extends BasePermissionGateProps {
  requiredPermissions: Permission[];
  requireAnyPermission?: never;
  minRole?: never;
}

interface AnyPermissionProps extends BasePermissionGateProps {
  requiredPermissions?: never;
  requireAnyPermission: Permission[];
  minRole?: never;
}

interface MinRoleProps extends BasePermissionGateProps {
  requiredPermissions?: never;
  requireAnyPermission?: never;
  minRole: UserRole;
}

type PermissionGateProps = PermissionRequiredProps | AnyPermissionProps | MinRoleProps;

const RoleIcons: Record<UserRole, React.ComponentType<any>> = {
  FREE: Lock,
  PRO: Star,
  TEAM: Zap,
  ENTERPRISE: Crown,
  ADMIN: Crown,
  SUPER_ADMIN: Crown
};

const RoleColors: Record<UserRole, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  PRO: 'bg-blue-100 text-blue-700',
  TEAM: 'bg-green-100 text-green-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-orange-100 text-orange-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700'
};

/**
 * PermissionGate component that conditionally renders content based on user permissions
 */
export function PermissionGate(props: PermissionGateProps) {
  const { children, fallback, showUpgradePrompt = true, customMessage } = props;
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="animate-pulse bg-muted h-20 rounded-md flex items-center justify-center">
        <div className="text-muted-foreground">Loading permissions...</div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Please sign in to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  const hasAccess = checkAccess(user.role, props);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return <UpgradePrompt userRole={user.role} {...props} customMessage={customMessage} />;
  }

  return (
    <Alert>
      <Lock className="h-4 w-4" />
      <AlertDescription>
        {customMessage || 'You do not have permission to access this feature.'}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Check if user has access based on the permission requirements
 */
function checkAccess(userRole: UserRole, props: PermissionGateProps): boolean {
  if ('requiredPermissions' in props && props.requiredPermissions) {
    return props.requiredPermissions.every(permission => hasPermission(userRole, permission));
  }

  if ('requireAnyPermission' in props && props.requireAnyPermission) {
    return hasAnyPermission(userRole, props.requireAnyPermission);
  }

  if ('minRole' in props && props.minRole) {
    return getRoleLevel(userRole) >= getRoleLevel(props.minRole);
  }

  return false;
}

/**
 * Get role hierarchy level for comparison
 */
function getRoleLevel(role: UserRole): number {
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
 * Upgrade prompt component
 */
function UpgradePrompt({ 
  userRole, 
  customMessage,
  ...props 
}: { userRole: UserRole; customMessage?: string } & PermissionGateProps) {
  const targetRole = getTargetRole(userRole, props);
  const Icon = RoleIcons[targetRole];
  const benefits = getUpgradeBenefits(userRole, targetRole);

  const handleUpgrade = () => {
    // Navigate to billing/upgrade page
    window.location.href = '/billing/upgrade';
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg">Upgrade Required</CardTitle>
        <CardDescription>
          {customMessage || `This feature is available with ${targetRole} plan and above.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className={RoleColors[userRole]}>
              Current: {userRole}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className={RoleColors[targetRole]}>
              Upgrade to: {targetRole}
            </Badge>
          </div>
        </div>

        {benefits.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">What you'll get:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {benefits.slice(0, 4).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleUpgrade} className="flex-1">
            Upgrade Now
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/contact'}>
            Contact Sales
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Get target role for upgrade based on current role and requirements
 */
function getTargetRole(currentRole: UserRole, props: PermissionGateProps): UserRole {
  if ('minRole' in props && props.minRole) {
    return props.minRole;
  }

  // Default upgrade path
  const upgradePath: Record<UserRole, UserRole> = {
    FREE: 'PRO',
    PRO: 'TEAM',
    TEAM: 'ENTERPRISE',
    ENTERPRISE: 'ENTERPRISE',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN'
  };

  return upgradePath[currentRole];
}

/**
 * Get upgrade benefits based on role transition
 */
function getUpgradeBenefits(currentRole: UserRole, targetRole: UserRole): string[] {
  const benefits: Record<string, string[]> = {
    'FREE-PRO': [
      'Advanced search filters',
      '1,000 searches per month',
      'Email addresses included',
      'Export up to 1,000 records',
      'Search alerts and analytics'
    ],
    'PRO-TEAM': [
      'Team collaboration features',
      '5,000 searches per month',
      'Phone numbers and premium data',
      'API access',
      'Unlimited saved searches'
    ],
    'TEAM-ENTERPRISE': [
      'Unlimited searches and exports',
      'Advanced analytics dashboard',
      'White-label options',
      'Dedicated customer success manager',
      'Custom integrations'
    ]
  };

  return benefits[`${currentRole}-${targetRole}`] || [];
}

/**
 * Hook for checking permissions programmatically
 */
export function usePermissions() {
  const { user } = useUser();

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const checkMinRole = (minRole: UserRole): boolean => {
    if (!user) return false;
    return getRoleLevel(user.role) >= getRoleLevel(minRole);
  };

  return {
    user,
    checkPermission,
    checkAnyPermission,
    checkMinRole,
    hasAccess: (props: PermissionGateProps) => 
      user ? checkAccess(user.role, props) : false
  };
}

/**
 * Higher-order component for protecting entire components
 */
export function withPermissionGate<P extends object>(
  Component: React.ComponentType<P>,
  gateProps: PermissionGateProps
) {
  return function ProtectedComponent(props: P) {
    return (
      <PermissionGate {...gateProps}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}