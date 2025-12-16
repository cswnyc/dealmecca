'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Mail,
  Calendar,
  Activity,
  Crown,
  Shield,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Linkedin,
  Gem,
  Award,
  ShieldCheck
} from 'lucide-react';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { motionVariants, designTokens, shouldReduceMotion } from '@/lib/design-tokens';

interface UserData {
  id: string;
  email: string;
  name: string;
  firebaseUid: string;
  role: 'FREE' | 'PREMIUM' | 'PRO' | 'ADMIN';
  subscriptionTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE';
  isAnonymous: boolean;
  anonymousUsername: string;
  searchesUsed: number;
  dashboardVisits: number;
  searchesThisMonth: number;
  achievementPoints: number;
  stripeCustomerId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  lastDashboardVisit: string;
  emailVerified: boolean;
  linkedinVerified: boolean;
  linkedinUrl?: string;
  companyId?: string;
  company?: {
    id: string;
    name: string;
  };
  forumGems?: number;
  forumContributions?: number;
  verifiedSeller: boolean;
  _count: {
    comments: number;
    posts: number;
    bookmarks: number;
    follows: number;
    ForumPost: number;
    ForumComment: number;
  };
}

interface UserStats {
  total: number;
  activeUsers: number;
  verifiedUsers: number;
  totalForumGems: number;
  byRole: Record<string, number>;
  bySubscriptionTier: Record<string, number>;
  bySubscriptionStatus: Record<string, number>;
}

interface UsersResponse {
  users: UserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: UserStats;
}

export default function UsersAdminPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit modal
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Accessibility
  const reducedMotion = shouldReduceMotion();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, subscriptionFilter, statusFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        include_stats: currentPage === 1 ? 'true' : 'false'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (subscriptionFilter) params.append('subscriptionTier', subscriptionFilter);
      if (statusFilter) params.append('subscriptionStatus', statusFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const userData = await response.json();
      setData(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export' })
      });

      if (!response.ok) throw new Error('Export failed');

      const { users } = await response.json();

      const csvContent = [
        ['ID', 'Email', 'Name', 'Role', 'Subscription Tier', 'Status', 'Anonymous Username', 'Searches Used', 'Dashboard Visits', 'Created At'],
        ...users.map((user: UserData) => [
          user.id,
          user.email || '',
          user.name || '',
          user.role,
          user.subscriptionTier,
          user.subscriptionStatus,
          user.anonymousUsername || '',
          user.searchesUsed || 0,
          user.dashboardVisits || 0,
          new Date(user.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      });

      if (!response.ok) throw new Error('Failed to update user');

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      throw err;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'PREMIUM': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-yellow-100 text-yellow-800';
      case 'PREMIUM': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PAST_DUE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border"
              whileHover={reducedMotion ? {} : designTokens.hover.card}
            >
              <div className="flex items-center">
                <Users className="w-8 h-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{data.stats.total}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border"
              whileHover={reducedMotion ? {} : designTokens.hover.card}
            >
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                  <p className="text-2xl font-bold text-foreground">{data.stats.verifiedUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border"
              whileHover={reducedMotion ? {} : designTokens.hover.card}
            >
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active (30 days)</p>
                  <p className="text-2xl font-bold text-foreground">{data.stats.activeUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border"
              whileHover={reducedMotion ? {} : designTokens.hover.card}
            >
              <div className="flex items-center">
                <Gem className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Forum Gems</p>
                  <p className="text-2xl font-bold text-foreground">{data.stats.totalForumGems.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border"
              whileHover={reducedMotion ? {} : designTokens.hover.card}
            >
              <div className="flex items-center">
                <Crown className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
                  <p className="text-2xl font-bold text-foreground">{data.stats.byRole.ADMIN || 0}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-input rounded-md text-sm text-foreground"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-input rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Roles</option>
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="border border-input rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Tiers</option>
              <option value="FREE">Free Tier</option>
              <option value="PREMIUM">Premium Tier</option>
              <option value="ENTERPRISE">Enterprise Tier</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-input rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PAST_DUE">Past Due</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setSubscriptionFilter('');
                setStatusFilter('');
              }}
              className="px-3 py-2 text-muted-foreground border border-input rounded-md hover:bg-muted text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-foreground">
              Users ({data?.pagination.total || 0} total)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role & Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Forum Gems
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {data?.users.map((user) => (
                  <motion.tr
                    key={user.id}
                    {...motionVariants.fadeIn}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                    className="hover:bg-muted"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-foreground">
                              {user.name || user.email || 'Anonymous User'}
                            </div>
                            {!user.firebaseUid && (
                              <div
                                className="flex items-center text-red-600"
                                title="Missing Firebase UID - user cannot log in!"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email || user.anonymousUsername || 'No email'}
                          </div>
                          {user.anonymousUsername && (
                            <div className="text-xs text-purple-600">@{user.anonymousUsername}</div>
                          )}
                          {user.company && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {user.company.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          {user.emailVerified ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-700 font-medium">Email</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">No Email</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {user.linkedinVerified ? (
                            <>
                              <Linkedin className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-blue-700 font-medium">LinkedIn</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">No LinkedIn</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {user.verifiedSeller ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-purple-600" />
                              <span className="text-xs text-purple-700 font-medium">Verified Seller</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Not Verified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                        <div className="text-xs text-muted-foreground">{user.subscriptionTier}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Gem className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-bold text-amber-700">
                            {user.forumGems || 0}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user._count.ForumPost || 0} posts, {user._count.ForumComment || 0} comments
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div>{formatDate(user.createdAt)}</div>
                        {user.lastDashboardVisit && (
                          <div className="text-xs">Last: {formatDate(user.lastDashboardVisit)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {data?.users.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-muted-foreground">No users found matching the current filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {data.pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
                  disabled={currentPage === data.pagination.pages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          user={editingUser}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}