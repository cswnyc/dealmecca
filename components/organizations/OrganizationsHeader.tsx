'use client';

import { Search, SlidersHorizontal, Moon, Sun, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { CategoryTabs, CategoryType } from './CategoryTabs';
import { ActiveFilterPills, Filter } from './ActiveFilterPills';

interface OrganizationsHeaderProps {
  // Category state
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  categoryCounts?: Partial<Record<CategoryType, number>>;

  // Search state
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Filter state
  activeFilters: Filter[];
  onRemoveFilter: (id: string) => void;
  onClearFilters: () => void;
  onOpenFilters: () => void;

  // Stats
  stats?: {
    filtered: number;
    total: number;
    people?: number;
  };

  // Sort
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  sortOptions?: { value: string; label: string }[];

  // Dark mode
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;

  className?: string;
}

export function OrganizationsHeader({
  activeCategory,
  onCategoryChange,
  categoryCounts,
  searchQuery,
  onSearchChange,
  activeFilters,
  onRemoveFilter,
  onClearFilters,
  onOpenFilters,
  stats,
  sortBy = 'relevance',
  onSortChange,
  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'activity', label: 'Most Active' },
  ],
  isDarkMode,
  onToggleDarkMode,
  className,
}: OrganizationsHeaderProps) {
  return (
    <header className={cn('bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800', className)}>
      {/* Top Section: Logo (mobile) + Title + Dark Mode Toggle */}
      <div className="px-4 lg:px-6 pt-4 lg:pt-6">
        <div className="flex items-start justify-between">
          {/* Left: Logo (mobile only) + Title */}
          <div className="flex items-center gap-4">
            {/* Mobile Logo */}
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-display">
                Organizations
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                Discover agencies, advertisers, and industry professionals
              </p>
            </div>
          </div>

          {/* Right: Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 lg:px-6 pt-4">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          counts={categoryCounts}
        />
      </div>

      {/* Search + Filters Row */}
      <div className="px-4 lg:px-6 pt-4 pb-4">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search organizations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={onOpenFilters}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-colors',
              activeFilters.length > 0
                ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary text-white text-xs font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Pills (Desktop) */}
        {activeFilters.length > 0 && (
          <div className="mt-3 hidden lg:block">
            <ActiveFilterPills
              filters={activeFilters}
              onRemoveFilter={onRemoveFilter}
              onClearAll={onClearFilters}
            />
          </div>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="px-4 lg:px-6 pb-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{stats.filtered.toLocaleString()}</span>
            {' '}of {stats.total.toLocaleString()} results
            {stats.people !== undefined && activeCategory !== 'people' && (
              <span className="ml-2">
                • <span className="font-semibold text-gray-900 dark:text-white">{stats.people.toLocaleString()}</span> people
              </span>
            )}
          </div>

          {/* Sort Dropdown */}
          {onSortChange && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
