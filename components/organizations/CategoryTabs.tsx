'use client';

import { Building2, Users, User, Factory, Globe, Cpu, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CategoryType = 'agencies' | 'advertisers' | 'people' | 'industries' | 'publishers' | 'dsp-ssp' | 'adtech';

interface CategoryConfig {
  id: CategoryType;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface CategoryTabsProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  counts?: Partial<Record<CategoryType, number>>;
  compact?: boolean;
  className?: string;
}

const categoryConfigs: CategoryConfig[] = [
  { id: 'agencies', label: 'Agencies', icon: <Building2 className="w-4 h-4" /> },
  { id: 'advertisers', label: 'Advertisers', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'people', label: 'People', icon: <Users className="w-4 h-4" /> },
  { id: 'industries', label: 'Industries', icon: <Factory className="w-4 h-4" /> },
  { id: 'publishers', label: 'Publishers', icon: <Globe className="w-4 h-4" /> },
  { id: 'dsp-ssp', label: 'DSP/SSP', icon: <Cpu className="w-4 h-4" /> },
  { id: 'adtech', label: 'Adtech', icon: <Cpu className="w-4 h-4" /> },
];

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  counts = {},
  compact = false,
  className,
}: CategoryTabsProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-shrink-0', className)}>
        {categoryConfigs.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
              activeCategory === category.id
                ? 'brand-gradient text-white'
                : 'text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0',
      className
    )}>
      {categoryConfigs.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 lg:gap-2 whitespace-nowrap flex-shrink-0 transition-colors',
            activeCategory === category.id
              ? 'brand-gradient text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          {category.icon}
          {category.label}
          {counts[category.id] !== undefined && (
            <span className={cn(
              'px-1.5 py-0.5 text-[10px] lg:text-xs rounded-full',
              activeCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            )}>
              {counts[category.id]?.toLocaleString()}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
