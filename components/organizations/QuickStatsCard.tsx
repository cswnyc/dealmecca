'use client';

interface Stat {
  label: string;
  value: string | number;
}

interface QuickStatsCardProps {
  stats: Stat[];
}

export function QuickStatsCard({ stats }: QuickStatsCardProps) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E6EAF2] dark:border-dark-border">
        <h3 className="text-lg font-bold text-[#162B54] dark:text-[#EAF0FF]">
          Quick Stats
        </h3>
      </div>
      <div className="p-5 space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] dark:text-[#9AA7C2]">
              {stat.label}
            </span>
            <span className="text-sm font-bold text-[#162B54] dark:text-[#EAF0FF]">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
