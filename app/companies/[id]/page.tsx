'use client';

import { useState, useEffect } from 'react';
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
  ChevronDown
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
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'partnerships' | 'relationships' | 'subsidiaries' | 'activity'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());

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
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/organizations" className="hover:text-gray-700">
                {company.companyType === 'ADVERTISER' ? 'Advertisers' :
                 company.companyType === 'AGENCY' || company.companyType === 'INDEPENDENT_AGENCY' ? 'Agencies' :
                 'Companies'}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{company.name}</span>
            </div>
          </div>
        </div>

        {/* Header with Stats */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              {/* Company Header with Logo */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
                <CompanyLogo
                  logoUrl={company.logoUrl}
                  companyName={company.name}
                  size="xl"
                  className="rounded-xl"
                />
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {company.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={getCompanyTypeBadgeColor(company.companyType)}>
                          {getCompanyTypeLabel(company.companyType)}
                        </Badge>
                        {company.verified && (
                          <Badge className="bg-green-50 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {company.industry && (
                          <Badge variant="outline">
                            {company.industry.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {(company.city || company.state) && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {[company.city, company.state, company.country]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        )}
                        {company.foundedYear && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Founded {company.foundedYear}
                          </div>
                        )}
                        {company.employeeCount && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {company.employeeCount} employees
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button
                        variant={isFollowing ? "default" : "outline"}
                        size="sm"
                        onClick={handleToggleFollow}
                        disabled={followLoading}
                        className="flex-1 sm:flex-none"
                      >
                        <Bell className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                        {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
                      </Button>
                      {company.website && (
                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Website</span>
                            <span className="sm:hidden">Web</span>
                          </a>
                        </Button>
                      )}
                      {company.linkedinUrl && (
                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                          <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">LinkedIn</span>
                            <span className="sm:hidden">LI</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Inline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{company._count.partnerships}</div>
                  <div className="text-sm text-gray-500">Partnerships</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{company._count.contacts}</div>
                  <div className="text-sm text-gray-500">Contacts</div>
                </div>
                {company._count.subsidiaries > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{company._count.subsidiaries}</div>
                    <div className="text-sm text-gray-500">Subsidiaries</div>
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {company.lastVerified ? new Date(company.lastVerified).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                </div>
              </div>
            </div>

            {/* Tabs - SellerCrowd Style */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex gap-8 px-6 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'team', label: `Team (${company._count.contacts})` },
                  { id: 'partnerships', label: `Partnerships (${company._count.partnerships})` },
                  { id: 'relationships', label: 'Relationship Graph' },
                  ...(company._count.subsidiaries > 0 ? [{ id: 'subsidiaries', label: `Subsidiaries (${company._count.subsidiaries})` }] : []),
                  { id: 'activity', label: 'Activity' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {company.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* What We Do - Capabilities */}
                <Card>
                  <CardHeader>
                    <CardTitle>What We Do</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CapabilitiesSection company={company} contacts={company.contacts} />
                  </CardContent>
                </Card>

                {/* Teams Section - Grouped by Role */}
                {company.contacts && company.contacts.length > 0 && (() => {
                  // Group contacts by role
                  const roleGroups = company.contacts.reduce((acc, contact) => {
                    const role = contact.role || 'Other';
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
                                      {contacts.filter(c => c.name).slice(0, 3).map((contact, idx) => (
                                        <div
                                          key={contact.id}
                                          className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white ${
                                            ['bg-gradient-to-br from-purple-400 to-pink-400',
                                             'bg-gradient-to-br from-blue-400 to-cyan-400',
                                             'bg-gradient-to-br from-green-400 to-emerald-400'][idx % 3]
                                          }`}
                                          title={contact.name}
                                        >
                                          {(contact.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {contacts.filter(c => c.name).slice(0, 2).map(c => c.name.split(' ')[0]).join(', ')}
                                      {contacts.filter(c => c.name).length > 2 && ` +${contacts.filter(c => c.name).length - 2} more`}
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Part of</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href={`/companies/${company.parentCompany.id}`}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
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
                    </CardContent>
                  </Card>
                )}

                {/* Recent Partnerships Preview */}
                {company.partnerships.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Key Partnerships</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('partnerships')}
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
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
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">Team Members</span>
                      </div>
                      <span className="font-semibold text-gray-900">{company._count.contacts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Network className="h-4 w-4 mr-2" />
                        <span className="text-sm">Partnerships</span>
                      </div>
                      <span className="font-semibold text-gray-900">{company._count.partnerships}</span>
                    </div>
                    {company._count.subsidiaries > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span className="text-sm">Subsidiaries</span>
                        </div>
                        <span className="font-semibold text-gray-900">{company._count.subsidiaries}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {company.address && (
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="text-gray-900 mt-1">{company.address}</p>
                        {company.zipCode && (
                          <p className="text-gray-900">{company.zipCode}</p>
                        )}
                      </div>
                    )}
                    {company.revenueRange && (
                      <div>
                        <span className="text-gray-600">Revenue Range:</span>
                        <p className="text-gray-900 mt-1">{company.revenueRange}</p>
                      </div>
                    )}
                    {company.stockSymbol && (
                      <div>
                        <span className="text-gray-600">Stock Symbol:</span>
                        <p className="text-gray-900 mt-1">{company.stockSymbol}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members ({company._count.contacts})</CardTitle>
                </CardHeader>
                <CardContent>
                  {company.contacts.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No team members listed yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Partnerships Tab */}
          {activeTab === 'partnerships' && (
            <div className="space-y-6">
              {/* Agencies */}
              {agencies.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No partnerships listed yet</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Subsidiaries Tab */}
          {activeTab === 'subsidiaries' && company._count.subsidiaries > 0 && (
            <div>
              {company.companyType === 'MEDIA_HOLDING_COMPANY' ? (
                /* Expandable Agencies for Holding Companies */
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Agencies ({company._count.subsidiaries})
                  </h2>
                  {company.subsidiaries.map((subsidiary) => (
                    <div key={subsidiary.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Agency Header - Clickable */}
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleAgency(subsidiary.id)}
                      >
                        <div className="flex items-start gap-4">
                          <CompanyLogo
                            logoUrl={subsidiary.logoUrl}
                            companyName={subsidiary.name}
                            size="lg"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{subsidiary.name}</h3>
                              {subsidiary.verified && (
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              )}
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors ml-auto">
                                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${expandedAgencies.has(subsidiary.id) ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">
                              {getCompanyTypeLabel(subsidiary.companyType)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Content - For now shows link to full page */}
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
                </div>
              ) : (
                /* Standard Grid View for Non-Holding Companies */
                <Card>
                  <CardHeader>
                    <CardTitle>Subsidiaries ({company._count.subsidiaries})</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Relationships Tab */}
          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitFork className="h-5 w-5" />
                    Relationship Graph
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Interactive visualization of {company.name}'s business relationships, including parent companies, subsidiaries, agency partnerships, and key contacts.
                  </p>
                </CardHeader>
                <CardContent>
                  <RelationshipGraph companyId={company.id} includeContacts={true} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>• Zoom:</strong> Use mouse wheel or pinch gesture</p>
                      <p><strong>• Pan:</strong> Click and drag background</p>
                      <p><strong>• Move nodes:</strong> Drag individual nodes to reposition</p>
                      <p><strong>• Fit view:</strong> Use the "Fit View" button in bottom-left controls</p>
                      <p><strong>• Minimap:</strong> Click on minimap to quickly navigate large graphs</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Suggest Edit Card */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit3 className="h-5 w-5 mr-2 text-gray-600" />
                    Know something we don't?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Help us keep {company.name}'s information accurate and up-to-date by suggesting edits.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Suggest an Edit
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
