'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const companyTypes = [
  { value: 'INDEPENDENT_AGENCY', label: 'Independent Agency' },
  { value: 'HOLDING_COMPANY_AGENCY', label: 'Holding Company Agency' },
  { value: 'MEDIA_HOLDING_COMPANY', label: 'Media Holding Company' },
  { value: 'NATIONAL_ADVERTISER', label: 'National Advertiser' },
  { value: 'LOCAL_ADVERTISER', label: 'Local Advertiser' },
  { value: 'ADTECH_VENDOR', label: 'AdTech Vendor' },
  { value: 'MEDIA_OWNER', label: 'Media Owner' }
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

export default function CreateCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    companyType: '',
    employeeCount: '',
    city: '',
    state: '',
    region: '',
    verified: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug from name
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug
        })
      });

      if (response.ok) {
        router.push('/admin/orgs/companies');
      } else {
        console.error('Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
        <p className="text-gray-600">Create a new organization profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Type *</Label>
                <Select onValueChange={(value) => updateFormData('companyType', value)}>
                  <option value="">Select company type</option>
                  {companyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Employee Count</Label>
                <Select onValueChange={(value) => updateFormData('employeeCount', value)}>
                  <option value="">Select size</option>
                  {employeeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
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
                <Label>Region</Label>
                <Select onValueChange={(value) => updateFormData('region', value)}>
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Verification */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => updateFormData('verified', !!checked)}
              />
              <Label htmlFor="verified">Mark as verified</Label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Company'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 