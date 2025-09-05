'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Database, Building2, BarChart3, Plus, Upload, TrendingUp, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { AdminPageLayout } from '@/components/navigation/PageLayout';

interface AdminStats {
  overview: {
    totalCompanies: {
      value: number;
      change: number;
      changeLabel: string;
    };
    totalContacts: {
      value: number;
      change: number;
      changeLabel: string;
    };
    verifiedCompanies: {
      value: number;
      rate: number;
      changeLabel: string;
    };
    dataQuality: {
      score: number;
      changeLabel: string;
    };
  };
  contacts: {
    total: number;
    verified: number;
    verificationRate: number;
    byDepartment: Array<{ name: string; count: number }>;
    bySeniority: Array<{ name: string; count: number }>;
  };
  companies: {
    total: number;
    verified: number;
    verificationRate: number;
  };
  activity: Array<{
    id: string;
    type: string;
    message: string;
    company?: string;
    timestamp: string;
  }>;
  lastUpdated: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Admin Dashboard"
        description="Manage DealMecca organization data and platform settings"
      >
        <div className="space-y-6">
          {/* Loading skeleton for metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
          
          {/* Loading skeleton for action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="space-y-2">
                  <div className="h-9 bg-gray-200 rounded"></div>
                  <div className="h-9 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminPageLayout
        title="Admin Dashboard"
        description="Manage DealMecca organization data and platform settings"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  {error || "We couldn't load your dashboard data. Please try again."}
                </p>
                <Button onClick={fetchStats} className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Retry Loading
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminPageLayout>
    );
  }

  const headerActions = (
    <div className="text-right">
      <p className="text-sm text-gray-500">Last updated</p>
      <p className="text-xs text-gray-400">
        {new Date(stats.lastUpdated).toLocaleString()}
      </p>
    </div>
  );

  return (
    <AdminPageLayout
      title="Admin Dashboard"
      description="Manage DealMecca organization data and platform settings"
      actions={headerActions}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Companies</CardTitle>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.overview.totalCompanies.value}</div>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats.overview.totalCompanies.change}
                </Badge>
                <p className="text-xs text-gray-600">{stats.overview.totalCompanies.changeLabel}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Contacts</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.overview.totalContacts.value}</div>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="mr-2 bg-green-50 text-green-700 hover:bg-green-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats.overview.totalContacts.change}
                </Badge>
                <p className="text-xs text-gray-600">{stats.overview.totalContacts.changeLabel}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Verified</CardTitle>
              <Shield className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.contacts.verified}</div>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2 border-amber-200 text-amber-700">
                  {stats.contacts.verificationRate}%
                </Badge>
                <p className="text-xs text-gray-600">verification rate</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Data Quality</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.overview.dataQuality.score}%</div>
              <div className="flex items-center mt-2">
                <Badge 
                  variant={stats.overview.dataQuality.score >= 80 ? "default" : "secondary"}
                  className={stats.overview.dataQuality.score >= 80 
                    ? "mr-2 bg-purple-100 text-purple-800" 
                    : "mr-2 bg-gray-100 text-gray-800"
                  }
                >
                  {stats.overview.dataQuality.changeLabel}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Insights - Only shown if we have data */}
        {stats.contacts.byDepartment.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Top Departments</span>
                </CardTitle>
                <CardDescription>Contact distribution by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.contacts.byDepartment.slice(0, 4).map((dept, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${(dept.count / stats.contacts.total) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 font-medium w-6 text-right">{dept.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span>Top Seniority Levels</span>
                </CardTitle>
                <CardDescription>Contact distribution by seniority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.contacts.bySeniority.slice(0, 4).map((sen, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{sen.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${(sen.count / stats.contacts.total) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 font-medium w-6 text-right">{sen.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Core Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Company Management - Working */}
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Company Management</span>
              </CardTitle>
              <CardDescription>
                Add, edit, and manage company profiles and organizational data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/orgs/companies">
                <Button className="w-full" size="sm">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Companies
                  <Badge className="ml-2">{stats.companies.total}</Badge>
                </Button>
              </Link>
              <Link href="/admin/orgs/companies/create">
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Company
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contact Management - Working */}
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Contact Management</span>
              </CardTitle>
              <CardDescription>
                Manage professional contacts and organizational relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/orgs/contacts">
                <Button className="w-full" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Contacts
                  <Badge className="ml-2">{stats.contacts.total}</Badge>
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/admin/orgs/contacts/create">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Contact
                  </Button>
                </Link>
                <Link href="/admin/orgs/contacts/import">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="w-3 h-3 mr-1" />
                    Import CSV
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Import - Primary Feature */}
          <Card className="hover:shadow-xl transition-all border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 md:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">Bulk Import</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Priority
                </Badge>
              </CardTitle>
              <CardDescription className="text-green-700">
                🚀 Scale from 17 to 5000+ companies with intelligent media seller targeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/bulk-import">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Start Bulk Import
                </Button>
              </Link>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-green-700 font-medium">Scaling Progress</span>
                  <span className="text-green-600">17 → 5,000+</span>
                </div>
                <div className="w-full bg-green-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '0.34%'}}></div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  ⚡ CSV, Excel & JSON supported • 📊 Media seller intelligence
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Forum Management - Working */}
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>Forum Management</span>
              </CardTitle>
              <CardDescription>
                Manage forum categories, topics, and community discussions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/forum-categories">
                <Button className="w-full" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
              <Link href="/admin/forum-categories?create=true">
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Topic
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Events Management - Working */}
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span>Event Management</span>
              </CardTitle>
              <CardDescription>
                Create and manage industry events and networking opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/events">
                <Button className="w-full" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
              </Link>
              <Link href="/admin/events/new">
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest data management activities across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.activity.length > 0 ? (
                stats.activity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.message}</p>
                      {activity.company && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          Company: {activity.company}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Activity will appear here as you use the system</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
} 