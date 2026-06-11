'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Users, CheckCircle, Building2, Briefcase, Award, Shield } from 'lucide-react';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { SearchHighlight } from '@/components/ui/SearchHighlight';
import { DisciplineChipList } from '@/components/ui/DisciplineChip';
import { cn } from '@/lib/utils';

interface OrgListItemProps {
  id: string;
  name: string;
  logoUrl?: string;
  type: string;
  /** Entity kind for icon/badge styling */
  kind?: 'agency' | 'advertiser' | 'holding';
  location?: {
    city?: string;
    state?: string;
  };
  /** Parent / holding company name */
  parentName?: string;
  verified?: boolean;
  teamCount?: number;
  typeBadgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children?: React.ReactNode;
  searchQuery?: string;
  showOrgChart?: boolean;
  duties?: Array<{ id: string; name: string; category?: string }>;
  /** Additional stats to show in the bottom row */
  stats?: Array<{ label: string; value: string | number }>;
}

const KIND_META: Record<string, { icon: React.ElementType; color: string }> = {
  holding:    { icon: Building2, color: 'var(--text-secondary, #334155)' },
  agency:     { icon: Briefcase, color: 'var(--accent, #2575FC)' },
  advertiser: { icon: Award,     color: 'var(--violet, #8B5CF6)' },
};

export function OrgListItem({
  id,
  name,
  logoUrl,
  type,
  kind = 'agency',
  location,
  parentName,
  verified,
  teamCount,
  typeBadgeVariant = 'secondary',
  children,
  searchQuery,
  showOrgChart = true,
  duties,
  stats,
}: OrgListItemProps) {
  const meta = KIND_META[kind] || KIND_META.agency;
  const KindIcon = meta.icon;
  const locationStr = [location?.city, location?.state].filter(Boolean).join(', ');

  return (
    <Link
      href={`/companies/${id}`}
      className="group flex flex-col text-left bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Header: logo + name + meta */}
      <div className="flex items-center gap-3.5">
        <CompanyLogo
          logoUrl={logoUrl}
          companyName={name}
          size="lg"
          className="flex-shrink-0 w-11 h-11 rounded-xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-extrabold tracking-tight text-[#0B1220] dark:text-[#EAF0FF] group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors truncate">
              {searchQuery ? (
                <SearchHighlight
                  text={name}
                  searchTerm={searchQuery}
                  highlightClassName="bg-[#2575FC]/20 text-[#2575FC] px-0.5 rounded font-extrabold"
                />
              ) : (
                name
              )}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold"
              style={{ color: meta.color, borderColor: 'var(--border-strong, #D7DEEA)' }}
            >
              <KindIcon className="w-3 h-3" />
              {type}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#64748B] dark:text-[#9AA7C2] flex-wrap">
            {parentName && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {parentName}
              </span>
            )}
            {parentName && locationStr && <span className="opacity-50">·</span>}
            {locationStr && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {searchQuery ? (
                  <SearchHighlight
                    text={locationStr}
                    searchTerm={searchQuery}
                    highlightClassName="bg-[#2575FC]/20 text-[#2575FC] px-0.5 rounded font-medium"
                  />
                ) : (
                  locationStr
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Discipline chips — the primary signal */}
      {duties && duties.length > 0 && (
        <div className="mt-3">
          <DisciplineChipList duties={duties} max={4} size="sm" />
        </div>
      )}

      {/* Children (client team chips etc) */}
      {children}

      {/* Stats row */}
      {stats && stats.length > 0 && (
        <div className="flex gap-5 mt-3 pt-3 border-t border-[#E6EAF2] dark:border-[#22304A]">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[15px] font-extrabold text-[#0B1220] dark:text-[#EAF0FF] tabular-nums">
                {s.value}
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#9AA7C2] mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </Link>
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
          </div>
        ))}
        {items.length > maxVisible && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs text-primary font-medium hover:underline"
          >
            {expanded ? 'Show less' : `+${items.length - maxVisible} more`}
          </button>
        )}
      </div>
    </div>
  );
}
