'use client';

import { Search, MoonStar, SunMedium } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { CategoryTabs, CategoryType } from './CategoryTabs';
import { Filter } from './ActiveFilterPills';

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
  // Get dynamic placeholder based on category
  const getSearchPlaceholder = () => {
    switch (activeCategory) {
      case 'agencies':
        return 'Search agencies...';
      case 'advertisers':
        return 'Search advertisers...';
      case 'people':
        return 'Search people...';
      case 'industries':
        return 'Search industries...';
      case 'publishers':
        return 'Search publishers...';
      case 'dsp-ssp':
        return 'Search DSP/SSP...';
      case 'adtech':
        return 'Search adtech...';
      default:
        return 'Search organizations...';
    }
  };

  return (
    <header className={cn('bg-[#F7F9FC] dark:bg-[#0B1220]', className)}>
      {/* Top Section: Logo (mobile) + Title + Dark Mode Toggle */}
      <div className="px-4 lg:px-6 pt-4 lg:pt-5">
        <div className="flex items-start justify-between">
          {/* Left: Logo (mobile only) + Title */}
          <div className="flex items-center gap-4">
            {/* Mobile Logo */}
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl lg:text-[28px] font-bold text-[#162B54] dark:text-[#EAF0FF]">
                Organizations
              </h1>
              <p className="text-sm text-[#64748B] dark:text-[#9AA7C2] mt-1">
                Explore deal connections and partnership opportunities
              </p>
            </div>
          </div>

          {/* Right: Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-[#64748B] hover:bg-white dark:text-[#9AA7C2] dark:hover:bg-[#101E38] transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunMedium className="w-5 h-5" /> : <MoonStar className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 lg:px-6 pt-5">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          counts={categoryCounts}
        />
      </div>

      {/* Search Row */}
      <div className="px-4 lg:px-6 pt-5 pb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] dark:text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] bg-white dark:bg-[#101E38] text-[#162B54] dark:text-[#EAF0FF] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2575FC]/20 focus:border-[#2575FC] transition-colors"
          />
        </div>
      </div>
    </header>
  );
}
