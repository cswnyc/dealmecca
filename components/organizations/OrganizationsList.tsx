'use client';

import { cn } from '@/lib/utils';
import { OrganizationCard, OrganizationCardProps } from './OrganizationCard';
import { CategoryType } from './CategoryTabs';

interface OrganizationsListProps {
  organizations: Omit<OrganizationCardProps, 'onClick'>[];
  category: CategoryType;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onCardClick?: (id: string) => void;
  className?: string;
}

// Loading skeleton for cards
function CardSkeleton() {
  return (
    <div className="p-3 lg:p-5 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 animate-pulse">
      <div className="flex items-start gap-3 lg:gap-4">
        {/* Logo skeleton */}
        <div className="w-11 h-11 lg:w-14 lg:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 lg:h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 lg:w-40" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        </div>

        {/* Right side skeleton */}
        <div className="text-right flex-shrink-0">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mb-1 ml-auto" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto" />
        </div>
      </div>
    </div>
  );
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="py-4 lg:py-6 text-center">
      <div className="inline-flex items-center gap-2 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
        <svg className="animate-spin w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Loading more...
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ category }: { category: CategoryType }) {
  const categoryLabels: Record<CategoryType, string> = {
    agencies: 'agencies',
    advertisers: 'advertisers',
    people: 'people',
    industries: 'industries',
    publishers: 'publishers',
    'dsp-ssp': 'DSP/SSP platforms',
    adtech: 'adtech companies',
  };

  return (
    <div className="py-12 lg:py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No {categoryLabels[category]} found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        Try adjusting your filters or search query to find what you&apos;re looking for.
      </p>
    </div>
  );
}

export function OrganizationsList({
  organizations,
  category,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onCardClick,
  className,
}: OrganizationsListProps) {
  // Show skeletons while initially loading
  if (isLoading && organizations.length === 0) {
    return (
      <div className={cn("space-y-3 lg:space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state if no results
  if (!isLoading && organizations.length === 0) {
    return <EmptyState category={category} />;
  }

  return (
    <div className={cn("space-y-3 lg:space-y-4", className)}>
      {/* Organization Cards */}
      {organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          {...org}
          onClick={() => onCardClick?.(org.id)}
        />
      ))}

      {/* Loading indicator for infinite scroll */}
      {isLoading && organizations.length > 0 && <LoadingSpinner />}

      {/* Load more button (alternative to infinite scroll) */}
      {!isLoading && hasMore && onLoadMore && (
        <div className="py-4 text-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {/* End of list indicator */}
      {!isLoading && !hasMore && organizations.length > 0 && (
        <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
          You&apos;ve reached the end
        </div>
      )}
    </div>
  );
}
