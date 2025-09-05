'use client';

import React from 'react';
import { useUser, usePermissions } from '@/hooks/useUser';
import { PermissionGate } from './PermissionGate';
import { UsageIndicator, UsageDashboard } from './UsageIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Alert, AlertDescription } from './alert';
import { 
  Search, 
  Download, 
  Users, 
  BarChart3, 
  Settings, 
  Crown, 
  Star, 
  Zap,
  Lock,
  TrendingUp,
  Filter,
  Database,
  Globe
} from 'lucide-react';

// Navigation items based on user role
export function RoleBasedNavigation() {
  const { user } = useUser();
  const { checkPermission, checkMinRole } = usePermissions();

  if (!user) return null;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      show: true
    },
    {
      label: 'Search',
      href: '/search',
      icon: Search,
      show: checkPermission('search:basic')
    },
    {
      label: 'Advanced Search',
      href: '/search/advanced',
      icon: Filter,
      show: checkPermission('search:advanced'),
      badge: 'Pro'
    },
    {
      label: 'Saved Searches',
      href: '/searches/saved',
      icon: Star,
      show: checkPermission('saved_searches:create')
    },
    {
      label: 'Exports',
      href: '/exports',
      icon: Download,
      show: checkPermission('contacts:export')
    },
    {
      label: 'Team',
      href: '/team',
      icon: Users,
      show: checkPermission('team:create'),
      badge: 'Team'
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: TrendingUp,
      show: checkPermission('search_analytics:view')
    },
    {
      label: 'API Access',
      href: '/api-docs',
      icon: Database,
      show: checkPermission('data:api_access'),
      badge: 'API'
    },
    {
      label: 'Admin',
      href: '/admin',
      icon: Settings,
      show: checkMinRole('ADMIN'),
      badge: 'Admin'
    }
  ];

  return (
    <nav className="space-y-1">
      {navItems
        .filter(item => item.show)
        .map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </a>
          );
        })}
    </nav>
  );
}

// Feature showcase based on user role
export function RoleBasedFeatureShowcase() {
  const { user } = useUser();
  const { checkPermission } = usePermissions();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Usage Overview - Always show */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>
            Your current usage across key features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsageDashboard />
        </CardContent>
      </Card>

      {/* Search Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PermissionGate requiredPermissions={['search:basic']}>
          <FeatureCard
            icon={Search}
            title="Basic Search"
            description="Search our comprehensive database"
            available={true}
          />
        </PermissionGate>

        <PermissionGate 
          requiredPermissions={['search:advanced']}
          fallback={
            <FeatureCard
              icon={Filter}
              title="Advanced Search"
              description="Powerful filters and boolean search"
              available={false}
              upgradePrompt="Upgrade to Pro"
            />
          }
        >
          <FeatureCard
            icon={Filter}
            title="Advanced Search"
            description="Powerful filters and boolean search"
            available={true}
          />
        </PermissionGate>

        <PermissionGate 
          requiredPermissions={['contacts:export']}
          fallback={
            <FeatureCard
              icon={Download}
              title="Export Contacts"
              description="Export search results to CSV/Excel"
              available={false}
              upgradePrompt="Upgrade to Pro"
            />
          }
        >
          <FeatureCard
            icon={Download}
            title="Export Contacts"
            description="Export search results to CSV/Excel"
            available={true}
          />
        </PermissionGate>

        <PermissionGate 
          requiredPermissions={['contacts:view_premium']}
          fallback={
            <FeatureCard
              icon={Crown}
              title="Premium Data"
              description="Access premium contact insights"
              available={false}
              upgradePrompt="Upgrade to Enterprise"
            />
          }
        >
          <FeatureCard
            icon={Crown}
            title="Premium Data"
            description="Access premium contact insights"
            available={true}
          />
        </PermissionGate>

        <PermissionGate 
          requiredPermissions={['team:create']}
          fallback={
            <FeatureCard
              icon={Users}
              title="Team Collaboration"
              description="Share searches and collaborate"
              available={false}
              upgradePrompt="Upgrade to Team"
            />
          }
        >
          <FeatureCard
            icon={Users}
            title="Team Collaboration"
            description="Share searches and collaborate"
            available={true}
          />
        </PermissionGate>

        <PermissionGate 
          requiredPermissions={['data:api_access']}
          fallback={
            <FeatureCard
              icon={Database}
              title="API Access"
              description="Programmatic access to data"
              available={false}
              upgradePrompt="Upgrade to Team"
            />
          }
        >
          <FeatureCard
            icon={Database}
            title="API Access"
            description="Programmatic access to data"
            available={true}
          />
        </PermissionGate>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  available,
  upgradePrompt
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  available: boolean;
  upgradePrompt?: string;
}) {
  return (
    <Card className={!available ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${available ? 'text-blue-600' : 'text-gray-400'}`} />
          <CardTitle className="text-lg">{title}</CardTitle>
          {!available && <Lock className="h-4 w-4 text-gray-400 ml-auto" />}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {!available && upgradePrompt && (
        <CardContent>
          <Button variant="outline" size="sm" className="w-full">
            {upgradePrompt}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// Role-specific analytics dashboard
export function RoleBasedAnalytics() {
  const { user } = useUser();
  const { checkPermission } = usePermissions();

  if (!user) return null;

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList>
        <TabsTrigger value="basic">Basic Analytics</TabsTrigger>
        <PermissionGate requiredPermissions={['search_analytics:advanced']}>
          <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
        </PermissionGate>
        <PermissionGate requiredPermissions={['team:analytics']}>
          <TabsTrigger value="team">Team Analytics</TabsTrigger>
        </PermissionGate>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Searches This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <UsageIndicator action="search:performed" variant="compact" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contacts Exported</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <UsageIndicator action="contact:exported" variant="compact" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Saved Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <UsageIndicator action="search:saved" variant="compact" />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="advanced">
        <PermissionGate 
          requiredPermissions={['search_analytics:advanced']}
          customMessage="Advanced analytics require Enterprise plan"
        >
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed insights into your search patterns and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Advanced analytics dashboard would be loaded here
                </p>
              </div>
            </CardContent>
          </Card>
        </PermissionGate>
      </TabsContent>

      <TabsContent value="team">
        <PermissionGate 
          requiredPermissions={['team:analytics']}
          customMessage="Team analytics require Team plan or higher"
        >
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>
                Analytics for your team's usage and collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Team analytics dashboard would be loaded here
                </p>
              </div>
            </CardContent>
          </Card>
        </PermissionGate>
      </TabsContent>
    </Tabs>
  );
}

// Quick actions based on permissions
export function RoleBasedQuickActions() {
  const { checkPermission } = usePermissions();

  const actions = [
    {
      label: 'New Search',
      href: '/search',
      icon: Search,
      show: checkPermission('search:basic'),
      primary: true
    },
    {
      label: 'Export Data',
      href: '/exports/new',
      icon: Download,
      show: checkPermission('contacts:export'),
      primary: false
    },
    {
      label: 'Invite Team',
      href: '/team/invite',
      icon: Users,
      show: checkPermission('team:manage_members'),
      primary: false
    },
    {
      label: 'View Analytics',
      href: '/analytics',
      icon: BarChart3,
      show: checkPermission('search_analytics:view'),
      primary: false
    }
  ];

  const visibleActions = actions.filter(action => action.show);

  if (visibleActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks based on your plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.href}
                variant={action.primary ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <a href={action.href} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {action.label}
                </a>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}