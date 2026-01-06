'use client';

import { MapPin } from 'lucide-react';

interface Location {
  name: string;
  count: number | string;
}

interface TopLocationsCardProps {
  locations: Location[];
}

export function TopLocationsCard({ locations }: TopLocationsCardProps) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E6EAF2] dark:border-dark-border">
        <h3 className="text-lg font-bold text-[#162B54] dark:text-[#EAF0FF]">
          Top Locations
        </h3>
      </div>
      <div className="p-5 space-y-3">
        {locations.map((loc) => (
          <div key={loc.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#9AA7C2] dark:text-[#6B7A99]" />
              <span className="text-xs text-[#64748B] dark:text-[#9AA7C2]">
                {loc.name}
              </span>
            </div>
            <span className="text-xs text-[#162B54] dark:text-[#EAF0FF]">
              {loc.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
