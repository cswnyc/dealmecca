'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
  _count: {
    contacts: number;
    subsidiaries: number;
    partnerships: number;
  };
}

export default function CompanyViewPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'partnerships' | 'contacts' | 'subsidiaries'>('overview');

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {company.name}
                {company.verified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
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
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('partnerships')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'partnerships'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Partnerships ({company._count.partnerships})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contacts ({company._count.contacts})
          </button>
          {company.subsidiaries.length > 0 && (
            <button
              onClick={() => setActiveTab('subsidiaries')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subsidiaries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subsidiaries ({company._count.subsidiaries})
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h2>
              <dl className="grid grid-cols-2 gap-4">
                {company.employeeCount && (
                  <div>
                    <dt className="text-sm text-gray-500">Employees</dt>
                    <dd className="text-lg font-semibold text-gray-900">{company.employeeCount}</dd>
                  </div>
                )}
                {company.revenue && (
                  <div>
                    <dt className="text-sm text-gray-500">Revenue</dt>
                    <dd className="text-lg font-semibold text-gray-900">{company.revenue}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Contacts</dt>
                  <dd className="text-lg font-semibold text-gray-900">{company._count.contacts}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Partnerships</dt>
                  <dd className="text-lg font-semibold text-gray-900">{company._count.partnerships}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
              <div className="space-y-2 text-sm">
                {company.city && (
                  <p className="text-gray-700">{company.city}{company.state && `, ${company.state}`}</p>
                )}
                {company.country && (
                  <p className="text-gray-700">{company.country}</p>
                )}
              </div>
            </div>

            {/* Parent Company */}
            {company.parentCompany && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Parent Company</h2>
                <Link href={`/admin/orgs/companies/${company.parentCompany.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 -m-2 rounded-lg">
                  {company.parentCompany.logoUrl && (
                    <img
                      src={company.parentCompany.logoUrl}
                      alt={company.parentCompany.name}
                      className="w-10 h-10 rounded object-cover border border-gray-200"
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Quality</h2>
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

      {activeTab === 'partnerships' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {company.companyType === 'AGENCY' || company.companyType === 'MEDIA_HOLDING_COMPANY'
                ? 'Clients'
                : 'Agency Partners'}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {company.partnerships.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No partnerships yet
              </div>
            ) : (
              company.partnerships.map((partnership) => (
                <div key={partnership.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {partnership.partner.logoUrl && (
                        <img
                          src={partnership.partner.logoUrl}
                          alt={partnership.partner.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{partnership.partner.name}</h3>
                          {partnership.isAOR && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              AOR
                            </span>
                          )}
                          {!partnership.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        {partnership.partner.industry && (
                          <p className="text-sm text-gray-600 mb-2">{partnership.partner.industry}</p>
                        )}
                        {partnership.services && (
                          <p className="text-sm text-gray-700 mb-2">{partnership.services}</p>
                        )}
                        <div className="flex gap-4 text-xs text-gray-500">
                          {partnership.startDate && (
                            <span>Started: {new Date(partnership.startDate).toLocaleDateString()}</span>
                          )}
                          {partnership.endDate && (
                            <span>Ended: {new Date(partnership.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/admin/orgs/companies/${partnership.partner.id}`}
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

      {activeTab === 'contacts' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
            <Link
              href={`/admin/orgs/contacts/create?companyId=${company.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Contact
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {company.contacts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No contacts yet
              </div>
            ) : (
              company.contacts.map((contact) => (
                <div key={contact.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{contact.fullName}</h3>
                        {contact.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      {contact.title && (
                        <p className="text-sm text-gray-600 mb-1">{contact.title}</p>
                      )}
                      <div className="flex gap-3 text-sm text-gray-500">
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

      {activeTab === 'subsidiaries' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Subsidiaries</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {company.subsidiaries.map((subsidiary) => (
              <div key={subsidiary.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {subsidiary.logoUrl && (
                      <img
                        src={subsidiary.logoUrl}
                        alt={subsidiary.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{subsidiary.name}</h3>
                      <p className="text-sm text-gray-600">{subsidiary.companyType.replace(/_/g, ' ')}</p>
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
        </div>
      )}
    </div>
  );
}
