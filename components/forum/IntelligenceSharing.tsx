'use client';

import { useState } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import { Upload, Users, Building2, DollarSign, Calendar, MapPin, Eye, EyeOff, FileText, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface IntelligenceSharingProps {
  onSubmit?: (intelligence: IntelligenceData) => void;
  onClose?: () => void;
}

interface IntelligenceData {
  title: string;
  company: string;
  contacts: ContactIntel[];
  budgetRange: string;
  timeline: string;
  location: string;
  mediaChannels: string[];
  decisionMakers: string[];
  notes: string;
  isAnonymous: boolean;
  attachments: File[];
  confidentialityLevel: 'PUBLIC' | 'VERIFIED_ONLY' | 'PREMIUM_ONLY';
}

interface ContactIntel {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  role: 'DECISION_MAKER' | 'INFLUENCER' | 'GATEKEEPER' | 'USER';
  notes?: string;
}

const BUDGET_RANGES = [
  'Under $10K', '$10K - $50K', '$50K - $100K', '$100K - $500K', 
  '$500K - $1M', '$1M - $5M', '$5M+', 'Undisclosed'
];

const MEDIA_CHANNELS = [
  'TV', 'Digital', 'OOH', 'Radio', 'Print', 'Social Media',
  'Streaming', 'Podcast', 'Programmatic', 'Connected TV'
];

const TIMELINE_OPTIONS = [
  'This Week', 'This Month', 'Next Month', 'Q1', 'Q2', 'Q3', 'Q4',
  'Next Year', 'Ongoing', 'Unknown'
];

export function IntelligenceSharing({ onSubmit, onClose }: IntelligenceSharingProps) {
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();

  // Check Firebase session
  const hasFirebaseSession = Boolean(firebaseUser);
  const [formData, setFormData] = useState<IntelligenceData>({
    title: '',
    company: '',
    contacts: [{ name: '', title: '', role: 'DECISION_MAKER' }],
    budgetRange: '',
    timeline: '',
    location: '',
    mediaChannels: [],
    decisionMakers: [],
    notes: '',
    isAnonymous: true,
    attachments: [],
    confidentialityLevel: 'PUBLIC'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', title: '', role: 'INFLUENCER' }]
    }));
  };

  const updateContact = (index: number, field: keyof ContactIntel, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      setFormData(prev => ({
        ...prev,
        contacts: prev.contacts.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleMediaChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      mediaChannels: prev.mediaChannels.includes(channel)
        ? prev.mediaChannels.filter(c => c !== channel)
        : [...prev.mediaChannels, channel]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.size <= 15 * 1024 * 1024); // 15MB limit
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 5) // Max 5 files
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const generateAISuggestions = async () => {
    if (formData.title && formData.notes) {
      try {
        const response = await fetch('/api/claude-code/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            content: formData.notes,
            type: 'forum_post'
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          setAiSuggestions(data.suggestions);
        } else {
          throw new Error(data.message || 'Failed to generate suggestions');
        }
      } catch (error) {
        console.error('Failed to generate AI suggestions:', error);
        // Set fallback suggestions
        setAiSuggestions({
          tags: [],
          technologies: [],
          frameworks: [],
          complexity: 'intermediate',
          projectType: 'fullstack',
          urgency: 'MEDIUM',
          codeRelated: false,
          suggestedCategories: ['general'],
          keyTopics: []
        });
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would normally submit to your API
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('Failed to submit intelligence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Share Intelligence</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Help the community by sharing prospect intelligence and contact details
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Privacy Settings */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {formData.isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {formData.isAnonymous ? 'Anonymous Sharing' : 'Public Attribution'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
            >
              {formData.isAnonymous ? 'Make Public' : 'Make Anonymous'}
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {formData.isAnonymous 
              ? 'Your identity will be hidden. You\'ll appear as "Anonymous" with a random ID.'
              : 'Your name and profile will be visible with this intelligence.'
            }
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opportunity Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Netflix Q1 Brand Campaign"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company/Brand *
            </label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="e.g., Netflix, Coca-Cola"
              className="w-full"
            />
          </div>
        </div>

        {/* Budget and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range
            </label>
            <select
              value={formData.budgetRange}
              onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select budget range</option>
              {BUDGET_RANGES.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline
            </label>
            <select
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select timeline</option>
              {TIMELINE_OPTIONS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., New York, National"
              className="w-full"
            />
          </div>
        </div>

        {/* Media Channels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Channels
          </label>
          <div className="flex flex-wrap gap-2">
            {MEDIA_CHANNELS.map(channel => (
              <button
                key={channel}
                type="button"
                onClick={() => toggleMediaChannel(channel)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.mediaChannels.includes(channel)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Key Contacts
            </label>
            <Button variant="outline" size="sm" onClick={addContact}>
              Add Contact
            </Button>
          </div>
          <div className="space-y-3">
            {formData.contacts.map((contact, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="Full Name"
                  />
                  <Input
                    value={contact.title}
                    onChange={(e) => updateContact(index, 'title', e.target.value)}
                    placeholder="Job Title"
                  />
                  <Input
                    value={contact.email || ''}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    placeholder="Email (optional)"
                    type="email"
                  />
                  <div className="flex items-center space-x-2">
                    <select
                      value={contact.role}
                      onChange={(e) => updateContact(index, 'role', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="DECISION_MAKER">Decision Maker</option>
                      <option value="INFLUENCER">Influencer</option>
                      <option value="GATEKEEPER">Gatekeeper</option>
                      <option value="USER">End User</option>
                    </select>
                    {formData.contacts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intelligence Notes
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Share any additional context, insights, or intelligence about this opportunity..."
            rows={4}
            className="w-full"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateAISuggestions}
            className="mt-2"
          >
            Get AI Suggestions
          </Button>
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload files (PDFs, docs, images up to 15MB each)
                </p>
              </div>
            </label>
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Display */}
        {aiSuggestions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
            <div className="space-y-2">
              {aiSuggestions.tags && (
                <div>
                  <span className="text-sm font-medium">Suggested tags: </span>
                  {aiSuggestions.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="mr-1">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              {aiSuggestions.urgency && (
                <div>
                  <span className="text-sm font-medium">Detected priority: </span>
                  <Badge variant="outline">{aiSuggestions.urgency}</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Intelligence will be reviewed and gems awarded for quality contributions
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.title || !formData.company}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Sharing...' : 'Share Intelligence'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}