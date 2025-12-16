'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Info, Network, Plus } from 'lucide-react';
import PartnershipModal from '@/components/admin/PartnershipModal';

interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  companyType: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  employeeCount: string | null;
  revenue: string | null;
  verified: boolean;
  dataQuality: string | null;
  parentCompany: {
    id: string;
    name: string;
    logoUrl: string | null;
  } | null;
  subsidiaries: Array<{
    id: string;
    name: string;
    logoUrl: string | null;
    companyType: string;
  }>;
  contacts: Array<{
    id: string;
    fullName: string;
    title: string | null;
    email: string | null;
    seniority: string;
    verified: boolean;
  }>;
  partnerships: Array<{
    id: string;
    relationshipType: string;
    isAOR: boolean;
    services: string | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    partner: {
      id: string;
      name: string;
      logoUrl: string | null;
      industry: string | null;
    };
    partnerRole: 'agency' | 'advertiser';
  }>;
  duties: Array<{
    id: string;
    name: string;
    category: string;
    description: string | null;
  }>;
  teams: Array<{
    id: string;
    name: string;
    type: string;
    description: string | null;
    isActive: boolean;
    clientCompany?: {
      id: string;
      name: string;
      logoUrl: string | null;
      companyType: string;
      verified: boolean;
    } | null;
    agencyCompany?: {
      id: string;
      name: string;
      logoUrl: string | null;
      companyType: string;
      verified: boolean;
    } | null;
    _count: {
      ContactTeam: number;
      PartnershipTeam: number;
    };
  }>;
  _count: {
    contacts: number;
    subsidiaries: number;
    partnerships: number;
    teams: number;
  };
}

export default function CompanyViewPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'partnerships' | 'people' | 'teams' | 'subsidiaries' | 'duties'>('overview');
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [partnershipSaving, setPartnershipSaving] = useState(false);
  const [partnershipError, setPartnershipError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCompany(params.id as string);
    }
  }, [params.id]);

  const fetchCompany = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orgs/companies/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company');
      }

      const data = await response.json();
      setCompany(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartnership = async (partnershipId: string) => {
    if (!confirm('Are you sure you want to delete this partnership? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orgs/companies/${company?.id}/partnerships/${partnershipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete partnership');
      }

      // Refresh company data to show updated partnerships list
      if (company?.id) {
        await fetchCompany(company.id);
      }
    } catch (err: any) {
      alert(`Error deleting partnership: ${err.message}`);
      console.error('Error deleting partnership:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Company not found'}</p>
          <Link href="/admin/orgs/companies" className="text-red-600 hover:text-red-700 mt-2 inline-block">
            ← Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/orgs/companies" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Companies
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                {company.name}
                {company.verified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground mt-1">
                {company.companyType.replace(/_/g, ' ')}
                {company.industry && ` • ${company.industry}`}
              </p>
              {company.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block"
                >
                  {company.website} →
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {(company.companyType === 'HOLDING_COMPANY_AGENCY' ||
              company.companyType === 'MEDIA_HOLDING_COMPANY') && (
              <Link
                href={`/admin/orgs/companies/create?parentCompanyId=${company.id}&parentName=${encodeURIComponent(company.name)}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Subsidiary
              </Link>
            )}
            <Link
              href={`/admin/orgs/companies/${company.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Company
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-input'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'people'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-input'
            }`}
          >
            People ({company._count.contacts})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1 ${
              activeTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-input'
            }`}
            title="Company teams"
          >
            Teams ({company._count.teams})
            <Info className="w-3 h-3 opacity-50" />
          </button>
          <button
            onClick={() => setActiveTab('duties')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'duties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-input'
            }`}
          >
            Duties ({company.duties?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('partnerships')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'partnerships'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-input'
            }`}
          >
            Partnerships ({company._count.partnerships})
          </button>
          {(company.companyType === 'HOLDING_COMPANY_AGENCY' ||
            company.companyType === 'MEDIA_HOLDING_COMPANY' ||
            company.subsidiaries.length > 0) && (
            <button
              onClick={() => setActiveTab('subsidiaries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1 ${
                activeTab === 'subsidiaries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-input'
              }`}
              title="Companies owned by this organization (corporate hierarchy)"
            >
              Subsidiaries ({company._count.subsidiaries})
              <Info className="w-3 h-3 opacity-50" />
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {company.description && (
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 mt-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{company.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Company Stats</h2>
              <dl className="grid grid-cols-2 gap-4">
                {company.employeeCount && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Employees</dt>
                    <dd className="text-lg font-semibold text-foreground">{company.employeeCount}</dd>
                  </div>
                )}
                {company.revenue && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Revenue</dt>
                    <dd className="text-lg font-semibold text-foreground">{company.revenue}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-muted-foreground">Contacts</dt>
                  <dd className="text-lg font-semibold text-foreground">{company._count.contacts}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Partnerships</dt>
                  <dd className="text-lg font-semibold text-foreground">{company._count.partnerships}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Location</h2>
              <div className="space-y-2 text-sm">
                {company.city && (
                  <p className="text-muted-foreground">{company.city}{company.state && `, ${company.state}`}</p>
                )}
                {company.country && (
                  <p className="text-muted-foreground">{company.country}</p>
                )}
              </div>
            </div>

            {/* Parent Company */}
            {company.parentCompany && (
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Parent Company</h2>
                <Link href={`/admin/orgs/companies/${company.parentCompany.id}`} className="flex items-center gap-3 hover:bg-muted p-2 -m-2 rounded-lg">
                  {company.parentCompany.logoUrl && (
                    <img
                      src={company.parentCompany.logoUrl}
                      alt={company.parentCompany.name}
                      className="w-10 h-10 rounded object-cover border border-border"
                    />
                  )}
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    {company.parentCompany.name}
                  </span>
                </Link>
              </div>
            )}

            {/* Data Quality */}
            {company.dataQuality && (
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Data Quality</h2>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    company.dataQuality === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                    company.dataQuality === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                    company.dataQuality === 'STANDARD' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {company.dataQuality}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Teams</h2>
              <Link
                href={`/admin/orgs/companies/${company.id}/edit#teams`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Manage Teams
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Teams within this company. Manage team structure, members, and responsibilities.
            </p>
          </div>
          <div className="divide-y divide-border">
            {company.teams.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No teams yet. <Link href={`/admin/orgs/companies/${company.id}/edit#teams`} className="text-blue-600 hover:text-blue-700">Create a team</Link> to get started.
              </div>
            ) : (
              company.teams.map((team) => {
                // Determine which company name to display
                // If viewing from advertiser perspective, show agency name
                // If viewing from agency perspective, show client name
                const displayName = team.agencyCompany?.name || team.clientCompany?.name || team.name;
                const relationshipLabel = team.agencyCompany ? 'Partner Agency' : team.clientCompany ? 'Agency Client' : null;

                return (
                  <div key={team.id} className="p-6 hover:bg-muted">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{displayName}</h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {team.type?.replace(/_/g, ' ')}
                          </span>
                          {relationshipLabel && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {relationshipLabel}
                            </span>
                          )}
                          {!team.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        {team.description && (
                          <p className="text-sm text-muted-foreground mb-2">{team.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{team._count.ContactTeam} member{team._count.ContactTeam !== 1 ? 's' : ''}</span>
                          {team._count.PartnershipTeam > 0 && (
                            <span>{team._count.PartnershipTeam} client{team._count.PartnershipTeam !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orgs/companies/${company.id}/edit#teams`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'people' && (
        <div className="bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Contacts</h2>
            <Link
              href={`/admin/orgs/contacts/create?companyId=${company.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Contact
            </Link>
          </div>
          <div className="divide-y divide-border">
            {company.contacts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No contacts yet
              </div>
            ) : (
              company.contacts.map((contact) => (
                <div key={contact.id} className="p-6 hover:bg-muted">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{contact.fullName}</h3>
                        {contact.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      {contact.title && (
                        <p className="text-sm text-muted-foreground mb-1">{contact.title}</p>
                      )}
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <span>{contact.seniority}</span>
                        {contact.email && <span>{contact.email}</span>}
                      </div>
                    </div>
                    <Link
                      href={`/admin/orgs/contacts/${contact.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'duties' && (
        <div className="bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Duties</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage duties for this company. Duties define the services and capabilities this company provides.
              </p>
            </div>
            <Link
              href={`/admin/orgs/companies/${company.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Manage Duties
            </Link>
          </div>
          <div className="p-6">
            {!company.duties || company.duties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No duties assigned yet</p>
                <Link
                  href={`/admin/orgs/companies/${company.id}/edit`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add duties →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.duties.map((duty) => (
                  <div
                    key={duty.id}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">{duty.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{duty.category}</p>
                      {duty.description && (
                        <p className="text-sm text-muted-foreground mt-2">{duty.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'partnerships' && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Partnerships</h2>
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Partnerships will be available for DSP/SSP, AdTech, and Publishers</p>
            <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
          </div>
        </div>
      )}

      {activeTab === 'subsidiaries' && (
        <div className="bg-white rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Subsidiaries</h2>
              <p className="text-sm text-muted-foreground">
                Companies owned by this organization in the corporate hierarchy. For example, WPP owns GroupM, which owns Mindshare.
              </p>
            </div>
            <Link
              href={`/admin/orgs/companies/create?parentCompanyId=${company.id}&parentName=${encodeURIComponent(company.name)}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Subsidiary
            </Link>
          </div>
          {company.subsidiaries.length === 0 ? (
            <div className="p-12 text-center">
              <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No subsidiaries yet</h3>
              <p className="text-muted-foreground mb-6">
                Add regional offices, agency brands, or other subsidiary companies to build out your corporate hierarchy.
              </p>
              <Link
                href={`/admin/orgs/companies/create?parentCompanyId=${company.id}&parentName=${encodeURIComponent(company.name)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add First Subsidiary
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {company.subsidiaries.map((subsidiary) => (
                <div key={subsidiary.id} className="p-6 hover:bg-muted">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {subsidiary.logoUrl && (
                        <img
                          src={subsidiary.logoUrl}
                          alt={subsidiary.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">{subsidiary.name}</h3>
                        <p className="text-sm text-muted-foreground">{subsidiary.companyType.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/orgs/companies/${subsidiary.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Partnership Modal */}
      <PartnershipModal
        isOpen={showPartnershipModal}
        onClose={() => setShowPartnershipModal(false)}
        companyId={company.id}
        companyType={company.companyType}
        onSuccess={() => {
          setShowPartnershipModal(false);
          fetchCompany(company.id);
        }}
      />
    </div>
  );
}
