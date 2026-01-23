'use client';

import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  progress: number; // 0-100
  className?: string;
}

export function ScrollProgress({ progress, className }: ScrollProgressProps) {
  return (
    <div className={cn("h-0.5 bg-gray-100 dark:bg-gray-700", className)}>
      <div
        className="h-full brand-gradient transition-all duration-100 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
