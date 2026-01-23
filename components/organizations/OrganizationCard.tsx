'use client';

import { cn } from '@/lib/utils';

export type ColorScheme = 'blue' | 'violet' | 'orange' | 'teal' | 'pink' | 'green';

export interface OrganizationCardProps {
  id: string;
  name: string;
  type: 'agency' | 'advertiser' | 'person';
  subtype?: string; // "Independent Agency", "Holding Company", "Brand", etc.
  location?: string;
  verified: boolean;
  hasOrgChart: boolean;
  peopleCount: number;
  lastActive: string;
  clients?: { name: string; logo?: string }[];
  colorScheme?: ColorScheme;
  onClick?: () => void;
  className?: string;
}

// Color variants for the logo container
const colorVariants: Record<ColorScheme, string> = {
  blue: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800',
  violet: 'from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800',
  orange: 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800',
  teal: 'from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800',
  pink: 'from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800',
  green: 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800',
};

const iconColors: Record<ColorScheme, string> = {
  blue: 'text-brand-blue',
  violet: 'text-violet-600 dark:text-violet-400',
  orange: 'text-orange-600 dark:text-orange-400',
  teal: 'text-teal-600 dark:text-teal-400',
  pink: 'text-pink-600 dark:text-pink-400',
  green: 'text-green-600 dark:text-green-400',
};

// Icons
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const OrgChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Helper to generate consistent color from string
export function getColorFromString(str: string): ColorScheme {
  const colors: ColorScheme[] = ['blue', 'violet', 'orange', 'teal', 'pink', 'green'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function OrganizationCard({
  id,
  name,
  type,
  subtype,
  location,
  verified,
  hasOrgChart,
  peopleCount,
  lastActive,
  clients,
  colorScheme,
  onClick,
  className,
}: OrganizationCardProps) {
  // Use provided color or generate from name
  const color = colorScheme || getColorFromString(name);

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 lg:p-5 border border-gray-100 dark:border-gray-700 rounded-xl",
        "hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md",
        "transition-all cursor-pointer bg-white dark:bg-gray-800",
        className
      )}
    >
      <div className="flex items-start gap-3 lg:gap-4">
        {/* Logo / Avatar */}
        <div
          className={cn(
            "w-11 h-11 lg:w-14 lg:h-14 bg-gradient-to-br rounded-xl flex items-center justify-center flex-shrink-0",
            colorVariants[color]
          )}
        >
          <BuildingIcon className={cn("w-5 h-5 lg:w-7 lg:h-7", iconColors[color])} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Name + Verification Badge */}
          <div className="flex items-center gap-2 lg:gap-3 mb-1 flex-wrap">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white truncate">
              {name}
            </h3>
            {verified && (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1 flex-shrink-0">
                <CheckIcon className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* Type + Location + Org Chart */}
          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            {subtype && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-brand-blue rounded font-medium">
                {subtype}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <LocationIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                {location}
              </span>
            )}
            {hasOrgChart && (
              <span className="flex items-center gap-1">
                <OrgChartIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                Org Chart
              </span>
            )}
          </div>

          {/* Clients (optional) */}
          {clients && clients.length > 0 && (
            <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap mt-2 lg:mt-3">
              <span className="text-[10px] lg:text-xs text-gray-400 dark:text-gray-500">
                Clients:
              </span>
              {clients.slice(0, 3).map((client) => (
                <span
                  key={client.name}
                  className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-gray-50 dark:bg-gray-700 rounded text-[10px] lg:text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  {client.name}
                </span>
              ))}
              {clients.length > 3 && (
                <button className="text-[10px] lg:text-xs text-brand-blue font-medium hover:underline">
                  +{clients.length - 3} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side - People Count + Last Active */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1 justify-end">
            <UsersIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {peopleCount}
            </span>
          </div>
          <p className="text-[10px] lg:text-xs text-gray-400 dark:text-gray-500">
            {lastActive}
          </p>
        </div>
      </div>
    </div>
  );
}
