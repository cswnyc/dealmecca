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
  X
} from 'lucide-react';

interface SubsidiaryLocation {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  _count?: {
    contacts: number;
  };
}

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
  subsidiaries?: SubsidiaryLocation[];
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

export function BasicHoldingCompanyView({ company }: HoldingCompanyViewProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'agencies' | 'intel' | 'overview'>('agencies');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSuggestEditExpanded, setIsSuggestEditExpanded] = useState(false);
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());

  // Global search functionality
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
    } else if (suggestion.type === 'event') {
      router.push(`/events/${suggestion.metadata?.slug || suggestion.id}`);
    } else if (suggestion.type === 'forumPost') {
      router.push(`/forum/${suggestion.metadata?.slug || suggestion.id}`);
    }
  };

  const toggleAgencyLocations = (agencyId: string) => {
    setExpandedAgencies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agencyId)) {
        newSet.delete(agencyId);
      } else {
        newSet.add(agencyId);
      }
      return newSet;
    });
  };

  // Helper function to get location emoji
  const getLocationEmoji = (country?: string) => {
    const emojiMap: Record<string, string> = {
      'United States': '🇺🇸',
      'USA': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'UK': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Belgium': '🇧🇪',
      'Switzerland': '🇨🇭',
      'Singapore': '🇸🇬',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'Argentina': '🇦🇷',
      'South Africa': '🇿🇦'
    };
    return emojiMap[country || ''] || '🌍';
  };

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
                Agencies
              </Link>
              {company.parentChain && company.parentChain.length > 0 && (
                <>
                  {company.parentChain.map((parent) => (
                    <span key={parent.id} className="flex items-center gap-2">
                      <span>›</span>
                      <Link href={`/companies/${parent.id}`} className="hover:text-gray-900">
                        {parent.name}
                      </Link>
                    </span>
                  ))}
                </>
              )}
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
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Holding Company
                    </Badge>
                  </div>
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
              {/* Global Search */}
              <div className="w-96 relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies, people, events..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchSuggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => handleSearchSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                            {suggestion.icon.startsWith('http') ? (
                              <img
                                src={suggestion.icon}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.textContent = '🏢';
                                }}
                              />
                            ) : (
                              <span className="text-lg">{suggestion.icon}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900 truncate">{suggestion.title}</p>
                              {suggestion.metadata?.verified && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{suggestion.category}</p>
                            {suggestion.metadata?.location && (
                              <p className="text-xs text-gray-400 mt-1">{suggestion.metadata.location}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showSearchResults && searchSuggestions.length === 0 && !searchLoading && globalSearchQuery.length >= 2 && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                    <p className="text-sm text-gray-500 text-center">No results found</p>
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
                      All Agencies ({company.subsidiaries.length})
                    </h2>
                  </div>

                  {company.subsidiaries.map((agency) => (
                    <div key={agency.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Agency Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <CompanyLogo
                              logoUrl={agency.logoUrl}
                              companyName={agency.name}
                              size="md"
                              className="flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/companies/${agency.id}`}
                                  className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  {agency.name}
                                </Link>
                                {agency.verified && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Verified
                                  </Badge>
                                )}
                              </div>

                              {/* Locations */}
                              {agency.subsidiaries && agency.subsidiaries.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex flex-wrap items-center gap-2 text-sm">
                                    {(expandedAgencies.has(agency.id)
                                      ? agency.subsidiaries
                                      : agency.subsidiaries.slice(0, 4)
                                    ).map((location, idx) => {
                                      const locationName = location.name || [location.city, location.state].filter(Boolean).join(', ') || location.country || 'Unknown';
                                      return (
                                        <Link
                                          key={location.id}
                                          href={`/companies/${location.id}`}
                                          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                          <span>{getLocationEmoji(location.country)}</span>
                                          <span>{locationName}</span>
                                          {idx < (expandedAgencies.has(agency.id) ? agency.subsidiaries!.length - 1 : Math.min(3, agency.subsidiaries!.length - 1)) && (
                                            <span className="text-gray-400">,</span>
                                          )}
                                        </Link>
                                      );
                                    })}
                                    {agency.subsidiaries.length > 4 && (
                                      <button
                                        onClick={() => toggleAgencyLocations(agency.id)}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                      >
                                        {expandedAgencies.has(agency.id)
                                          ? 'Hide branches'
                                          : `+${agency.subsidiaries.length - 4} branches`
                                        }
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Last activity */}
                              <div className="mt-3 text-xs text-gray-500">
                                Last activity: 1 day
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/companies/${agency.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {company.subsidiaries.length === 0 && (
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
            {/* Suggest Edit Panel - Now First */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsSuggestEditExpanded(!isSuggestEditExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Suggest an edit
                    </h3>
                    {!isSuggestEditExpanded && (
                      <p className="text-xs text-gray-600">Click to expand</p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform ${
                    isSuggestEditExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isSuggestEditExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  <p className="text-xs text-gray-600">
                    Know agencies or people we're missing?
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-start gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="mt-1 rounded" />
                      <span>Missing agencies</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="mt-1 rounded" />
                      <span>Missing people</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="mt-1 rounded" />
                      <span>Wrong information</span>
                    </label>
                  </div>

                  <textarea
                    placeholder="Write your suggestions here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none bg-white"
                    rows={4}
                  />

                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm font-medium">
                    Submit
                  </button>
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
