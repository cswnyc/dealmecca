'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Users, CheckCircle, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { SearchHighlight } from '@/components/ui/SearchHighlight';
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
  showOrgChart = true
}: OrgListItemProps) {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-[#F7F9FC] dark:hover:bg-[#101E38] cursor-pointer transition-all border-l-2 border-transparent hover:border-[#2575FC] dark:hover:border-[#5B8DFF]">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-xl icon-gradient-bg flex items-center justify-center">
          <svg className="w-6 h-6 text-[#2575FC] dark:text-[#5B8DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/companies/${id}`} className="group">
            <h3 className="text-sm font-semibold text-[#162B54] dark:text-[#EAF0FF] group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors">
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
          <div className="flex items-center flex-wrap gap-2 mt-1">
            <span className="px-2 py-0.5 bg-[#2575FC]/10 text-[#2575FC] dark:bg-[#5B8DFF]/10 dark:text-[#5B8DFF] rounded text-xs font-medium">
              {type}
            </span>
            {location && (location.city || location.state) && (
              <span className="flex items-center gap-1 text-xs text-[#64748B] dark:text-[#9AA7C2]">
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
            {showOrgChart && (
              <span className="flex items-center gap-1 text-xs text-[#64748B] dark:text-[#9AA7C2]">
                <Network className="w-3 h-3" />
                Org Chart
              </span>
            )}
            {verified && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          {children}
        </div>
      </div>
      {teamCount !== undefined && (
        <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9AA7C2]">
          <Users className="w-3.5 h-3.5" />
          <span>{teamCount} people</span>
        </div>
      )}
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

