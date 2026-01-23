'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Building2, Check } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
  companyType: string;
  city: string | null;
  state: string | null;
  parentCompanyId: string | null;
}

interface AddSubsidiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCompanyId: string;
  parentCompanyName: string;
  existingSubsidiaryIds: string[];
  onSuccess: () => void;
}

export default function AddSubsidiaryModal({
  isOpen,
  onClose,
  parentCompanyId,
  parentCompanyName,
  existingSubsidiaryIds,
  onSuccess,
}: AddSubsidiaryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  // Debounced search
  const searchCompanies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCompanies([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/orgs/companies?search=${encodeURIComponent(query)}&limit=20`);

      if (!response.ok) {
        throw new Error('Failed to search companies');
      }

      const data = await response.json();

      // Filter out:
      // 1. The parent company itself
      // 2. Companies that are already subsidiaries
      // 3. Companies that already have a different parent (optional - could allow re-parenting)
      const filteredCompanies = (data.companies || []).filter((company: Company) => {
        if (company.id === parentCompanyId) return false;
        if (existingSubsidiaryIds.includes(company.id)) return false;
        return true;
      });

      setCompanies(filteredCompanies);
    } catch (err: any) {
      setError(err.message);
      console.error('Error searching companies:', err);
    } finally {
      setLoading(false);
    }
  }, [parentCompanyId, existingSubsidiaryIds]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCompanies(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchCompanies]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setCompanies([]);
      setSelectedCompanyIds([]);
      setError('');
    }
  }, [isOpen]);

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanyIds(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleAddSubsidiaries = async () => {
    if (selectedCompanyIds.length === 0) return;

    try {
      setSaving(true);
      setError('');

      // Update all selected companies' parentCompanyId
      const results = await Promise.allSettled(
        selectedCompanyIds.map(companyId =>
          fetch(`/api/orgs/companies/${companyId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              parentCompanyId: parentCompanyId,
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to add subsidiary');
            }
            return response.json();
          })
        )
      );

      // Check for any failures
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        const successCount = results.length - failures.length;
        if (successCount > 0) {
          setError(`Added ${successCount} companies, but ${failures.length} failed`);
        } else {
          throw new Error('Failed to add subsidiaries');
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding subsidiaries:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedCompanies = companies.filter(c => selectedCompanyIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Existing Company as Subsidiary</h2>
              <p className="text-sm text-gray-500 mt-1">
                Search for a company to add as a subsidiary of {parentCompanyName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Results */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : searchQuery && companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No companies found matching "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start typing to search for companies</p>
                </div>
              ) : (
                companies.map((company) => {
                  const isSelected = selectedCompanyIds.includes(company.id);
                  return (
                    <button
                      key={company.id}
                      onClick={() => toggleCompanySelection(company.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                        <p className="text-sm text-gray-500">
                          {company.companyType.replace(/_/g, ' ')}
                          {company.city && ` • ${company.city}${company.state ? `, ${company.state}` : ''}`}
                        </p>
                        {company.parentCompanyId && company.parentCompanyId !== parentCompanyId && (
                          <p className="text-xs text-amber-600 mt-1">
                            Already has a parent company (will be reassigned)
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            {selectedCompanyIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedCompanyIds.length} {selectedCompanyIds.length === 1 ? 'company' : 'companies'}</strong> will become {selectedCompanyIds.length === 1 ? 'a subsidiary' : 'subsidiaries'} of <strong>{parentCompanyName}</strong>
                </p>
                {selectedCompanies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedCompanies.map(c => (
                      <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {c.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompanySelection(c.id);
                          }}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubsidiaries}
                disabled={selectedCompanyIds.length === 0 || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  `Add ${selectedCompanyIds.length || ''} ${selectedCompanyIds.length === 1 ? 'Subsidiary' : 'Subsidiaries'}`.trim()
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
