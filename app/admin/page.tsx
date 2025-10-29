'use client';

import { useState, useEffect } from 'react';
import { Users, Building2, MessageSquare, TrendingUp, Plus, Settings, Upload, BarChart3, UserCheck, Shield, Folder, Calendar } from 'lucide-react';

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
        const usersRes = await fetch('/api/admin/users?include_stats=true&limit=1');
        const usersData = await usersRes.json();

        // Fetch forum posts count
        const forumPostsRes = await fetch('/api/admin/forum/posts?limit=1');
        const forumPostsData = await forumPostsRes.json();

        // Fetch events count
        const eventsRes = await fetch('/api/admin/events?limit=1');
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
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Manage Contacts',
      description: 'View and edit contact data',
      href: '/admin/orgs/contacts',
      icon: Users,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and subscriptions',
      href: '/admin/users',
      icon: UserCheck,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Waitlist Management',
      description: 'View and manage waitlist signups',
      href: '/admin/waitlist',
      icon: Shield,
      color: 'text-cyan-600 bg-cyan-50'
    },
    {
      title: 'Bulk Import',
      description: 'Upload CSV data for companies and contacts',
      href: '/admin/bulk-import',
      icon: Upload,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Forum Posts',
      description: 'Manage all forum posts and moderation',
      href: '/admin/forum/posts',
      icon: MessageSquare,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'Forum Categories',
      description: 'Manage discussion categories and topics',
      href: '/admin/forum-categories',
      icon: Folder,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      title: 'Events Management',
      description: 'Create and manage industry events',
      href: '/admin/events',
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage DealMecca platform and data</p>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="/admin/bulk-import"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Import
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-600 mb-2">Total Companies</p>
                <p className="text-3xl font-bold text-blue-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalCompanies.toLocaleString()
                  )}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-green-600 mb-2">Total Contacts</p>
                <p className="text-3xl font-bold text-green-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalContacts.toLocaleString()
                  )}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-purple-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-purple-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalUsers.toLocaleString()
                  )}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-600 mb-2">Forum Posts</p>
                <p className="text-3xl font-bold text-orange-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.forumPosts.toLocaleString()
                  )}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-indigo-600 mb-2">Total Events</p>
                <p className="text-3xl font-bold text-indigo-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalEvents.toLocaleString()
                  )}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-600 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="group p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} flex-shrink-0`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <p className="text-green-800 font-medium">All systems operational</p>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Platform is running smoothly with no detected issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}