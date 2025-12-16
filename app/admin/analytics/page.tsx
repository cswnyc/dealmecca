'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  Building2,
  Users,
  Handshake,
  MapPin,
  Briefcase,
  CheckCircle,
  Link as LinkIcon,
  Globe,
  UserCheck,
  Star,
  Eye,
  Search,
  Bookmark,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Analytics {
  overview: {
    totalCompanies: number;
    totalAgencies: number;
    totalAdvertisers: number;
    totalContacts: number;
    verifiedCompanies: number;
    companiesWithLogos: number;
    totalPartnerships: number;
    verificationRate: number;
    logoCompletionRate: number;
  };
  growth: {
    recentCompanies: number;
    recentContacts: number;
    companiesLast30Days: number;
    contactsLast30Days: number;
  };
  distribution: {
    byState: Array<{ state: string; count: number }>;
    byIndustry: Array<{ industry: string; count: number }>;
    byAgencyType: Array<{ agencyType: string; count: number }>;
    byPartnershipType: Array<{ partnershipType: string; count: number }>;
  };
  contacts: {
    total: number;
    byRole: Array<{ role: string; count: number }>;
    bySeniority: Array<{ seniority: string; count: number }>;
  };
  completeness: {
    withDescriptions: number;
    withWebsite: number;
    withLinkedIn: number;
    descriptionRate: number;
    websiteRate: number;
    linkedInRate: number;
  };
  engagement: {
    totalFollows: number;
    userFollows: number;
    totalSearches: number;
    savedSearches: number;
    topCompanies: Array<{
      id: string;
      name: string;
      logoUrl: string;
      type: string;
      followers: number;
    }>;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/analytics');

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">Loading comprehensive platform statistics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h2>
          <p className="text-red-600">{error || 'Unable to load analytics data'}</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-muted min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Comprehensive insights into your advertising platform</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.totalCompanies.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Agencies</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.totalAgencies.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Advertisers</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.totalAdvertisers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.totalContacts.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Growth (Last 30 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Companies</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.growth.recentCompanies}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Contacts</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.growth.recentContacts}</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Partnerships</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.totalPartnerships}</p>
                </div>
                <Handshake className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.verifiedCompanies}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data Completeness */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Data Quality & Completeness</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">With Logos</p>
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.overview.companiesWithLogos}</p>
              <div className="mt-3 bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${analytics.overview.logoCompletionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{analytics.overview.logoCompletionRate.toFixed(1)}% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">With Descriptions</p>
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.completeness.withDescriptions}</p>
              <div className="mt-3 bg-muted rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${analytics.completeness.descriptionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{analytics.completeness.descriptionRate.toFixed(1)}% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">With Websites</p>
                <LinkIcon className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.completeness.withWebsite}</p>
              <div className="mt-3 bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${analytics.completeness.websiteRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{analytics.completeness.websiteRate.toFixed(1)}% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Verification Rate</p>
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.overview.verifiedCompanies}</p>
              <div className="mt-3 bg-muted rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${analytics.overview.verificationRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{analytics.overview.verificationRate.toFixed(1)}% verified</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribution & Engagement - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top States */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Top States by Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.distribution.byState.slice(0, 5).map((item, index) => (
                <div key={item.state} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-muted-foreground w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-foreground">{item.state || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.distribution.byState[0].count) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-foreground w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
              Top Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.distribution.byIndustry.slice(0, 5).map((item, index) => (
                <div key={item.industry} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-muted-foreground w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {item.industry || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.distribution.byIndustry[0].count) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-foreground w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Analytics & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Contact Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-green-600" />
              Top Contact Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.contacts.byRole.slice(0, 5).map((item, index) => (
                <div key={item.role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-muted-foreground w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-foreground">{item.role || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.contacts.byRole[0].count) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-foreground w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Platform Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-foreground">Total Follows</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{analytics.engagement.totalFollows}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Search className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-foreground">Your Searches</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{analytics.engagement.totalSearches}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bookmark className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">Saved Searches</span>
                </div>
                <span className="text-lg font-bold text-green-600">{analytics.engagement.savedSearches}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Followed Companies */}
      {analytics.engagement.topCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Most Followed Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analytics.engagement.topCompanies.map((company, index) => (
                <div
                  key={company.id}
                  className="flex flex-col items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="relative">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-3 text-center line-clamp-2">
                    {company.name}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">{company.followers}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
