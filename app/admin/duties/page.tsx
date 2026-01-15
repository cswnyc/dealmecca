'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter,
  Tag,
  Briefcase,
  Target,
  Users as UsersIcon,
  Globe,
  Building2,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motionVariants, designTokens, shouldReduceMotion } from '@/lib/design-tokens';
import { authedFetch } from '@/lib/authedFetch';

interface Duty {
  id: string;
  name: string;
  category: DutyCategory;
  description?: string;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    CompanyDuty: number;
    PartnershipDuty: number;
    ContactDuty: number;
  };
}

type DutyCategory = 'ROLE' | 'MEDIA_TYPE' | 'BRAND' | 'BUSINESS_LINE' | 'GOAL' | 'AUDIENCE' | 'GEOGRAPHY';

const CATEGORY_INFO: Record<DutyCategory, { label: string; icon: any; color: string }> = {
  ROLE: { label: 'Role', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
  MEDIA_TYPE: { label: 'Media Type', icon: Tag, color: 'bg-purple-100 text-purple-800' },
  BRAND: { label: 'Brand', icon: Building2, color: 'bg-pink-100 text-pink-800' },
  BUSINESS_LINE: { label: 'Business Line', icon: TrendingUp, color: 'bg-green-100 text-green-800' },
  GOAL: { label: 'Goal', icon: Target, color: 'bg-orange-100 text-orange-800' },
  AUDIENCE: { label: 'Audience', icon: UsersIcon, color: 'bg-emerald-100 text-emerald-800' },
  GEOGRAPHY: { label: 'Geography', icon: Globe, color: 'bg-indigo-100 text-indigo-800' }
};

export default function DutiesAdminPage() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DutyCategory | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newDuty, setNewDuty] = useState({
    name: '',
    category: '' as DutyCategory | '',
    description: '',
    isGlobal: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const reducedMotion = shouldReduceMotion();

  useEffect(() => {
    fetchDuties();
  }, [categoryFilter]);

  const fetchDuties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await authedFetch(`/api/admin/duties?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch duties');
      }

      const data = await response.json();
      setDuties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load duties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDuty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDuty.name.trim()) {
      setFormError('Duty name is required');
      return;
    }

    if (!newDuty.category) {
      setFormError('Category is required');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const response = await authedFetch('/api/admin/duties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDuty)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create duty');
      }

      // Reset form and refresh list
      setNewDuty({ name: '', category: '', description: '', isGlobal: true });
      setShowAddForm(false);
      await fetchDuties();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create duty');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDuty = async (dutyId: string, dutyName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${dutyName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await authedFetch(`/api/admin/duties/${dutyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete duty');
      }

      await fetchDuties();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete duty');
    }
  };

  // Filter duties by search term
  const filteredDuties = duties.filter(duty =>
    duty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    duty.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group duties by category
  const groupedDuties = filteredDuties.reduce((acc, duty) => {
    if (!acc[duty.category]) {
      acc[duty.category] = [];
    }
    acc[duty.category].push(duty);
    return acc;
  }, {} as Record<DutyCategory, Duty[]>);

  // Calculate total usage
  const getTotalUsage = (duty: Duty) => {
    return duty._count.CompanyDuty + duty._count.PartnershipDuty + duty._count.ContactDuty;
  };

  if (loading && duties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-muted rounded"></div>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Duties Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage duties that can be assigned to companies, partnerships, and contacts
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Duty
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Add Duty Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Duty</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDuty} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Duty Name *</Label>
                    <Input
                      id="name"
                      value={newDuty.name}
                      onChange={(e) => setNewDuty({ ...newDuty, name: e.target.value })}
                      placeholder="e.g., Programmatic, AOR, CPG"
                      className={formError && !newDuty.name ? 'border-red-500' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newDuty.category}
                      onValueChange={(value) => setNewDuty({ ...newDuty, category: value as DutyCategory })}
                    >
                      <SelectTrigger className={formError && !newDuty.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                          return (
                            <SelectItem key={key} value={key}>
                              {info.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newDuty.description}
                    onChange={(e) => setNewDuty({ ...newDuty, description: e.target.value })}
                    placeholder="Brief description of this duty"
                  />
                </div>

                {formError && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{formError}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Duty'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAddForm(false);
                    setFormError('');
                    setNewDuty({ name: '', category: '', description: '', isGlobal: true });
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search duties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as DutyCategory | '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  return (
                    <SelectItem key={key} value={key}>
                      {info.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duties List - Grouped by Category */}
        <div className="space-y-6">
          {Object.entries(groupedDuties).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No duties found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedDuties).map(([category, categoryDuties]) => {
              const categoryInfo = CATEGORY_INFO[category as DutyCategory];
              const Icon = categoryInfo.icon;

              return (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5" />
                        <CardTitle>{categoryInfo.label}</CardTitle>
                        <Badge variant="outline">{categoryDuties.length}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryDuties.map((duty) => (
                        <motion.div
                          key={duty.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          whileHover={reducedMotion ? {} : { scale: 1.02 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{duty.name}</h4>
                              {duty.description && (
                                <p className="text-sm text-muted-foreground mt-1">{duty.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDuty(duty.id, duty.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="text-xs text-muted-foreground">
                              Total usage: {getTotalUsage(duty)}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span title="Company assignments">{duty._count.CompanyDuty} Co.</span>
                              <span>•</span>
                              <span title="Partnership assignments">{duty._count.PartnershipDuty} Part.</span>
                              <span>•</span>
                              <span title="Contact assignments">{duty._count.ContactDuty} Cont.</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {duties.length > 0 && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total duties: {duties.length}</span>
                <span>
                  Total assignments: {duties.reduce((sum, d) => sum + getTotalUsage(d), 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
