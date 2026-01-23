'use client';

import { cn } from '@/lib/utils';

type NavItem = 'forum' | 'orgs' | 'events' | 'profile';

interface MobileBottomNavProps {
  activeTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  onFilterClick: () => void;
  activeFilterCount?: number;
  className?: string;
}

// Icons
const ForumIcon = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const OrgsIcon = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const EventsIcon = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ProfileIcon = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export function MobileBottomNav({
  activeTab,
  onTabChange,
  onFilterClick,
  activeFilterCount = 0,
  className,
}: MobileBottomNavProps) {
  const navItems: { id: NavItem; label: string; icon: typeof ForumIcon }[] = [
    { id: 'forum', label: 'Forum', icon: ForumIcon },
    { id: 'orgs', label: 'Orgs', icon: OrgsIcon },
    // FAB goes in the middle
    { id: 'events', label: 'Events', icon: EventsIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
        "safe-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {/* First two nav items */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full touch-target",
                "transition-colors",
                isActive
                  ? "text-[#2575FC] dark:text-[#5B8DFF]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Icon className="w-6 h-6 mb-1" active={isActive} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Center FAB */}
        <div className="relative -mt-6">
          <button
            onClick={onFilterClick}
            className={cn(
              "w-14 h-14 brand-gradient text-white rounded-full shadow-lg",
              "flex items-center justify-center",
              "hover:opacity-90 active:scale-95 transition-all",
              "animate-pulse-ring"
            )}
            aria-label="Open filters"
          >
            <FilterIcon className="w-6 h-6" />
          </button>
          {/* Badge */}
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>

        {/* Last two nav items */}
        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full touch-target",
                "transition-colors",
                isActive
                  ? "text-[#2575FC] dark:text-[#5B8DFF]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Icon className="w-6 h-6 mb-1" active={isActive} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
