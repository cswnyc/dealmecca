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
import { TeamCard } from '@/components/companies/TeamCard';
import { ContactCard } from '@/components/companies/ContactCard';
import { RelationshipGraph } from '@/components/companies/RelationshipGraph';
import { BasicHoldingCompanyView } from '@/components/companies/BasicHoldingCompanyView';
import { MediaHoldingCompanyView } from '@/components/companies/MediaHoldingCompanyView';
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
  Plus,
  Lightbulb
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
  parentChain?: Array<{
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
  }>;
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
    agency?: {
      id: string;
      name: string;
      logoUrl?: string;
      companyType: string;
      verified: boolean;
    };
    advertiser?: {
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
      phone?: string;
      verified: boolean;
      seniority?: string;
      department?: string;
    }>;
  }>;
  teams: Array<{
    id: string;
    name: string;
    description?: string;
    type: string;
    isActive: boolean;
    _count: {
      ContactTeam: number;
      PartnershipTeam: number;
    };
  }>;
  _count: {
    contacts: number;
    subsidiaries: number;
    partnerships: number;
    teams: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'people' | 'teams' | 'duties' | 'relationships' | 'subsidiaries' | 'activity' | 'intel'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());
  const [isSuggestEditExpanded, setIsSuggestEditExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Duties state
  const [duties, setDuties] = useState<any[]>([]);
  const [dutiesLoading, setDutiesLoading] = useState(false);
  const [selectedDutyCategory, setSelectedDutyCategory] = useState<string>('ALL');

  // Activity state
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: 'CONTACT_JOINED' | 'CONTACT_UPDATED' | 'TEAM_ASSIGNED';
    title: string;
    description?: string;
    contactId: string;
    contactName: string;
    createdAt: string;
  }>>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [activitiesOffset, setActivitiesOffset] = useState(0);

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

  // Fetch duties when duties tab is active
  useEffect(() => {
    const fetchDuties = async () => {
      if (activeTab !== 'duties' || !companyId) return;

      try {
        setDutiesLoading(true);
        const params = new URLSearchParams();
        if (selectedDutyCategory !== 'ALL') {
          params.append('category', selectedDutyCategory);
        }

        const response = await fetch(`/api/orgs/companies/${companyId}/duties?${params.toString()}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setDuties(data.duties || []);
        }
      } catch (err) {
        console.error('Error fetching duties:', err);
      } finally {
        setDutiesLoading(false);
      }
    };

    fetchDuties();
  }, [companyId, activeTab, selectedDutyCategory]);

  // Fetch activity when activity tab is active or for overview preview
  useEffect(() => {
    const fetchActivity = async () => {
      if (!companyId) return;
      // Fetch activity for overview (preview) or activity tab
      if (activeTab !== 'activity' && activeTab !== 'overview') return;

      try {
        setActivitiesLoading(true);
        const limit = activeTab === 'overview' ? 4 : 20;
        const response = await fetch(
          `/api/orgs/companies/${companyId}/activity?limit=${limit}&offset=${activitiesOffset}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          if (activitiesOffset === 0) {
            setActivities(data.activities || []);
          } else {
            setActivities(prev => [...prev, ...(data.activities || [])]);
          }
          setActivitiesTotal(data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching activity:', err);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivity();
  }, [companyId, activeTab, activitiesOffset]);

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
      VENDOR: 'bg-emerald-100 text-emerald-800',
      PUBLISHER: 'bg-red-100 text-red-800',
      DSP: 'bg-blue-100 text-blue-800',
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

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  };

  // Get activity icon and color based on type
  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'CONTACT_JOINED':
        return { bgColor: 'bg-blue-100', iconColor: 'text-blue-600', Icon: UserPlus };
      case 'CONTACT_UPDATED':
        return { bgColor: 'bg-green-100', iconColor: 'text-green-600', Icon: Edit3 };
      case 'TEAM_ASSIGNED':
        return { bgColor: 'bg-purple-100', iconColor: 'text-purple-600', Icon: Users };
      default:
        return { bgColor: 'bg-gray-100', iconColor: 'text-gray-600', Icon: ActivityIcon };
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  // Calculate total contacts across all teams (in-house + partnership contacts)
  const totalContacts = useMemo(() => {
    if (!company) return 0;
    const inHouseContacts = company.contacts?.length || 0;
    const partnershipContacts = company.partnerships?.reduce((sum, p) => sum + (p.contacts?.length || 0), 0) || 0;
    return inHouseContacts + partnershipContacts;
  }, [company?.contacts, company?.partnerships]);

  // Calculate total teams (in-house + agency partnerships)
  const totalTeams = useMemo(() => {
    if (!company) return 0;
    // Only count Team model teams (partnerships are no longer shown)
    return company.teams?.length || 0;
  }, [company?.teams]);

  // Calculate total partnerships (disabled for now - will be added later)
  const totalPartnerships = useMemo(() => {
    return 0; // Partnerships functionality disabled
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading company details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !company) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {error || 'Company Not Found'}
                </h2>
                <p className="text-muted-foreground mb-6">
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

  // Show appropriate holding company view based on type
  if (company.companyType === 'MEDIA_HOLDING_COMPANY' && company._count?.subsidiaries > 0) {
    return <MediaHoldingCompanyView company={company} />;
  }

  if ((company.companyType === 'HOLDING_COMPANY' || company.companyType === 'HOLDING_COMPANY_AGENCY') && company._count?.subsidiaries > 0) {
    return <BasicHoldingCompanyView company={company} />;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-muted">
        {company.companyType === 'MEDIA_HOLDING_COMPANY' ? (
          <>
            {/* Header Section */}
            <div className="bg-white border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                  {/* Breadcrumb Navigation */}
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/organizations" className="hover:text-foreground">Agencies</Link>
                    {company.parentChain && company.parentChain.length > 0 && (
                      <>
                        {company.parentChain.map((parent) => (
                          <span key={parent.id} className="flex items-center gap-2">
                            <span>›</span>
                            <Link href={`/companies/${parent.id}`} className="hover:text-foreground">
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
                        className="rounded-lg flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                          {company.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        {company.description && (
                          <p className="text-muted-foreground mb-3">{company.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          {company._count.subsidiaries > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>{company._count.subsidiaries} agencies</span>
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
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search..."
                          className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tabs Navigation */}
                  <div className="border-t pt-4">
                    <nav className="flex gap-1">
                      {[
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
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
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
                  {/* Tab Content for HOLDING COMPANIES */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      {company.description && (
                        <div className="bg-white rounded-lg border border-border p-6">
                          <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
                          <p className="text-foreground whitespace-pre-wrap">{company.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'subsidiaries' && company._count.subsidiaries > 0 && (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search agencies, teams, or locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">
                          All Agencies ({filteredSubsidiaries.length})
                        </h2>
                      </div>
                      {filteredSubsidiaries.map((subsidiary) => (
                        <div key={subsidiary.id} className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Agency Header - Clickable */}
                          <div
                            className="p-6 cursor-pointer hover:bg-muted transition-colors"
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
                                    <h3 className="text-xl font-semibold text-foreground">{subsidiary.name}</h3>
                                    {subsidiary.verified && (
                                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    )}
                                    <button
                                      className="p-1 hover:bg-muted rounded transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAgency(subsidiary.id);
                                      }}
                                    >
                                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedAgencies.has(subsidiary.id) ? 'rotate-180' : ''}`} />
                                    </button>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {getCompanyTypeLabel(subsidiary.companyType)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/companies/${subsidiary.id}`}
                                  className="p-2 text-muted-foreground hover:text-blue-600 rounded hover:bg-blue-50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Content - Shows link to full page */}
                          {expandedAgencies.has(subsidiary.id) && (
                            <div className="border-t border-border bg-muted p-6">
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
                  )}

                  {activeTab === 'intel' && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg border border-border p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Intel</h2>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Sidebar for HOLDING COMPANIES */}
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
                        <h3 className="font-bold text-foreground text-lg">
                          Suggest an edit for this company
                        </h3>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${isSuggestEditExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {!isSuggestEditExpanded && (
                      <p className="px-5 pb-5 text-sm text-muted-foreground">
                        Click to expand
                      </p>
                    )}

                    {isSuggestEditExpanded && (
                      <div className="px-5 pb-5">
                        <div className="space-y-2 mb-4">
                          <label className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-0.5" />
                            <span className="text-foreground">Should we add or remove people?</span>
                          </label>
                          <label className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-0.5" />
                            <span className="text-foreground">Are any teams no longer active?</span>
                          </label>
                          <label className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-0.5" />
                            <span className="text-foreground">Are there other agencies we should add?</span>
                          </label>
                        </div>

                        <textarea
                          placeholder="Write your suggestion here..."
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />

                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-3">
                          Submit
                        </button>

                        <p className="text-xs text-muted-foreground text-center">
                          Share information with the community and obtain rewards when you do.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Agencies</span>
                        <span className="font-semibold text-foreground">{company._count.subsidiaries}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(company.address || company.website || company.linkedinUrl) && (
                    <div className="bg-white border border-border rounded-lg p-6">
                      <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
                      <div className="space-y-3">
                        {company.address && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Address</div>
                            <div className="text-sm text-foreground">
                              {company.address}
                              {company.zipCode && <><br />{company.zipCode}</>}
                            </div>
                          </div>
                        )}

                        {company.website && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Website</div>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {company.website.replace(/^https?:\/\//, '')} →
                            </a>
                          </div>
                        )}

                        {company.linkedinUrl && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">LinkedIn</div>
                            <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              View Profile →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* NON-HOLDING COMPANY LAYOUT - Compact card design */
          <>
            {/* Breadcrumb outside card */}
            <div className="bg-white border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Link href="/organizations" className="hover:text-foreground">
                    {company.companyType === 'ADVERTISER' ? 'Advertisers' : 'Agencies'}
                  </Link>
                  {company.parentChain && company.parentChain.length > 0 && (
                    <>
                      {company.parentChain.map((parent) => (
                        <span key={parent.id} className="flex items-center gap-2">
                          <span>›</span>
                          <Link href={`/companies/${parent.id}`} className="hover:text-foreground">
                            {parent.name}
                          </Link>
                        </span>
                      ))}
                    </>
                  )}
                  <span>›</span>
                  <span className="text-foreground">{company.name}</span>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Company Header Card */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <CompanyLogo
                          logoUrl={company.logoUrl}
                          companyName={company.name}
                          size="lg"
                          className="rounded-lg flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                            {company.verified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {getCompanyTypeLabel(company.companyType)}
                            {(company.city || company.state) && (
                              <> • {[company.city, company.state].filter(Boolean).join(', ')}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleToggleFollow}
                          disabled={followLoading}
                          className="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted"
                        >
                          {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
                        </button>
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                      <div>
                        <div className="text-2xl font-bold text-foreground">{totalPartnerships}</div>
                        <div className="text-sm text-muted-foreground">Partnerships</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{totalContacts}</div>
                        <div className="text-sm text-muted-foreground">Contacts</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{totalTeams}</div>
                        <div className="text-sm text-muted-foreground">Teams</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">2 hrs</div>
                        <div className="text-sm text-muted-foreground">Last activity</div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs Navigation + Content Card */}
                  <div className="bg-white rounded-lg border border-border">
                    <div className="border-b border-border px-6">
                      <nav className="-mb-px flex gap-8">
                        {[
                          { id: 'overview', label: 'Overview', count: null },
                          { id: 'people', label: 'People', count: totalContacts },
                          { id: 'teams', label: 'Teams', count: totalTeams },
                          { id: 'duties', label: 'Duties', count: duties.length > 0 ? duties.length : null },
                          { id: 'partnerships', label: 'Partnerships', count: totalPartnerships },
                          ...(company._count.subsidiaries > 0 ? [{ id: 'subsidiaries', label: 'Subsidiaries', count: company._count.subsidiaries }] : []),
                          { id: 'activity', label: 'Activity', count: null }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 px-1 border-b-2 transition-colors text-sm font-medium ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {tab.label}{tab.count !== null && ` (${tab.count})`}
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Overview Tab Content */}
                    {activeTab === 'overview' && (
                      <div className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Company Overview</h2>
                        {company.description ? (
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{company.description}</p>
                        ) : (
                          <p className="text-muted-foreground italic">
                            No company overview available yet. {company.name} is a {company.companyType === 'ADVERTISER' ? 'advertiser' : company.companyType === 'AGENCY' || company.companyType === 'INDEPENDENT_AGENCY' ? 'agency' : 'company'}{company.city && company.state ? ` based in ${company.city}, ${company.state}` : ''}.
                          </p>
                        )}
                      </div>
                    )}

                    {/* People Tab */}
                    {activeTab === 'people' && (
                      <div className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">People ({company._count.contacts})</h2>
                      {company.contacts.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No team members listed yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {company.contacts.map((contact) => (
                            <ContactCard key={contact.id} contact={contact} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Teams Tab - Shows company teams */}
                  {activeTab === 'teams' && (
                    <div className="bg-white rounded-lg border border-border p-6">
                      {/* Group teams by type */}
                      {(() => {
                        const inHouseTeams = company.teams.filter(t => t.type !== 'ADVERTISER_TEAM');
                        const clientTeams = company.teams.filter(t => t.type === 'ADVERTISER_TEAM');

                        return (
                          <>
                            {/* In-House Teams */}
                            {inHouseTeams.length > 0 && (
                              <div className="mb-8">
                                <h3 className="text-base font-semibold text-foreground mb-4">In-House Teams</h3>
                                <div className="space-y-4">
                                  {inHouseTeams.map((team) => (
                                    <TeamCard key={team.id} team={team} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Agency Client Teams */}
                            {clientTeams.length > 0 && (
                              <div>
                                <h3 className="text-base font-semibold text-foreground mb-4">Agency Client Teams</h3>
                                <div className="space-y-4">
                                  {clientTeams.map((team) => (
                                    <TeamCard key={team.id} team={team} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Empty state */}
                            {company.teams.length === 0 && (
                              <div className="text-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No teams listed yet</p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Duties Tab */}
                  {activeTab === 'duties' && (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Duties</h2>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {[
                          { value: 'ALL', label: 'All', count: duties.length },
                          { value: 'ROLE', label: 'Roles', count: duties.filter(d => d.category === 'ROLE').length },
                          { value: 'MEDIA_TYPE', label: 'Media Types', count: duties.filter(d => d.category === 'MEDIA_TYPE').length },
                          { value: 'BRAND', label: 'Brands', count: duties.filter(d => d.category === 'BRAND').length },
                          { value: 'BUSINESS_LINE', label: 'Business Lines', count: duties.filter(d => d.category === 'BUSINESS_LINE').length },
                          { value: 'GOAL', label: 'Goals', count: duties.filter(d => d.category === 'GOAL').length },
                          { value: 'AUDIENCE', label: 'Audiences', count: duties.filter(d => d.category === 'AUDIENCE').length },
                          { value: 'GEOGRAPHY', label: 'Geographies', count: duties.filter(d => d.category === 'GEOGRAPHY').length }
                        ].map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setSelectedDutyCategory(filter.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              selectedDutyCategory === filter.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                            }`}
                          >
                            {filter.label} ({filter.count})
                          </button>
                        ))}
                      </div>

                      {/* Duties List */}
                      {dutiesLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-muted-foreground mt-4">Loading duties...</p>
                        </div>
                      ) : duties.length === 0 ? (
                        <div className="text-center py-12">
                          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No duties assigned yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {duties.map((duty) => (
                            <div
                              key={duty.id}
                              className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div>
                                <h4 className="font-semibold text-foreground">{duty.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {duty.category.replace(/_/g, ' ')}
                                </p>
                                {duty.description && (
                                  <p className="text-sm text-muted-foreground mt-2">{duty.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Partnerships Tab - Placeholder for DSP/SSP/AdTech */}
                  {/* Subsidiaries Tab */}
                  {activeTab === 'subsidiaries' && company._count.subsidiaries > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-foreground mb-4">Subsidiaries ({company._count.subsidiaries})</h2>
                      {company.subsidiaries.map((subsidiary) => {
                        const clients = subsidiary.Team?.map(t => t.clientCompany).filter(Boolean) || [];
                        const visibleClients = clients.slice(0, 3);
                        const hiddenClientsCount = clients.length - visibleClients.length;
                        const duties = subsidiary.CompanyDuty?.map(cd => cd.duty.name) || [];
                        const visibleDuties = duties.slice(0, 3);
                        const hiddenDutiesCount = duties.length - visibleDuties.length;
                        const contactCount = subsidiary._count?.contacts || 0;
                        const locationString = subsidiary.city && subsidiary.state
                          ? `${subsidiary.city}, ${subsidiary.state}`
                          : subsidiary.city || subsidiary.state || '';

                        return (
                          <div key={subsidiary.id} className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start gap-3">
                              {/* Logo */}
                              <CompanyLogo
                                logoUrl={subsidiary.logoUrl}
                                companyName={subsidiary.name}
                                size="sm"
                                className="flex-shrink-0 mt-0.5"
                              />

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Title with badges */}
                                <div className="flex items-center gap-2 mb-2">
                                  <Link
                                    href={`/companies/${subsidiary.id}`}
                                    className="font-semibold text-foreground hover:text-blue-600"
                                  >
                                    {subsidiary.name}
                                  </Link>
                                </div>

                                {/* Clients */}
                                {clients.length > 0 && (
                                  <div className="text-sm text-muted-foreground mb-2 flex flex-wrap items-center gap-1">
                                    {visibleClients.map((client, index) => (
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
                                        {index < visibleClients.length - 1 && ', '}
                                      </span>
                                    ))}
                                    {hiddenClientsCount > 0 && (
                                      <Link
                                        href={`/companies/${subsidiary.id}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                                      >
                                        +{hiddenClientsCount} teams
                                      </Link>
                                    )}
                                  </div>
                                )}

                                {/* Duties */}
                                {duties.length > 0 && (
                                  <div className="text-sm text-muted-foreground mb-2">
                                    <span className="font-medium">Handles:</span> {visibleDuties.join(', ')}
                                    {hiddenDutiesCount > 0 && (
                                      <Link
                                        href={`/companies/${subsidiary.id}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                                      >
                                        +{hiddenDutiesCount} duties
                                      </Link>
                                    )}
                                  </div>
                                )}

                                {/* Location */}
                                {locationString && (
                                  <div className="text-sm text-muted-foreground mb-1">
                                    {locationString}
                                  </div>
                                )}

                                {/* Last Activity */}
                                <div className="text-xs text-muted-foreground/70">
                                  Last activity: 23 hrs
                                </div>
                              </div>

                              {/* Right side: People count and action icons */}
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {contactCount > 0 && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{contactCount} {contactCount === 1 ? 'person' : 'people'}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/admin/orgs/companies/${subsidiary.id}/edit`}
                                    className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Link>
                                  <button className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted">
                                    <Bookmark className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Activity Tab */}
                  {activeTab === 'activity' && (
                    <div className="bg-white rounded-lg border border-border p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">
                        Recent Activity {activitiesTotal > 0 && `(${activitiesTotal})`}
                      </h2>
                      <div className="space-y-4">
                        {/* Loading state */}
                        {activitiesLoading && activities.length === 0 && (
                          <div className="text-center py-8">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                            <p className="text-muted-foreground text-sm">Loading activity...</p>
                          </div>
                        )}

                        {/* Activity items */}
                        {activities.map((activity) => {
                          const { bgColor, iconColor, Icon } = getActivityStyle(activity.type);
                          return (
                            <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-0 last:pb-0">
                              <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`h-4 w-4 ${iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">
                                  <Link href={`/people/${activity.contactId}`} className="font-semibold hover:text-blue-600">
                                    {activity.contactName}
                                  </Link>
                                  {' '}{activity.type === 'CONTACT_JOINED' ? 'joined' : activity.type === 'CONTACT_UPDATED' ? 'profile updated' : activity.title.replace(activity.contactName, '').trim()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {activity.description && `${activity.description} • `}
                                  {formatRelativeTime(activity.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Load more button */}
                        {activities.length < activitiesTotal && (
                          <div className="text-center pt-4">
                            <button
                              onClick={() => setActivitiesOffset(prev => prev + 20)}
                              disabled={activitiesLoading}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
                            >
                              {activitiesLoading ? 'Loading...' : 'Load more'}
                            </button>
                          </div>
                        )}

                        {/* Empty state if no activity */}
                        {!activitiesLoading && activities.length === 0 && (
                          <div className="text-center py-8">
                            <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">No recent activity to show</p>
                            <p className="text-muted-foreground/70 text-xs mt-1">Activity will appear here as the team grows</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Teams Card - Separate card for Overview tab */}
                  {activeTab === 'overview' && totalTeams > 0 && (
                    <div className="bg-white rounded-lg border border-border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-foreground">
                          What does {company.name} do? ({totalTeams} {totalTeams === 1 ? 'team' : 'teams'})
                        </h2>
                        <button
                          onClick={() => setActiveTab('teams')}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                          View all →
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Display Organization Teams */}
                        {company.teams.slice(0, 3).map((team) => (
                          <TeamCard key={`org-team-${team.id}`} team={team} />
                        ))}

                        {/* Display Partnership Teams - show remaining slots up to 3 total */}
                        {company.partnerships.slice(0, Math.max(0, 3 - company.teams.length)).map((partnership) => (
                          <PartnershipCard
                            key={`partnership-${partnership.id}`}
                            partnership={partnership}
                            companyName={company.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* People Card - Separate card for Overview tab */}
                  {activeTab === 'overview' && company.contacts.length > 0 && (
                    <div className="bg-white rounded-lg border border-border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-foreground">
                          People ({company._count.contacts})
                        </h2>
                        <button
                          onClick={() => setActiveTab('people')}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                          View all →
                        </button>
                      </div>

                      <div className="space-y-4">
                        {company.contacts.slice(0, 3).map((contact) => (
                          <ContactCard key={contact.id} contact={contact} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Latest Activity Card - Separate card for Overview tab */}
                  {activeTab === 'overview' && (
                    <div className="bg-white rounded-lg border border-border p-6">
                      <h2 className="text-xl font-bold text-foreground mb-6">
                        Latest Activity {activitiesTotal > 0 && `(${activitiesTotal} items)`}
                      </h2>

                      <div className="space-y-4">
                        {/* Loading state */}
                        {activitiesLoading && activities.length === 0 && (
                          <div className="text-center py-4">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                          </div>
                        )}

                        {/* Activity items */}
                        {activities.slice(0, 4).map((activity) => {
                          const { bgColor, iconColor, Icon } = getActivityStyle(activity.type);
                          return (
                            <div key={activity.id} className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
                                  <Icon className={`w-6 h-6 ${iconColor}`} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground">
                                  <Link href={`/people/${activity.contactId}`} className="font-semibold hover:text-blue-600">
                                    {activity.contactName}
                                  </Link>
                                  {' '}{activity.type === 'CONTACT_JOINED' ? 'joined' : activity.type === 'CONTACT_UPDATED' ? 'profile updated' : activity.title.replace(activity.contactName, '').trim()}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {activity.description && `${activity.description} • `}
                                  {formatRelativeTime(activity.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Empty state */}
                        {!activitiesLoading && activities.length === 0 && (
                          <div className="text-center py-4">
                            <ActivityIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">No recent activity</p>
                          </div>
                        )}
                      </div>

                      {/* View All Activity Link */}
                      {activitiesTotal > 4 && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => setActiveTab('activity')}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View all activity →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Sidebar for NON-HOLDING companies */}
                <div className="space-y-6">
                  {/* Suggest Edit Panel */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
                    <div
                      className="flex items-start gap-3 mb-4 cursor-pointer"
                      onClick={() => setIsSuggestEditExpanded(!isSuggestEditExpanded)}
                    >
                      <div className="flex-shrink-0">
                        <span className="text-2xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          Suggest an edit for this company
                        </h3>
                        {!isSuggestEditExpanded && (
                          <p className="text-xs text-muted-foreground">
                            Click to expand
                          </p>
                        )}
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isSuggestEditExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {isSuggestEditExpanded && (
                      <>
                        <div className="space-y-2 mb-4">
                          <label className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-0.5" />
                            <span className="text-foreground">Should we add or remove people?</span>
                          </label>
                          <label className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-0.5" />
                            <span className="text-foreground">Are any teams no longer active?</span>
                          </label>
                          <label className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-0.5" />
                            <span className="text-foreground">Are there other agencies we should add?</span>
                          </label>
                        </div>

                        <textarea
                          placeholder="Write your suggestion here..."
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />

                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-3">
                          Submit
                        </button>

                        <p className="text-xs text-muted-foreground text-center">
                          Share information with the community and obtain rewards when you do.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(company.address || company.website || company.linkedinUrl) && (
                    <div className="bg-white border border-border rounded-lg p-6">
                      <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
                      <div className="space-y-3">
                        {company.address && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Address</div>
                            <div className="text-sm text-foreground">
                              {company.address}
                              {company.zipCode && <><br />{company.zipCode}</>}
                            </div>
                          </div>
                        )}

                        {company.website && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Website</div>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {company.website.replace(/^https?:\/\//, '')} →
                            </a>
                          </div>
                        )}

                        {company.linkedinUrl && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">LinkedIn</div>
                            <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              View Profile →
                            </a>
                          </div>
                        )}
                      </div>

                      {company.lastVerified && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            Contact information last updated {new Date(company.lastVerified).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Top Locations */}
                  {(company.city || company.state) && (
                    <div className="bg-white border border-border rounded-lg p-6">
                      <h3 className="font-semibold text-foreground mb-4">Top Locations</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{[company.city, company.state].filter(Boolean).join(', ')}</span>
                          </div>
                          <span className="text-muted-foreground">HQ</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

