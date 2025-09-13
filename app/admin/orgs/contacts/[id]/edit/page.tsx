'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LogoUpload } from '@/components/admin/LogoUpload';
import { AdminPageLayout } from '@/components/navigation/PageLayout';
import { ArrowLeft, Save, Search } from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  logoUrl?: string;
  personalEmail?: string;
  department?: string;
  seniority: string;
  primaryRole?: string;
  companyId: string;
  territories?: string;
  accounts?: string;
  budgetRange?: string;
  isDecisionMaker: boolean;
  verified: boolean;
  dataQuality: string;
  isActive: boolean;
  preferredContact?: string;
  company: {
    id: string;
    name: string;
    companyType: string;
    city?: string;
    state?: string;
  };
}

interface CompanyOption {
  id: string;
  name: string;
  companyType: string;
  city?: string;
  state?: string;
  logoUrl?: string;
}

const departments = [
  { value: 'ACCOUNT_MANAGEMENT', label: 'Account Management' },
  { value: 'BUSINESS_DEVELOPMENT', label: 'Business Development' },
  { value: 'CREATIVE', label: 'Creative' },
  { value: 'DATA_ANALYTICS', label: 'Data & Analytics' },
  { value: 'DIGITAL_MARKETING', label: 'Digital Marketing' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HUMAN_RESOURCES', label: 'Human Resources' },
  { value: 'MEDIA_PLANNING', label: 'Media Planning' },
  { value: 'MEDIA_BUYING', label: 'Media Buying' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'PROGRAMMATIC', label: 'Programmatic' },
  { value: 'STRATEGY', label: 'Strategy' },
  { value: 'TECHNOLOGY', label: 'Technology' }
];

const seniorityLevels = [
  { value: 'INTERN', label: 'Intern' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'ASSOCIATE', label: 'Associate' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'VP_LEVEL', label: 'VP Level' },
  { value: 'C_LEVEL', label: 'C-Level' }
];

const contactRoles = [
  { value: 'BUYER', label: 'Buyer' },
  { value: 'PLANNER', label: 'Planner' },
  { value: 'DECISION_MAKER', label: 'Decision Maker' },
  { value: 'INFLUENCER', label: 'Influencer' },
  { value: 'GATEKEEPER', label: 'Gatekeeper' },
  { value: 'TECHNICAL_CONTACT', label: 'Technical Contact' }
];

const budgetRanges = [
  { value: 'UNDER_100K', label: 'Under $100K' },
  { value: 'K100_500K', label: '$100K - $500K' },
  { value: 'K500_1M', label: '$500K - $1M' },
  { value: 'M1_5M', label: '$1M - $5M' },
  { value: 'M5_10M', label: '$5M - $10M' },
  { value: 'M10_PLUS', label: '$10M+' }
];

const contactMethods = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'IN_PERSON', label: 'In Person' }
];

const dataQualityOptions = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'ENHANCED', label: 'Enhanced' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'VERIFIED', label: 'Verified' }
];

export default function EditContactPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({});

  // Fetch contact data and companies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch contact details
        const contactResponse = await fetch(`/api/admin/contacts/${contactId}`);
        if (!contactResponse.ok) {
          throw new Error('Failed to fetch contact details');
        }
        const contactData = await contactResponse.json();
        
        // Fetch companies for company selector
        const companiesResponse = await fetch('/api/admin/companies/search?limit=100');
        const companiesData = await companiesResponse.json();
        
        setContact(contactData.contact);
        setFormData(contactData.contact);
        setCompanies(companiesData.companies || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact data');
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchData();
    }
  }, [contactId]);

  // Fetch companies based on search
  useEffect(() => {
    const searchCompanies = async () => {
      if (companySearchQuery.length > 2) {
        try {
          const response = await fetch(`/api/admin/companies/search?q=${encodeURIComponent(companySearchQuery)}&limit=50`);
          const data = await response.json();
          setCompanies(data.companies || []);
        } catch (error) {
          console.error('Failed to search companies:', error);
        }
      }
    };

    const debounce = setTimeout(searchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [companySearchQuery]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Generate fullName if firstName/lastName changed
      if (formData.firstName || formData.lastName) {
        formData.fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
      }

      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact');
      }

      const result = await response.json();
      
      // Redirect back to contacts list with success message
      router.push(`/admin/orgs/contacts?updated=${result.contact.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Edit Contact"
        description="Loading contact details..."
        currentPage="Edit Contact"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminPageLayout>
    );
  }

  if (error && !contact) {
    return (
      <AdminPageLayout
        title="Edit Contact"
        description="Error loading contact"
        currentPage="Edit Contact"
      >
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/admin/orgs/contacts">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contacts
            </Button>
          </Link>
        </div>
      </AdminPageLayout>
    );
  }

  const headerActions = (
    <div className="flex space-x-2">
      <Link href="/admin/orgs/contacts">
        <Button variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </Link>
      <Button 
        type="submit" 
        form="contact-form"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );

  return (
    <AdminPageLayout
      title={`Edit ${contact?.fullName || 'Contact'}`}
      description="Update contact information and company association"
      currentPage="Edit Contact"
      actions={headerActions}
    >
      <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => updateFormData('title', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="personalEmail">Personal Email</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={formData.personalEmail || ''}
                  onChange={(e) => updateFormData('personalEmail', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div>
              <Label>Profile Photo</Label>
              <LogoUpload
                entityId={contactId}
                entityType="contact"
                currentLogoUrl={formData.logoUrl}
                onLogoChange={(logoUrl) => updateFormData('logoUrl', logoUrl)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Association */}
        <Card>
          <CardHeader>
            <CardTitle>Company Association</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={formData.companyId || ''}
                  onValueChange={(value) => updateFormData('companyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center space-x-2">
                          {company.logoUrl && (
                            <img 
                              src={company.logoUrl} 
                              alt="" 
                              className="w-4 h-4 rounded object-cover"
                            />
                          )}
                          <span>{company.name}</span>
                          <span className="text-xs text-gray-500">
                            ({company.companyType.replace(/_/g, ' ')})
                          </span>
                          {company.city && company.state && (
                            <span className="text-xs text-gray-400">
                              - {company.city}, {company.state}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Search and select the company this contact works for
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select
                  value={formData.department || ''}
                  onValueChange={(value) => updateFormData('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Seniority Level *</Label>
                <Select
                  value={formData.seniority || ''}
                  onValueChange={(value) => updateFormData('seniority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    {seniorityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Primary Role</Label>
                <Select
                  value={formData.primaryRole || ''}
                  onValueChange={(value) => updateFormData('primaryRole', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary role" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Budget Range</Label>
                <Select
                  value={formData.budgetRange || ''}
                  onValueChange={(value) => updateFormData('budgetRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="territories">Territories</Label>
              <Input
                id="territories"
                value={formData.territories || ''}
                onChange={(e) => updateFormData('territories', e.target.value)}
                placeholder="Geographic territories managed (e.g., Northeast, California)"
              />
            </div>

            <div>
              <Label htmlFor="accounts">Key Accounts</Label>
              <Input
                id="accounts"
                value={formData.accounts || ''}
                onChange={(e) => updateFormData('accounts', e.target.value)}
                placeholder="Key accounts or clients managed"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDecisionMaker"
                checked={formData.isDecisionMaker || false}
                onCheckedChange={(checked) => updateFormData('isDecisionMaker', !!checked)}
              />
              <Label htmlFor="isDecisionMaker" className="text-sm font-medium">
                This contact is a decision maker
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Contact Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Preferred Contact Method</Label>
              <Select
                value={formData.preferredContact || ''}
                onValueChange={(value) => updateFormData('preferredContact', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred method" />
                </SelectTrigger>
                <SelectContent>
                  {contactMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Quality & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Data Quality & Status</CardTitle>
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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={formData.verified || false}
                  onCheckedChange={(checked) => updateFormData('verified', !!checked)}
                />
                <Label htmlFor="verified" className="text-sm font-medium">
                  Mark as verified contact
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive !== false} // Default to true if not set
                  onCheckedChange={(checked) => updateFormData('isActive', !!checked)}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active contact
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminPageLayout>
  );
}