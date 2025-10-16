'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Briefcase,
  Shield,
  Trash2,
  Save,
  X,
  Search,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

// Validation rules
interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

const VALIDATION_RULES: Record<string, ValidationRule> = {
  name: { required: true, minLength: 2, maxLength: 200 },
  companyType: { required: true },
  website: { required: false, pattern: /^https?:\/\/.+\..+/ },
  industry: { required: false },
  advertisingModel: { required: false }
};

const companyTypes = [
  { value: 'HOLDING_COMPANY_AGENCY', label: 'Holding Company', icon: '🏢', level: 1 },
  { value: 'MEDIA_HOLDING_COMPANY', label: 'Media Holding Company', icon: '📺', level: 1 },
  { value: 'AGENCY', label: 'Agency (Level 2)', icon: '🎯', level: 2 },
  { value: 'INDEPENDENT_AGENCY', label: 'Independent Agency', icon: '⭐', level: 2 },
  { value: 'NATIONAL_ADVERTISER', label: 'National Advertiser', icon: '🏪', level: 0 },
  { value: 'LOCAL_ADVERTISER', label: 'Local Advertiser', icon: '🏬', level: 0 },
  { value: 'ADVERTISER', label: 'Advertiser', icon: '💼', level: 0 },
  { value: 'PUBLISHER', label: 'Publisher', icon: '📰', level: 0 },
  { value: 'BROADCASTER', label: 'Broadcaster', icon: '📡', level: 0 },
  { value: 'MEDIA_OWNER', label: 'Media Owner', icon: '🎬', level: 0 },
  { value: 'ADTECH_VENDOR', label: 'AdTech Vendor', icon: '💻', level: 0 },
  { value: 'MARTECH_VENDOR', label: 'MarTech Vendor', icon: '🛠️', level: 0 },
  { value: 'DSP_SSP', label: 'DSP/SSP', icon: '🔗', level: 0 },
  { value: 'ADTECH', label: 'AdTech', icon: '⚡', level: 0 },
  { value: 'TECH_VENDOR', label: 'Tech Vendor', icon: '🖥️', level: 0 },
  { value: 'CONSULTANCY', label: 'Consultancy', icon: '👔', level: 0 },
  { value: 'PRODUCTION_COMPANY', label: 'Production Company', icon: '🎥', level: 0 },
  { value: 'MEDIA_COMPANY', label: 'Media Company', icon: '📻', level: 0 }
];

const agencyTypes = [
  { value: 'FULL_SERVICE', label: 'Full Service', icon: '🌟' },
  { value: 'MEDIA_SPECIALIST', label: 'Media Specialist', icon: '📊' },
  { value: 'CREATIVE_SPECIALIST', label: 'Creative Specialist', icon: '🎨' },
  { value: 'DIGITAL_SPECIALIST', label: 'Digital Specialist', icon: '💻' },
  { value: 'PROGRAMMATIC_SPECIALIST', label: 'Programmatic Specialist', icon: '🤖' },
  { value: 'SOCIAL_MEDIA_SPECIALIST', label: 'Social Media Specialist', icon: '📱' },
  { value: 'SEARCH_SPECIALIST', label: 'Search Specialist', icon: '🔍' },
  { value: 'INFLUENCER_SPECIALIST', label: 'Influencer Specialist', icon: '⭐' },
  { value: 'PERFORMANCE_MARKETING', label: 'Performance Marketing', icon: '📈' },
  { value: 'BRAND_STRATEGY', label: 'Brand Strategy', icon: '🎯' },
  { value: 'MEDIA_PLANNING', label: 'Media Planning', icon: '📋' },
  { value: 'MEDIA_BUYING', label: 'Media Buying', icon: '💰' },
  { value: 'DATA_ANALYTICS', label: 'Data & Analytics', icon: '📊' },
  { value: 'CONTENT_MARKETING', label: 'Content Marketing', icon: '✍️' }
];

const advertisingModels = [
  { value: 'AGENCY_MANAGED', label: 'Agency Managed', description: 'Works with external agencies' },
  { value: 'IN_HOUSE', label: 'In-House', description: 'Internal marketing team' },
  { value: 'HYBRID', label: 'Hybrid', description: 'Mix of agency and in-house' }
];

const industries = [
  'AUTOMOTIVE', 'CPG_FOOD_BEVERAGE', 'CPG_PERSONAL_CARE', 'CPG_HOUSEHOLD',
  'FINANCIAL_SERVICES', 'HEALTHCARE_PHARMA', 'RETAIL_ECOMMERCE', 'TECHNOLOGY',
  'ENTERTAINMENT_MEDIA', 'TRAVEL_HOSPITALITY', 'TELECOM', 'FASHION_BEAUTY',
  'SPORTS_FITNESS', 'EDUCATION', 'REAL_ESTATE', 'ENERGY', 'GOVERNMENT_NONPROFIT',
  'GAMING', 'CRYPTOCURRENCY', 'INSURANCE', 'B2B_SERVICES', 'STARTUPS',
  'NONPROFIT', 'PROFESSIONAL_SERVICES', 'LOGISTICS'
];

const regions = [
  'NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST', 'NORTHWEST',
  'NATIONAL', 'INTERNATIONAL', 'CANADA', 'GLOBAL'
];

const employeeRanges = [
  { value: 'STARTUP_1_10', label: '1-10 employees' },
  { value: 'SMALL_11_50', label: '11-50 employees' },
  { value: 'MEDIUM_51_200', label: '51-200 employees' },
  { value: 'LARGE_201_1000', label: '201-1,000 employees' },
  { value: 'ENTERPRISE_1001_5000', label: '1,001-5,000 employees' },
  { value: 'MEGA_5000_PLUS', label: '5,000+ employees' }
];

const revenueRanges = [
  { value: 'UNDER_1M', label: 'Under $1M' },
  { value: 'RANGE_1M_5M', label: '$1M - $5M' },
  { value: 'RANGE_5M_25M', label: '$5M - $25M' },
  { value: 'RANGE_25M_100M', label: '$25M - $100M' },
  { value: 'RANGE_100M_500M', label: '$100M - $500M' },
  { value: 'RANGE_500M_1B', label: '$500M - $1B' },
  { value: 'OVER_1B', label: 'Over $1B' },
  { value: 'UNDISCLOSED', label: 'Undisclosed' }
];

interface Company {
  id: string;
  name: string;
  companyType: string;
  agencyType?: string;
  city?: string;
  state?: string;
  parentCompany?: {
    id: string;
    name: string;
  };
}

interface CompanyFormProps {
  mode: 'create' | 'edit';
  company?: any;
  onSave?: (companyData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  companyType: string;
  agencyType: string;
  advertisingModel: string;
  industry: string;
  website: string;
  description: string;
  logoUrl: string;
  address: string;
  city: string;
  state: string;
  region: string;
  country: string;
  zipCode: string;
  headquarters: string;
  employeeCount: string;
  revenueRange: string;
  teamCount: string;
  foundedYear: string;
  stockSymbol: string;
  linkedinUrl: string;
  twitterHandle: string;
  revenue: string;
  parentCompanyId: string;
  verified: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

interface DuplicateError {
  field: string;
  value: string;
  existingCompany: {
    id: string;
    name: string;
    companyType: string;
    website?: string;
  };
}

export default function CompanyForm({ mode, company, onSave, onDelete, onCancel }: CompanyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [duplicateError, setDuplicateError] = useState<DuplicateError | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: company?.name || '',
    companyType: company?.companyType || '',
    agencyType: company?.agencyType || '',
    advertisingModel: company?.advertisingModel || '',
    industry: company?.industry || '',
    website: company?.website || '',
    description: company?.description || '',
    logoUrl: company?.logoUrl || '',
    address: company?.address || '',
    city: company?.city || '',
    state: company?.state || '',
    region: company?.region || '',
    country: company?.country || 'US',
    zipCode: company?.zipCode || '',
    headquarters: company?.headquarters || '',
    employeeCount: company?.employeeCount || '',
    revenueRange: company?.revenueRange || '',
    teamCount: company?.teamCount?.toString() || '',
    foundedYear: company?.foundedYear?.toString() || '',
    stockSymbol: company?.stockSymbol || '',
    linkedinUrl: company?.linkedinUrl || '',
    twitterHandle: company?.twitterHandle || '',
    revenue: company?.revenue || '',
    parentCompanyId: company?.parentCompany?.id || '',
    verified: company?.verified || false
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Filter companies for parent company selection
    if (companySearchTerm) {
      const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        c.companyType.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      // Filter to show only potential parent companies (holding companies and agencies)
      const filtered = companies.filter(c =>
        ['HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY', 'AGENCY', 'INDEPENDENT_AGENCY'].includes(c.companyType)
      );
      setFilteredCompanies(filtered);
    }
  }, [companies, companySearchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orgs/companies?limit=1000');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = useCallback((field: string, value: any): string => {
    const rules = VALIDATION_RULES[field];
    if (!rules) return '';

    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return '';
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rules.maxLength} characters`;
      }
    }

    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      switch (field) {
        case 'website':
          return 'Please enter a valid website URL (e.g., https://example.com)';
        default:
          return 'Invalid format';
      }
    }

    return '';
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate required fields
    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Additional business logic: Advertiser companies should have advertisingModel
    if (['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADVERTISER'].includes(formData.companyType)) {
      if (!formData.advertisingModel) {
        newErrors.advertisingModel = 'Advertising model is required for advertisers';
        isValid = false;
      }
    }

    // Agencies should have agencyType
    if (['AGENCY', 'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY'].includes(formData.companyType)) {
      if (!formData.agencyType) {
        newErrors.agencyType = 'Agency type is required for agencies';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Prepare data for API
      const dataToSend: any = {
        name: formData.name,
        companyType: formData.companyType,
        website: formData.website || undefined,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        region: formData.region || undefined,
        country: formData.country,
        zipCode: formData.zipCode || undefined,
        headquarters: formData.headquarters || undefined,
        verified: formData.verified
      };

      // Add optional fields if they have values
      if (formData.agencyType) dataToSend.agencyType = formData.agencyType;
      if (formData.advertisingModel) dataToSend.advertisingModel = formData.advertisingModel;
      if (formData.industry) dataToSend.industry = formData.industry;
      if (formData.employeeCount) dataToSend.employeeCount = formData.employeeCount;
      if (formData.revenueRange) dataToSend.revenueRange = formData.revenueRange;
      if (formData.teamCount) dataToSend.teamCount = parseInt(formData.teamCount);
      if (formData.foundedYear) dataToSend.foundedYear = parseInt(formData.foundedYear);
      if (formData.stockSymbol) dataToSend.stockSymbol = formData.stockSymbol;
      if (formData.linkedinUrl) dataToSend.linkedinUrl = formData.linkedinUrl;
      if (formData.twitterHandle) dataToSend.twitterHandle = formData.twitterHandle;
      if (formData.revenue) dataToSend.revenue = formData.revenue;
      if (formData.parentCompanyId) dataToSend.parentCompanyId = formData.parentCompanyId;

      if (onSave) {
        await onSave(dataToSend);
      } else {
        const url = mode === 'create' ? '/api/orgs/companies' : `/api/orgs/companies/${company?.id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (jsonError) {
            throw new Error(response.statusText || 'Failed to save company');
          }

          // Check for duplicate error (409 status) - show all duplicates inline
          if (response.status === 409) {
            if (errorData.existingCompany) {
              // Detailed duplicate error with company info
              setDuplicateError({
                field: errorData.duplicateField,
                value: errorData.duplicateValue,
                existingCompany: errorData.existingCompany
              });
            } else {
              // Generic duplicate error when company details aren't available
              setDuplicateError({
                field: errorData.duplicateField || 'field',
                value: errorData.duplicateValue || formData.name || formData.website || 'value',
                existingCompany: {
                  id: '',
                  name: 'Unknown Company',
                  companyType: 'UNKNOWN',
                  website: undefined
                }
              });
            }
            return; // Don't throw, just show the duplicate error inline
          }

          // For other errors, throw to show in alert
          const errorMessage = errorData.error || errorData.message || 'Failed to save company';
          throw new Error(errorMessage);
        }

        router.push('/admin/orgs/companies');
      }
    } catch (error: any) {
      console.error('Error saving company:', error);
      alert(`Failed to ${mode} company: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!company?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${company.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      if (onDelete) {
        await onDelete();
      } else {
        const response = await fetch(`/api/admin/companies/${company.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete company');
        }

        router.push('/admin/orgs/companies');
      }
    } catch (error: any) {
      console.error('Error deleting company:', error);
      alert(`Failed to delete company: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }

    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const getSelectedCompanyType = () => {
    return companyTypes.find(t => t.value === formData.companyType);
  };

  const getSelectedParentCompany = () => {
    return companies.find(c => c.id === formData.parentCompanyId);
  };

  const isHoldingCompany = () => {
    return ['HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY'].includes(formData.companyType);
  };

  const isAgency = () => {
    return ['AGENCY', 'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY'].includes(formData.companyType);
  };

  const isAdvertiser = () => {
    return ['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADVERTISER'].includes(formData.companyType);
  };

  const getHierarchyLevel = () => {
    const type = getSelectedCompanyType();
    return type?.level || 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'create' ? 'Add New Company' : `Edit ${company?.name}`}
            </h1>
            <p className="text-gray-600">
              {mode === 'create'
                ? 'Create a new company profile with hierarchy support'
                : 'Update company information and settings'
              }
            </p>
            {mode === 'edit' && company && (
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={company.verified ? "default" : "secondary"}>
                  {company.verified ? "Verified" : "Unverified"}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(company.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Company Alert */}
      {duplicateError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Duplicate Company Detected</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>
                A company with the {duplicateError.field} <strong>"{duplicateError.value}"</strong> already exists:
              </p>
              <div className="flex items-center space-x-2 bg-white/10 p-2 rounded">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{duplicateError.existingCompany.name}</span>
                <Badge variant="outline" className="border-white text-white">
                  {duplicateError.existingCompany.companyType.replace(/_/g, ' ')}
                </Badge>
                {duplicateError.existingCompany.website && (
                  <span className="text-sm">• {duplicateError.existingCompany.website}</span>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-3">
                {duplicateError.existingCompany.id && (
                  <Link
                    href={`/admin/orgs/companies/${duplicateError.existingCompany.id}`}
                    className="inline-flex items-center text-sm font-medium underline hover:no-underline"
                  >
                    View Existing Company
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDuplicateError(null)}
                  className="text-white hover:bg-white/20"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center space-x-1">
                <span>Company Name</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Acme Agency"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="companyType" className="flex items-center space-x-1">
                <span>Company Type</span>
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.companyType}
                onValueChange={(value) => updateFormData('companyType', value)}
              >
                <SelectTrigger className={errors.companyType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  {companyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.companyType && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">
                      {getHierarchyLevel() === 1 && "This is a Level 1 (Holding Company) - can have agency brands below"}
                      {getHierarchyLevel() === 2 && "This is a Level 2 (Agency Brand) - can have regional offices below"}
                      {getHierarchyLevel() === 0 && "This is a standalone entity"}
                    </span>
                  </div>
                </div>
              )}
              {errors.companyType && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.companyType}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://example.com"
                  className={errors.website ? 'border-red-500' : ''}
                />
                {errors.website && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.website}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => updateFormData('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Brief description of the company..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Agency-Specific Fields */}
        {isAgency() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Agency Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agencyType" className="flex items-center space-x-1">
                  <span>Agency Type / Practice Area</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.agencyType}
                  onValueChange={(value) => updateFormData('agencyType', value)}
                >
                  <SelectTrigger className={errors.agencyType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select agency type" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.agencyType && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.agencyType}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advertiser-Specific Fields */}
        {isAdvertiser() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Advertiser Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                    <strong>Advertiser companies</strong> are brands, publishers, or organizations that advertise products/services. They work with agencies for marketing services.
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="advertisingModel" className="flex items-center space-x-1">
                  <span>Advertising Model</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.advertisingModel}
                  onValueChange={(value) => updateFormData('advertisingModel', value)}
                >
                  <SelectTrigger className={errors.advertisingModel ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select advertising model" />
                  </SelectTrigger>
                  <SelectContent>
                    {advertisingModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.label}</span>
                          <span className="text-xs text-gray-500">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.advertisingModel && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.advertisingModel}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateFormData('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="New York"
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  placeholder="NY"
                />
              </div>

              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => updateFormData('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  placeholder="US"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="headquarters">Headquarters</Label>
              <Input
                id="headquarters"
                value={formData.headquarters}
                onChange={(e) => updateFormData('headquarters', e.target.value)}
                placeholder="New York, NY"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Size & Scale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Company Size & Scale</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Select
                  value={formData.employeeCount}
                  onValueChange={(value) => updateFormData('employeeCount', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee range" />
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

              <div>
                <Label htmlFor="revenueRange">Revenue Range</Label>
                <Select
                  value={formData.revenueRange}
                  onValueChange={(value) => updateFormData('revenueRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamCount">Team Count</Label>
                <Input
                  id="teamCount"
                  type="number"
                  value={formData.teamCount}
                  onChange={(e) => updateFormData('teamCount', e.target.value)}
                  placeholder="50"
                />
              </div>

              <div>
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => updateFormData('foundedYear', e.target.value)}
                  placeholder="2020"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Business Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockSymbol">Stock Symbol</Label>
                <Input
                  id="stockSymbol"
                  value={formData.stockSymbol}
                  onChange={(e) => updateFormData('stockSymbol', e.target.value)}
                  placeholder="NASDAQ:ACME"
                />
              </div>

              <div>
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  value={formData.revenue}
                  onChange={(e) => updateFormData('revenue', e.target.value)}
                  placeholder="$50M"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/company/acme"
                />
              </div>

              <div>
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={(e) => updateFormData('twitterHandle', e.target.value)}
                  placeholder="@acmeagency"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hierarchy - only show if not a top-level holding company */}
        {!isHoldingCompany() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Company Hierarchy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Parent Company</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search parent companies..."
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={formData.parentCompanyId}
                    onValueChange={(value) => updateFormData('parentCompanyId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent company (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent company</SelectItem>
                      {filteredCompanies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.companyType.replace(/_/g, ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getSelectedParentCompany() && (
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">{getSelectedParentCompany()?.name}</span>
                        <Badge variant="outline">{getSelectedParentCompany()?.companyType.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Status & Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => updateFormData('verified', !!checked)}
              />
              <Label htmlFor="verified" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Verified Company</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={saving || loading}
                  className="min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {mode === 'create' ? 'Create Company' : 'Save Changes'}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving || deleting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>

              {mode === 'edit' && company && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="min-w-[120px]"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Company
                    </>
                  )}
                </Button>
              )}
            </div>

            {isDirty && (
              <p className="text-sm text-amber-600 mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                You have unsaved changes
              </p>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
