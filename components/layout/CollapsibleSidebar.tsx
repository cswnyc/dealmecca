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
import { Logo, LogoMark } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/lib/theme-context';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      className="hidden md:flex flex-col bg-card border-r border-border h-screen overflow-hidden"
    >
      {/* Logo and Collapse Toggle */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-border`}>
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.button
              key="logomark"
              onClick={toggleCollapse}
              {...motionVariants.fadeIn}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="Expand sidebar"
            >
              <LogoMark size={40} dark={isDark} />
            </motion.button>
          ) : (
            <motion.div
              key="logo"
              {...motionVariants.fadeIn}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2, delay: 0.1 }}
            >
              <Logo size="lg" dark={isDark} />
            </motion.div>
          )}
        </AnimatePresence>
        {!isCollapsed && (
          <AnimatedIconButton
            onClick={toggleCollapse}
            tooltip="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="w-8 h-8"
          >
            <ChevronLeft className="w-5 h-5" />
          </AnimatedIconButton>
        )}
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
                  ? 'bg-gradient-brand-subtle border-l-[3px] border-brand-primary dark:border-[#5B8DFF] text-brand-primary dark:text-[#5B8DFF]'
                  : 'text-[#64748B] dark:text-[#9AA7C2] hover:text-[#162B54] dark:hover:text-[#EAF0FF] hover:bg-muted'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`
                flex-shrink-0 w-5 h-5
                ${active ? 'text-brand-primary dark:text-[#5B8DFF]' : 'text-[#64748B] dark:text-[#9AA7C2]'}
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
      <div className="border-t border-border p-3 space-y-3">
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
