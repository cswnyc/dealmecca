'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailCopy } from '@/components/ui/EmailCopy';
import {
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  Briefcase,
  Award,
  Network,
  Lock,
  Shield,
  Clock,
  Users,
  Target,
  Bookmark,
  UserPlus,
  Edit3,
  MoreHorizontal,
  Activity,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface Partnership {
  id: string;
  relationshipType: string;
  isAOR: boolean;
  services?: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  partner: {
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
    verified: boolean;
  };
  partnerRole: 'agency' | 'advertiser';
}

interface Duty {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface Team {
  id: string;
  name: string;
  type: string;
  description?: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
  };
}

interface ContactTeam {
  id: string;
  role?: string;
  isPrimary: boolean;
  team: Team;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  logoUrl?: string;
  personalEmail?: string;
  department?: string;
  seniority?: string;
  primaryRole?: string;
  companyId: string;
  territories?: string[];
  accounts?: string[];
  budgetRange?: string;
  isDecisionMaker?: boolean;
  verified: boolean;
  dataQuality?: number;
  lastVerified?: string;
  isActive: boolean;
  preferredContact?: string;
  communityScore?: number;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
    agencyType?: string;
    industry?: string;
    city?: string;
    state?: string;
    website?: string;
    verified: boolean;
  };
  duties?: Duty[];
  partnerships?: Partnership[];
  ContactTeam?: ContactTeam[];
  recentInteractions: Array<{
    id: string;
    type: string;
    notes?: string;
    outcome?: string;
    createdAt: string;
    User?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  recentNotes: Array<{
    id: string;
    content: string;
    isPrivate: boolean;
    createdAt: string;
    User?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  _count: {
    interactions: number;
    notes: number;
    connections: number;
    partnerships?: number;
  };
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'duties' | 'activity' | 'contact'>('overview');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orgs/contacts/${contactId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Contact not found');
          } else {
            setError('Failed to load contact data');
          }
          return;
        }

        const data = await response.json();
        setContact(data);
      } catch (err) {
        console.error('Error fetching contact:', err);
        setError('Failed to load contact data');
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const getSeniorityBadgeColor = (seniority?: string) => {
    if (!seniority) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      'C_LEVEL': 'bg-purple-100 text-purple-800',
      'VP': 'bg-blue-100 text-blue-800',
      'DIRECTOR': 'bg-indigo-100 text-indigo-800',
      'MANAGER': 'bg-green-100 text-green-800',
      'COORDINATOR': 'bg-teal-100 text-teal-800',
      'INDIVIDUAL_CONTRIBUTOR': 'bg-gray-100 text-gray-800'
    };
    return colors[seniority] || 'bg-gray-100 text-gray-800';
  };

  const formatSeniority = (seniority?: string) => {
    if (!seniority) return '';
    return seniority.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return formatDate(dateString);
  };

  // Group duties by category
  const dutiesByCategory = contact?.duties?.reduce((acc, duty) => {
    if (!acc[duty.category]) {
      acc[duty.category] = [];
    }
    acc[duty.category].push(duty);
    return acc;
  }, {} as Record<string, Duty[]>) || {};

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading contact details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !contact) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {error || 'Contact Not Found'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  The person you're looking for doesn't exist or has been removed.
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-muted">
        {/* Compact Header */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="py-3">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                size="sm"
                className="text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>

            {/* Profile Header */}
            <div className="pb-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-foreground truncate">
                      {contact.fullName}
                    </h1>
                    {contact.verified && (
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>

                  {contact.title && (
                    <p className="text-base text-muted-foreground mb-2">{contact.title}</p>
                  )}

                  <Link
                    href={`/companies/${contact.company.id}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 group mb-3"
                  >
                    <CompanyLogo
                      logoUrl={contact.company.logoUrl}
                      companyName={contact.company.name}
                      size="xs"
                    />
                    <span className="font-medium group-hover:underline">{contact.company.name}</span>
                  </Link>

                  {contact.email && (
                    <div className="text-sm text-muted-foreground mb-3">
                      <EmailCopy email={contact.email} variant="compact" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-1.5" />
                    Save
                  </Button>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Follow
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-t border-border -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-input'
                }`}
              >
                Overview
              </button>
              {((contact.partnerships && contact.partnerships.length > 0) || (contact.ContactTeam && contact.ContactTeam.length > 0)) && (
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'teams'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-input'
                  }`}
                >
                  Teams ({(contact.ContactTeam?.length || 0) + (contact.partnerships?.length || 0)})
                </button>
              )}
              {contact.duties && contact.duties.length > 0 && (
                <button
                  onClick={() => setActiveTab('duties')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'duties'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-input'
                  }`}
                >
                  Duties ({contact.duties.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-input'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'contact'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-input'
                }`}
              >
                Contact Info
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Latest Activity */}
                  {(contact.recentInteractions.length > 0 || contact.recentNotes.length > 0) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Latest Activity</CardTitle>
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            View all →
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[...contact.recentInteractions.slice(0, 3), ...contact.recentNotes.slice(0, 2)]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 5)
                          .map((item, index) => (
                            <div key={index} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                {'type' in item ? (
                                  <MessageSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Activity className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">
                                  {'type' in item ? (
                                    <span><span className="font-medium">{item.type}</span> {item.notes && `- ${item.notes}`}</span>
                                  ) : (
                                    <span>{item.content}</span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {getRelativeTime(item.createdAt)}
                                  {item.User && ` • by ${item.User.name}`}
                                </p>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Professional Details */}
                    {(contact.seniority || contact.department || contact.primaryRole) && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            Professional Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            {contact.seniority && (
                              <div>
                                <span className="text-muted-foreground">Level:</span>
                                <Badge className={`ml-2 ${getSeniorityBadgeColor(contact.seniority)}`}>
                                  {formatSeniority(contact.seniority)}
                                </Badge>
                              </div>
                            )}
                            {contact.department && (
                              <div>
                                <span className="text-muted-foreground">Department:</span>
                                <span className="ml-2 text-foreground">{contact.department}</span>
                              </div>
                            )}
                            {contact.primaryRole && (
                              <div>
                                <span className="text-muted-foreground">Role:</span>
                                <span className="ml-2 text-foreground">{contact.primaryRole}</span>
                              </div>
                            )}
                            {contact.budgetRange && (
                              <div>
                                <span className="text-muted-foreground">Budget:</span>
                                <span className="ml-2 text-foreground">{contact.budgetRange}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Key Accounts */}
                    {contact.accounts && contact.accounts.length > 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            Key Accounts
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {contact.accounts.slice(0, 6).map((account, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {account}
                              </Badge>
                            ))}
                            {contact.accounts.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.accounts.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Territories */}
                    {contact.territories && contact.territories.length > 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Territories
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {contact.territories.map((territory, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {territory}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Company Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Company</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href={`/companies/${contact.company.id}`}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors border border-border group"
                      >
                        <CompanyLogo
                          logoUrl={contact.company.logoUrl}
                          companyName={contact.company.name}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground group-hover:text-blue-600 truncate">
                              {contact.company.name}
                            </h3>
                            {contact.company.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.company.companyType.replace(/_/g, ' ')}
                            {contact.company.industry && ` • ${contact.company.industry.replace(/_/g, ' ')}`}
                          </div>
                          {(contact.company.city || contact.company.state) && (
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {[contact.company.city, contact.company.state].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </Link>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Teams Tab */}
              {activeTab === 'teams' && (
                <div className="space-y-4">
                  {/* Contact Teams */}
                  {contact.ContactTeam && contact.ContactTeam.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Teams</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Internal teams and groups this person is part of
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {contact.ContactTeam.map((contactTeam) => (
                          <div
                            key={contactTeam.id}
                            className="p-4 rounded-lg border border-border hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {contactTeam.team.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-foreground">{contactTeam.team.name}</h3>
                                  {contactTeam.isPrimary && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">Primary</Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {contactTeam.team.type.replace(/_/g, ' ')}
                                  </Badge>
                                </div>

                                {contactTeam.role && (
                                  <div className="text-sm text-muted-foreground mb-2">
                                    Role: <span className="font-medium">{contactTeam.role}</span>
                                  </div>
                                )}

                                {contactTeam.team.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{contactTeam.team.description}</p>
                                )}

                                <Link
                                  href={`/companies/${contactTeam.team.company.id}`}
                                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600"
                                >
                                  <CompanyLogo
                                    logoUrl={contactTeam.team.company.logoUrl}
                                    companyName={contactTeam.team.company.name}
                                    size="xs"
                                  />
                                  <span className="hover:underline">{contactTeam.team.company.name}</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Partnership Teams */}
                  {contact.partnerships && contact.partnerships.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Partnerships</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Agency-client relationships this person is involved with
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {contact.partnerships.map((partnership) => (
                      <div
                        key={partnership.id}
                        className="p-4 rounded-lg border border-border hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <CompanyLogo
                            logoUrl={partnership.partner.logoUrl}
                            companyName={partnership.partner.name}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Link
                                href={`/companies/${partnership.partner.id}`}
                                className="font-semibold text-foreground hover:text-blue-600 truncate"
                              >
                                {partnership.partner.name}
                              </Link>
                              {partnership.partner.verified && (
                                <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                              {partnership.isAOR && (
                                <Badge className="bg-purple-100 text-purple-800 text-xs">AOR</Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {partnership.partnerRole === 'agency' ? 'Agency Partner' : 'Client'}
                              </Badge>
                              {partnership.services && (
                                <span className="text-muted-foreground">{partnership.services}</span>
                              )}
                            </div>

                            {partnership.startDate && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Since {formatDate(partnership.startDate)}</span>
                                {partnership.endDate && !partnership.isActive && (
                                  <span>- {formatDate(partnership.endDate)}</span>
                                )}
                                {!partnership.isActive && (
                                  <Badge variant="outline" className="ml-2 text-xs">Inactive</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Duties Tab */}
              {activeTab === 'duties' && (
                <Card>
                  <CardHeader>
                    <CardTitle>What does {contact.firstName} do?</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Roles and responsibilities across different areas
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(dutiesByCategory).map(([category, duties]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          {category}
                        </h3>
                        <div className="ml-4 space-y-3">
                          {duties.map((duty) => (
                            <div key={duty.id} className="p-3 rounded-lg bg-muted border border-border">
                              <div className="font-medium text-foreground mb-1">{duty.name}</div>
                              {duty.description && (
                                <p className="text-sm text-muted-foreground">{duty.description}</p>
                              )}
                              {/* Show related partnerships for this duty if available */}
                              {contact.partnerships && contact.partnerships.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {contact.partnerships.slice(0, 3).map(p => (
                                    <Badge key={p.id} variant="outline" className="text-xs">
                                      {p.partner.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...contact.recentInteractions, ...contact.recentNotes]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                {'type' in item ? (
                                  <MessageSquare className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Activity className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              {index < contact.recentInteractions.length + contact.recentNotes.length - 1 && (
                                <div className="w-px h-full bg-muted mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-medium text-foreground">
                                  {'type' in item ? item.type : 'Note Added'}
                                </h4>
                                <span className="text-xs text-muted-foreground">{getRelativeTime(item.createdAt)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {'notes' in item && item.notes ? item.notes : ''}
                                {'content' in item ? item.content : ''}
                              </p>
                              {item.User && (
                                <p className="text-xs text-muted-foreground mt-1">by {item.User.name}</p>
                              )}
                              {'outcome' in item && item.outcome && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {item.outcome}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}

                      {contact.recentInteractions.length === 0 && contact.recentNotes.length === 0 && (
                        <div className="text-center py-12">
                          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No activity yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info Tab */}
              {activeTab === 'contact' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      {contact.title && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Title</div>
                          <div className="text-foreground">{contact.title}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Company</div>
                        <Link
                          href={`/companies/${contact.company.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {contact.company.name}
                        </Link>
                      </div>

                      {contact.email && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                          <EmailCopy email={contact.email} variant="inline" />
                        </div>
                      )}

                      {contact.phone && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
                          {isPro ? (
                            <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                              {contact.phone}
                            </a>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Premium only</span>
                            </div>
                          )}
                        </div>
                      )}

                      {contact.linkedinUrl && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">LinkedIn</div>
                          {isPro ? (
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                            >
                              View Profile
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Premium only</span>
                            </div>
                          )}
                        </div>
                      )}

                      {(contact.company.city || contact.company.state) && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
                          <div className="text-foreground">
                            {[contact.company.city, contact.company.state].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {contact.lastVerified && (
                      <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                        Contact information last updated {formatDate(contact.lastVerified)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Suggest an edit
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Update email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Add other info
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Activity Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Teams</span>
                    </div>
                    <span className="font-semibold text-foreground">{(contact.ContactTeam?.length || 0) + (contact._count.partnerships || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Interactions</span>
                    </div>
                    <span className="font-semibold text-foreground">{contact._count.interactions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Notes</span>
                    </div>
                    <span className="font-semibold text-foreground">{contact._count.notes}</span>
                  </div>
                  {contact.duties && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Duties</span>
                      </div>
                      <span className="font-semibold text-foreground">{contact.duties.length}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Quality */}
              {contact.dataQuality !== undefined && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Quality Score</span>
                        <span className="font-semibold text-foreground">{contact.dataQuality}/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            contact.dataQuality >= 80 ? 'bg-green-500' :
                            contact.dataQuality >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${contact.dataQuality}%` }}
                        />
                      </div>
                      {contact.lastVerified && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Verified {formatDate(contact.lastVerified)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Badges */}
              {(contact.verified || contact.isDecisionMaker) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Badges</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contact.verified && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-foreground">Verified Contact</span>
                      </div>
                    )}
                    {contact.isDecisionMaker && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span className="text-foreground">Decision Maker</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
