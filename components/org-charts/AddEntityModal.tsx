'use client';

import { useState } from 'react';
import { useAuth } from "@/lib/auth/firebase-auth";;
import {
  Building2,
  Users,
  Briefcase,
  X,
  Upload,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Tag,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type EntityType = 'agency' | 'advertiser' | 'person' | 'industry' | 'publisher' | 'dsp-ssp' | 'adtech';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  onEntityAdded?: (entity: any) => void;
}

interface EntityFormData {
  name: string;
  type: EntityType;
  description: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  logoUrl: string;
  companyType: string;
  industry: string;
  parentCompany: string;
  tags: string[];
  verified: boolean;
  // Person specific fields
  title?: string;
  department?: string;
  linkedin?: string;
}

export function AddEntityModal({ isOpen, onClose, entityType, onEntityAdded }: AddEntityModalProps) {
  const { data: session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  console.log('AddEntityModal props:', { isOpen, entityType, sessionStatus: user?.email });
  const [formData, setFormData] = useState<EntityFormData>({
    name: '',
    type: entityType,
    description: '',
    website: '',
    email: '',
    phone: '',
    location: '',
    logoUrl: '',
    companyType: '',
    industry: '',
    parentCompany: '',
    tags: [],
    verified: false,
    title: '',
    department: '',
    linkedin: ''
  });

  // Allow all authenticated users to submit entities (admins will approve later)
  if (!user) {
    console.log('AddEntityModal: No session user, not rendering modal');
    return null;
  }

  console.log('AddEntityModal: Rendering for user:', session.user.email, 'Role:', session.user.role);

  const handleInputChange = (field: keyof EntityFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} "${formData.name}" created successfully!`);
        onEntityAdded?.(result);
        
        // Auto-close after success message
        setTimeout(() => {
          onClose();
          setSuccess(null);
          // Reset form
          setFormData({
            name: '',
            type: entityType,
            description: '',
            website: '',
            email: '',
            phone: '',
            location: '',
            logoUrl: '',
            companyType: '',
            industry: '',
            parentCompany: '',
            tags: [],
            verified: false,
            title: '',
            department: '',
            linkedin: ''
          });
        }, 2000);
      } else {
        setError(result.error || 'Failed to create entity. Please try again.');
      }
    } catch (error) {
      console.error('Error adding entity:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'agency': return <Building2 className="w-5 h-5" />;
      case 'advertiser': return <Briefcase className="w-5 h-5" />;
      case 'person': return <Users className="w-5 h-5" />;
      case 'industry': return <Tag className="w-5 h-5" />;
      case 'publisher': return <Globe className="w-5 h-5" />;
      case 'dsp-ssp': return <Upload className="w-5 h-5" />;
      case 'adtech': return <Building2 className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const getEntityTitle = () => {
    switch (entityType) {
      case 'agency': return 'Add New Agency';
      case 'advertiser': return 'Add New Advertiser';
      case 'person': return 'Add New Person';
      case 'industry': return 'Add New Industry';
      case 'publisher': return 'Add New Publisher';
      case 'dsp-ssp': return 'Add New DSP/SSP';
      case 'adtech': return 'Add New Adtech';
      default: return 'Add New Entity';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            {getEntityIcon()}
            <span>{getEntityTitle()}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <div className="flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={entityType === 'person' ? 'Full Name' : 'Company Name'}
                  required
                />
              </div>

              {entityType === 'person' && (
                <>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Job Title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      value={formData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select Department</option>
                      <option value="LEADERSHIP">Leadership</option>
                      <option value="MEDIA_PLANNING">Media Planning</option>
                      <option value="STRATEGY">Strategy</option>
                      <option value="FINANCE">Finance</option>
                      <option value="OPERATIONS">Operations</option>
                      <option value="BUSINESS_DEVELOPMENT">Business Development</option>
                    </select>
                  </div>
                </>
              )}

              {entityType !== 'person' && (
                <div>
                  <Label htmlFor="companyType">Company Type</Label>
                  <select
                    id="companyType"
                    value={formData.companyType}
                    onChange={(e) => handleInputChange('companyType', e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="">Select Type</option>
                    <option value="MEDIA_HOLDING_COMPANY">Media Holding Company</option>
                    <option value="INDEPENDENT_AGENCY">Independent Agency</option>
                    <option value="ADVERTISER">Advertiser</option>
                    <option value="BRAND">Brand</option>
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {entityType === 'person' && (
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin || ''}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State, Country"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logoUrl">Logo/Avatar URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logoUrl && (
                  <div className="mt-2">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={formData.logoUrl} alt="Preview" />
                      <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>

              {entityType !== 'person' && (
                <>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="Advertising, Marketing, Media"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentCompany">Parent Company</Label>
                    <Input
                      id="parentCompany"
                      value={formData.parentCompany}
                      onChange={(e) => handleInputChange('parentCompany', e.target.value)}
                      placeholder="Parent or holding company name"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      handleTagAdd(input.value.trim());
                      input.value = '';
                    }
                  }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => handleInputChange('verified', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="verified">Verified Entity</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name || success}
              className={success ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {success ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Created Successfully!
                </>
              ) : loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                `Add ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}