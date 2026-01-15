'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Filter {
  id: string;
  label: string;
  value: string;
  type?: string;
}

interface ActiveFilterPillsProps {
  filters: Filter[];
  onRemoveFilter: (id: string) => void;
  onClearAll?: () => void;
  compact?: boolean;
  className?: string;
}

export function ActiveFilterPills({
  filters,
  onRemoveFilter,
  onClearAll,
  compact = false,
  className,
}: ActiveFilterPillsProps) {
  if (filters.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 overflow-x-auto hide-scrollbar', className)}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onRemoveFilter(filter.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors whitespace-nowrap"
          >
            <span>{filter.label}</span>
            <X className="w-3 h-3" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active:</span>

      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemoveFilter(filter.id)}
          className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
        >
          {filter.type && (
            <span className="text-xs text-brand-primary/60">{filter.type}:</span>
          )}
          <span>{filter.label}</span>
          <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}

      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
