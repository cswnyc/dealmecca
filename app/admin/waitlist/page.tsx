'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Users, Mail, Calendar, Filter, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import { motionVariants, designTokens, shouldReduceMotion } from '@/lib/design-tokens';

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  status: 'PENDING' | 'INVITED' | 'REGISTERED' | 'DECLINED';
  createdAt: string;
  isDuplicate?: boolean;
  existingUser?: {
    id: string;
    role: string;
    accountStatus: string;
    createdAt: string;
  };
}

interface WaitlistStats {
  total: number;
  byStatus: Record<string, number>;
  emails?: WaitlistEntry[];
  duplicateCount?: number;
}

export default function WaitlistAdminPage() {
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleDeleteEntry = async (entry: WaitlistEntry): Promise<void> => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${entry.email} from the waitlist?\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(entry.id);
      setError('');

      const response = await fetch(`/api/waitlist?id=${entry.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete entry');
      }

      // Refresh the list
      await fetchWaitlistData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      console.error('Delete entry failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConvertToUser = async (entry: WaitlistEntry): Promise<void> => {
    if (entry.isDuplicate) {
      alert(`Cannot convert: A user account already exists for ${entry.email}`);
      return;
    }

    const confirmed = window.confirm(
      `Convert ${entry.email} to a full user account?\n\n` +
      `This will:\n` +
      `- Create a FREE tier user account\n` +
      `- Set account status to APPROVED\n` +
      `- Mark waitlist entry as REGISTERED\n\n` +
      `The user will need to complete sign-in to set their password.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(entry.id);
      setError('');

      const response = await fetch('/api/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: entry.id,
          action: 'convert'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert entry');
      }

      // Show success message
      alert(`Successfully created user account for ${entry.email}`);

      // Refresh the list
      await fetchWaitlistData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert entry');
      console.error('Convert entry failed:', err);
    } finally {
      setProcessingId(null);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
            whileHover={reducedMotion ? {} : { scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Total</p>
                <p className="text-3xl font-bold text-foreground">{stats?.total || 0}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-shadow"
            whileHover={reducedMotion ? {} : { scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Pending</p>
                <p className="text-3xl font-bold text-foreground">{stats?.byStatus?.PENDING || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow"
            whileHover={reducedMotion ? {} : { scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Invited</p>
                <p className="text-3xl font-bold text-foreground">{stats?.byStatus?.INVITED || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow"
            whileHover={reducedMotion ? {} : { scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Registered</p>
                <p className="text-3xl font-bold text-foreground">{stats?.byStatus?.REGISTERED || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow"
            whileHover={reducedMotion ? {} : { scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Duplicates</p>
                <p className="text-3xl font-bold text-foreground">{stats?.duplicateCount || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-foreground">{entry.email}</span>
                        {entry.isDuplicate && (
                          <div className="flex items-center space-x-1">
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              User Exists
                            </span>
                          </div>
                        )}
                      </div>
                      {entry.isDuplicate && entry.existingUser && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          User ID: {entry.existingUser.id.substring(0, 8)}... | Role: {entry.existingUser.role} | Status: {entry.existingUser.accountStatus}
                        </div>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {entry.status === 'PENDING' && !entry.isDuplicate && (
                          <button
                            onClick={() => handleConvertToUser(entry)}
                            disabled={processingId === entry.id}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === entry.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Converting...</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Convert</span>
                              </>
                            )}
                          </button>
                        )}
                        {entry.status === 'PENDING' && entry.isDuplicate && (
                          <span className="inline-flex items-center space-x-1 px-3 py-1.5 text-muted-foreground text-xs italic">
                            Already a user
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteEntry(entry)}
                          disabled={processingId === entry.id}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === entry.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </div>
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