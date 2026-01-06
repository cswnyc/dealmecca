'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { GradientPillTabs } from '@/components/ui/GradientPillTabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { QuickStatsCard } from '@/components/organizations/QuickStatsCard';
import { TopLocationsCard } from '@/components/organizations/TopLocationsCard';
import { SuggestEditCardGradient } from '@/components/organizations/SuggestEditCardGradient';
import { HoldingCompanyAgencyRow } from '@/components/organizations/HoldingCompanyAgencyRow';
import { AgencyBranchRow } from '@/components/organizations/AgencyBranchRow';
import {
  Building2,
  MapPin,
  Users,
  Search,
  X
} from 'lucide-react';

interface Subsidiary {
  id: string;
  name: string;
  logoUrl?: string;
  companyType: string;
  agencyType?: string;
  verified: boolean;
  city?: string;
  state?: string;
  country?: string;
  _count?: {
    contacts: number;
    subsidiaries?: number;
  };
  subsidiaries?: Subsidiary[];
  Team?: Array<{
    id: string;
    clientCompany: {
      id: string;
      name: string;
      logoUrl?: string;
      verified: boolean;
    };
  }>;
  CompanyDuty?: Array<{
    duty: {
      id: string;
      name: string;
    };
  }>;
}

interface HoldingCompanyViewProps {
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    description?: string;
    companyType: string;
    subsidiaries: Subsidiary[];
    parentCompany?: {
      id: string;
      name: string;
      logoUrl?: string;
      companyType: string;
    };
    parentChain?: Array<{
      id: string;
      name: string;
      logoUrl?: string;
      companyType: string;
    }>;
    _count?: {
      contacts: number;
      subsidiaries: number;
    };
  };
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'company' | 'team' | 'businessLine' | 'contact' | 'forumPost' | 'event' | 'forumCategory';
  category: string;
  icon: string;
  metadata?: {
    verified?: boolean;
    location?: string;
    description?: string;
    slug?: string;
  };
}

export function MediaHoldingCompanyView({ company }: HoldingCompanyViewProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'agencies' | 'intel' | 'overview'>('agencies');
  const [searchQuery, setSearchQuery] = useState('');

  // Global search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (globalSearchQuery.length < 2) {
        setSearchSuggestions([]);
        setShowSearchResults(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(globalSearchQuery)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setSearchSuggestions(data.suggestions || []);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [globalSearchQuery]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSearchResults(false);
    setGlobalSearchQuery('');

    if (suggestion.type === 'company') {
      router.push(`/companies/${suggestion.id}`);
    } else if (suggestion.type === 'contact') {
      router.push(`/people/${suggestion.id}`);
    } else if (suggestion.type === 'forumPost') {
      router.push(`/forum/post/${suggestion.id}`);
    } else if (suggestion.type === 'event') {
      router.push(`/events/${suggestion.id}`);
    } else if (suggestion.type === 'forumCategory' && suggestion.metadata?.slug) {
      router.push(`/forum/${suggestion.metadata.slug}`);
    }
  };

  // Use subsidiaries as networks, and their nested subsidiaries as branches
  const agencyNetworks = company.subsidiaries;

  // Calculate stats
  const subsidiaryStats = company.subsidiaries.reduce((acc, sub) => {
    const peopleCount = sub._count?.contacts || 0;
    acc.totalPeople += peopleCount;

    const location = sub.city && sub.state ? `${sub.city}, ${sub.state}` : 'Unknown';
    if (!acc.locationCounts[location]) {
      acc.locationCounts[location] = 0;
    }
    acc.locationCounts[location] += peopleCount;

    return acc;
  }, { totalPeople: 0, locationCounts: {} as Record<string, number> });

  const topLocations = Object.entries(subsidiaryStats.locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count: `${count} people` }));

  // Filter agencies based on search
  const filteredAgencies = searchQuery.trim()
    ? agencyNetworks.filter(agency =>
        agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agency.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agency.state?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agencyNetworks;

  // Determine if this is an agency network (ALL subsidiaries have no sub-subsidiaries)
  // vs a holding company (subsidiaries have their own subsidiaries/branches)
  const hasSubsidiariesWithBranches = agencyNetworks.some(sub => 
    sub.subsidiaries && sub.subsidiaries.length > 0
  );
  const isAgencyNetwork = !hasSubsidiariesWithBranches && agencyNetworks.some(sub => 
    sub.Team && sub.Team.length > 0
  );

  // Transform agencies into the row format
  const agencyRowData = filteredAgencies.map(agency => ({
    id: agency.id,
    name: agency.name,
    logoUrl: agency.logoUrl,
    verified: agency.verified,
    branches: (agency.subsidiaries || []).map(sub => ({
      id: sub.id,
      name: sub.name
    })),
    totalBranches: agency._count?.subsidiaries || agency.subsidiaries?.length || 0,
    lastActivity: '23 hrs'
  }));

  // Transform branches into the row format (with their teams) - for agency networks
  const branchRowData = filteredAgencies.map(branch => {
    const teams = (branch.Team || []).map(team => ({
      id: team.clientCompany.id,
      name: team.clientCompany.name,
      logoUrl: team.clientCompany.logoUrl,
      color: '#2575FC'
    }));
    
    return {
      id: branch.id,
      name: branch.name,
      teams,
      peopleCount: branch._count?.contacts || 0,
      lastActivity: '23 hrs'
    };
  });

  return (
    <div className="min-h-screen bg-surface-light dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-[#E6EAF2] dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/organizations" className="hover:text-foreground transition-colors">
                Agencies
              </Link>
              {company.parentChain && company.parentChain.length > 0 && (
                <>
                  {company.parentChain.map((parent) => (
                    <span key={parent.id} className="flex items-center gap-2">
                      <span>›</span>
                      <Link href={`/companies/${parent.id}`} className="hover:text-foreground transition-colors">
                        {parent.name}
                      </Link>
                    </span>
                  ))}
                </>
              )}
              <span>›</span>
              <span className="text-foreground font-medium">{company.name}</span>
            </div>

            {/* Company Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <CompanyLogo
                  logoUrl={company.logoUrl}
                  companyName={company.name}
                  size="lg"
                  className="flex-shrink-0 w-16 h-16"
                />
                <div>
                  <h1 className="text-3xl font-bold text-brand-ink dark:text-white mb-2">{company.name}</h1>
                  {company.description && (
                    <p className="text-muted-foreground mb-3">{company.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{company.subsidiaries.length} {company.subsidiaries.length === 1 ? 'agency' : 'agencies'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{subsidiaryStats.totalPeople} people</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{topLocations.length} locations</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Global Search */}
              <div className="relative w-full sm:w-80" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search companies, people..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  onFocus={() => globalSearchQuery.length >= 2 && setShowSearchResults(true)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => {
                      setGlobalSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-surface rounded-lg shadow-2xl border border-border dark:border-dark-border max-h-96 overflow-y-auto z-[100]">
                    {searchLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary mx-auto"></div>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <div className="py-2">
                        {searchSuggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.type}-${suggestion.id}`}
                            onClick={() => handleSearchSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 hover:bg-surface-subtle dark:hover:bg-dark-surfaceAlt flex items-start gap-3 text-left transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-surface-subtle dark:bg-dark-surfaceAlt rounded-lg text-lg overflow-hidden">
                              {suggestion.icon.startsWith('http') ? (
                                <img
                                  src={suggestion.icon}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.textContent = suggestion.type === 'company' ? '🏢' : '👤';
                                  }}
                                />
                              ) : (
                                suggestion.icon
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground truncate">
                                  {suggestion.title}
                                </span>
                                {suggestion.metadata?.verified && (
                                  <span className="flex-shrink-0 text-xs bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-0.5 rounded-full">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                                {suggestion.metadata?.location && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">{suggestion.metadata.location}</span>
                                  </>
                                )}
                              </div>
                              {suggestion.metadata?.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {suggestion.metadata.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : globalSearchQuery.length >= 2 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No results found for "{globalSearchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-border dark:border-dark-border pt-4">
              <GradientPillTabs
                tabs={[
                  { id: 'agencies', label: 'Agencies', count: company.subsidiaries.length },
                  { id: 'intel', label: 'Intel' },
                  { id: 'overview', label: 'Overview' }
                ]}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as 'agencies' | 'intel' | 'overview')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'agencies' && (
              <div>
                {/* Search Bar */}
                <div className="mb-6">
                  <SearchInput
                    placeholder="Search agencies..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>

                {/* Agencies/Branches List */}
                <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E6EAF2] dark:border-dark-border">
                    <h2 className="text-lg font-bold text-[#162B54] dark:text-[#EAF0FF]">
                      {isAgencyNetwork ? 'Branch Locations' : 'Agency Directory'}
                    </h2>
                    <p className="text-sm text-[#64748B] dark:text-[#9AA7C2] mt-1">
                      {isAgencyNetwork 
                        ? `Explore ${company.name}'s locations and their teams`
                        : `Discover and connect with ${company.name}'s agencies`
                      }
                    </p>
                  </div>
                  <div className="divide-y divide-[#E6EAF2] dark:divide-dark-border">
                    {isAgencyNetwork ? (
                      branchRowData.map((branch) => (
                        <AgencyBranchRow key={branch.id} branch={branch} />
                      ))
                    ) : (
                      agencyRowData.map((agency) => (
                        <HoldingCompanyAgencyRow key={agency.id} agency={agency} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intel' && (
              <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E6EAF2] dark:border-dark-border">
                  <h2 className="text-lg font-bold text-[#162B54] dark:text-[#EAF0FF]">Intel</h2>
                  <p className="text-sm text-[#64748B] dark:text-[#9AA7C2] mt-1">Latest news and updates</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">Coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-4">
                {company.description && (
                  <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#E6EAF2] dark:border-dark-border">
                      <h2 className="text-lg font-bold text-[#162B54] dark:text-[#EAF0FF]">About</h2>
                      <p className="text-sm text-[#64748B] dark:text-[#9AA7C2] mt-1">Company overview</p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-[#162B54] dark:text-[#EAF0FF] whitespace-pre-wrap">{company.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Suggest Edit Panel */}
            <SuggestEditCardGradient />

            {/* Quick Stats */}
            <QuickStatsCard
              stats={[
                { label: 'Agencies', value: company.subsidiaries.length },
                { label: 'People', value: subsidiaryStats.totalPeople },
                { label: 'Locations', value: topLocations.length }
              ]}
            />

            {/* Top Locations */}
            {topLocations.length > 0 && (
              <TopLocationsCard locations={topLocations} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
