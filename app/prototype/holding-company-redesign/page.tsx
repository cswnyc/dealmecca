'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Building2, MapPin, Users, Edit3, Plus, CheckCircle, ExternalLink } from 'lucide-react';

/**
 * Holding Company Page Redesign Prototype
 *
 * Based on SellerCrowd's comprehensive agency list design
 * Shows all agencies/subsidiaries with their teams and people
 */

export default function HoldingCompanyRedesignPrototype() {
  const [activeTab, setActiveTab] = useState<'agencies' | 'intel' | 'overview'>('agencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());

  // Sample data for WPP holding company
  const holdingCompany = {
    name: 'WPP',
    logoUrl: null,
    description: 'Global leader in marketing and communications services',
    agencyCount: 12,
    peopleCount: 245,
    locationsCount: 28
  };

  // Sample agencies data with locations
  const agencies = [
    {
      id: '1',
      name: 'Publicis Media',
      logoUrl: null,
      peopleCount: 67,
      locations: [
        { city: 'New York', state: 'NY', peopleCount: 23 },
        { city: 'Chicago', state: 'IL', peopleCount: 18 },
        { city: 'Los Angeles', state: 'CA', peopleCount: 15 },
        { city: 'San Francisco', state: 'CA', peopleCount: 11 }
      ]
    },
    {
      id: '2',
      name: 'Starcom Worldwide',
      logoUrl: null,
      peopleCount: 54,
      locations: [
        { city: 'Chicago', state: 'IL', peopleCount: 28 },
        { city: 'New York', state: 'NY', peopleCount: 18 },
        { city: 'Detroit', state: 'MI', peopleCount: 8 }
      ]
    },
    {
      id: '3',
      name: 'Spark Foundry',
      logoUrl: null,
      peopleCount: 42,
      locations: [
        { city: 'New York', state: 'NY', peopleCount: 22 },
        { city: 'Chicago', state: 'IL', peopleCount: 12 },
        { city: 'Miami', state: 'FL', peopleCount: 8 }
      ]
    },
    {
      id: '4',
      name: 'Publicis North America',
      logoUrl: null,
      peopleCount: 89,
      locations: [
        { city: 'New York', state: 'NY', peopleCount: 45 },
        { city: 'Los Angeles', state: 'CA', peopleCount: 22 },
        { city: 'Seattle', state: 'WA', peopleCount: 14 },
        { city: 'Austin', state: 'TX', peopleCount: 8 }
      ]
    },
    {
      id: '5',
      name: 'Digitas',
      logoUrl: null,
      peopleCount: 38,
      locations: [
        { city: 'Boston', state: 'MA', peopleCount: 27 },
        { city: 'Atlanta', state: 'GA', peopleCount: 11 }
      ]
    },
    {
      id: '6',
      name: 'Zenith',
      logoUrl: null,
      peopleCount: 31,
      locations: [
        { city: 'London', state: 'UK', peopleCount: 19 },
        { city: 'New York', state: 'NY', peopleCount: 12 }
      ]
    },
    {
      id: '7',
      name: 'Performics',
      logoUrl: null,
      peopleCount: 24,
      locations: [
        { city: 'Chicago', state: 'IL', peopleCount: 12 },
        { city: 'Dallas', state: 'TX', peopleCount: 12 }
      ]
    },
    {
      id: '8',
      name: 'Saatchi & Saatchi X',
      logoUrl: null,
      peopleCount: 28,
      locations: [
        { city: 'New York', state: 'NY', peopleCount: 14 },
        { city: 'Bentonville', state: 'AR', peopleCount: 14 }
      ]
    },
    {
      id: '9',
      name: 'Publicis Luxe',
      logoUrl: null,
      peopleCount: 16,
      locations: [
        { city: 'Paris', state: 'France', peopleCount: 8 },
        { city: 'New York', state: 'NY', peopleCount: 8 }
      ]
    },
    {
      id: '10',
      name: 'Publicis Commerce',
      logoUrl: null,
      peopleCount: 45,
      locations: [
        { city: 'New York', state: 'NY', peopleCount: 16 },
        { city: 'Seattle', state: 'WA', peopleCount: 13 },
        { city: 'Bentonville', state: 'AR', peopleCount: 10 },
        { city: 'Minneapolis', state: 'MN', peopleCount: 6 }
      ]
    }
  ];

  // Sample intel posts
  const intelPosts = [
    {
      id: '1',
      title: 'Publicis Media wins major automotive account',
      agency: 'Publicis Media',
      date: '2 days ago',
      tags: ['New Business', 'Automotive'],
      excerpt: 'Major automotive brand selects Publicis Media as their media agency of record...'
    },
    {
      id: '2',
      title: 'Starcom launches new retail media practice',
      agency: 'Starcom Worldwide',
      date: '5 days ago',
      tags: ['Product Launch', 'Retail Media'],
      excerpt: 'Starcom announces expansion into retail media with dedicated practice group...'
    },
    {
      id: '3',
      title: 'Digitas appoints new Chief Strategy Officer',
      agency: 'Digitas',
      date: '1 week ago',
      tags: ['Leadership', 'Appointments'],
      excerpt: 'Industry veteran joins Digitas to lead global strategy efforts...'
    },
    {
      id: '4',
      title: 'Publicis Commerce expands Amazon services',
      agency: 'Publicis Commerce',
      date: '1 week ago',
      tags: ['E-commerce', 'Amazon'],
      excerpt: 'New suite of Amazon advertising and optimization services launched...'
    },
    {
      id: '5',
      title: 'Zenith wins pharmaceutical media review',
      agency: 'Zenith',
      date: '2 weeks ago',
      tags: ['New Business', 'Healthcare'],
      excerpt: 'Top pharmaceutical company consolidates media with Zenith...'
    }
  ];

  const toggleAgency = (agencyId: string) => {
    const newExpanded = new Set(expandedAgencies);
    if (newExpanded.has(agencyId)) {
      newExpanded.delete(agencyId);
    } else {
      newExpanded.add(agencyId);
    }
    setExpandedAgencies(newExpanded);
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.locations.some(loc =>
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
                Home
              </Link>
              <span>›</span>
              <Link href="/organizations/holding-companies" className="hover:text-gray-900">
                Holding Companies
              </Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">{holdingCompany.name}</span>
            </div>

            {/* Company Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {holdingCompany.name[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{holdingCompany.name}</h1>
                  <p className="text-gray-600 mb-3">{holdingCompany.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{holdingCompany.agencyCount} agencies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{holdingCompany.peopleCount} people</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{holdingCompany.locationsCount} locations</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Agency
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t pt-4">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('agencies')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'agencies'
                      ? 'bg-white text-blue-600 border-t-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Agencies
                </button>
                <button
                  onClick={() => setActiveTab('intel')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'intel'
                      ? 'bg-white text-blue-600 border-t-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Intel
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-white text-blue-600 border-t-2 border-blue-600'
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
                      placeholder="Search agencies, teams, or locations..."
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

                  {filteredAgencies.map((agency) => (
                    <div key={agency.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Agency Header */}
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleAgency(agency.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                              {agency.name[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {agency.name}
                                </h3>
                                <button
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAgency(agency.id);
                                  }}
                                >
                                  <svg
                                    className={`h-5 w-5 text-gray-500 transition-transform ${
                                      expandedAgencies.has(agency.id) ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{agency.locations.length} {agency.locations.length === 1 ? 'location' : 'locations'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{agency.peopleCount} people</span>
                                </div>
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

                      {/* Expandable Locations */}
                      {expandedAgencies.has(agency.id) && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4">Locations</h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {agency.locations.map((location, locIndex) => (
                              <Link
                                key={locIndex}
                                href={`/companies/${agency.id}/locations/${locIndex}`}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {location.city}, {location.state}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">{location.peopleCount} people</span>
                                  <ExternalLink className="h-4 w-4 text-gray-400" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

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
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Intel & News ({intelPosts.length})
                  </h2>
                  <p className="text-sm text-gray-600">
                    Latest posts, news, and updates related to agencies in this holding company
                  </p>
                </div>

                <div className="space-y-4">
                  {intelPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link
                            href={`/intel/${post.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                            <span className="font-medium text-blue-600">{post.agency}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{post.excerpt}</p>

                      <div className="flex items-center gap-2">
                        {post.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {intelPosts.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No intel posts available yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Overview coming soon</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Suggest Edit Panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Suggest an edit for this company
                  </h3>
                  <p className="text-xs text-gray-600">
                    • Any of the info above seems wrong?
                  </p>
                  <p className="text-xs text-gray-600">
                    • Know people we're missing?
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span>Wrong info / Incorrect agency</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span>Missing people</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span>Incorrect relationships</span>
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

              <p className="text-xs text-gray-500 text-center mt-3">
                🎉 Thanks for helping us improve!
              </p>
            </div>

            {/* Company Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Agencies</span>
                  <span className="font-semibold text-gray-900">{holdingCompany.agencyCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total People</span>
                  <span className="font-semibold text-gray-900">{holdingCompany.peopleCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Locations</span>
                  <span className="font-semibold text-gray-900">{holdingCompany.locationsCount}</span>
                </div>
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Top Locations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">New York, NY</span>
                  </div>
                  <span className="text-gray-600">67 people</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">Chicago, IL</span>
                  </div>
                  <span className="text-gray-600">45 people</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">London, UK</span>
                  </div>
                  <span className="text-gray-600">32 people</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">Boston, MA</span>
                  </div>
                  <span className="text-gray-600">28 people</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
