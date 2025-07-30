'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, Users, Search, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
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

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
}

interface BulkUploadResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    contact: string;
    error: string;
  }>;
}

export default function OrgsPage() {
  const { data: session, status } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin and bulk upload state
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);

  // Check user session and admin status
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/session-status');
        if (response.ok) {
          const sessionData = await response.json();
          const activeToken = sessionData.activeToken;
          if (activeToken) {
            setUserSession(activeToken);
            setIsAdmin(activeToken.role === 'ADMIN');
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error);
      }
    }
    
    checkSession();
  }, []);

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

  // Handle file upload
  const handleFileUpload = async () => {
    if (!uploadFile || !isAdmin) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Parse CSV file
      const text = await uploadFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const contacts = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          id: `temp-${index}`,
          firstName: values[0] || '',
          lastName: values[1] || '',
          title: values[2] || '',
          email: values[3] || '',
          phone: values[4] || '',
          linkedinUrl: values[5] || '',
          department: values[6] || '',
          company: values[7] || '',
          companyId: companies.find(c => c.name.toLowerCase() === (values[7] || '').toLowerCase())?.id || '',
          isValid: !!(values[0] && values[1] && values[2] && values[7])
        };
      }).filter(contact => contact.isValid);

      // Send to bulk import API
      const response = await fetch('/api/admin/contacts/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts }),
      });

      const result = await response.json();
      setUploadResult(result);
      
      if (result.success) {
        // Clear the file input
        setUploadFile(null);
        // Refresh companies data to show updated contact counts
        const companiesResponse = await fetch('/api/orgs/companies?limit=20');
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData.companies || []);
          setFilteredCompanies(companiesData.companies || []);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [{ row: 0, contact: '', error: 'Failed to process file' }]
      });
    } finally {
      setUploading(false);
    }
  };

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

        {/* Admin Bulk Upload Section */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
                <Button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload CSV</span>
                    </>
                  )}
                </Button>
              </div>
              {uploadResult && (
                <div className="mt-4 p-3 border rounded-lg">
                  {uploadResult.success ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>{uploadResult.imported} contacts imported successfully!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span>{uploadResult.failed} contacts failed to import.</span>
                      {uploadResult.errors.length > 0 && (
                        <ul className="mt-2 text-sm">
                          {uploadResult.errors.map((error, index) => (
                            <li key={index}>
                              Row {error.row + 1}: {error.contact} - {error.error}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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