'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlobalSearchInput } from '@/components/navigation/GlobalSearchInput';
import { 
  ArrowLeft, 
  Home, 
  ChevronRight, 
  Bell,
  Settings,
  User,
  Menu,
  Search,
  Plus
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'outline' | 'secondary';
  badge?: string | number;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackToDashboard?: boolean;
  customBackPath?: string;
  customBackLabel?: string;
  customHomePath?: string;
  customHomeLabel?: string;
  quickActions?: QuickAction[];
  showGlobalSearch?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  showBackToDashboard = true,
  customBackPath,
  customBackLabel,
  customHomePath,
  customHomeLabel,
  quickActions = [],
  showGlobalSearch = true,
  children,
  className = ''
}: PageHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (customBackPath) {
      router.push(customBackPath);
    } else {
      router.push('/dashboard');
    }
  };

  const getBackLabel = () => {
    if (customBackLabel) return customBackLabel;
    if (customBackPath) {
      // Try to infer a good label from the path
      const segments = customBackPath.split('/').filter(Boolean);
      if (segments.length > 0) {
        return `Back to ${segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)}`;
      }
    }
    return 'Back to Dashboard';
  };

  return (
    <header className={`bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="py-3 border-b border-gray-100">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href={customHomePath || "/dashboard"} className="flex items-center hover:text-blue-600 transition-colors">
                <Home className="w-4 h-4 mr-1" />
                {customHomeLabel || "Dashboard"}
              </Link>
              
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  {item.href ? (
                    <Link href={item.href} className="hover:text-blue-600 transition-colors flex items-center">
                      {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`flex items-center ${index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : ''}`}>
                      {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Main Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
          {/* Left Section - Title & Back Button */}
          <div className="flex items-center gap-4">
            {showBackToDashboard && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-2 hidden sm:flex hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                {getBackLabel()}
              </Button>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Global Search - Desktop Only */}
            {showGlobalSearch && (
              <div className="hidden md:block">
                <GlobalSearchInput 
                  className="w-64 lg:w-80"
                  size="md"
                  placeholder="Search companies, teams..."
                />
              </div>
            )}

            {/* Quick Actions */}
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link href={action.href}>
                    <Icon className="w-4 h-4" />
                    {action.label}
                    {action.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
            
            {/* Custom children */}
            {children}
          </div>
        </div>

        {/* Mobile Back Button */}
        {showBackToDashboard && (
          <div className="pb-3 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackClick}
              className="flex items-center gap-2 w-full justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              {getBackLabel()}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

// Common quick actions for different sections
export const commonQuickActions = {
  search: {
    label: 'Search',
    href: '/search',
    icon: Search,
    variant: 'outline' as const
  },
  settings: {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    variant: 'outline' as const
  },
  profile: {
    label: 'Profile',
    href: '/profile',
    icon: User,
    variant: 'outline' as const
  }
};

// Pre-configured headers for common sections
export const sectionHeaders = {
  search: {
    title: 'Search Database',
    subtitle: 'Find companies and contacts in our comprehensive database',
    quickActions: [
      {
        label: 'Enhanced Search',
        href: '/search/enhanced',
        icon: Search,
        variant: 'default' as const
      },
      commonQuickActions.settings
    ]
  },
  orgs: {
    title: 'Organization Charts',
    subtitle: 'Explore company structures and connections',
    quickActions: [
      commonQuickActions.search,
      commonQuickActions.settings
    ]
  },
  events: {
    title: 'Events & Conferences',
    subtitle: 'Track networking events and ROI opportunities',
    quickActions: [
      {
        label: 'Create Event',
        href: '/events/new',
        icon: Plus,
        variant: 'default' as const
      },
      commonQuickActions.search
    ]
  },
  forum: {
    title: 'Community Forum',
    subtitle: 'Connect and share insights with industry peers',
    quickActions: [
      {
        label: 'New Post',
        href: '/forum/create',
        icon: Plus,
        variant: 'default' as const
      },
      commonQuickActions.search
    ]
  },
  intelligence: {
    title: 'Intelligence Hub',
    subtitle: 'AI-powered insights and market intelligence',
    quickActions: [
      commonQuickActions.search,
      commonQuickActions.settings
    ]
  },
  analytics: {
    title: 'Analytics Dashboard',
    subtitle: 'Performance metrics and data insights',
    quickActions: [
      commonQuickActions.search,
      commonQuickActions.settings
    ]
  }
}; 