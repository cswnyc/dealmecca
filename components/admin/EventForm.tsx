'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Globe,
  Monitor,
  Wifi,
  Save, 
  X,
  Trash2,
  AlertCircle,
  CheckCircle,
  Settings,
  Building2
} from 'lucide-react';

// Form validation rules
interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

const VALIDATION_RULES: Record<string, ValidationRule> = {
  name: { required: true, minLength: 3, maxLength: 100 },
  description: { required: false, maxLength: 2000 },
  startDate: { required: true },
  endDate: { required: true },
  location: { required: true, minLength: 3, maxLength: 200 },
  venue: { required: false, maxLength: 200 },
  category: { required: true },
  capacity: { required: false },
  registrationDeadline: { required: false }
};

const eventCategories = [
  { value: 'CONFERENCE', label: 'Conference', icon: '🎯', description: 'Large industry gatherings' },
  { value: 'TRADE_SHOW', label: 'Trade Show', icon: '🏪', description: 'Product exhibitions and demos' },
  { value: 'SUMMIT', label: 'Summit', icon: '🏔️', description: 'High-level strategic meetings' },
  { value: 'WORKSHOP', label: 'Workshop', icon: '🔧', description: 'Hands-on learning sessions' },
  { value: 'NETWORKING', label: 'Networking', icon: '🤝', description: 'Professional networking events' },
  { value: 'WEBINAR', label: 'Webinar', icon: '💻', description: 'Online educational sessions' },
  { value: 'SEMINAR', label: 'Seminar', icon: '📚', description: 'Educational presentations' },
  { value: 'PANEL', label: 'Panel Discussion', icon: '🗣️', description: 'Expert panel discussions' },
  { value: 'LAUNCH', label: 'Product Launch', icon: '🚀', description: 'Product announcements' },
  { value: 'AWARDS', label: 'Awards Ceremony', icon: '🏆', description: 'Recognition events' }
];

const eventStatuses = [
  { value: 'DRAFT', label: 'Draft', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-gray-100 text-gray-800' },
  { value: 'PUBLISHED', label: 'Published', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', icon: <X className="w-4 h-4" />, color: 'bg-red-100 text-red-800' },
  { value: 'COMPLETED', label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
  { value: 'SUSPENDED', label: 'Suspended', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' }
];

const eventTypes = [
  { value: 'INDUSTRY_EVENT', label: 'Industry Event', description: 'General industry gathering' },
  { value: 'COMPANY_EVENT', label: 'Company Event', description: 'Company-specific event' },
  { value: 'PARTNER_EVENT', label: 'Partner Event', description: 'Partner collaboration event' },
  { value: 'TRAINING', label: 'Training', description: 'Educational training session' },
  { value: 'SOCIAL', label: 'Social', description: 'Social networking event' },
  { value: 'CORPORATE', label: 'Corporate', description: 'Corporate function' }
];

interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  category: string;
  status: string;
  capacity?: number;
  registrationDeadline?: string;
  eventType?: string;
  isVirtual: boolean;
  isHybrid: boolean;
  website?: string;
  registrationUrl?: string;
  imageUrl?: string;
  logoUrl?: string;
  organizerName?: string;
  organizerUrl?: string;
  estimatedCost?: number;
  attendeeCount?: number;
  callForSpeakers: boolean;
  sponsorshipAvailable: boolean;
  creator?: {
    id: string;
    name: string;
  };
  attendeesCount: number;
  ratingsCount: number;
  createdAt: string;
}

interface EventFormProps {
  mode: 'create' | 'edit';
  event?: Event;
  onSave?: (eventData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  category: string;
  status: string;
  capacity: string;
  registrationDeadline: string;
  eventType: string;
  isVirtual: boolean;
  isHybrid: boolean;
  website: string;
  registrationUrl: string;
  imageUrl: string;
  logoUrl: string;
  organizerName: string;
  organizerUrl: string;
  estimatedCost: string;
  attendeeCount: string;
  callForSpeakers: boolean;
  sponsorshipAvailable: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function EventForm({ mode, event, onSave, onDelete, onCancel }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: event?.name || '',
    description: event?.description || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    venue: event?.venue || '',
    category: event?.category || '',
    status: event?.status || 'DRAFT',
    capacity: event?.capacity?.toString() || '',
    registrationDeadline: event?.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
    eventType: event?.eventType || '',
    isVirtual: event?.isVirtual || false,
    isHybrid: event?.isHybrid || false,
    website: event?.website || '',
    registrationUrl: event?.registrationUrl || '',
    imageUrl: event?.imageUrl || '',
    logoUrl: event?.logoUrl || '',
    organizerName: event?.organizerName || '',
    organizerUrl: event?.organizerUrl || '',
    estimatedCost: event?.estimatedCost?.toString() || '',
    attendeeCount: event?.attendeeCount?.toString() || '',
    callForSpeakers: event?.callForSpeakers || false,
    sponsorshipAvailable: event?.sponsorshipAvailable || false
  });

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
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
        isValid = false;
      }
    }

    if (formData.registrationDeadline && formData.startDate) {
      const regDeadline = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);
      
      if (regDeadline >= startDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event start date';
        isValid = false;
      }
    }

    if (formData.capacity && parseInt(formData.capacity) < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
      isValid = false;
    }

    if (formData.isVirtual && !formData.location.includes('Virtual')) {
      newErrors.location = 'Virtual events should have "Virtual" in the location';
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

    // Auto-update location for virtual events
    if (field === 'isVirtual' && value) {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value, 
        location: prev.location.includes('Virtual') ? prev.location : 'Virtual Event',
        isHybrid: false
      }));
    }

    // Auto-update for hybrid events
    if (field === 'isHybrid' && value) {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value, 
        isVirtual: false
      }));
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const eventData = {
        name: formData.name,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        location: formData.location,
        venue: formData.venue || undefined,
        category: formData.category,
        status: formData.status,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : null,
        eventType: formData.eventType || undefined,
        isVirtual: formData.isVirtual,
        isHybrid: formData.isHybrid,
        website: formData.website || undefined,
        registrationUrl: formData.registrationUrl || undefined,
        imageUrl: formData.imageUrl || undefined,
        logoUrl: formData.logoUrl || undefined,
        organizerName: formData.organizerName || undefined,
        organizerUrl: formData.organizerUrl || undefined,
        estimatedCost: formData.estimatedCost ? parseInt(formData.estimatedCost) : undefined,
        attendeeCount: formData.attendeeCount ? parseInt(formData.attendeeCount) : undefined,
        callForSpeakers: formData.callForSpeakers,
        sponsorshipAvailable: formData.sponsorshipAvailable
      };
      
      if (onSave) {
        await onSave(eventData);
      } else {
        // Default save logic
        const url = mode === 'create' ? '/api/events' : `/api/events/${event?.id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save event');
        }

        router.push('/admin/events');
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(`Failed to ${mode} event: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeleting(true);
      
      if (onDelete) {
        await onDelete();
      } else {
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete event');
        }

        router.push('/admin/events');
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event: ${error.message}`);
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

  const getStatusInfo = () => {
    return eventStatuses.find(s => s.value === formData.status);
  };

  const getCategoryInfo = () => {
    return eventCategories.find(c => c.value === formData.category);
  };

  const getEventTypeInfo = () => {
    return eventTypes.find(t => t.value === formData.eventType);
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
              {mode === 'create' ? 'Create New Event' : `Edit ${event?.name}`}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Set up a new event with capacity management and org chart integration' 
                : 'Update event information and settings'
              }
            </p>
            {mode === 'edit' && event && (
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusInfo()?.color} variant="outline">
                  <div className="flex items-center space-x-1">
                    {getStatusInfo()?.icon}
                    <span>{getStatusInfo()?.label}</span>
                  </div>
                </Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(event.createdAt).toLocaleDateString()}
                </span>
                {event.creator && (
                  <span className="text-sm text-gray-500">
                    by {event.creator.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        {mode === 'edit' && event && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(event.website, '_blank')}
              disabled={!event.website}
            >
              <Globe className="w-4 h-4 mr-2" />
              Website
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(event.registrationUrl, '_blank')}
              disabled={!event.registrationUrl}
            >
              <Users className="w-4 h-4 mr-2" />
              Register
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center space-x-1">
                <span>Event Name</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Digital Marketing Summit 2024"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your event, its objectives, and what attendees can expect..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="flex items-center space-x-1">
                  <span>Category</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => updateFormData('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select event category" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label} - {category.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getCategoryInfo() && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      {getCategoryInfo()?.icon} {getCategoryInfo()?.label}
                    </Badge>
                  </div>
                )}
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select 
                  value={formData.eventType} 
                  onValueChange={(value) => updateFormData('eventType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getEventTypeInfo() && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      {getEventTypeInfo()?.label}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => updateFormData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {eventStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getStatusInfo() && (
                <div className="mt-2">
                  <Badge className={getStatusInfo()?.color} variant="outline">
                    <div className="flex items-center space-x-1">
                      {getStatusInfo()?.icon}
                      <span>{getStatusInfo()?.label}</span>
                    </div>
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Date & Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="flex items-center space-x-1">
                  <span>Start Date & Time</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="endDate" className="flex items-center space-x-1">
                  <span>End Date & Time</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => updateFormData('registrationDeadline', e.target.value)}
                className={errors.registrationDeadline ? 'border-red-500' : ''}
              />
              {errors.registrationDeadline && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.registrationDeadline}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Optional: Last date for attendee registration
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location & Format</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVirtual"
                  checked={formData.isVirtual}
                  onCheckedChange={(checked) => updateFormData('isVirtual', !!checked)}
                />
                <Label htmlFor="isVirtual" className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4" />
                  <span>Virtual Event</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isHybrid"
                  checked={formData.isHybrid}
                  onCheckedChange={(checked) => updateFormData('isHybrid', !!checked)}
                />
                <Label htmlFor="isHybrid" className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4" />
                  <span>Hybrid Event</span>
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="flex items-center space-x-1">
                  <span>Location</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder={formData.isVirtual ? "Virtual Event" : "e.g., San Francisco, CA"}
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => updateFormData('venue', e.target.value)}
                  placeholder="e.g., Moscone Center, Hall A"
                  className={errors.venue ? 'border-red-500' : ''}
                />
                {errors.venue && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.venue}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity & Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Capacity & Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Event Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => updateFormData('capacity', e.target.value)}
                  placeholder="e.g., 500 (leave empty for unlimited)"
                  className={errors.capacity ? 'border-red-500' : ''}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.capacity}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty for unlimited capacity
                </p>
              </div>
              
              <div>
                <Label htmlFor="attendeeCount">Expected Attendees</Label>
                <Input
                  id="attendeeCount"
                  type="number"
                  min="1"
                  value={formData.attendeeCount}
                  onChange={(e) => updateFormData('attendeeCount', e.target.value)}
                  placeholder="e.g., 300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Estimated number of attendees
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedCost">Estimated Cost (USD)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  min="0"
                  value={formData.estimatedCost}
                  onChange={(e) => updateFormData('estimatedCost', e.target.value)}
                  placeholder="e.g., 299"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Average cost per attendee
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="callForSpeakers"
                    checked={formData.callForSpeakers}
                    onCheckedChange={(checked) => updateFormData('callForSpeakers', !!checked)}
                  />
                  <Label htmlFor="callForSpeakers">Call for Speakers</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sponsorshipAvailable"
                    checked={formData.sponsorshipAvailable}
                    onCheckedChange={(checked) => updateFormData('sponsorshipAvailable', !!checked)}
                  />
                  <Label htmlFor="sponsorshipAvailable">Sponsorship Available</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links & Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Links & Media</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Event Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="registrationUrl">Registration URL</Label>
                <Input
                  id="registrationUrl"
                  type="url"
                  value={formData.registrationUrl}
                  onChange={(e) => updateFormData('registrationUrl', e.target.value)}
                  placeholder="https://eventbrite.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Event Banner Image</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => updateFormData('imageUrl', e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="logoUrl">Event Logo</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => updateFormData('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizerName">Organizer Name</Label>
                <Input
                  id="organizerName"
                  value={formData.organizerName}
                  onChange={(e) => updateFormData('organizerName', e.target.value)}
                  placeholder="e.g., Tech Events Inc."
                />
              </div>
              
              <div>
                <Label htmlFor="organizerUrl">Organizer Website</Label>
                <Input
                  id="organizerUrl"
                  type="url"
                  value={formData.organizerUrl}
                  onChange={(e) => updateFormData('organizerUrl', e.target.value)}
                  placeholder="https://organizer.com"
                />
              </div>
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
                      {mode === 'create' ? 'Create Event' : 'Save Changes'}
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

              {mode === 'edit' && event && (
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
                      Delete Event
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