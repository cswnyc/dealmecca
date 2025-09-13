'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Shield, Building2 } from 'lucide-react';
import { AdminPageLayout } from '@/components/navigation/PageLayout';
import { EnhancedCompanyCard } from '@/components/admin/EnhancedCompanyCard';

interface Company {
  id: string;
  name: string;
  companyType: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  verified: boolean;
  _count: { 
    contacts: number;
    agencyPartnerships?: number;
    advertiserPartnerships?: number;
  };
  agencyPartnerships?: Array<{
    id: string;
    relationshipType: string;
    advertiser: {
      id: string;
      name: string;
      companyType: string;
      logoUrl?: string;
      city?: string;
      state?: string;
      verified: boolean;
    };
  }>;
  advertiserPartnerships?: Array<{
    id: string;
    relationshipType: string;
    agency: {
      id: string;
      name: string;
      companyType: string;
      logoUrl?: string;
      city?: string;
      state?: string;
      verified: boolean;
    };
  }>;
  createdAt: string;
}

export default function CompaniesAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [searchQuery]);

  const fetchCompanies = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await fetch(`/api/admin/companies?${params}`);
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (companyId: string, verified: boolean) => {
    try {
      await fetch(`/api/admin/companies/${companyId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !verified })
      });
      fetchCompanies();
    } catch (error) {
      console.error('Failed to update verification:', error);
    }
  };

  const headerActions = (
    <Link href="/admin/orgs/companies/create">
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Add Company
      </Button>
    </Link>
  );

  if (loading) {
    return (
      <AdminPageLayout
        title="Company Management"
        description="Manage organizations and agencies"
        currentPage="Companies"
        actions={headerActions}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Company Management"
      description="Manage organizations and agencies"
      currentPage="Companies"
      actions={headerActions}
    >
      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => {
            // Transform partnerships to match EnhancedCompanyCard interface
            const transformedCompany = {
              ...company,
              agencyPartnerships: company.agencyPartnerships?.map(p => ({
                ...p,
                partner: p.advertiser,
                currentCompanyRole: 'agency' as const
              })),
              advertiserPartnerships: company.advertiserPartnerships?.map(p => ({
                ...p,
                partner: p.agency,
                currentCompanyRole: 'advertiser' as const
              }))
            };

            return (
              <EnhancedCompanyCard
                key={company.id}
                company={transformedCompany}
                createdAt={company.createdAt}
                onToggleVerification={toggleVerification}
              />
            );
          })}
        </div>

        {companies.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new company.
            </p>
            <div className="mt-6">
              <Link href="/admin/orgs/companies/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
} 