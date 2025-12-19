'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandTabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface BrandTabsProps {
  tabs: BrandTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function BrandTabs({ tabs, activeTab, onTabChange, className }: BrandTabsProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'text-white'
                : 'bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border text-[#64748B] dark:text-[#9AA7C2] hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:text-[#2575FC] dark:hover:text-[#5B8DFF]'
            )}
            style={
              isActive
                ? { background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }
                : undefined
            }
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
