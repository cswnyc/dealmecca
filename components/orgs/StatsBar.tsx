'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  colorClass?: string;
}

interface StatsBarProps {
  stats: StatItem[];
  onToggleFilters?: () => void;
  showFilters?: boolean;
}

export function StatsBar({ stats, onToggleFilters, showFilters }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClass = stat.colorClass || 'bg-[#2575FC]/10 dark:bg-[#5B8DFF]/10 text-[#2575FC] dark:text-[#5B8DFF]';
        
        return (
          <div key={index} className="stat-card rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">{stat.label}</p>
              <p className="text-2xl font-bold text-[#162B54] dark:text-[#EAF0FF]">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

