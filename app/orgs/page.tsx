'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, Users, Search } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Company {
  id: string;
  name: string;
  companyType: string;
  industry: string;
  city: string;
  state: string;
  verified: boolean;
  _count: {
    contacts: number;
  };
}

export default function OrgsPage() {
  const { data: session, status } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const response = await fetch('/api/orgs/companies?limit=20');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data.companies || []);
        setFilteredCompanies(data.companies || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    // Load companies regardless of auth status for testing
    if (status !== 'loading') {
      fetchCompanies();
    }
  }, [status]);

  // Filter companies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies]);

  if (status === 'loading') {
    return (
      <PageLayout
        title="Organization Charts"
        description="Explore company structures and connections"
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const headerActions = (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-64"
        />
      </div>
      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSearchQuery('')}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout
      title="Organization Charts"
      description="Explore company structures and connections"
      actions={headerActions}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                Active organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((sum, company) => sum + company._count.contacts, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Professional contacts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Rate</CardTitle>
              <Badge variant="secondary" className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.length > 0 
                  ? Math.round((companies.filter(c => c.verified).length / companies.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Data quality
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery ? `Search Results (${filteredCompanies.length})` : 'Recent Companies'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading companies...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchQuery ? `No companies found matching "${searchQuery}"` : 'No companies found'}
                </p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.slice(0, 10).map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-sky-100 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{company.name}</h3>
                        <p className="text-sm text-gray-600">
                          {company.industry} • {company.city}, {company.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={company.verified ? "default" : "secondary"}>
                        {company.verified ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge variant="outline">
                        {company._count.contacts} contacts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 