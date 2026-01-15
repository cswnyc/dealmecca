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
      <div className={cn('flex items-center gap-1.5 overflow-x-auto hide-scrollbar', className)}>
        {categoryConfigs.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              activeCategory === category.id
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {category.icon}
            <span>{category.label}</span>
            {counts[category.id] !== undefined && (
              <span className="ml-0.5 opacity-70">{counts[category.id]}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto hide-scrollbar', className)}>
      <div className="flex items-center gap-1 min-w-max">
        {categoryConfigs.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap',
              activeCategory === category.id
                ? 'brand-gradient text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {category.icon}
            <span>{category.label}</span>
            {counts[category.id] !== undefined && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-xs',
                activeCategory === category.id
                  ? 'bg-white/20'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}>
                {counts[category.id]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
