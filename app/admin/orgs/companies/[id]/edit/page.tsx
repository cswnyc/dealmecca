'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoUpload } from '@/components/admin/LogoUpload';
import { PartnershipManagement } from '@/components/admin/PartnershipManagement';
import { AdminPageLayout } from '@/components/navigation/PageLayout';
import { ArrowLeft, Save, X, Building2, Users } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  companyType: string;
  agencyType?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  region?: string;
  country: string;
  zipCode?: string;
  employeeCount?: string;
  revenueRange?: string;
  foundedYear?: number;
  stockSymbol?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  headquarters?: string;
  revenue?: string;
  parentCompanyId?: string;
  verified: boolean;
  dataQuality: string;
  aiSummary?: string;
  parentCompany?: {
    id: string;
    name: string;
    companyType: string;
  };
}

interface ParentCompanyOption {
  id: string;
  name: string;
  companyType: string;
}

const companyTypes = [
  { value: 'INDEPENDENT_AGENCY', label: 'Independent Agency' },
  { value: 'HOLDING_COMPANY_AGENCY', label: 'Holding Company Agency' },
  { value: 'MEDIA_HOLDING_COMPANY', label: 'Media Holding Company' },
  { value: 'NATIONAL_ADVERTISER', label: 'National Advertiser' },
  { value: 'LOCAL_ADVERTISER', label: 'Local Advertiser' },
  { value: 'ADTECH_VENDOR', label: 'AdTech Vendor' },
  { value: 'MARTECH_VENDOR', label: 'MarTech Vendor' },
  { value: 'MEDIA_OWNER', label: 'Media Owner' },
  { value: 'BROADCASTER', label: 'Broadcaster' },
  { value: 'PUBLISHER', label: 'Publisher' },
  { value: 'CONSULTANCY', label: 'Consultancy' },
  { value: 'PRODUCTION_COMPANY', label: 'Production Company' },
  { value: 'ADVERTISER', label: 'Advertiser' },
  { value: 'AGENCY', label: 'Agency' },
  { value: 'MEDIA_COMPANY', label: 'Media Company' }
];

const agencyTypes = [
  { value: 'FULL_SERVICE', label: 'Full Service' },
  { value: 'CREATIVE_ONLY', label: 'Creative Only' },
  { value: 'MEDIA_ONLY', label: 'Media Only' },
  { value: 'DIGITAL_ONLY', label: 'Digital Only' },
  { value: 'PROGRAMMATIC_SPECIALIST', label: 'Programmatic Specialist' },
  { value: 'PERFORMANCE_MARKETING', label: 'Performance Marketing' }
];

const employeeRanges = [
  { value: 'STARTUP_1_10', label: '1-10 employees' },
  { value: 'SMALL_11_50', label: '11-50 employees' },
  { value: 'MEDIUM_51_200', label: '51-200 employees' },
  { value: 'LARGE_201_1000', label: '201-1,000 employees' },
  { value: 'ENTERPRISE_1001_5000', label: '1,001-5,000 employees' },
  { value: 'MEGA_5000_PLUS', label: '5,000+ employees' }
];

const regions = [
  { value: 'NORTHEAST', label: 'Northeast' },
  { value: 'SOUTHEAST', label: 'Southeast' },
  { value: 'MIDWEST', label: 'Midwest' },
  { value: 'SOUTHWEST', label: 'Southwest' },
  { value: 'WEST', label: 'West' },
  { value: 'NATIONAL', label: 'National' }
];

const industries = [
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'CPG', label: 'Consumer Packaged Goods' },
  { value: 'FINANCIAL_SERVICES', label: 'Financial Services' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'FOOD_BEVERAGE', label: 'Food & Beverage' },
  { value: 'ENTERTAINMENT_MEDIA', label: 'Entertainment & Media' },
  { value: 'TELECOMMUNICATIONS', label: 'Telecommunications' }
];

const dataQualityOptions = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'ENHANCED', label: 'Enhanced' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'VERIFIED', label: 'Verified' }
];

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [parentCompanies, setParentCompanies] = useState<ParentCompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'details');

  // Fetch company data and potential parent companies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch company details
        const companyResponse = await fetch(`/api/admin/companies/${companyId}`);
        if (!companyResponse.ok) {
          throw new Error('Failed to fetch company details');
        }
        const companyData = await companyResponse.json();
        
        // Fetch potential parent companies (excluding self and subsidiaries)
        const parentResponse = await fetch(`/api/admin/companies/search?exclude=${companyId}&types=HOLDING_COMPANY_AGENCY,MEDIA_HOLDING_COMPANY,AGENCY`);
        const parentData = await parentResponse.json();
        
        setCompany(companyData.company);
        setFormData(companyData.company);
        setParentCompanies(parentData.companies || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }

      const result = await response.json();
      
      // Redirect back to company list with success message
      router.push(`/admin/orgs/companies?updated=${result.company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const headerActions = (
    <div className="flex space-x-2">
      <Link href="/admin/orgs/companies">
        <Button variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </Link>
      <Button 
        type="submit" 
        form="company-form"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <AdminPageLayout
        title="Edit Company"
        description="Loading company details..."
        currentPage="Edit Company"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminPageLayout>
    );
  }

  if (error && !company) {
    return (
      <AdminPageLayout
        title="Edit Company"
        description="Error loading company"
        currentPage="Edit Company"
      >
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/admin/orgs/companies">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title={`Edit ${company?.name || 'Company'}`}
      description="Update company information and relationships"
      currentPage="Edit Company"
      actions={headerActions}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Company Details</span>
            </TabsTrigger>
            <TabsTrigger value="partnerships" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Partnerships</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <form id="company-form" onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Logo Upload */}
            <div>
              <Label>Company Logo</Label>
              <LogoUpload
                entityId={companyId}
                entityType="company"
                currentLogoUrl={formData.logoUrl}
                onLogoChange={(logoUrl) => updateFormData('logoUrl', logoUrl)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification & Type */}
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Type *</Label>
                <Select
                  value={formData.companyType || ''}
                  onValueChange={(value) => updateFormData('companyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(formData.companyType?.includes('AGENCY') || formData.companyType === 'AGENCY') && (
                <div>
                  <Label>Agency Type</Label>
                  <Select
                    value={formData.agencyType || ''}
                    onValueChange={(value) => updateFormData('agencyType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agency type" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Industry</Label>
                <Select
                  value={formData.industry || ''}
                  onValueChange={(value) => updateFormData('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Employee Count</Label>
                <Select
                  value={formData.employeeCount || ''}
                  onValueChange={(value) => updateFormData('employeeCount', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card>
          <CardHeader>
            <CardTitle>Company Relationships</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Parent Company</Label>
              <Select
                value={formData.parentCompanyId || ''}
                onValueChange={(value) => updateFormData('parentCompanyId', value === '' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Parent Company</SelectItem>
                  {parentCompanies.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name} ({parent.companyType.replace(/_/g, ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Set this if the company is a subsidiary or division of another company
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => updateFormData('address', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => updateFormData('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  placeholder="NY"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                />
              </div>
              <div>
                <Label>Region</Label>
                <Select
                  value={formData.region || ''}
                  onValueChange={(value) => updateFormData('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.foundedYear || ''}
                  onChange={(e) => updateFormData('foundedYear', parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <Label htmlFor="stockSymbol">Stock Symbol</Label>
                <Input
                  id="stockSymbol"
                  value={formData.stockSymbol || ''}
                  onChange={(e) => updateFormData('stockSymbol', e.target.value)}
                  placeholder="NYSE:ABC"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div>
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  value={formData.twitterHandle || ''}
                  onChange={(e) => updateFormData('twitterHandle', e.target.value)}
                  placeholder="@company"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="aiSummary">AI Summary</Label>
              <Textarea
                id="aiSummary"
                value={formData.aiSummary || ''}
                onChange={(e) => updateFormData('aiSummary', e.target.value)}
                rows={2}
                placeholder="AI-generated company summary..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Quality & Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Data Quality & Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data Quality</Label>
                <Select
                  value={formData.dataQuality || 'BASIC'}
                  onValueChange={(value) => updateFormData('dataQuality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataQualityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified || false}
                onCheckedChange={(checked) => updateFormData('verified', !!checked)}
              />
              <Label htmlFor="verified" className="text-sm font-medium">
                Mark as verified company
              </Label>
            </div>
          </CardContent>
        </Card>
            </form>
          </TabsContent>

          <TabsContent value="partnerships" className="mt-6">
            {company && (
              <PartnershipManagement 
                companyId={companyId}
                companyName={company.name}
                companyType={company.companyType}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}