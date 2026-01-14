'use client';

import { useState } from 'react';
import { X, ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { motionVariants, designTokens } from '@/lib/design-tokens';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    role: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    emailVerified: boolean;
    linkedinVerified: boolean;
    forumGems: number;
    verifiedSeller: boolean;
    accountStatus?: string;
    approvedAt?: string | null;
    approvalNotes?: string | null;
  };
  onSave: (userId: string, updates: any) => Promise<void>;
}

export function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
    verifiedSeller: user.verifiedSeller,
    accountStatus: user.accountStatus || 'APPROVED',
    approvalNotes: user.approvalNotes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(user.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...motionVariants.fadeIn}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: designTokens.zIndex.modal }}
          />

          {/* Modal */}
          <motion.div
            {...motionVariants.scaleIn}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: designTokens.zIndex.modal }}
          >
            <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Edit User</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Update user information and permissions
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {/* User Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">User Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="User's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Approval Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Account Approval</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Account Status
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={(): void => setFormData({ ...formData, accountStatus: 'APPROVED' })}
                          className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${
                            formData.accountStatus === 'APPROVED'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-border hover:border-green-300'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Approved</span>
                        </button>

                        <button
                          type="button"
                          onClick={(): void => setFormData({ ...formData, accountStatus: 'PENDING' })}
                          className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${
                            formData.accountStatus === 'PENDING'
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-border hover:border-yellow-300'
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                          <span className="font-semibold">Pending</span>
                        </button>

                        <button
                          type="button"
                          onClick={(): void => setFormData({ ...formData, accountStatus: 'REJECTED' })}
                          className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${
                            formData.accountStatus === 'REJECTED'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-border hover:border-red-300'
                          }`}
                        >
                          <XCircle className="w-5 h-5" />
                          <span className="font-semibold">Rejected</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Approval Notes (Optional)
                      </label>
                      <textarea
                        value={formData.approvalNotes}
                        onChange={(e): void => setFormData({ ...formData, approvalNotes: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Add notes about the approval decision..."
                        rows={3}
                      />
                    </div>

                    {user.approvedAt && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Previously approved on: {new Date(user.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Permissions & Access</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="FREE">Free</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="PRO">Pro</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Subscription Tier
                      </label>
                      <select
                        value={formData.subscriptionTier}
                        onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="FREE">Free</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Subscription Status
                      </label>
                      <select
                        value={formData.subscriptionStatus}
                        onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="CANCELED">Canceled</option>
                        <option value="TRIALING">Trialing</option>
                        <option value="PAST_DUE">Past Due</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="INCOMPLETE">Incomplete</option>
                        <option value="INCOMPLETE_EXPIRED">Incomplete Expired</option>
                      </select>
                    </div>
                  </div>

                  {/* Verified Seller Toggle */}
                  <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Verified Seller</p>
                        <p className="text-xs text-muted-foreground">
                          Mark this user as a verified media sales professional
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.verifiedSeller}
                        onChange={(e) => setFormData({ ...formData, verifiedSeller: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                {/* Stats Display (Read-only) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">User Stats (Read-only)</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Email Verified</p>
                      <p className="text-sm font-semibold text-foreground">
                        {user.emailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">LinkedIn Verified</p>
                      <p className="text-sm font-semibold text-foreground">
                        {user.linkedinVerified ? 'Yes' : 'No'}
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Forum Gems</p>
                      <p className="text-sm font-semibold text-foreground">
                        {user.forumGems}
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">User ID</p>
                      <p className="text-xs font-mono text-foreground truncate">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-foreground border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
