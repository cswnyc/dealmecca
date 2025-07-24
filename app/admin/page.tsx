'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Database, Building2, BarChart3, Plus, Upload, TrendingUp } from 'lucide-react';
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
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchStats}>Retry</Button>
            </div>
          </CardContent>
        </Card>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalCompanies.value}</div>
              <div className="flex items-center mt-1">
                <Badge variant="secondary" className="mr-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.overview.totalCompanies.change}
                </Badge>
                <p className="text-xs text-gray-600">{stats.overview.totalCompanies.changeLabel}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalContacts.value}</div>
              <div className="flex items-center mt-1">
                <Badge variant="secondary" className="mr-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.overview.totalContacts.change}
                </Badge>
                <p className="text-xs text-gray-600">{stats.overview.totalContacts.changeLabel}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Contacts</CardTitle>
              <Shield className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contacts.verified}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-2">
                  {stats.contacts.verificationRate}%
                </Badge>
                <p className="text-xs text-gray-600">verification rate</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.dataQuality.score}%</div>
              <div className="flex items-center mt-1">
                <Badge 
                  variant={stats.overview.dataQuality.score >= 80 ? "default" : "secondary"}
                  className="mr-2"
                >
                  {stats.overview.dataQuality.changeLabel}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Contacts by Department</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.contacts.byDepartment.slice(0, 5).map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dept.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(dept.count / stats.contacts.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{dept.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span>Contacts by Seniority</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.contacts.bySeniority.slice(0, 5).map((sen, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sen.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(sen.count / stats.contacts.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{sen.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Company Management</span>
              </CardTitle>
              <CardDescription>
                Add, edit, and verify company profiles and organizational data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/orgs/companies">
                <Button className="w-full">
                  Manage Companies
                </Button>
              </Link>
              <Link href="/admin/orgs/companies/create">
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Company
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Contact Management</span>
              </CardTitle>
              <CardDescription>
                Manage professional contacts and organizational relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/orgs/contacts">
                <Button className="w-full">
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

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                <span>Data Verification</span>
              </CardTitle>
              <CardDescription>
                Review and verify data quality for accuracy and completeness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/orgs/verification">
                <Button className="w-full">
                  Verification Queue
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Quality Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span>Data Import</span>
              </CardTitle>
              <CardDescription>
                Bulk import and export organizational data from external sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/orgs/import">
                <Button className="w-full">
                  Import Data
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-red-700" />
                <span>Analytics</span>
              </CardTitle>
              <CardDescription>
                View platform usage analytics and data insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">
                View Analytics
              </Button>
              <Button variant="outline" className="w-full">
                Usage Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <span>System Settings</span>
              </CardTitle>
              <CardDescription>
                Configure platform settings and administrative preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/settings">
                <Button className="w-full">
                  Settings
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                User Management
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest data management activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.activity.length > 0 ? (
                stats.activity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      {activity.company && (
                        <p className="text-xs text-gray-500">Company: {activity.company}</p>
                      )}
                      <p className="text-xs text-gray-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
} 