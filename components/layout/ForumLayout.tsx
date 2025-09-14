'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirebaseSession } from '@/hooks/useFirebaseSession';
import { useAuth } from '@/lib/auth/firebase-auth';
import { Button } from '@/components/ui/button';
import { UserProfileCard } from './UserProfileCard';
import { ForumSidebar } from '@/components/forum/ForumSidebar';
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
    path: '/orgs'
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const hasFirebaseSession = useFirebaseSession();
  const { user: firebaseUser, loading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Close sidebar when route changes on mobile
    setSidebarOpen(false);
  }, [pathname]);

  const handleNavigate = (path: string) => {
    router.push(path);
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  const isActive = (path: string): boolean => {
    if (path === '/forum' && (pathname === '/' || pathname === '/forum')) {
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
    <div className="h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 
        w-64 bg-white border-r border-gray-200 
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        flex flex-col
      `}>
        {/* Mobile Close Button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

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

        {/* User Profile Card and Forum Stats at Bottom */}
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Only show ForumSidebar stats on forum pages */}
          {pathname === '/forum' || pathname.startsWith('/forum/') ? (
            <ForumSidebar />
          ) : (
            <UserProfileCard />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content - No top header, just the content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}