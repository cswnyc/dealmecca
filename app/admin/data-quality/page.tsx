'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DataQualityStats {
  companies: {
    total: number;
    unverified: number;
    missingWebsite: number;
    missingIndustry: number;
    missingLocation: number;
  };
  contacts: {
    total: number;
    unverified: number;
    missingEmail: number;
    missingPhone: number;
    missingLinkedIn: number;
    inactive: number;
  };
  partnerships: {
    total: number;
    active: number;
    inactive: number;
    missingDates: number;
  };
}

export default function DataQualityPage() {
  const [stats, setStats] = useState<DataQualityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch company stats
      const companiesRes = await fetch('/api/orgs/companies?limit=10000');
      const companiesData = await companiesRes.json();
      const companies = companiesData.companies || [];

      // Fetch contact stats
      const contactsRes = await fetch('/api/orgs/contacts?limit=10000');
      const contactsData = await contactsRes.json();
      const contacts = contactsData.contacts || [];

      setStats({
        companies: {
          total: companies.length,
          unverified: companies.filter((c: any) => !c.verified).length,
          missingWebsite: companies.filter((c: any) => !c.website).length,
          missingIndustry: companies.filter((c: any) => !c.industry).length,
          missingLocation: companies.filter((c: any) => !c.city && !c.state).length
        },
        contacts: {
          total: contacts.length,
          unverified: contacts.filter((c: any) => !c.verified).length,
          missingEmail: contacts.filter((c: any) => !c.email).length,
          missingPhone: contacts.filter((c: any) => !c.phone).length,
          missingLinkedIn: contacts.filter((c: any) => !c.linkedinUrl).length,
          inactive: contacts.filter((c: any) => !c.isActive).length
        },
        partnerships: {
          total: 0,
          active: 0,
          inactive: 0,
          missingDates: 0
        }
      });

      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Failed to load stats'}</p>
        </div>
      </div>
    );
  }

  const getQualityScore = (category: 'companies' | 'contacts') => {
    if (category === 'companies') {
      const issues = stats.companies.unverified + stats.companies.missingWebsite +
                    stats.companies.missingIndustry + stats.companies.missingLocation;
      const maxIssues = stats.companies.total * 4; // 4 potential issues per company
      return Math.round(((maxIssues - issues) / maxIssues) * 100);
    } else {
      const issues = stats.contacts.unverified + stats.contacts.missingEmail +
                    stats.contacts.missingPhone + stats.contacts.missingLinkedIn + stats.contacts.inactive;
      const maxIssues = stats.contacts.total * 5; // 5 potential issues per contact
      return Math.round(((maxIssues - issues) / maxIssues) * 100);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Quality Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and improve data quality across companies, contacts, and partnerships</p>
      </div>

      {/* Overall Quality Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Companies Quality</h2>
            <div className={`text-3xl font-bold ${getQualityScore('companies') >= 80 ? 'text-green-600' : getQualityScore('companies') >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {getQualityScore('companies')}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getQualityScore('companies') >= 80 ? 'bg-green-600' : getQualityScore('companies') >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
              style={{ width: `${getQualityScore('companies')}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contacts Quality</h2>
            <div className={`text-3xl font-bold ${getQualityScore('contacts') >= 80 ? 'text-green-600' : getQualityScore('contacts') >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {getQualityScore('contacts')}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getQualityScore('contacts') >= 80 ? 'bg-green-600' : getQualityScore('contacts') >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
              style={{ width: `${getQualityScore('contacts')}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Total Records</h2>
            <div className="text-3xl font-bold text-blue-600">
              {stats.companies.total + stats.contacts.total}
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Companies:</span>
              <span className="font-medium">{stats.companies.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Contacts:</span>
              <span className="font-medium">{stats.contacts.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Companies - Data Issues</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Unverified Companies</h3>
                  <p className="text-sm text-gray-600">Companies not yet verified</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.companies.unverified}</div>
                  <Link href="/admin/orgs/companies?verified=false" className="text-sm text-blue-600 hover:text-blue-700">
                    View →
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Missing Website</h3>
                  <p className="text-sm text-gray-600">Companies without website URL</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.companies.missingWebsite}</div>
                  <span className="text-sm text-gray-500">
                    {Math.round((stats.companies.missingWebsite / stats.companies.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Missing Industry</h3>
                  <p className="text-sm text-gray-600">Companies without industry classification</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.companies.missingIndustry}</div>
                  <span className="text-sm text-gray-500">
                    {Math.round((stats.companies.missingIndustry / stats.companies.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Missing Location</h3>
                  <p className="text-sm text-gray-600">Companies without city/state</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.companies.missingLocation}</div>
                  <span className="text-sm text-gray-500">
                    {Math.round((stats.companies.missingLocation / stats.companies.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Issues */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contacts - Data Issues</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Unverified Contacts</h3>
                  <p className="text-sm text-gray-600">Contacts not yet verified</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.contacts.unverified}</div>
                  <Link href="/admin/orgs/contacts?verified=false" className="text-sm text-blue-600 hover:text-blue-700">
                    View →
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Missing Email</h3>
                  <p className="text-sm text-gray-600">Contacts without email address</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.contacts.missingEmail}</div>
                  <span className="text-sm text-gray-500">
                    {Math.round((stats.contacts.missingEmail / stats.contacts.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Missing Phone</h3>
                  <p className="text-sm text-gray-600">Contacts without phone number</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.contacts.missingPhone}</div>
                  <span className="text-sm text-gray-500">
                    {Math.round((stats.contacts.missingPhone / stats.contacts.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Missing LinkedIn</h3>
                  <p className="text-sm text-gray-600">Contacts without LinkedIn profile</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.contacts.missingLinkedIn}</div>
                  <span className="text-sm text-gray-500">
                    {Math.round((stats.contacts.missingLinkedIn / stats.contacts.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Inactive Contacts</h3>
                  <p className="text-sm text-gray-600">Contacts marked as inactive</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.contacts.inactive}</div>
                  <Link href="/admin/orgs/contacts?isActive=false" className="text-sm text-blue-600 hover:text-blue-700">
                    View →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Improve Data Quality</h3>
        <p className="text-blue-800 mb-4">
          High-quality data leads to better insights and more effective outreach. Focus on verifying records and filling in missing information.
        </p>
        <div className="flex gap-3">
          <Link href="/admin/orgs/companies" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Review Companies
          </Link>
          <Link href="/admin/orgs/contacts" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Review Contacts
          </Link>
        </div>
      </div>
    </div>
  );
}
