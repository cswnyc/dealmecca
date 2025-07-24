'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Save, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Shield,
  UserCheck,
  Building2
} from 'lucide-react';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Array<{
    id: string;
    fullName: string;
    title: string;
    department?: string;
    seniority: string;
    verified: boolean;
    isActive: boolean;
  }>;
  onBulkUpdate: (data: BulkEditData) => Promise<void>;
}

interface BulkEditData {
  department?: string;
  seniority?: string;
  verified?: boolean;
  isActive?: boolean;
}

interface FieldUpdate {
  enabled: boolean;
  value: any;
}

export default function BulkEditModal({ 
  isOpen, 
  onClose, 
  selectedContacts, 
  onBulkUpdate 
}: BulkEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fieldUpdates, setFieldUpdates] = useState<Record<string, FieldUpdate>>({
    department: { enabled: false, value: '' },
    seniority: { enabled: false, value: '' },
    verified: { enabled: false, value: false },
    isActive: { enabled: false, value: true }
  });

  const departments = [
    { value: 'SALES', label: 'Sales' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'ENGINEERING', label: 'Engineering' },
    { value: 'PRODUCT', label: 'Product' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'OPERATIONS', label: 'Operations' },
    { value: 'EXECUTIVE', label: 'Executive' },
    { value: 'CUSTOMER_SUCCESS', label: 'Customer Success' },
    { value: 'LEGAL', label: 'Legal' },
    { value: 'OTHER', label: 'Other' }
  ];

  const seniorityLevels = [
    { value: 'C_LEVEL', label: 'C-Level' },
    { value: 'VP', label: 'VP / Vice President' },
    { value: 'DIRECTOR', label: 'Director' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'SENIOR', label: 'Senior' },
    { value: 'MID_LEVEL', label: 'Mid Level' },
    { value: 'JUNIOR', label: 'Junior' }
  ];

  const handleFieldToggle = (field: string, enabled: boolean) => {
    setFieldUpdates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        enabled
      }
    }));
  };

  const handleFieldValueChange = (field: string, value: any) => {
    setFieldUpdates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);

    try {
      // Build update data from enabled fields
      const updateData: BulkEditData = {};
      
      Object.entries(fieldUpdates).forEach(([field, update]) => {
        if (update.enabled) {
          (updateData as any)[field] = update.value;
        }
      });

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await onBulkUpdate(updateData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasEnabledFields = Object.values(fieldUpdates).some(field => field.enabled);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Bulk Edit Contacts</CardTitle>
                  <CardDescription>
                    Update {selectedContacts.length} selected contact{selectedContacts.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {loading && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="font-medium">Updating contacts...</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 mt-1">
                  Processing {selectedContacts.length} contacts
                </p>
              </div>
            )}

            {/* Selected Contacts Preview */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Selected Contacts</Label>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {selectedContacts.slice(0, 10).map((contact) => (
                    <Badge key={contact.id} variant="secondary" className="text-xs">
                      {contact.fullName}
                    </Badge>
                  ))}
                  {selectedContacts.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedContacts.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Department Update */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    checked={fieldUpdates.department.enabled}
                    onCheckedChange={(checked) => handleFieldToggle('department', checked as boolean)}
                  />
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <Label className="font-medium">Update Department</Label>
                </div>
                {fieldUpdates.department.enabled && (
                  <Select
                    value={fieldUpdates.department.value}
                    onValueChange={(value) => handleFieldValueChange('department', value)}
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
                )}
              </div>

              {/* Seniority Update */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    checked={fieldUpdates.seniority.enabled}
                    onCheckedChange={(checked) => handleFieldToggle('seniority', checked as boolean)}
                  />
                  <Users className="w-4 h-4 text-gray-600" />
                  <Label className="font-medium">Update Seniority Level</Label>
                </div>
                {fieldUpdates.seniority.enabled && (
                  <Select
                    value={fieldUpdates.seniority.value}
                    onValueChange={(value) => handleFieldValueChange('seniority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select seniority level" />
                    </SelectTrigger>
                    <SelectContent>
                      {seniorityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Verification Status Update */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    checked={fieldUpdates.verified.enabled}
                    onCheckedChange={(checked) => handleFieldToggle('verified', checked as boolean)}
                  />
                  <Shield className="w-4 h-4 text-gray-600" />
                  <Label className="font-medium">Update Verification Status</Label>
                </div>
                {fieldUpdates.verified.enabled && (
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handleFieldValueChange('verified', true)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        fieldUpdates.verified.value 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldValueChange('verified', false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        !fieldUpdates.verified.value 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Unverified</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Active Status Update */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    checked={fieldUpdates.isActive.enabled}
                    onCheckedChange={(checked) => handleFieldToggle('isActive', checked as boolean)}
                  />
                  <UserCheck className="w-4 h-4 text-gray-600" />
                  <Label className="font-medium">Update Active Status</Label>
                </div>
                {fieldUpdates.isActive.enabled && (
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handleFieldValueChange('isActive', true)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        fieldUpdates.isActive.value 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldValueChange('isActive', false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        !fieldUpdates.isActive.value 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Inactive</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!hasEnabledFields || loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Contacts
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 