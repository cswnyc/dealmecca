'use client';

import { useState, useEffect } from 'react';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyType: string;
  onSuccess: () => void;
}

interface Company {
  id: string;
  name: string;
  companyType: string;
  industry: string | null;
  city: string | null;
  state: string | null;
}

export default function PartnershipModal({
  isOpen,
  onClose,
  companyId,
  companyType,
  onSuccess
}: PartnershipModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    partnerId: '',
    relationshipType: 'AGENCY_CLIENT',
    isAOR: false,
    services: '',
    startDate: '',
    endDate: '',
    isActive: true,
    contractValue: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen, searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '10000', // Large limit to get all companies for client-side filtering
        sortBy: 'name'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/orgs/companies?${params}`);
      if (!response.ok) throw new Error('Failed to fetch companies');

      const data = await response.json();
      const allCompanies = data.companies || [];

      // Define company type groups
      const AGENCY_TYPES = ['AGENCY', 'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY'];
      const ADVERTISER_TYPES = ['ADVERTISER', 'NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER'];

      // Filter by opposite company type
      let filtered;
      if (AGENCY_TYPES.includes(companyType)) {
        // For agencies, show advertisers/brands
        filtered = allCompanies.filter((c: Company) => ADVERTISER_TYPES.includes(c.companyType));
      } else {
        // For advertisers, show agencies
        filtered = allCompanies.filter((c: Company) => AGENCY_TYPES.includes(c.companyType));
      }

      setCompanies(filtered);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Convert contractValue to number or null
      const contractValueNum = formData.contractValue
        ? parseFloat(formData.contractValue.replace(/[^0-9.-]/g, ''))
        : null;

      const response = await fetch(`/api/orgs/companies/${companyId}/partnerships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contractValue: contractValueNum,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          services: formData.services || null,
          notes: formData.notes || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create partnership');
      }

      onSuccess();
      onClose();

      // Reset form
      setFormData({
        partnerId: '',
        relationshipType: 'AGENCY_CLIENT',
        isAOR: false,
        services: '',
        startDate: '',
        endDate: '',
        isActive: true,
        contractValue: '',
        notes: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Add Partnership</h2>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Partner Company Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {companyType === 'AGENCY' || companyType === 'MEDIA_HOLDING_COMPANY'
                ? 'Client Company'
                : 'Agency'} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
            />
            <select
              required
              value={formData.partnerId}
              onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a company...</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} {company.city && `- ${company.city}, ${company.state}`}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Relationship Type
            </label>
            <select
              value={formData.relationshipType}
              onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="AGENCY_CLIENT">Agency-Client</option>
              <option value="STRATEGIC_PARTNER">Strategic Partner</option>
              <option value="VENDOR">Vendor</option>
              <option value="RESELLER">Reseller</option>
            </select>
          </div>

          {/* AOR Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAOR"
              checked={formData.isAOR}
              onChange={(e) => setFormData({ ...formData, isAOR: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="isAOR" className="ml-2 block text-sm text-foreground">
              Agency of Record (AOR)
            </label>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Services / Scope
            </label>
            <textarea
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              rows={3}
              placeholder="e.g., Media planning & buying, Creative services"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Contract Value */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contract Value
            </label>
            <input
              type="text"
              value={formData.contractValue}
              onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
              placeholder="e.g., $100,000/year"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-foreground">
              Partnership is active
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Partnership'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
