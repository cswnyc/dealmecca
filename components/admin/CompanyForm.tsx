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
import ImageUpload from '@/components/admin/ImageUpload';
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
  ExternalLink,
  Plus
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
  const [availableDuties, setAvailableDuties] = useState<any[]>([]);
  const [selectedDuties, setSelectedDuties] = useState<string[]>([]);
  const [showDutyPicker, setShowDutyPicker] = useState(false);
  const [duplicateError, setDuplicateError] = useState<DuplicateError | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamType, setNewTeamType] = useState('IN_HOUSE');
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState('');
  const [newTeamDuties, setNewTeamDuties] = useState<string[]>([]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [advertiserSearchTerm, setAdvertiserSearchTerm] = useState('');
  const [filteredAdvertisers, setFilteredAdvertisers] = useState<Company[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [selectedContactForTeam, setSelectedContactForTeam] = useState<{[teamId: string]: string}>({});
  const [selectedDutiesForTeam, setSelectedDutiesForTeam] = useState<{[teamId: string]: string[]}>({});
  const [contactRoleForTeam, setContactRoleForTeam] = useState<{[teamId: string]: string}>({});
  const [companyContacts, setCompanyContacts] = useState<any[]>([]);

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
    fetchDuties();
  }, []);

  // Initialize selected duties from company data in edit mode
  useEffect(() => {
    if (mode === 'edit' && company?.duties && availableDuties.length > 0) {
      if (Array.isArray(company.duties)) {
        const dutyIds = company.duties.map((d: any) => d.id);
        setSelectedDuties(dutyIds);
      }
    }
  }, [mode, company?.duties, availableDuties]);

  // Load teams for edit mode
  useEffect(() => {
    if (mode === 'edit' && company?.id) {
      fetchTeams();
      fetchCompanyContacts();
    }
  }, [mode, company?.id]);

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

  useEffect(() => {
    // Filter advertisers for team creation
    const advertisers = companies.filter(c =>
      ['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADVERTISER'].includes(c.companyType)
    );

    if (advertiserSearchTerm) {
      const filtered = advertisers.filter(c =>
        c.name.toLowerCase().includes(advertiserSearchTerm.toLowerCase()) ||
        c.city?.toLowerCase().includes(advertiserSearchTerm.toLowerCase()) ||
        c.state?.toLowerCase().includes(advertiserSearchTerm.toLowerCase())
      );
      setFilteredAdvertisers(filtered);
    } else {
      setFilteredAdvertisers(advertisers);
    }
  }, [companies, advertiserSearchTerm]);

  // Fetch company contacts for team member assignment
  useEffect(() => {
    if (mode === 'edit' && company?.id) {
      fetchCompanyContacts();
    }
  }, [mode, company?.id]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orgs/companies?limit=10000');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDuties = async () => {
    try {
      const response = await fetch('/api/admin/duties');
      const data = await response.json();
      setAvailableDuties(data || []);
    } catch (error) {
      console.error('Failed to fetch duties:', error);
    }
  };

  const handleDutyToggle = (dutyId: string) => {
    setSelectedDuties(prev => {
      if (prev.includes(dutyId)) {
        return prev.filter(id => id !== dutyId);
      } else {
        return [...prev, dutyId];
      }
    });
    setIsDirty(true);
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim() || !selectedAdvertiserId) {
      alert('Please fill in team name and select an advertiser');
      return;
    }

    try {
      setCreatingTeam(true);

      // Create team via API
      const response = await fetch('/api/orgs/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName.trim(),
          companyId: selectedAdvertiserId,
          type: newTeamType === 'IN_HOUSE' ? 'ADVERTISER_TEAM' : 'AGENCY_TEAM',
          description: `${newTeamName.trim()} - ${newTeamType === 'IN_HOUSE' ? 'In-House Team' : 'Agency Team'}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create team');
      }

      const createdTeam = await response.json();

      // If duties were selected, create ContactDuty relationships
      if (newTeamDuties.length > 0) {
        // Note: This would require a team-duties API endpoint, or we handle it differently
        // For now, we'll just log it
        console.log('Team duties to be added:', newTeamDuties);
      }

      // Refresh teams list
      await fetchTeams();

      // Clear form
      setNewTeamName('');
      setNewTeamType('IN_HOUSE');
      setSelectedAdvertiserId('');
      setNewTeamDuties([]);
      setAdvertiserSearchTerm('');

      alert('Team created successfully!');
    } catch (error: any) {
      console.error('Error creating team:', error);
      alert(`Failed to create team: ${error.message}`);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`/api/orgs/teams/${teamId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete team');
      }

      // Refresh teams list
      await fetchTeams();

      alert('Team deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting team:', error);
      alert(`Failed to delete team: ${error.message}`);
    }
  };

  const fetchTeams = async () => {
    if (!company?.id) return;

    try {
      const response = await fetch(`/api/orgs/teams?companyId=${company.id}`);
      const data = await response.json();
      setTeams(data || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleTeamDutyToggle = (dutyId: string) => {
    setNewTeamDuties(prev =>
      prev.includes(dutyId)
        ? prev.filter(id => id !== dutyId)
        : [...prev, dutyId]
    );
  };

  const fetchCompanyContacts = async () => {
    if (!company?.id) return;
    try {
      const response = await fetch(`/api/orgs/contacts?companyId=${company.id}`);
      const data = await response.json();
      setCompanyContacts(data || []);
    } catch (error) {
      console.error('Failed to fetch company contacts:', error);
    }
  };

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const handleAddContactToTeam = async (teamId: string) => {
    const contactId = selectedContactForTeam[teamId];
    const role = contactRoleForTeam[teamId];

    if (!contactId) {
      alert('Please select a contact');
      return;
    }

    try {
      const response = await fetch(`/api/orgs/teams/${teamId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, role: role || null, isPrimary: false })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add contact');
      }

      await fetchTeams();
      setSelectedContactForTeam(prev => ({ ...prev, [teamId]: '' }));
      setContactRoleForTeam(prev => ({ ...prev, [teamId]: '' }));
    } catch (error: any) {
      alert(`Failed to add contact: ${error.message}`);
    }
  };

  const handleRemoveContactFromTeam = async (teamId: string, contactId: string) => {
    if (!confirm('Remove this contact from the team?')) return;

    try {
      const response = await fetch(`/api/orgs/teams/${teamId}/contacts/${contactId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove contact');
      }

      await fetchTeams();
    } catch (error: any) {
      alert(`Failed to remove contact: ${error.message}`);
    }
  };

  const handleAddDutiesToTeam = async (teamId: string) => {
    const dutyIds = selectedDutiesForTeam[teamId];

    if (!dutyIds || dutyIds.length === 0) {
      alert('Please select at least one duty');
      return;
    }

    try {
      const response = await fetch(`/api/orgs/teams/${teamId}/duties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dutyIds })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add duties');
      }

      await fetchTeams();
      setSelectedDutiesForTeam(prev => ({ ...prev, [teamId]: [] }));
    } catch (error: any) {
      alert(`Failed to add duties: ${error.message}`);
    }
  };

  const handleRemoveDutyFromTeam = async (teamId: string, dutyId: string) => {
    if (!confirm('Remove this duty from the team?')) return;

    try {
      const response = await fetch(`/api/orgs/teams/${teamId}/duties?dutyIds=${dutyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove duty');
      }

      await fetchTeams();
    } catch (error: any) {
      alert(`Failed to remove duty: ${error.message}`);
    }
  };

  const toggleTeamDuty = (teamId: string, dutyId: string) => {
    setSelectedDutiesForTeam(prev => {
      const current = prev[teamId] || [];
      return {
        ...prev,
        [teamId]: current.includes(dutyId)
          ? current.filter(id => id !== dutyId)
          : [...current, dutyId]
      };
    });
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

      // Add duties as comma-separated string of duty names
      if (selectedDuties.length > 0) {
        const dutyNames = selectedDuties
          .map(dutyId => availableDuties.find(d => d.id === dutyId)?.name)
          .filter(Boolean)
          .join(',');
        dataToSend.duties = dutyNames;
      } else {
        dataToSend.duties = '';
      }

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
                <ImageUpload
                  label="Company Logo"
                  currentImageUrl={formData.logoUrl}
                  entityType="company"
                  entityId={company?.id}
                  onUploadSuccess={(url) => updateFormData('logoUrl', url)}
                  onRemove={() => updateFormData('logoUrl', '')}
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
                        {model.label}
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

        {/* Duties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Duties</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDutyPicker(!showDutyPicker)}
              >
                {showDutyPicker ? 'Hide' : 'Select'} Duties
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showDutyPicker && (
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {['ROLE', 'MEDIA_TYPE', 'BRAND', 'BUSINESS_LINE', 'GOAL', 'AUDIENCE', 'GEOGRAPHY'].map(category => {
                  const categoryDuties = availableDuties.filter(d => d.category === category);
                  if (categoryDuties.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">{category.replace(/_/g, ' ')}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {categoryDuties.map(duty => (
                          <div
                            key={duty.id}
                            onClick={() => handleDutyToggle(duty.id)}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={selectedDuties.includes(duty.id)}
                              readOnly
                            />
                            <div className="flex-1">
                              <span className="text-sm">{duty.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedDuties.length > 0 && (
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Selected Duties ({selectedDuties.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDuties.map(dutyId => {
                    const duty = availableDuties.find(d => d.id === dutyId);
                    if (!duty) return null;
                    return (
                      <Badge
                        key={duty.id}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100"
                        onClick={() => handleDutyToggle(duty.id)}
                      >
                        {duty.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDuties.length === 0 && (
              <p className="text-sm text-gray-500 italic">No duties selected. Click "Select Duties" to add duties to this company.</p>
            )}
          </CardContent>
        </Card>

        {/* Teams */}
        {mode === 'edit' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Teams</span>
                <Badge variant="outline">{teams.length} team(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Create Team</AlertTitle>
                <AlertDescription>
                  Teams are saved immediately when you click "Add Team"
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="advertiserSearch">Search Advertiser *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="advertiserSearch"
                      value={advertiserSearchTerm}
                      onChange={(e) => setAdvertiserSearchTerm(e.target.value)}
                      placeholder="Search by company name, city, or state..."
                      className="pl-10"
                    />
                  </div>
                  {advertiserSearchTerm && (
                    <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                      {filteredAdvertisers.length > 0 ? (
                        filteredAdvertisers.slice(0, 50).map(advertiser => (
                          <div
                            key={advertiser.id}
                            onClick={() => {
                              setSelectedAdvertiserId(advertiser.id);
                              setAdvertiserSearchTerm(advertiser.name);
                            }}
                            className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 ${
                              selectedAdvertiserId === advertiser.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="font-medium text-sm">{advertiser.name}</p>
                            <p className="text-xs text-gray-500">
                              {advertiser.city && advertiser.state
                                ? `${advertiser.city}, ${advertiser.state}`
                                : advertiser.city || advertiser.state || 'Location not specified'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="p-3 text-sm text-gray-500">No advertisers found</p>
                      )}
                    </div>
                  )}
                  {!advertiserSearchTerm && selectedAdvertiserId && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {companies.find(c => c.id === selectedAdvertiserId)?.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newTeamName">Team Name *</Label>
                  <Input
                    id="newTeamName"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Facebook Team, Media Planning"
                  />
                </div>

                <div>
                  <Label htmlFor="newTeamType">Team Type *</Label>
                  <Select value={newTeamType} onValueChange={setNewTeamType}>
                    <SelectTrigger id="newTeamType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_HOUSE">In-House Team</SelectItem>
                      <SelectItem value="AGENCY">Agency Team (External)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="teamDuties">Duties (Optional)</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {availableDuties.slice(0, 5).map(duty => (
                      <Badge
                        key={duty.id}
                        variant={newTeamDuties.includes(duty.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTeamDutyToggle(duty.id)}
                      >
                        {duty.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddTeam}
                disabled={!newTeamName.trim() || !selectedAdvertiserId || creatingTeam}
                className="w-full"
              >
                {creatingTeam ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating Team...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team
                  </>
                )}
              </Button>

              {teams.length > 0 && (
                <div className="space-y-2 mt-6">
                  <Label className="text-sm text-gray-600">Existing Teams ({teams.length})</Label>
                  <div className="space-y-3">
                    {teams.map((team) => {
                      const isExpanded = expandedTeams.has(team.id);
                      const members = team.ContactTeam || [];
                      const duties = team.TeamDuty || [];

                      return (
                        <div
                          key={team.id}
                          className="bg-white rounded-lg border border-gray-300 overflow-hidden"
                        >
                          {/* Team Header */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                            <div className="flex-1 cursor-pointer" onClick={() => toggleTeamExpanded(team.id)}>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{team.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {team.type === 'AGENCY_TEAM' && 'Agency'}
                                  {team.type === 'ADVERTISER_TEAM' && 'In-House'}
                                  {team.type === 'INTERNAL_TEAM' && 'Internal'}
                                  {team.type === 'PROJECT_TEAM' && 'Project'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  {members.length} member{members.length !== 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                  {duties.length} {duties.length !== 1 ? 'duties' : 'duty'}
                                </Badge>
                              </div>
                              {team.company && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Company: {team.company.name}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTeamExpanded(team.id)}
                              >
                                {isExpanded ? '−' : '+'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTeam(team.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="p-4 space-y-4">
                              {/* Team Members Section */}
                              <div>
                                <Label className="text-sm font-semibold mb-2 block">Team Members</Label>

                                {/* Existing Members */}
                                {members.length > 0 ? (
                                  <div className="space-y-2 mb-3">
                                    {members.map((member: any) => (
                                      <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                                      >
                                        <div className="flex-1">
                                          <div className="text-sm font-medium">
                                            {member.contact.fullName}
                                            {member.isPrimary && (
                                              <Badge variant="default" className="ml-2 text-xs">Primary</Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500">{member.contact.title}</p>
                                          {member.role && (
                                            <p className="text-xs text-gray-400">Role: {member.role}</p>
                                          )}
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveContactFromTeam(team.id, member.contact.id)}
                                          className="text-red-600"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 italic mb-3">No members yet</p>
                                )}

                                {/* Add Member Form */}
                                <div className="grid grid-cols-12 gap-2">
                                  <div className="col-span-5">
                                    <Select
                                      value={selectedContactForTeam[team.id] || ''}
                                      onValueChange={(value) =>
                                        setSelectedContactForTeam(prev => ({ ...prev, [team.id]: value }))
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Select contact" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(Array.isArray(companyContacts) ? companyContacts : [])
                                          .filter(c => !members.some((m: any) => m.contact.id === c.id))
                                          .map(contact => (
                                            <SelectItem key={contact.id} value={contact.id}>
                                              {contact.fullName} - {contact.title}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-4">
                                    <Input
                                      placeholder="Role (optional)"
                                      value={contactRoleForTeam[team.id] || ''}
                                      onChange={(e) =>
                                        setContactRoleForTeam(prev => ({ ...prev, [team.id]: e.target.value }))
                                      }
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => handleAddContactToTeam(team.id)}
                                      disabled={!selectedContactForTeam[team.id]}
                                      className="h-8 w-full text-xs"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Team Duties Section */}
                              <div>
                                <Label className="text-sm font-semibold mb-2 block">Team Duties</Label>

                                {/* Existing Duties */}
                                {duties.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {duties.map((teamDuty: any) => (
                                      <Badge
                                        key={teamDuty.id}
                                        variant="outline"
                                        className="flex items-center gap-1"
                                      >
                                        {teamDuty.duty.name}
                                        <X
                                          className="w-3 h-3 cursor-pointer hover:text-red-600"
                                          onClick={() => handleRemoveDutyFromTeam(team.id, teamDuty.duty.id)}
                                        />
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 italic mb-3">No duties assigned</p>
                                )}

                                {/* Add Duties */}
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                    {availableDuties
                                      .filter(d => !duties.some((td: any) => td.duty.id === d.id))
                                      .slice(0, 10)
                                      .map(duty => (
                                        <Badge
                                          key={duty.id}
                                          variant={(selectedDutiesForTeam[team.id] || []).includes(duty.id) ? "default" : "outline"}
                                          className="cursor-pointer text-xs"
                                          onClick={() => toggleTeamDuty(team.id, duty.id)}
                                        >
                                          {duty.name}
                                        </Badge>
                                      ))}
                                  </div>
                                  {(selectedDutiesForTeam[team.id] || []).length > 0 && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => handleAddDutiesToTeam(team.id)}
                                      className="h-8 text-xs"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Selected Duties ({(selectedDutiesForTeam[team.id] || []).length})
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {teams.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No teams created yet. Create a team by filling in the form above.
                </p>
              )}
            </CardContent>
          </Card>
        )}

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
