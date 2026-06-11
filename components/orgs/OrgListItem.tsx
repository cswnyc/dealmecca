'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Users, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { SearchHighlight } from '@/components/ui/SearchHighlight';
import { DisciplineChipList } from '@/components/ui/DisciplineChip';
import { cn } from '@/lib/utils';

interface OrgListItemProps {
  id: string;
  name: string;
  logoUrl?: string;
  type: string;
  location?: {
    city?: string;
    state?: string;
  };
  verified?: boolean;
  teamCount?: number;
  typeBadgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children?: React.ReactNode;
  searchQuery?: string;
  showOrgChart?: boolean;
  duties?: Array<{ id: string; name: string; category?: string }>;
}

export function OrgListItem({
  id,
  name,
  logoUrl,
  type,
  location,
  verified,
  teamCount,
  typeBadgeVariant = 'secondary',
  children,
  searchQuery,
  showOrgChart = true,
  duties
}: OrgListItemProps) {
  return (
    <div className="p-4 lg:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <CompanyLogo
          logoUrl={logoUrl}
          companyName={name}
          size="md"
          className="flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Link href={`/companies/${id}`} className="group min-w-0">
              <h3 className="text-sm font-semibold text-[#162B54] dark:text-[#EAF0FF] group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors truncate">
                {searchQuery ? (
                  <SearchHighlight
                    text={name}
                    searchTerm={searchQuery}
                    highlightClassName="bg-[#2575FC]/20 text-[#2575FC] px-1 rounded font-semibold"
                  />
                ) : (
                  name
                )}
              </h3>
            </Link>
            {verified && (
              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#64748B] dark:text-[#9AA7C2]">
            <span className="font-medium">{type}</span>
            {location && (location.city || location.state) && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {searchQuery ? (
                  <SearchHighlight
                    text={`${location.city || ''}, ${location.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                    searchTerm={searchQuery}
                    highlightClassName="bg-[#2575FC]/20 text-[#2575FC] px-1 rounded font-medium"
                  />
                ) : (
                  `${location.city || ''}, ${location.state || ''}`.replace(/^,\s*|\s*,$/g, '')
                )}
              </span>
            )}
            {teamCount !== undefined && teamCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3" />
                {teamCount} people
              </span>
            )}
          </div>
          {/* Discipline chips */}
          {duties && duties.length > 0 && (
            <div className="mt-1.5">
              <DisciplineChipList duties={duties} max={5} />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

interface RelatedItemsProps {
  items: Array<{
    id: string;
    name: string;
    logoUrl?: string;
  }>;
  label: string;
  searchQuery?: string;
  maxVisible?: number;
}

export function RelatedItems({ items, label, searchQuery, maxVisible = 3 }: RelatedItemsProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, maxVisible);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}:</p>
      <div className="flex flex-wrap items-center gap-2">
        {visibleItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <CompanyLogo
              logoUrl={item.logoUrl}
              companyName={item.name}
              size="sm"
              className="rounded-full"
            />
            <span className="text-sm font-medium text-foreground">
              {searchQuery ? (
                <SearchHighlight
                  text={item.name}
                  searchTerm={searchQuery}
                  highlightClassName="bg-primary/20 text-primary px-1 rounded font-medium"
                />
              ) : (
                item.name
              )}
            </span>
            {index < visibleItems.length - 1 && (
              <span className="text-muted-foreground">,</span>
            )}
          </div>
        ))}
        {items.length > maxVisible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-auto py-0 text-xs"
          >
            {expanded ? 'Show less' : `+${items.length - maxVisible} more`}
          </Button>
        )}
      </div>
    </div>
  );
}

