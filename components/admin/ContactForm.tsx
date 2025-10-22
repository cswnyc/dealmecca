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
import { ContactPhotoUpload } from '@/components/admin/ContactPhotoUpload';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Trash2,
  Save,
  X,
  Search,
  User,
  MapPin,
  Globe,
  AlertCircle,
  Camera
} from 'lucide-react';
import Link from 'next/link';

// Form validation rules
interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

const VALIDATION_RULES: Record<string, ValidationRule> = {
  firstName: { required: true, minLength: 2, maxLength: 50 },
  lastName: { required: true, minLength: 2, maxLength: 50 },
  title: { required: true, minLength: 2, maxLength: 100 },
  email: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { required: false, pattern: /^[\+]?[1-9][\d]{0,15}$/ },
  linkedinUrl: { required: false, pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/ },
  personalEmail: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  companyId: { required: true },
  seniority: { required: true }
};

const departments = [
  { value: 'MARKETING', label: 'Marketing', icon: '📢' },
  { value: 'SALES', label: 'Sales', icon: '💰' },
  { value: 'BUSINESS_DEVELOPMENT', label: 'Business Development', icon: '🤝' },
  { value: 'ACCOUNT_MANAGEMENT', label: 'Account Management', icon: '👥' },
  { value: 'CREATIVE', label: 'Creative', icon: '🎨' },
  { value: 'STRATEGY', label: 'Strategy', icon: '🎯' },
  { value: 'MEDIA', label: 'Media', icon: '📺' },
  { value: 'OPERATIONS', label: 'Operations', icon: '⚙️' },
  { value: 'TECHNOLOGY', label: 'Technology', icon: '💻' },
  { value: 'FINANCE', label: 'Finance', icon: '💳' },
  { value: 'HR', label: 'Human Resources', icon: '👤' },
  { value: 'EXECUTIVE', label: 'Executive', icon: '👔' }
];

const seniorityLevels = [
  { value: 'C_LEVEL', label: 'C-Level', icon: '🏆', color: 'bg-purple-100 text-purple-800' },
  { value: 'VP', label: 'Vice President', icon: '👑', color: 'bg-blue-100 text-blue-800' },
  { value: 'SVP', label: 'Senior Vice President', icon: '👑', color: 'bg-blue-100 text-blue-800' },
  { value: 'EVP', label: 'Executive Vice President', icon: '👑', color: 'bg-blue-100 text-blue-800' },
  { value: 'DIRECTOR', label: 'Director', icon: '⭐', color: 'bg-green-100 text-green-800' },
  { value: 'SENIOR_DIRECTOR', label: 'Senior Director', icon: '⭐', color: 'bg-green-100 text-green-800' },
  { value: 'MANAGER', label: 'Manager', icon: '📊', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'SENIOR_MANAGER', label: 'Senior Manager', icon: '📊', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'SENIOR', label: 'Senior Level', icon: '🌟', color: 'bg-orange-100 text-orange-800' },
  { value: 'ASSOCIATE', label: 'Associate', icon: '🔹', color: 'bg-gray-100 text-gray-800' },
  { value: 'COORDINATOR', label: 'Coordinator', icon: '📋', color: 'bg-gray-100 text-gray-800' },
  { value: 'ANALYST', label: 'Analyst', icon: '📈', color: 'bg-gray-100 text-gray-800' },
  { value: 'SPECIALIST', label: 'Specialist', icon: '🔧', color: 'bg-gray-100 text-gray-800' },
  { value: 'UNKNOWN', label: 'Unknown', icon: '❓', color: 'bg-gray-100 text-gray-800' }
];

const contactMethods = [
  { value: 'EMAIL', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'PHONE', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: <Globe className="w-4 h-4" /> },
  { value: 'IN_PERSON', label: 'In Person', icon: <User className="w-4 h-4" /> }
];

interface Company {
  id: string;
  name: string;
  companyType: string;
  city?: string;
  state?: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  personalEmail?: string;
  department?: string;
  seniority: string;
  isDecisionMaker: boolean;
  preferredContact?: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  lastVerified?: string;
  company: Company;
}

interface ContactFormProps {
  mode: 'create' | 'edit';
  contact?: Contact;
  onSave?: (contactData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  personalEmail: string;
  companyId: string;
  department: string;
  seniority: string;
  isDecisionMaker: boolean;
  preferredContact: string;
  verified: boolean;
  isActive: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ContactForm({ mode, contact, onSave, onDelete, onCancel }: ContactFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(contact?.logoUrl || '');

  const [formData, setFormData] = useState<FormData>({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    title: contact?.title || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    linkedinUrl: contact?.linkedinUrl || '',
    personalEmail: contact?.personalEmail || '',
    companyId: contact?.company?.id || '',
    department: contact?.department || '',
    seniority: contact?.seniority || '',
    isDecisionMaker: contact?.isDecisionMaker || false,
    preferredContact: contact?.preferredContact || '',
    verified: contact?.verified || false,
    isActive: contact?.isActive !== false // Default to true
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Filter companies based on search term
    if (companySearchTerm) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        company.companyType.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [companies, companySearchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orgs/companies?limit=1000'); // Get more companies for search
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

    // Required field validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return '';
    }

    // String length validation
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rules.maxLength} characters`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      switch (field) {
        case 'email':
        case 'personalEmail':
          return 'Please enter a valid email address';
        case 'phone':
          return 'Please enter a valid phone number';
        case 'linkedinUrl':
          return 'Please enter a valid LinkedIn profile URL';
        default:
          return 'Invalid format';
      }
    }

    return '';
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Additional business logic validations
    if (formData.email && formData.personalEmail && formData.email === formData.personalEmail) {
      newErrors.personalEmail = 'Personal email must be different from business email';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
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
      
      if (onSave) {
        await onSave({
          ...formData,
          fullName: `${formData.firstName} ${formData.lastName}`.trim()
        });
      } else {
        // Default save logic
        const url = mode === 'create' ? '/api/orgs/contacts' : `/api/orgs/contacts/${contact?.id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        // Convert empty strings to null for optional enum fields
        const payload = {
          ...formData,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          department: formData.department || null,
          preferredContact: formData.preferredContact || null,
          // Ensure seniority has a value (required field)
          seniority: formData.seniority || 'UNKNOWN'
        };

        console.log('Submitting contact data:', payload);

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let errorMessage = 'Failed to save contact';
          let errorDetails = '';
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
            errorDetails = error.details ? ` (${error.details})` : '';
            console.error('Server error response:', error);
          } catch (jsonError) {
            // If response isn't JSON, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage + errorDetails);
        }

        router.push('/admin/orgs/contacts');
      }
    } catch (error: any) {
      console.error('Error saving contact:', error);
      alert(`Failed to ${mode} contact: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contact?.id) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${contact.fullName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeleting(true);
      
      if (onDelete) {
        await onDelete();
      } else {
        const response = await fetch(`/api/admin/contacts/${contact.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete contact');
        }

        router.push('/admin/orgs/contacts');
      }
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      alert(`Failed to delete contact: ${error.message}`);
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

  const getSelectedCompany = () => {
    return companies.find(c => c.id === formData.companyId);
  };

  const getSeniorityInfo = () => {
    return seniorityLevels.find(s => s.value === formData.seniority);
  };

  const getDepartmentInfo = () => {
    return departments.find(d => d.value === formData.department);
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
              {mode === 'create' ? 'Add New Contact' : `Edit ${contact?.fullName}`}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Create a new professional contact profile' 
                : 'Update contact information and settings'
              }
            </p>
            {mode === 'edit' && contact && (
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={contact.verified ? "default" : "secondary"}>
                  {contact.verified ? "Verified" : "Unverified"}
                </Badge>
                {!contact.isActive && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
                <span className="text-sm text-gray-500">
                  Created {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        {mode === 'edit' && contact && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(contact.linkedinUrl, '_blank')}
              disabled={!contact.linkedinUrl}
            >
              <Globe className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
              disabled={!contact.email}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="flex items-center space-x-1">
                  <span>First Name</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="John"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName" className="flex items-center space-x-1">
                  <span>Last Name</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="flex items-center space-x-1">
                <span>Job Title</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="e.g., VP of Marketing"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Contact Photo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              label="Contact Photo"
              currentImageUrl={photoUrl}
              entityType="contact"
              entityId={contact?.id}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              onRemove={() => setPhotoUrl('')}
            />
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center space-x-1">
                <span>Company</span>
                <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select 
                  value={formData.companyId} 
                  onValueChange={(value) => updateFormData('companyId', value)}
                >
                  <SelectTrigger className={errors.companyId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCompanies.length === 0 ? (
                      <SelectItem value="" disabled>
                        {companySearchTerm ? 'No companies found' : 'Loading companies...'}
                      </SelectItem>
                    ) : (
                      filteredCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.companyType.replace(/_/g, ' ')})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {getSelectedCompany() && (
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{getSelectedCompany()?.name}</span>
                      <Badge variant="outline">{getSelectedCompany()?.companyType.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                )}
              </div>
              {errors.companyId && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.companyId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john@company.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="personalEmail">Personal Email</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => updateFormData('personalEmail', e.target.value)}
                  placeholder="john@gmail.com"
                  className={errors.personalEmail ? 'border-red-500' : ''}
                />
                {errors.personalEmail && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.personalEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                  className={errors.linkedinUrl ? 'border-red-500' : ''}
                />
                {errors.linkedinUrl && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.linkedinUrl}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Preferred Contact Method</Label>
              <Select 
                value={formData.preferredContact} 
                onValueChange={(value) => updateFormData('preferredContact', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred contact method" />
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

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Professional Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => updateFormData('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.icon} {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getDepartmentInfo() && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      {getDepartmentInfo()?.icon} {getDepartmentInfo()?.label}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="flex items-center space-x-1">
                  <span>Seniority Level</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.seniority} 
                  onValueChange={(value) => updateFormData('seniority', value)}
                >
                  <SelectTrigger className={errors.seniority ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select seniority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {seniorityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.icon} {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getSeniorityInfo() && (
                  <div className="mt-2">
                    <Badge className={getSeniorityInfo()?.color}>
                      {getSeniorityInfo()?.icon} {getSeniorityInfo()?.label}
                    </Badge>
                  </div>
                )}
                {errors.seniority && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.seniority}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Status & Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDecisionMaker"
                    checked={formData.isDecisionMaker}
                    onCheckedChange={(checked) => updateFormData('isDecisionMaker', !!checked)}
                  />
                  <Label htmlFor="isDecisionMaker" className="flex items-center space-x-2">
                    <span>Decision Maker</span>
                    <Badge variant="outline">Key Contact</Badge>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) => updateFormData('verified', !!checked)}
                  />
                  <Label htmlFor="verified" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Verified Contact</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateFormData('isActive', !!checked)}
                  />
                  <Label htmlFor="isActive" className="flex items-center space-x-2">
                    <span>Active Contact</span>
                    {!formData.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </Label>
                </div>
              </div>
              
              {mode === 'edit' && contact && (
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
                  </div>
                  {contact.lastVerified && (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Last verified: {new Date(contact.lastVerified).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>ID: {contact.id}</span>
                  </div>
                </div>
              )}
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
                      {mode === 'create' ? 'Create Contact' : 'Save Changes'}
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

              {mode === 'edit' && contact && (
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
                      Delete Contact
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