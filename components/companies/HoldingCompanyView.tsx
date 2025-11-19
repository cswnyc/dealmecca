'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Lightbulb
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
  };
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

export function HoldingCompanyView({ company }: HoldingCompanyViewProps) {
  const [activeTab, setActiveTab] = useState<'agencies' | 'intel' | 'overview'>('agencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());

  const toggleAgency = (agencyId: string) => {
    const newExpanded = new Set(expandedAgencies);
    if (newExpanded.has(agencyId)) {
      newExpanded.delete(agencyId);
    } else {
      newExpanded.add(agencyId);
    }
    setExpandedAgencies(newExpanded);
  };

  // Get location info for an agency
  // For now, each agency is in one location (its city/state)
  // This function returns empty array since we don't have multi-location agencies yet
  const getAgencyLocations = (agency: Subsidiary) => {
    // Future: When agencies have multiple office locations,
    // we can group by location and show them here
    return [];
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

  const filteredAgencies = company.subsidiaries.filter(agency =>
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Link
                href={`/admin/orgs/companies/${company.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Link>
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
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search agencies or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Agencies List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      All Agencies ({filteredAgencies.length})
                    </h2>
                  </div>

                  {filteredAgencies.map((agency) => {
                    const locations = getAgencyLocations(agency);
                    const isExpanded = expandedAgencies.has(agency.id);
                    const hasMultipleLocations = locations.length > 1;

                    return (
                      <div key={agency.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {/* Agency Header */}
                        <div
                          className={`p-6 ${hasMultipleLocations ? 'cursor-pointer' : ''}`}
                          onClick={() => hasMultipleLocations && toggleAgency(agency.id)}
                        >
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
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {agency.name}
                                  </h3>
                                  {agency.verified && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      Verified
                                    </Badge>
                                  )}
                                  {hasMultipleLocations && (
                                    <ChevronDown
                                      className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  {hasMultipleLocations ? (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{locations.length} locations</span>
                                    </div>
                                  ) : agency.city && agency.state && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{agency.city}, {agency.state}</span>
                                    </div>
                                  )}
                                  {agency._count && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      <span>{agency._count.contacts} {agency._count.contacts === 1 ? 'person' : 'people'}</span>
                                    </div>
                                  )}
                                  {agency.agencyType && (
                                    <Badge variant="outline" className="text-xs">
                                      {agency.agencyType.replace(/_/g, ' ')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/companies/${agency.id}`}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Locations Section (Expandable) */}
                        {isExpanded && hasMultipleLocations && (
                          <div className="px-6 pb-6 pt-0">
                            <h4 className="font-semibold text-gray-900 mb-4">Locations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {locations.map((loc) => (
                                <div
                                  key={loc.location}
                                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-gray-900">{loc.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">
                                        {loc.count} {loc.count === 1 ? 'person' : 'people'}
                                      </span>
                                      <ExternalLink className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredAgencies.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No agencies found matching your search</p>
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

            {/* Suggest Edit Panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Suggest an edit
                  </h3>
                  <p className="text-xs text-gray-600">
                    Know agencies or people we're missing?
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 resize-none"
                rows={4}
              />

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
