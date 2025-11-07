'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CapabilitiesSection } from '@/components/companies/CapabilitiesSection';
import { PartnershipCard } from '@/components/companies/PartnershipCard';
import { RelationshipGraph } from '@/components/companies/RelationshipGraph';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import {
  Building2,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Users,
  TrendingUp,
  Briefcase,
  CheckCircle,
  ExternalLink,
  Network,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ArrowLeft,
  Bookmark,
  Bell,
  Activity as ActivityIcon,
  UserPlus,
  Edit3,
  GitFork,
  ChevronDown,
  Search,
  Plus
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  companyType: string;
  agencyType?: string;
  advertisingModel?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  region?: string;
  country?: string;
  zipCode?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  headquarters?: string;
  employeeCount?: string;
  revenueRange?: string;
  revenue?: number;
  foundedYear?: number;
  stockSymbol?: string;
  verified: boolean;
  lastVerified?: string;
  parentCompany?: {
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
  };
  subsidiaries: Array<{
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
    verified: boolean;
  }>;
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    verified: boolean;
    seniority?: string;
    department?: string;
  }>;
  partnerships: Array<{
    id: string;
    relationshipType?: string;
    isAOR?: boolean;
    services?: string[];
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    contractValue?: number;
    notes?: string;
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
  }>;
  _count: {
    contacts: number;
    subsidiaries: number;
    partnerships: number;
  };
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { user: firebaseUser, idToken, loading: authLoading } = useFirebaseAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'partnerships' | 'relationships' | 'subsidiaries' | 'activity' | 'intel'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());
  const [isSuggestEditExpanded, setIsSuggestEditExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter subsidiaries based on search query
  const filteredSubsidiaries = useMemo(() => {
    if (!company || !company.subsidiaries) return [];
    if (!searchQuery.trim()) return company.subsidiaries;
    const query = searchQuery.toLowerCase();
    return company.subsidiaries.filter(sub =>
      sub.name.toLowerCase().includes(query)
    );
  }, [company?.subsidiaries, searchQuery]);

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orgs/companies/${companyId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Company not found');
          } else {
            setError('Failed to load company data');
          }
          return;
        }

        const data = await response.json();
        setCompany(data);

        // Set default active tab based on company type
        if (data.companyType === 'MEDIA_HOLDING_COMPANY' && data._count.subsidiaries > 0) {
          setActiveTab('subsidiaries');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  // Fetch follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!firebaseUser || !idToken) {
        setIsFollowing(false);
        return;
      }

      try {
        const response = await fetch(`/api/orgs/companies/${companyId}/follow`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        console.error('Error fetching follow status:', err);
      }
    };

    if (companyId && !authLoading) {
      fetchFollowStatus();
    }
  }, [companyId, firebaseUser, idToken, authLoading]);

  // Toggle follow
  const handleToggleFollow = async () => {
    if (!firebaseUser || !idToken) {
      router.push('/auth/login');
      return;
    }

    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/orgs/companies/${companyId}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      } else {
        console.error('Failed to toggle follow');
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      AGENCY: 'Agency',
      INDEPENDENT_AGENCY: 'Independent Agency',
      HOLDING_COMPANY_AGENCY: 'Holding Company Agency',
      NETWORK_AGENCY: 'Network Agency',
      MEDIA_HOLDING_COMPANY: 'Media Holding Company',
      ADVERTISER: 'Advertiser',
      BRAND: 'Brand',
      VENDOR: 'Vendor',
      PUBLISHER: 'Publisher',
      DSP: 'Demand Side Platform',
      SSP: 'Supply Side Platform',
      ADTECH: 'AdTech'
    };
    return labels[type] || type;
  };

  const getCompanyTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      INDEPENDENT_AGENCY: 'bg-green-100 text-green-800',
      HOLDING_COMPANY_AGENCY: 'bg-blue-100 text-blue-800',
      NETWORK_AGENCY: 'bg-purple-100 text-purple-800',
      MEDIA_HOLDING_COMPANY: 'bg-indigo-100 text-indigo-800',
      ADVERTISER: 'bg-orange-100 text-orange-800',
      BRAND: 'bg-pink-100 text-pink-800',
      VENDOR: 'bg-teal-100 text-teal-800',
      PUBLISHER: 'bg-red-100 text-red-800',
      DSP: 'bg-cyan-100 text-cyan-800',
      SSP: 'bg-sky-100 text-sky-800',
      ADTECH: 'bg-violet-100 text-violet-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const toggleAgency = (agencyId: string) => {
    const newExpanded = new Set(expandedAgencies);
    if (newExpanded.has(agencyId)) {
      newExpanded.delete(agencyId);
    } else {
      newExpanded.add(agencyId);
    }
    setExpandedAgencies(newExpanded);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading company details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !company) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {error || 'Company Not Found'}
                </h2>
                <p className="text-gray-600 mb-6">
                  The company you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => router.push('/organizations')} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Organizations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const agencies = company.partnerships.filter(p => p.partnerRole === 'agency');
  const clients = company.partnerships.filter(p => p.partnerRole === 'advertiser');

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              {/* Breadcrumb Navigation */}
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-gray-900">Home</Link>
                <span>›</span>
                <Link href="/organizations" className="hover:text-gray-900">
                  {company.companyType === 'ADVERTISER' ? 'Advertisers' :
                   company.companyType === 'AGENCY' || company.companyType === 'INDEPENDENT_AGENCY' ? 'Agencies' :
                   'Companies'}
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
                    className="rounded-lg flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                      {company.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    {company.description && (
                      <p className="text-gray-600 mb-3">{company.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      {company._count.subsidiaries > 0 && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{company._count.subsidiaries} {company.companyType === 'MEDIA_HOLDING_COMPANY' ? 'agencies' : 'subsidiaries'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{company._count.contacts} people</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{[company.city, company.state].filter(Boolean).join(', ') || 'Multiple locations'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {company.companyType === 'MEDIA_HOLDING_COMPANY' ? (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Agency
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleToggleFollow}
                        disabled={followLoading}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
                      </button>
                      <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="border-t pt-4">
                <nav className="flex gap-1">
                  {company.companyType === 'MEDIA_HOLDING_COMPANY' ? (
                    // Tabs for Holding Companies
                    [
                      ...(company._count.subsidiaries > 0 ? [{ id: 'subsidiaries', label: 'Agencies' }] : []),
                      { id: 'intel', label: 'Intel' },
                      { id: 'overview', label: 'Overview' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 border-t-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))
                  ) : (
                    // Tabs for Non-Holding Companies
                    [
                      { id: 'overview', label: 'Overview' },
                      { id: 'team', label: 'Teams' },
                      { id: 'partnerships', label: 'Partnerships' },
                      { id: 'relationships', label: 'Relationships' },
                      ...(company._count.subsidiaries > 0 ? [{ id: 'subsidiaries', label: 'Subsidiaries' }] : []),
                      { id: 'activity', label: 'Activity' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 border-t-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1">
              {/* Tab Content */}
              <div>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                {/* Description */}
                {company.description && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
                  </div>
                )}

                {/* What We Do - Capabilities */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">What We Do</h2>
                  <CapabilitiesSection company={company} contacts={company.contacts} />
                </div>

                {/* Teams Section - Grouped by Role */}
                {company.contacts && company.contacts.length > 0 && (() => {
                  // Group contacts by role/title
                  const roleGroups = company.contacts.reduce((acc, contact) => {
                    const role = contact.title || contact.department || 'Other';
                    if (!acc[role]) {
                      acc[role] = [];
                    }
                    acc[role].push(contact);
                    return acc;
                  }, {} as Record<string, typeof company.contacts>);

                  // Only show top 3 teams with most people
                  const topTeams = Object.entries(roleGroups)
                    .sort(([, a], [, b]) => b.length - a.length)
                    .slice(0, 3);

                  if (topTeams.length === 0) return null;

                  return (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Key Teams ({topTeams.reduce((sum, [, contacts]) => sum + contacts.length, 0)} people)
                        </h2>
                        <button
                          onClick={() => setActiveTab('team')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View all →
                        </button>
                      </div>

                      <div className="space-y-4">
                        {topTeams.map(([role, contacts], index) => {
                          // Simple color schemes for teams
                          const colorSchemes = [
                            'bg-blue-100 text-blue-600',
                            'bg-purple-100 text-purple-600',
                            'bg-green-100 text-green-600',
                          ];
                          const colorScheme = colorSchemes[index % colorSchemes.length];

                          return (
                            <div key={role} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${colorScheme}`}>
                                  {role.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-2">{role}</h3>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex -space-x-2">
                                      {contacts.filter(c => c.fullName).slice(0, 3).map((contact, idx) => (
                                        <div
                                          key={contact.id}
                                          className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white ${
                                            ['bg-gradient-to-br from-purple-400 to-pink-400',
                                             'bg-gradient-to-br from-blue-400 to-cyan-400',
                                             'bg-gradient-to-br from-green-400 to-emerald-400'][idx % 3]
                                          }`}
                                          title={contact.fullName}
                                        >
                                          {contact.firstName[0]}{contact.lastName[0]}
                                        </div>
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {contacts.filter(c => c.fullName).slice(0, 2).map(c => c.firstName).join(', ')}
                                      {contacts.filter(c => c.fullName).length > 2 && ` +${contacts.filter(c => c.fullName).length - 2} more`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Parent Company */}
                {company.parentCompany && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Part of</h2>
                    <Link
                      href={`/companies/${company.parentCompany.id}`}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      <CompanyLogo
                        logoUrl={company.parentCompany.logoUrl}
                        companyName={company.parentCompany.name}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                          {company.parentCompany.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getCompanyTypeLabel(company.parentCompany.companyType)}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </Link>
                  </div>
                )}

                {/* Recent Partnerships Preview */}
                {company.partnerships.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Key Partnerships</h2>
                      <button
                        onClick={() => setActiveTab('partnerships')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {company.partnerships.slice(0, 5).map((partnership) => (
                        <Link
                          key={partnership.id}
                          href={`/companies/${partnership.partner.id}`}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                          <CompanyLogo
                            logoUrl={partnership.partner.logoUrl}
                            companyName={partnership.partner.name}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                              {partnership.partner.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">
                                {partnership.partnerRole === 'agency' ? 'Agency Partner' : 'Client'}
                              </span>
                              {partnership.isAOR && (
                                <Badge variant="outline" className="text-xs">AOR</Badge>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                    </div>
                  )}

                  {/* Team Tab */}
                  {activeTab === 'team' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members ({company._count.contacts})</h2>
              {company.contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No team members listed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {company.contacts.map((contact) => (
                    <Link
                      key={contact.id}
                      href={`/people/${contact.id}`}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                            {contact.fullName}
                          </h3>
                          {contact.verified && (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        {contact.title && (
                          <p className="text-sm text-gray-600 mt-1">{contact.title}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {contact.department && (
                            <span>{contact.department}</span>
                          )}
                          {contact.seniority && (
                            <span>{contact.seniority}</span>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Partnerships Tab */}
          {activeTab === 'partnerships' && (
            <div className="space-y-4">
              {/* Agencies */}
              {agencies.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Agency Partners ({agencies.length})
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {agencies.map((partnership) => (
                      <PartnershipCard
                        key={partnership.id}
                        partnership={partnership}
                        companyName={company.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {clients.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Clients ({clients.length})
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {clients.map((partnership) => (
                      <PartnershipCard
                        key={partnership.id}
                        partnership={partnership}
                        companyName={company.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {agencies.length === 0 && clients.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No partnerships listed yet</p>
                </div>
              )}
            </div>
          )}

          {/* Subsidiaries Tab */}
          {activeTab === 'subsidiaries' && company._count.subsidiaries > 0 && (
            <div className="space-y-4">
              {company.companyType === 'MEDIA_HOLDING_COMPANY' ? (
                /* Expandable Agencies for Holding Companies */
                <>
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

                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      All Agencies ({filteredSubsidiaries.length})
                    </h2>
                  </div>
                  {filteredSubsidiaries.map((subsidiary) => (
                    <div key={subsidiary.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Agency Header - Clickable */}
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleAgency(subsidiary.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <CompanyLogo
                              logoUrl={subsidiary.logoUrl}
                              companyName={subsidiary.name}
                              size="lg"
                              className="flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold text-gray-900">{subsidiary.name}</h3>
                                {subsidiary.verified && (
                                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                )}
                                <button
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAgency(subsidiary.id);
                                  }}
                                >
                                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${expandedAgencies.has(subsidiary.id) ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {getCompanyTypeLabel(subsidiary.companyType)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/companies/${subsidiary.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Content - Shows link to full page */}
                      {expandedAgencies.has(subsidiary.id) && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                          <Link
                            href={`/companies/${subsidiary.id}`}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View {subsidiary.name} details
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                /* Standard Grid View for Non-Holding Companies */
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Subsidiaries ({company._count.subsidiaries})</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {company.subsidiaries.map((subsidiary) => (
                      <Link
                        key={subsidiary.id}
                        href={`/companies/${subsidiary.id}`}
                        className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      >
                        <CompanyLogo
                          logoUrl={subsidiary.logoUrl}
                          companyName={subsidiary.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                              {subsidiary.name}
                            </h3>
                            {subsidiary.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {getCompanyTypeLabel(subsidiary.companyType)}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Intel Tab */}
          {activeTab === 'intel' && company.companyType === 'MEDIA_HOLDING_COMPANY' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Intel</h2>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            </div>
          )}

          {/* Relationships Tab */}
          {activeTab === 'relationships' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <GitFork className="h-5 w-5" />
                  <h2 className="text-lg font-semibold text-gray-900">Relationship Graph</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Interactive visualization of {company.name}'s business relationships, including parent companies, subsidiaries, agency partnerships, and key contacts.
                </p>
                <RelationshipGraph companyId={company.id} includeContacts={true} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Legend</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-blue-600 ring-2 ring-blue-200"></div>
                      <span>Central Company (this company)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-purple-500"></div>
                      <span>Agency Partners</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span>Client/Advertiser</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-gray-400"></div>
                      <span>Contacts/People</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-0.5 bg-purple-500"></div>
                      <span>Agency-Client Relationship (animated)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-1 bg-gray-600"></div>
                      <span>Parent-Subsidiary Relationship</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Controls</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>• Zoom:</strong> Use mouse wheel or pinch gesture</p>
                    <p><strong>• Pan:</strong> Click and drag background</p>
                    <p><strong>• Move nodes:</strong> Drag individual nodes to reposition</p>
                    <p><strong>• Fit view:</strong> Use the "Fit View" button in bottom-left controls</p>
                    <p><strong>• Minimap:</strong> Click on minimap to quickly navigate large graphs</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {/* Team additions from recent contacts */}
                  {company.contacts.slice(0, 3).map((contact, index) => (
                    <div key={`contact-${contact.id}`} className="flex items-start space-x-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <Link href={`/people/${contact.id}`} className="font-semibold hover:text-blue-600">
                            {contact.fullName}
                          </Link>
                          {' '}joined the team
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {contact.title && `${contact.title} • `}
                          {index === 0 ? '2 days ago' : index === 1 ? '1 week ago' : '2 weeks ago'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Partnership updates */}
                  {company.partnerships.slice(0, 2).map((partnership, index) => (
                    <div key={`partnership-${partnership.id}`} className="flex items-start space-x-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Network className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          New partnership with{' '}
                          <Link href={`/companies/${partnership.partner.id}`} className="font-semibold hover:text-blue-600">
                            {partnership.partner.name}
                          </Link>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {partnership.partnerRole === 'agency' ? 'Agency Partner' : 'Client'} •
                          {partnership.startDate ? ` ${new Date(partnership.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ` ${index === 0 ? '3 weeks ago' : '1 month ago'}`}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Profile verification */}
                  {company.verified && company.lastVerified && (
                    <div className="flex items-start space-x-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          Company profile <span className="font-semibold">verified</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(company.lastVerified).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Empty state if no activity */}
                  {company.contacts.length === 0 && company.partnerships.length === 0 && !company.verified && (
                    <div className="text-center py-8">
                      <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">No recent activity to show</p>
                      <p className="text-gray-500 text-xs mt-1">Activity will appear here as the team and partnerships grow</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggest Edit Card */}
              <div className="bg-white rounded-lg border border-gray-200 border-dashed p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Know something we don't?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Help us keep {company.name}'s information accurate and up-to-date by suggesting edits.
                </p>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Suggest an Edit
                </button>
              </div>
            </div>
                  )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-6">
              {/* Suggest Edit Panel */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div
                  className="flex items-start gap-3 mb-4 cursor-pointer"
                  onClick={() => setIsSuggestEditExpanded(!isSuggestEditExpanded)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Edit3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Suggest an edit for this company
                    </h3>
                    {!isSuggestEditExpanded && (
                      <p className="text-xs text-gray-600">
                        Click to expand
                      </p>
                    )}
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isSuggestEditExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isSuggestEditExpanded && (
                  <>
                    <div className="space-y-3 mb-4">
                      <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="mt-1 rounded" />
                        <span>Wrong info / Incorrect company</span>
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
                      Thanks for helping us improve!
                    </p>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Partnerships</span>
                    <span className="font-semibold text-gray-900">{company._count.partnerships}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">People</span>
                    <span className="font-semibold text-gray-900">{company._count.contacts}</span>
                  </div>
                  {company._count.subsidiaries > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{company.companyType === 'MEDIA_HOLDING_COMPANY' ? 'Agencies' : 'Subsidiaries'}</span>
                      <span className="font-semibold text-gray-900">{company._count.subsidiaries}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(company.address || company.website || company.linkedinUrl) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Contact Info</h3>
                  <div className="space-y-3">
                    {company.address && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Address</div>
                        <div className="text-sm text-gray-900">
                          {company.address}
                          {company.zipCode && <><br />{company.zipCode}</>}
                        </div>
                      </div>
                    )}

                    {company.website && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Website</div>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {company.website.replace(/^https?:\/\//, '')} →
                        </a>
                      </div>
                    )}

                    {company.linkedinUrl && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">LinkedIn</div>
                        <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Profile →
                        </a>
                      </div>
                    )}
                  </div>

                  {company.lastVerified && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Contact information last updated {new Date(company.lastVerified).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Top Locations */}
              {(company.city || company.state) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Top Locations</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{[company.city, company.state].filter(Boolean).join(', ')}</span>
                      </div>
                      <span className="text-gray-600">HQ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
