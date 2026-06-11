'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { DisciplineChip } from '@/components/ui/DisciplineChip';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Calendar, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  DISCIPLINE_KEYS,
  DISCIPLINE_LABELS,
  DISCIPLINE_COLORS,
  getDisciplineKey,
  getCompanyTypeLabel,
  type DisciplineKey,
} from '@/lib/labels';

interface Partnership {
  id: string;
  relationshipType?: string;
  isAOR?: boolean;
  startDate?: string | null;
  isActive: boolean;
  partner: {
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
    industry?: string;
    agencyType?: string;
    verified: boolean;
  };
  partnerRole: 'agency' | 'advertiser';
  agency?: {
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
    verified: boolean;
  };
  contacts?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    title?: string;
    email?: string;
    verified: boolean;
  }>;
  contactRoles?: Array<{
    contactId: string;
    role?: string;
    isPrimary: boolean;
    dutyId?: string | null;
    duty?: { id: string; name: string; category: string } | null;
  }>;
  duties?: Array<{ id: string; name: string; category: string }>;
}

interface AgencyRosterByDisciplineProps {
  partnerships: Partnership[];
  advertiserName: string;
}

interface DisciplineGroup {
  discipline: DisciplineKey;
  partnerships: Partnership[];
}

export function AgencyRosterByDiscipline({
  partnerships,
  advertiserName,
}: AgencyRosterByDisciplineProps) {
  const [activeDisciplineFilter, setActiveDisciplineFilter] = useState<DisciplineKey | 'all'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Group partnerships by discipline
  const { groups, untagged } = useMemo(() => {
    const grouped = new Map<DisciplineKey, Partnership[]>();
    const untaggedList: Partnership[] = [];

    for (const p of partnerships) {
      if (p.partnerRole !== 'agency') continue;

      const partnershipDisciplines = new Set<DisciplineKey>();

      // Check PartnershipDuty (partnership-level disciplines)
      if (p.duties && p.duties.length > 0) {
        for (const duty of p.duties) {
          const dk = getDisciplineKey(duty.name);
          if (dk) partnershipDisciplines.add(dk);
        }
      }

      // Also check contact-level duties as a fallback
      if (partnershipDisciplines.size === 0 && p.contactRoles) {
        for (const cr of p.contactRoles) {
          if (cr.duty) {
            const dk = getDisciplineKey(cr.duty.name);
            if (dk) partnershipDisciplines.add(dk);
          }
        }
      }

      if (partnershipDisciplines.size === 0) {
        untaggedList.push(p);
      } else {
        for (const dk of partnershipDisciplines) {
          if (!grouped.has(dk)) grouped.set(dk, []);
          grouped.get(dk)!.push(p);
        }
      }
    }

    // Build groups in the canonical discipline order
    const orderedGroups: DisciplineGroup[] = DISCIPLINE_KEYS
      .filter(dk => grouped.has(dk))
      .map(dk => ({ discipline: dk, partnerships: grouped.get(dk)! }));

    return { groups: orderedGroups, untagged: untaggedList };
  }, [partnerships]);

  // Filter
  const visibleGroups = activeDisciplineFilter === 'all'
    ? groups
    : groups.filter(g => g.discipline === activeDisciplineFilter);

  const showUntagged = activeDisciplineFilter === 'all' && untagged.length > 0;

  // All disciplines that appear (for filter chips)
  const activeDisciplines = useMemo(() => groups.map(g => g.discipline), [groups]);

  // Empty discipline rows (disciplines with no agency on file)
  const emptyDisciplines = useMemo(() => {
    if (activeDisciplineFilter !== 'all') return [];
    const covered = new Set(groups.map(g => g.discipline));
    return DISCIPLINE_KEYS.filter(dk => !covered.has(dk));
  }, [groups, activeDisciplineFilter]);

  const agencyPartnerships = partnerships.filter(p => p.partnerRole === 'agency');

  if (agencyPartnerships.length === 0 && activeDisciplineFilter === 'all') {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">No agency relationships on file yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Agency Roster
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Agencies working with {advertiserName}, grouped by discipline
        </p>
      </div>

      {/* Discipline filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveDisciplineFilter('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeDisciplineFilter === 'all'
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({agencyPartnerships.length})
        </button>
        {DISCIPLINE_KEYS.map(dk => {
          const count = groups.find(g => g.discipline === dk)?.partnerships.length || 0;
          const isActive = activeDisciplineFilter === dk;
          const colors = DISCIPLINE_COLORS[dk];
          return (
            <button
              key={dk}
              onClick={() => setActiveDisciplineFilter(isActive ? 'all' : dk)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                isActive
                  ? `${colors.bg} ${colors.text} ${colors.border} ${colors.darkBg} ${colors.darkText}`
                  : count > 0
                    ? 'bg-muted text-muted-foreground hover:text-foreground border-transparent'
                    : 'bg-transparent text-muted-foreground/50 border-dashed border-border cursor-default'
              }`}
              disabled={count === 0 && !isActive}
            >
              {DISCIPLINE_LABELS[dk]} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Discipline groups */}
      <div className="space-y-4">
        {visibleGroups.map(group => (
          <DisciplineGroupCard
            key={group.discipline}
            group={group}
            expandedRows={expandedRows}
            onToggleRow={(id) => {
              setExpandedRows(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
          />
        ))}

        {/* Empty discipline rows */}
        {emptyDisciplines.map(dk => (
          <div
            key={dk}
            className="border border-dashed border-border dark:border-dark-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <DisciplineChip name={dk} size="md" variant="outline" />
              <span className="text-sm text-muted-foreground">
                No agency on file
              </span>
            </div>
          </div>
        ))}

        {/* Untagged partnerships */}
        {showUntagged && (
          <div className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/50 dark:bg-muted/20 border-b border-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Other agencies (no discipline tagged)
                </span>
                <span className="text-xs text-muted-foreground">
                  ({untagged.length})
                </span>
              </div>
            </div>
            <div className="divide-y divide-border dark:divide-dark-border">
              {untagged.map(p => (
                <AgencyRow key={p.id} partnership={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DisciplineGroupCard({
  group,
  expandedRows,
  onToggleRow,
}: {
  group: DisciplineGroup;
  expandedRows: Set<string>;
  onToggleRow: (id: string) => void;
}) {
  return (
    <div className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
      {/* Group header */}
      <div className="px-4 py-3 bg-muted/30 dark:bg-muted/10 border-b border-border dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DisciplineChip name={group.discipline} size="md" />
            <span className="text-sm text-muted-foreground">
              {group.partnerships.length} {group.partnerships.length === 1 ? 'agency' : 'agencies'}
            </span>
          </div>
        </div>
      </div>

      {/* Agency rows */}
      <div className="divide-y divide-border dark:divide-dark-border">
        {group.partnerships.map(p => (
          <AgencyRow
            key={p.id}
            partnership={p}
            discipline={group.discipline}
            isExpanded={expandedRows.has(p.id)}
            onToggle={() => onToggleRow(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AgencyRow({
  partnership,
  discipline,
  isExpanded,
  onToggle,
}: {
  partnership: Partnership;
  discipline?: DisciplineKey;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const agency = partnership.partner;
  const startYear = partnership.startDate
    ? new Date(partnership.startDate).getFullYear()
    : null;

  // Find handling contact for this discipline
  const handlingContact = useMemo(() => {
    if (!discipline || !partnership.contactRoles) return null;
    const match = partnership.contactRoles.find(cr => {
      if (!cr.duty) return false;
      return getDisciplineKey(cr.duty.name) === discipline;
    });
    if (!match) return null;
    return partnership.contacts?.find(c => c.id === match.contactId) || null;
  }, [partnership, discipline]);

  // Primary contact fallback
  const primaryContact = useMemo(() => {
    if (handlingContact) return null;
    const primary = partnership.contactRoles?.find(cr => cr.isPrimary);
    if (!primary) return null;
    return partnership.contacts?.find(c => c.id === primary.contactId) || null;
  }, [partnership, handlingContact]);

  const displayContact = handlingContact || primaryContact;
  const hasExpandableContent = (partnership.contacts?.length || 0) > 1;

  return (
    <div className="px-4 py-3 hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors">
      <div className="flex items-center gap-4">
        {/* Agency logo & name */}
        <Link
          href={`/companies/${agency.id}`}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <CompanyLogo
            logoUrl={agency.logoUrl}
            companyName={agency.name}
            size="sm"
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {agency.name}
              </span>
              {agency.verified && (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              )}
            </div>
            {agency.agencyType && (
              <span className="text-xs text-muted-foreground">
                {getCompanyTypeLabel(agency.agencyType)}
              </span>
            )}
          </div>
        </Link>

        {/* Lead badge */}
        {partnership.isAOR && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 text-xs flex-shrink-0">
            LEAD
          </Badge>
        )}

        {/* Since year */}
        {startYear && (
          <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
            Since {startYear}
          </span>
        )}

        {/* Handling contact */}
        {displayContact && (
          <Link
            href={`/people/${displayContact.id}`}
            className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 max-w-[200px]"
          >
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-medium">
                {displayContact.firstName?.[0]}{displayContact.lastName?.[0]}
              </span>
            </div>
            <span className="truncate">
              {displayContact.fullName || `${displayContact.firstName} ${displayContact.lastName}`}
            </span>
          </Link>
        )}

        {/* Expand toggle */}
        {hasExpandableContent && onToggle && (
          <button
            onClick={onToggle}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            {isExpanded
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />
            }
          </button>
        )}
      </div>

      {/* Expanded content - additional contacts */}
      {isExpanded && partnership.contacts && partnership.contacts.length > 1 && (
        <div className="mt-3 ml-11 space-y-2 border-l-2 border-border dark:border-dark-border pl-4">
          {partnership.contacts
            .filter(c => c.id !== displayContact?.id)
            .map(contact => {
              const role = partnership.contactRoles?.find(cr => cr.contactId === contact.id);
              return (
                <Link
                  key={contact.id}
                  href={`/people/${contact.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-medium">
                      {contact.firstName?.[0]}{contact.lastName?.[0]}
                    </span>
                  </div>
                  <span className="truncate">
                    {contact.fullName || `${contact.firstName} ${contact.lastName}`}
                  </span>
                  {contact.title && (
                    <span className="text-xs text-muted-foreground/70 truncate hidden md:inline">
                      {contact.title}
                    </span>
                  )}
                  {role?.duty && (
                    <DisciplineChip name={role.duty.name} size="sm" variant="outline" />
                  )}
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
