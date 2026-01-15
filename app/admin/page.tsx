'use client';

import { useState, useEffect } from 'react';
import { Users, Building2, MessageSquare, TrendingUp, Plus, Settings, Upload, BarChart3, UserCheck, Shield, Folder, Calendar } from 'lucide-react';
import { PageFrame, PageHeader, PageContent, PageCard, PageGrid } from '@/components/layout/PageFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authedFetch } from '@/lib/authedFetch';
import Link from 'next/link';

interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  totalUsers: number;
  forumPosts: number;
  totalEvents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalContacts: 0,
    totalUsers: 0,
    forumPosts: 0,
    totalEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch companies count
        const companiesRes = await fetch('/api/orgs/companies?limit=1');
        const companiesData = await companiesRes.json();

        // Fetch contacts count
        const contactsRes = await fetch('/api/orgs/contacts?limit=1');
        const contactsData = await contactsRes.json();

        // Fetch real user stats
        const usersRes = await authedFetch('/api/admin/users?include_stats=true&limit=1');
        const usersData = await usersRes.json();

        // Fetch forum posts count
        const forumPostsRes = await authedFetch('/api/admin/forum/posts?limit=1');
        const forumPostsData = await forumPostsRes.json();

        // Fetch events count
        const eventsRes = await authedFetch('/api/admin/events?limit=1');
        const eventsData = await eventsRes.json();

        setStats({
          totalCompanies: companiesData.pagination?.total || 0,
          totalContacts: contactsData.pagination?.total || 0,
          totalUsers: usersData.stats?.total || 0,
          forumPosts: forumPostsData.stats?.total || 0,
          totalEvents: eventsData.pagination?.total || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Keep zero values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Manage Companies',
      description: 'View and edit company data',
      href: '/admin/orgs/companies',
      icon: Building2,
      color: 'text-primary bg-primary/10'
    },
    {
      title: 'Manage Contacts',
      description: 'View and edit contact data',
      href: '/admin/orgs/contacts',
      icon: Users,
      color: 'text-accent bg-accent/10'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and subscriptions',
      href: '/admin/users',
      icon: UserCheck,
      color: 'text-secondary bg-secondary/10'
    },
    {
      title: 'Waitlist Management',
      description: 'View and manage waitlist signups',
      href: '/admin/waitlist',
      icon: Shield,
      color: 'text-primary bg-primary/10'
    },
    {
      title: 'Bulk Import',
      description: 'Upload CSV data for companies and contacts',
      href: '/admin/bulk-import',
      icon: Upload,
      color: 'text-secondary bg-secondary/10'
    },
    {
      title: 'Forum Posts',
      description: 'Manage all forum posts and moderation',
      href: '/admin/forum/posts',
      icon: MessageSquare,
      color: 'text-accent bg-accent/10'
    },
    {
      title: 'Forum Categories',
      description: 'Manage discussion categories and topics',
      href: '/admin/forum-categories',
      icon: Folder,
      color: 'text-accent bg-accent/10'
    },
    {
      title: 'Events Management',
      description: 'Create and manage industry events',
      href: '/admin/events',
      icon: TrendingUp,
      color: 'text-secondary bg-secondary/10'
    }
  ];

  return (
    <PageFrame maxWidth="7xl">
      <PageHeader
        title="Admin Dashboard"
        description="Manage DealMecca platform and data"
        actions={
          <Button asChild>
            <Link href="/admin/bulk-import">
              <Plus className="w-4 h-4 mr-2" />
              Bulk Import
            </Link>
          </Button>
        }
      />

      <PageContent>

        {/* Stats Grid */}
        <PageGrid columns={3}>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary mb-2">Total Companies</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stats.totalCompanies.toLocaleString()
                    )}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-accent mb-2">Total Contacts</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stats.totalContacts.toLocaleString()
                    )}
                  </p>
                </div>
                <Users className="w-8 h-8 text-accent flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-secondary mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stats.totalUsers.toLocaleString()
                    )}
                  </p>
                </div>
                <Users className="w-8 h-8 text-secondary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-accent mb-2">Forum Posts</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stats.forumPosts.toLocaleString()
                    )}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-accent flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-secondary mb-2">Total Events</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stats.totalEvents.toLocaleString()
                    )}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-secondary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </PageGrid>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <PageGrid columns={3}>
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <PageCard hover>
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} flex-shrink-0`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </PageCard>
              </Link>
            ))}
          </PageGrid>
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">System Status</h2>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
                <p className="text-foreground font-medium">All systems operational</p>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Platform is running smoothly with no detected issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageFrame>
  );
}