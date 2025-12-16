'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Users, Mail, Calendar, Filter } from 'lucide-react';
import { motionVariants, designTokens, shouldReduceMotion } from '@/lib/design-tokens';

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  status: 'PENDING' | 'INVITED' | 'REGISTERED' | 'DECLINED';
  createdAt: string;
}

interface WaitlistStats {
  total: number;
  byStatus: Record<string, number>;
  emails?: WaitlistEntry[];
}

export default function WaitlistAdminPage() {
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Accessibility
  const reducedMotion = shouldReduceMotion();

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/waitlist?include_emails=true');

      if (!response.ok) {
        throw new Error('Failed to fetch waitlist data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load waitlist data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!stats?.emails) return;

    const filteredEmails = statusFilter === 'all'
      ? stats.emails
      : stats.emails.filter(entry => entry.status === statusFilter);

    const csvContent = [
      ['Email', 'Source', 'Status', 'Created At'],
      ...filteredEmails.map(entry => [
        entry.email,
        entry.source,
        entry.status,
        new Date(entry.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${statusFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredEmails = () => {
    if (!stats?.emails) return [];
    return statusFilter === 'all'
      ? stats.emails
      : stats.emails.filter(entry => entry.status === statusFilter);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INVITED': return 'bg-blue-100 text-blue-800';
      case 'REGISTERED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
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
            onClick={fetchWaitlistData}
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
          <h1 className="text-3xl font-bold text-foreground">Waitlist Management</h1>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-card p-6 rounded-lg shadow-sm border border-border"
            whileHover={reducedMotion ? {} : designTokens.hover.card}
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Signups</p>
                <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-card p-6 rounded-lg shadow-sm border border-border"
            whileHover={reducedMotion ? {} : designTokens.hover.card}
          >
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats?.byStatus?.PENDING || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-card p-6 rounded-lg shadow-sm border border-border"
            whileHover={reducedMotion ? {} : designTokens.hover.card}
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Invited</p>
                <p className="text-2xl font-bold text-foreground">{stats?.byStatus?.INVITED || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-card p-6 rounded-lg shadow-sm border border-border"
            whileHover={reducedMotion ? {} : designTokens.hover.card}
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Registered</p>
                <p className="text-2xl font-bold text-foreground">{stats?.byStatus?.REGISTERED || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <label className="text-sm font-medium text-muted-foreground">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-input rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All ({stats?.total || 0})</option>
              <option value="PENDING">Pending ({stats?.byStatus?.PENDING || 0})</option>
              <option value="INVITED">Invited ({stats?.byStatus?.INVITED || 0})</option>
              <option value="REGISTERED">Registered ({stats?.byStatus?.REGISTERED || 0})</option>
              <option value="DECLINED">Declined ({stats?.byStatus?.DECLINED || 0})</option>
            </select>
          </div>
        </div>

        {/* Email List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-foreground">
              Email List ({getFilteredEmails().length} entries)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {getFilteredEmails().map((entry) => (
                  <motion.tr
                    key={entry.id}
                    {...motionVariants.fadeIn}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                    className="hover:bg-muted"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {entry.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {getFilteredEmails().length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-muted-foreground">No waitlist entries found.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}