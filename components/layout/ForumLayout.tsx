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
      <div className="min-h-screen bg-muted">
        <div className="animate-pulse">
          <div className="h-screen bg-muted"></div>
        </div>
      </div>
    );
  }

  // ForumLayout now just renders children since sidebar is in root layout
  return <>{children}</>;
}