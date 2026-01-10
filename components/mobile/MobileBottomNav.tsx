'use client'

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { 
  Search, MessageSquare, Building2, Calendar, Settings
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
  color: string;
}

interface MobileBottomNavProps {
  onNewSearch?: () => void;
  notifications?: number;
}

export default function MobileBottomNav({ 
  onNewSearch, 
  notifications = 0 
}: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('forum');

  const navItems: NavItem[] = [
    {
      id: 'forum',
      label: 'Forum',
      icon: MessageSquare,
      path: '/forum',
      color: 'text-primary'
    },
    {
      id: 'organizations',
      label: 'Orgs',
      icon: Building2,
      path: '/organizations',
      color: 'text-accent-foreground'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/search',
      color: 'text-yellow-600'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      path: '/events',
      color: 'text-green-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      badge: notifications,
      color: 'text-muted-foreground'
    }
  ];

  // Update active tab based on current path
  useEffect(() => {
    // Special handling for routes with aliases or variations
    if (pathname === '/' || pathname === '/forum' || pathname?.startsWith('/forum/')) {
      setActiveTab('forum');
    } else if (pathname === '/organizations' || pathname === '/orgs' || pathname?.startsWith('/orgs/') || pathname?.startsWith('/organizations/')) {
      setActiveTab('organizations');
    } else if (pathname?.startsWith('/search')) {
      setActiveTab('search');
    } else if (pathname?.startsWith('/events')) {
      setActiveTab('events');
    } else if (pathname?.startsWith('/settings')) {
      setActiveTab('settings');
    } else {
      // Fallback: try to match by path prefix
      const currentItem = navItems.find(item => pathname?.startsWith(item.path));
      if (currentItem) {
        setActiveTab(currentItem.id);
      }
    }
  }, [pathname])


  const handleNavClick = (item: NavItem): void => {
    setActiveTab(item.id);
    router.push(item.path);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground active:text-foreground'
                }`}
              >
                <div className="relative">
                  <IconComponent
                    className={`w-5 h-5 ${isActive ? item.color : ''}`}
                  />
                  {item.badge && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 text-xs p-0 flex items-center justify-center rounded-full"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for content */}
      <div className="h-16" />
    </>
  );
}

// Enhanced FAB with expandable actions
export function ExpandableFAB({ 
  onNewSearch, 
  onQuickSave, 
  onNewContact 
}: {
  onNewSearch?: () => void
  onQuickSave?: () => void
  onNewContact?: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const actions = [
    {
      label: 'New Search',
      icon: Search,
      onClick: onNewSearch,
      color: 'bg-primary'
    },
    {
      label: 'Save Search',
      icon: Star,
      onClick: onQuickSave,
      color: 'bg-yellow-600'
    },
    {
      label: 'Add Contact',
      icon: Users,
      onClick: onNewContact,
      color: 'bg-green-600'
    }
  ]

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Action buttons */}
      {expanded && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <div
                key={action.label}
                className="flex items-center space-x-3 animate-in slide-in-from-bottom duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-card px-3 py-2 rounded-full shadow-lg">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {action.label}
                  </span>
                </div>
                <button
                  onClick={() => {
                    action.onClick?.()
                    setExpanded(false)
                  }}
                  className={`w-12 h-12 ${action.color} rounded-full shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all duration-200`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 ${
          expanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Backdrop */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  )
}

// Mobile tab indicator component
export function MobileTabIndicator({ 
  activeTab, 
  tabs 
}: { 
  activeTab: string
  tabs: Array<{ id: string; label: string }>
}) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  const indicatorWidth = 100 / tabs.length
  const indicatorLeft = activeIndex * indicatorWidth

  return (
    <div className="relative">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div
        className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
        style={{
          width: `${indicatorWidth}%`,
          left: `${indicatorLeft}%`
        }}
      />
    </div>
  )
}

// Pull to refresh indicator
export function PullToRefreshIndicator({ 
  refreshing, 
  pullDistance = 0 
}: { 
  refreshing: boolean
  pullDistance?: number 
}) {
  const rotation = Math.min(pullDistance * 2, 360)
  
  return (
    <div className="flex justify-center py-4">
      <div 
        className={`transition-transform duration-200 ${
          refreshing ? 'animate-spin' : ''
        }`}
        style={{ 
          transform: `rotate(${rotation}deg)` 
        }}
      >
        <Activity className="w-5 h-5 text-primary" />
      </div>
    </div>
  )
}
