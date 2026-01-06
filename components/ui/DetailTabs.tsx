'use client';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface DetailTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function DetailTabs({ tabs, activeTab, onTabChange, className }: DetailTabsProps) {
  return (
    <div className={cn('border-b border-border dark:border-dark-border', className)}>
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-brand-primary dark:text-[#5B8DFF]'
                : 'text-muted-foreground hover:text-brand-primary dark:hover:text-[#5B8DFF]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary dark:bg-[#5B8DFF]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

