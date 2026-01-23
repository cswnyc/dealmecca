'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { CategoryTabs, CategoryType } from './CategoryTabs';
import { ActiveFilterPills, Filter } from './ActiveFilterPills';
import { ScrollProgress } from '../ui/ScrollProgress';

interface CompactHeaderProps {
  visible: boolean;
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: Filter[];
  onRemoveFilter: (filterId: string) => void;
  onOpenFilters: () => void;
  stats: {
    filtered: number;
    total: number;
  };
  scrollProgress: number; // 0-100
  className?: string;
}

// Icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

export function CompactHeader({
  visible,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  activeFilters,
  onRemoveFilter,
  onOpenFilters,
  stats,
  scrollProgress,
  className,
}: CompactHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const headerContent = (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 lg:left-64 z-[9999] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm",
        "transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="px-4 lg:px-6 py-2.5 flex items-center gap-2 lg:gap-3">
        {/* Category Pills (compact) - scrollable on mobile */}
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          compact
        />

        {/* Divider - hidden on mobile */}
        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

        {/* Search (compact) */}
        <div className="flex-1 relative min-w-0">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-shadow"
          />
        </div>

        {/* Divider - hidden on small screens */}
        <div className="hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

        {/* Active Filters (hidden on small mobile) */}
        <div className="hidden md:block">
          <ActiveFilterPills
            filters={activeFilters}
            onRemoveFilter={onRemoveFilter}
            compact
            showClearAll={false}
          />
        </div>

        {/* Filter button - shown when filters are hidden on mobile */}
        {activeFilters.length > 0 && (
          <button
            onClick={onOpenFilters}
            className="md:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 relative"
            aria-label="Open filters"
          >
            <FilterIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilters.length}
            </span>
          </button>
        )}

        {/* Divider */}
        <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

        {/* Result count */}
        <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
          <span className="font-semibold text-gray-900 dark:text-white">
            {stats.filtered.toLocaleString()}
          </span>
          {' '}of{' '}
          <span className="text-gray-900 dark:text-white">
            {stats.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <ScrollProgress progress={scrollProgress} />
    </div>
  );

  // Use portal to render outside the scroll container
  if (!mounted) {
    return null;
  }

  return createPortal(headerContent, document.body);
}
