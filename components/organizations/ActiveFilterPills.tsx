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
  showClearAll?: boolean;
  className?: string;
}

export function ActiveFilterPills({
  filters,
  onRemoveFilter,
  onClearAll,
  compact = false,
  showClearAll = true,
  className,
}: ActiveFilterPillsProps) {
  if (filters.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-shrink-0', className)}>
        {filters.map((filter) => (
          <span
            key={filter.id}
            className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-brand-blue text-xs font-medium rounded-full flex items-center gap-1.5"
          >
            {filter.label}
            <button
              onClick={() => onRemoveFilter(filter.id)}
              className="hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="text-xs text-[#64748B] dark:text-[#9AA7C2]">Active:</span>

      {filters.map((filter) => (
        <span
          key={filter.id}
          className="px-2.5 py-1 bg-[#2575FC]/10 dark:bg-[#5B8DFF]/20 text-[#2575FC] dark:text-[#5B8DFF] text-xs font-medium rounded-full flex items-center gap-1.5"
        >
          {filter.type && (
            <span className="text-[10px] text-[#2575FC]/60 dark:text-[#5B8DFF]/60">{filter.type}:</span>
          )}
          {filter.label}
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="hover:text-[#1a5fd4] dark:hover:text-[#8bb4ff] transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {showClearAll && onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-[#64748B] hover:text-[#162B54] dark:text-[#9AA7C2] dark:hover:text-[#EAF0FF] transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
