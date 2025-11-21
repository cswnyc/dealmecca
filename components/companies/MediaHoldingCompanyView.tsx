'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Users,
  Search,
  Plus,
  Edit3,
  ExternalLink,
  ChevronDown,
  Lightbulb,
  X,
  Bookmark,
  BookmarkCheck
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
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [expandedDuties, setExpandedDuties] = useState<Set<string>>(new Set());
  const [isSuggestEditExpanded, setIsSuggestEditExpanded] = useState(false);
  const [bookmarkedAgencies, setBookmarkedAgencies] = useState<Set<string>>(new Set());

  // Global search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const toggleAgency = (agencyId: string) => {
    const newExpanded = new Set(expandedAgencies);
    if (newExpanded.has(agencyId)) {
      newExpanded.delete(agencyId);
    } else {
      newExpanded.add(agencyId);
    }
    setExpandedAgencies(newExpanded);
  };

  const toggleTeams = (agencyId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agencyId)) {
        newSet.delete(agencyId);
      } else {
        newSet.add(agencyId);
      }
      return newSet;
    });
  };

  const toggleDuties = (agencyId: string) => {
    setExpandedDuties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agencyId)) {
        newSet.delete(agencyId);
      } else {
        newSet.add(agencyId);
      }
      return newSet;
    });
  };

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

  // Get location info for an agency
  // For now, each agency is in one location (its city/state)
  // This function returns empty array since we don't have multi-location agencies yet
  const getAgencyLocations = (agency: Subsidiary) => {
    // Future: When agencies have multiple office locations,
    // we can group by location and show them here
    return [];
  };

  // Use subsidiaries as networks, and their nested subsidiaries as branches
  const agencyNetworks = company.subsidiaries.map(sub => ({
    id: sub.id,
    name: sub.name,
    branches: sub.subsidiaries && sub.subsidiaries.length > 0 ? sub.subsidiaries : [sub],
    logo: sub.logoUrl,
  }));

  // Group subsidiaries by location and calculate stats
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
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Back Button & Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <Link href="/organizations" className="hover:text-gray-900">
                Organizations
              </Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">{company.name}</span>
            </div>

            {/* Company Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <CompanyLogo
                  logoUrl={company.logoUrl}
                  companyName={company.name}
                  size="lg"
                  className="flex-shrink-0"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                  {company.description && (
                    <p className="text-gray-600 mb-3">{company.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
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
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies, people..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  onFocus={() => globalSearchQuery.length >= 2 && setShowSearchResults(true)}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => {
                      setGlobalSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-300 max-h-96 overflow-y-auto z-[100] backdrop-blur-sm">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <div className="py-2">
                        {searchSuggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.type}-${suggestion.id}`}
                            onClick={() => handleSearchSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-lg overflow-hidden">
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
                                <span className="font-medium text-gray-900 truncate">
                                  {suggestion.title}
                                </span>
                                {suggestion.metadata?.verified && (
                                  <span className="flex-shrink-0 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{suggestion.category}</span>
                                {suggestion.metadata?.location && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-500">{suggestion.metadata.location}</span>
                                  </>
                                )}
                              </div>
                              {suggestion.metadata?.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                  {suggestion.metadata.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : globalSearchQuery.length >= 2 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No results found for "{globalSearchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t pt-4">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('agencies')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'agencies'
                      ? 'bg-gray-50 text-blue-600 border-t-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Agencies
                </button>
                <button
                  onClick={() => setActiveTab('intel')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'intel'
                      ? 'bg-gray-50 text-blue-600 border-t-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Intel
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-gray-50 text-blue-600 border-t-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'agencies' && (
              <div>
                {/* Agencies List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      All Agencies ({agencyNetworks.length})
                    </h2>
                  </div>

                  {/* Show each branch as a rich card */}
                  {company.subsidiaries.flatMap(network =>
                    (network.subsidiaries && network.subsidiaries.length > 0 ? network.subsidiaries : [network])
                  ).map((branch) => {
                    const isBookmarked = bookmarkedAgencies.has(branch.id);
                    const clients = branch.Team?.map(t => t.clientCompany).filter(Boolean) || [];
                    const visibleClients = clients.slice(0, 3);
                    const hiddenClientsCount = clients.length - visibleClients.length;
                    const duties = branch.CompanyDuty?.map(cd => cd.duty.name) || [];
                    const visibleDuties = duties.slice(0, 3);
                    const hiddenDutiesCount = duties.length - visibleDuties.length;
                    const contactCount = branch._count?.contacts || 0;
                    const locationString = branch.city && branch.state
                      ? `${branch.city}, ${branch.state}`
                      : branch.city || branch.state || '';

                    return (
                      <div key={branch.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          {/* Logo */}
                          <CompanyLogo
                            logoUrl={branch.logoUrl}
                            companyName={branch.name}
                            size="sm"
                            className="flex-shrink-0 mt-0.5"
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Agency Name */}
                            <div className="flex items-center gap-2 mb-2">
                              <Link
                                href={`/companies/${branch.id}`}
                                className="font-semibold text-gray-900 hover:text-blue-600"
                              >
                                {branch.name}
                              </Link>
                            </div>

                            {/* Clients */}
                            {clients.length > 0 && (
                              <div className="text-sm text-gray-600 mb-2 flex flex-wrap items-center gap-1">
                                {(expandedTeams.has(branch.id) ? clients : visibleClients).map((client, index) => (
                                  <span key={client.id}>
                                    <CompanyLogo
                                      logoUrl={client.logoUrl}
                                      companyName={client.name}
                                      size="xs"
                                      className="inline-block align-middle mr-1"
                                    />
                                    <Link
                                      href={`/companies/${client.id}`}
                                      className="hover:text-blue-600 hover:underline align-middle"
                                    >
                                      {client.name}
                                    </Link>
                                    {index < (expandedTeams.has(branch.id) ? clients.length - 1 : visibleClients.length - 1) && ', '}
                                  </span>
                                ))}
                                {hiddenClientsCount > 0 && (
                                  <button
                                    onClick={() => toggleTeams(branch.id)}
                                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                                  >
                                    {expandedTeams.has(branch.id)
                                      ? 'Show fewer'
                                      : `+${hiddenClientsCount} teams`
                                    }
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Duties */}
                            {duties.length > 0 && (
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Handles:</span> {(expandedDuties.has(branch.id) ? duties : visibleDuties).join(', ')}
                                {hiddenDutiesCount > 0 && (
                                  <button
                                    onClick={() => toggleDuties(branch.id)}
                                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                                  >
                                    {expandedDuties.has(branch.id)
                                      ? 'Show fewer'
                                      : `+${hiddenDutiesCount} duties`
                                    }
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Location */}
                            {locationString && (
                              <div className="text-sm text-gray-500 mb-1">
                                {locationString}
                              </div>
                            )}

                            {/* Last Activity */}
                            <div className="text-xs text-gray-400">
                              Last activity: 23 hrs
                            </div>
                          </div>

                          {/* Right side: People count and action icons */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {contactCount > 0 && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{contactCount} {contactCount === 1 ? 'person' : 'people'}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/orgs/companies/${branch.id}/edit`}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-50"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  const newBookmarked = new Set(bookmarkedAgencies);
                                  if (newBookmarked.has(branch.id)) {
                                    newBookmarked.delete(branch.id);
                                  } else {
                                    newBookmarked.add(branch.id);
                                  }
                                  setBookmarkedAgencies(newBookmarked);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-50"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="h-4 w-4 fill-current" />
                                ) : (
                                  <Bookmark className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {agencyNetworks.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No agencies found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'intel' && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Intel Coming Soon</h3>
                <p className="text-gray-600">News and updates about {company.name} agencies will appear here</p>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview Coming Soon</h3>
                <p className="text-gray-600">Detailed overview of {company.name} will appear here</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Suggest Edit Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/50 transition-colors"
                onClick={() => setIsSuggestEditExpanded(!isSuggestEditExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Suggest an edit for this company
                  </h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${isSuggestEditExpanded ? 'rotate-180' : ''}`} />
              </div>

              {!isSuggestEditExpanded && (
                <p className="px-5 pb-5 text-sm text-gray-600">
                  Click to expand
                </p>
              )}

              {isSuggestEditExpanded && (
                <div className="px-5 pb-5">
                  <div className="space-y-2 mb-4">
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-0.5" />
                      <span className="text-gray-700">Should we add or remove people?</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-0.5" />
                      <span className="text-gray-700">Are any teams no longer active?</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-0.5" />
                      <span className="text-gray-700">Are there other agencies we should add?</span>
                    </label>
                  </div>

                  <textarea
                    placeholder="Write your suggestion here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />

                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-3">
                    Submit
                  </button>

                  <p className="text-xs text-gray-600 text-center">
                    Share information with the community and obtain rewards when you do.
                  </p>
                </div>
              )}
            </div>

            {/* Company Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Agencies</span>
                  <span className="font-semibold text-gray-900">{company.subsidiaries.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total People</span>
                  <span className="font-semibold text-gray-900">{subsidiaryStats.totalPeople}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Locations</span>
                  <span className="font-semibold text-gray-900">{topLocations.length}</span>
                </div>
              </div>
            </div>

            {/* Top Locations */}
            {topLocations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Locations</h3>
                <div className="space-y-3">
                  {topLocations.map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{location}</span>
                      </div>
                      <span className="text-gray-600">{count} {count === 1 ? 'person' : 'people'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
