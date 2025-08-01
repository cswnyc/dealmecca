'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  LinkedinIcon, 
  MapPin, 
  Building2, 
  User, 
  Calendar,
  DollarSign,
  Target,
  Award,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  Briefcase
} from 'lucide-react';

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
  seniority: string;
  department?: string;
  primaryRole?: string;
  budgetRange?: string;
  responsibilities?: string[];
  lastUpdated?: string;
  dataQuality: number;
  verified: boolean;
  verificationDate?: string;
  company: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    companyType: string;
    industry?: string;
    verified: boolean;
  };
}

interface ContactInfoProps {
  contact: Contact;
  loading?: boolean;
  showSensitiveInfo?: boolean;
}

export function ContactInfo({ contact, loading = false, showSensitiveInfo = true }: ContactInfoProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getDataQualityIcon = () => {
    if (contact.dataQuality >= 80) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (contact.dataQuality >= 60) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Email */}
          {contact.email && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{contact.email}</p>
                  <p className="text-xs text-gray-500">Primary Email</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contact.email!, 'email')}
                  className="p-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`mailto:${contact.email}`)}
                  className="p-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Personal Email */}
          {contact.personalEmail && showSensitiveInfo && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium">{showPersonalInfo ? contact.personalEmail : '•••••@•••••.com'}</p>
                  <p className="text-xs text-blue-600">Personal Email</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                  className="p-2"
                >
                  {showPersonalInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                {showPersonalInfo && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(contact.personalEmail!, 'personalEmail')}
                      className="p-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${contact.personalEmail}`)}
                      className="p-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Phone */}
          {contact.phone && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{formatPhoneNumber(contact.phone)}</p>
                  <p className="text-xs text-gray-500">Phone Number</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contact.phone!, 'phone')}
                  className="p-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`tel:${contact.phone}`)}
                  className="p-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* LinkedIn */}
          {contact.linkedinUrl && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <LinkedinIcon className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-600">LinkedIn Profile</p>
                  <p className="text-xs text-blue-500">Professional Network</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contact.linkedinUrl!, 'linkedin')}
                  className="p-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(contact.linkedinUrl, '_blank')}
                  className="p-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {copied && (
            <div className="text-sm text-green-600 text-center">
              {copied === 'email' ? 'Email' : 
               copied === 'personalEmail' ? 'Personal email' :
               copied === 'phone' ? 'Phone number' : 
               'LinkedIn URL'} copied to clipboard!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Professional Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seniority Level */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Award className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium">
                  {contact.seniority.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-xs text-gray-500">Seniority Level</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {contact.seniority.includes('C_LEVEL') ? 'Executive' : 
               contact.seniority.includes('VP') ? 'VP Level' : 
               contact.seniority.includes('DIRECTOR') ? 'Director' : 
               contact.seniority.includes('MANAGER') ? 'Manager' : 'Individual Contributor'}
            </Badge>
          </div>

          {/* Department */}
          {contact.department && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {contact.department.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">Department</p>
                </div>
              </div>
            </div>
          )}

          {/* Primary Role */}
          {contact.primaryRole && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{contact.primaryRole}</p>
                  <p className="text-xs text-gray-500">Primary Role</p>
                </div>
              </div>
            </div>
          )}

          {/* Budget Range */}
          {contact.budgetRange && showSensitiveInfo && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">{contact.budgetRange}</p>
                  <p className="text-xs text-green-600">Budget Range</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                Sensitive
              </Badge>
            </div>
          )}

          {/* Responsibilities */}
          {contact.responsibilities && contact.responsibilities.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="font-medium">Key Responsibilities</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.responsibilities.map((responsibility, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {responsibility}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Quality & Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Data Quality & Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Quality Score */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getDataQualityIcon()}
              <div>
                <p className="font-medium">Data Quality Score</p>
                <p className="text-xs text-gray-500">Accuracy and completeness</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{contact.dataQuality}%</p>
              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${
                    contact.dataQuality >= 80 ? 'bg-green-500' : 
                    contact.dataQuality >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${contact.dataQuality}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-4 h-4 ${contact.verified ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium">
                  {contact.verified ? 'Verified Contact' : 'Unverified Contact'}
                </p>
                <p className="text-xs text-gray-500">
                  {contact.verificationDate ? `Verified ${contact.verificationDate}` : 'Manual verification pending'}
                </p>
              </div>
            </div>
            <Badge variant={contact.verified ? "default" : "secondary"}>
              {contact.verified ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          {/* Last Updated */}
          {contact.lastUpdated && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-xs text-gray-500">Most recent data refresh</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{contact.lastUpdated}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}