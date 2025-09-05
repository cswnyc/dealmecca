'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useMobileOptimization } from '@/lib/mobile-performance';
import {
  Menu,
  X,
  Home,
  Search,
  Users,
  BarChart3,
  Settings,
  User,
  Bell,
  Download,
  Zap,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Activity,
  TrendingUp,
  MessageSquare,
  Building2
} from 'lucide-react';

interface MobileNavigationProps {
  currentPath?: string;
  userName?: string;
  userRole?: string;
  notifications?: number;
  onNavigate?: (path: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  children?: NavigationItem[];
}

export default function MobileNavigation({
  currentPath = '/',
  userName = 'User',
  userRole = 'FREE',
  notifications = 0,
  onNavigate
}: MobileNavigationProps) {
  const { isMobile } = useMobileOptimization();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: MessageSquare,
      path: '/forum'
    },
    {
      id: 'org-charts',
      label: 'Organization Charts',
      icon: Building2,
      path: '/org-charts'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/search',
      children: [
        {
          id: 'basic-search',
          label: 'Basic Search',
          icon: Search,
          path: '/search/basic'
        },
        {
          id: 'advanced-search',
          label: 'Advanced Search',
          icon: Zap,
          path: '/search/advanced',
          requiresAuth: true
        }
      ]
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      path: '/contacts',
      requiresAuth: true
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      requiresAuth: true,
      children: [
        {
          id: 'trends',
          label: 'Trend Analysis',
          icon: TrendingUp,
          path: '/analytics/trends',
          requiresAuth: true
        },
        {
          id: 'admin-insights',
          label: 'Admin Insights',
          icon: Shield,
          path: '/analytics/admin',
          adminOnly: true
        }
      ]
    },
    {
      id: 'exports',
      label: 'Exports',
      icon: Download,
      path: '/exports',
      requiresAuth: true
    }
  ];

  const accountItems: NavigationItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      badge: notifications
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      path: '/logout'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
    setIsOpen(false);
  };

  const toggleExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (path: string): boolean => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const canAccess = (item: NavigationItem): boolean => {
    if (item.adminOnly && !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return false;
    }
    if (item.requiresAuth && userRole === 'FREE') {
      return false;
    }
    return true;
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'FREE': return 'bg-gray-500';
      case 'PRO': return 'bg-blue-500';
      case 'TEAM': return 'bg-green-500';
      case 'ENTERPRISE': return 'bg-purple-500';
      case 'ADMIN': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    if (!canAccess(item)) return null;
    
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const active = isActive(item.path);
    
    return (
      <div key={item.id}>
        <Button
          variant={active ? 'default' : 'ghost'}
          className={`w-full justify-start h-auto py-3 px-4 ${
            level > 0 ? 'ml-4 border-l-2 border-gray-200 dark:border-gray-700' : ''
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigate(item.path);
            }
          }}
        >
          <item.icon className={`h-5 w-5 mr-3 ${level > 0 ? 'h-4 w-4' : ''}`} />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`h-4 w-4 ml-2 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!mounted || !isMobile) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`text-xs ${getRoleBadgeColor(userRole)} text-white`}
                    >
                      {userRole}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Navigation
                </h3>
                <div className="space-y-1">
                  {navigationItems.map(item => renderNavigationItem(item))}
                </div>
              </div>

              <div className="px-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Account
                </h3>
                <div className="space-y-1">
                  {accountItems.map(item => renderNavigationItem(item))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        Mobile Optimized
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enhanced for mobile devices
                      </p>
                    </div>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}