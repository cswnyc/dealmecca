'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingUp,
  Award,
  Network,
  Lock,
  Shield
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
  partnerships?: Partnership[];
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
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

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

  const handleProAction = (action: string) => {
    if (!isPro) {
      setShowUpgradePrompt(true);
      return false;
    }
    return true;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading contact details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !contact) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {error || 'Contact Not Found'}
                </h2>
                <p className="text-gray-600 mb-6">
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              {/* Back Button */}
              <div className="mb-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              {/* Contact Header */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0">
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {contact.fullName}
                        </h1>
                        {contact.verified && (
                          <Badge className="bg-green-50 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {contact.title && (
                        <p className="text-lg text-gray-700 mb-3">{contact.title}</p>
                      )}

                      {/* Company Link */}
                      <Link
                        href={`/companies/${contact.company.id}`}
                        className="inline-flex items-center space-x-2 mb-3 group"
                      >
                        <CompanyLogo
                          logoUrl={contact.company.logoUrl}
                          companyName={contact.company.name}
                          size="sm"
                        />
                        <span className="text-blue-600 hover:text-blue-700 font-medium group-hover:underline">
                          {contact.company.name}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </Link>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {contact.seniority && (
                          <Badge className={getSeniorityBadgeColor(contact.seniority)}>
                            {formatSeniority(contact.seniority)}
                          </Badge>
                        )}
                        {contact.department && (
                          <Badge variant="outline">
                            {contact.department}
                          </Badge>
                        )}
                        {contact.isDecisionMaker && (
                          <Badge className="bg-purple-50 text-purple-700">
                            <Award className="w-3 h-3 mr-1" />
                            Decision Maker
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {contact.email && (
                        isPro ? (
                          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                            <a href={`mailto:${contact.email}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProAction('email')}
                            className="flex-1 sm:flex-none"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                        )
                      )}
                      {contact.phone && (
                        isPro ? (
                          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                            <a href={`tel:${contact.phone}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProAction('phone')}
                            className="flex-1 sm:flex-none"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        )
                      )}
                      {contact.linkedinUrl && (
                        isPro ? (
                          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">LinkedIn</span>
                              <span className="sm:hidden">LI</span>
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProAction('linkedin')}
                            className="flex-1 sm:flex-none"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">LinkedIn</span>
                            <span className="sm:hidden">LI</span>
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Upgrade Prompt */}
        {showUpgradePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Upgrade to Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Unlock direct contact access including email, phone, and LinkedIn with a Pro subscription.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => router.push('/pricing')} className="flex-1">
                    View Plans
                  </Button>
                  <Button variant="outline" onClick={() => setShowUpgradePrompt(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contact.email && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {(contact.company.city || contact.company.state) && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">Location</div>
                        <div className="text-gray-900">
                          {[contact.company.city, contact.company.state].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                  {contact.linkedinUrl && (
                    <div className="flex items-start">
                      <Linkedin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">LinkedIn</div>
                        <a
                          href={contact.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View Profile
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Details */}
              {(contact.primaryRole || contact.territories || contact.accounts || contact.budgetRange) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contact.primaryRole && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Primary Role</div>
                        <div className="text-gray-900">{contact.primaryRole}</div>
                      </div>
                    )}
                    {contact.budgetRange && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Budget Range</div>
                        <div className="text-gray-900">{contact.budgetRange}</div>
                      </div>
                    )}
                    {contact.territories && contact.territories.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">Territories</div>
                        <div className="flex flex-wrap gap-2">
                          {contact.territories.map((territory, index) => (
                            <Badge key={index} variant="outline">{territory}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {contact.accounts && contact.accounts.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">Key Accounts</div>
                        <div className="flex flex-wrap gap-2">
                          {contact.accounts.map((account, index) => (
                            <Badge key={index} variant="outline">{account}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/companies/${contact.company.id}`}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <CompanyLogo
                      logoUrl={contact.company.logoUrl}
                      companyName={contact.company.name}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                          {contact.company.name}
                        </h3>
                        {contact.company.verified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>{contact.company.companyType.replace(/_/g, ' ')}</span>
                        {contact.company.industry && (
                          <>
                            <span>•</span>
                            <span>{contact.company.industry.replace(/_/g, ' ')}</span>
                          </>
                        )}
                      </div>
                      {(contact.company.city || contact.company.state) && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {[contact.company.city, contact.company.state].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </Link>
                </CardContent>
              </Card>

              {/* Company Partnerships & Teams */}
              {contact.partnerships && contact.partnerships.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Company Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contact.partnerships.map((partnership) => (
                        <Link
                          key={partnership.id}
                          href={`/companies/${partnership.partner.id}`}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
                        >
                          <CompanyLogo
                            logoUrl={partnership.partner.logoUrl}
                            companyName={partnership.partner.name}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 truncate text-sm">
                                {partnership.partner.name}
                              </h4>
                              {partnership.partner.verified && (
                                <Shield className="h-3 w-3 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <Badge variant="outline" className="text-xs">
                                {partnership.partnerRole === 'agency' ? 'Agency Partner' : 'Client'}
                              </Badge>
                              {partnership.startDate && (
                                <span className="text-xs text-gray-500">
                                  Since {formatDate(partnership.startDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                    {contact._count.partnerships && contact._count.partnerships > 5 && (
                      <div className="mt-3 pt-3 border-t">
                        <Link
                          href={`/companies/${contact.company.id}?tab=partnerships`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all {contact._count.partnerships} partnerships →
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span className="text-sm">Interactions</span>
                    </div>
                    <span className="font-semibold text-gray-900">{contact._count.interactions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="text-sm">Notes</span>
                    </div>
                    <span className="font-semibold text-gray-900">{contact._count.notes}</span>
                  </div>
                  {contact.communityScore !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Award className="h-4 w-4 mr-2" />
                        <span className="text-sm">Community Score</span>
                      </div>
                      <span className="font-semibold text-gray-900">{contact.communityScore}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Quality */}
              {contact.dataQuality !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>Data Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quality Score</span>
                        <span className="font-semibold text-gray-900">{contact.dataQuality}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            contact.dataQuality >= 80 ? 'bg-green-500' :
                            contact.dataQuality >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${contact.dataQuality}%` }}
                        />
                      </div>
                      {contact.lastVerified && (
                        <div className="text-xs text-gray-500">
                          Last verified: {new Date(contact.lastVerified).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferred Contact Method */}
              {contact.preferredContact && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="text-gray-600 mb-1">Preferred Contact Method</div>
                      <div className="text-gray-900 font-medium">{contact.preferredContact}</div>
                    </div>
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
