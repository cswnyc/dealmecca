'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfileCard } from './UserProfileCard';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  MessageSquare,
  Search,
  Building2,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Home,
  Calendar
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

interface ForumLayoutProps {
  children: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'forum',
    label: 'Forum',
    icon: MessageSquare,
    path: '/forum'
  },
  {
    id: 'organizations', 
    label: 'Organizations',
    icon: Building2,
    path: '/organizations'
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    path: '/events'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  }
];

export function ForumLayout({ children }: ForumLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string): boolean => {
    if (path === '/forum' && (pathname === '/' || pathname === '/forum')) {
      return true;
    }
    if (path === '/organizations' && (pathname === '/orgs' || pathname === '/organizations' || pathname.startsWith('/orgs/'))) {
      return true;
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-screen bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Sidebar - Hidden on mobile, visible on desktop */}
      <div className="
        hidden md:flex
        w-64 bg-white border-r border-gray-200
        flex-col h-full
      ">
        {/* Navigation */}
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                    transition-all duration-200 group
                    ${active
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card and Theme Toggle at Bottom - Desktop only */}
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <UserProfileCard />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    flex flex-col items-center justify-center px-3 py-2 rounded-lg
                    transition-all duration-200 relative
                    ${active ? 'text-blue-600' : 'text-gray-600'}
                  `}
                >
                  <item.icon className={`
                    h-6 w-6
                    ${active ? 'text-blue-600' : 'text-gray-400'}
                  `} />
                  <span className={`text-xs mt-1 font-medium ${active ? 'text-blue-600' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}