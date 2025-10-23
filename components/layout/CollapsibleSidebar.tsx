'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Building2,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AnimatedIconButton } from '@/components/ui/animated-components';
import { UserProfileCard } from './UserProfileCard';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { designTokens, motionVariants, shouldReduceMotion } from '@/lib/design-tokens';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface CollapsibleSidebarProps {
  defaultCollapsed?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'forum',
    label: 'Forum',
    icon: MessageSquare,
    path: '/forum',
  },
  {
    id: 'organizations',
    label: 'Organizations',
    icon: Building2,
    path: '/organizations',
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    path: '/events',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

const STORAGE_KEY = 'dealmecca-sidebar-collapsed';

export default function CollapsibleSidebar({ defaultCollapsed = false }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = shouldReduceMotion();

  // Load collapsed state from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string): boolean => {
    if (path === '/forum' && (pathname === '/' || pathname === '/forum')) {
      return true;
    }
    if (path === '/organizations' && (pathname === '/orgs' || pathname === '/organizations' || pathname?.startsWith('/orgs/'))) {
      return true;
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? '4rem' : '16rem',
      }}
      transition={reducedMotion ? { duration: 0 } : designTokens.transitions.spring}
      className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 h-screen overflow-hidden"
    >
      {/* Collapse Toggle Button */}
      <div className="flex items-center justify-end p-3 border-b border-gray-200 dark:border-slate-700">
        <AnimatedIconButton
          onClick={toggleCollapse}
          tooltip={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-8 h-8"
        >
          <motion.div
            initial={false}
            animate={{
              rotate: isCollapsed ? 180 : 0,
            }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </motion.div>
        </AnimatedIconButton>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              whileHover={reducedMotion ? {} : designTokens.hover.button}
              whileTap={reducedMotion ? {} : designTokens.tap.button}
              title={isCollapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${active
                  ? 'bg-accent-50 text-accent-700 border-l-4 border-accent-500 dark:bg-accent/20 dark:text-accent-400 dark:border-accent'
                  : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`
                flex-shrink-0 w-5 h-5
                ${active ? 'text-accent-600 dark:text-accent-400' : 'text-gray-600 dark:text-slate-400'}
              `} />

              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    {...motionVariants.fadeIn}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.2, delay: 0.1 }}
                    className="text-sm font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Theme Toggle and User Profile Section */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-3 space-y-3">
        {/* Theme Toggle */}
        <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <ThemeToggle />
        </div>

        {/* User Profile */}
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              {...motionVariants.fadeIn}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2, delay: 0.1 }}
            >
              <UserProfileCard />
            </motion.div>
          ) : (
            <motion.div
              {...motionVariants.fadeIn}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
