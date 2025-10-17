'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Shield,
  User,
  Star,
  AlertCircle,
  ExternalLink,
  Activity,
  FileText
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
  department?: string;
  seniority: string;
  primaryRole?: string;
  isDecisionMaker: boolean;
  preferredContact?: string;
  verified: boolean;
  isActive: boolean;
  dataQuality: string;
  communityScore: number;
  createdAt: string;
  updatedAt: string;
  lastVerified?: string;
  company: {
    id: string;
    name: string;
    companyType: string;
    industry: string;
    city?: string;
    state?: string;
    website?: string;
  };
  recentInteractions: any[];
  recentNotes: any[];
  status: any;
  _count: {
    interactions: number;
    notes: number;
    connections: number;
  };
}

const departments = [
  { value: 'MARKETING', label: 'Marketing', icon: '📢' },
  { value: 'SALES', label: 'Sales', icon: '💰' },
  { value: 'BUSINESS_DEVELOPMENT', label: 'Business Development', icon: '🤝' },
  { value: 'ACCOUNT_MANAGEMENT', label: 'Account Management', icon: '👥' },
  { value: 'CREATIVE_SERVICES', label: 'Creative Services', icon: '🎨' },
  { value: 'STRATEGY_PLANNING', label: 'Strategy & Planning', icon: '🎯' },
  { value: 'MEDIA_PLANNING', label: 'Media Planning', icon: '📺' },
  { value: 'OPERATIONS', label: 'Operations', icon: '⚙️' },
  { value: 'TECHNOLOGY', label: 'Technology', icon: '💻' },
  { value: 'FINANCE', label: 'Finance', icon: '💳' },
  { value: 'HR', label: 'Human Resources', icon: '👤' },
  { value: 'LEADERSHIP', label: 'Leadership', icon: '👔' },
  { value: 'PROGRAMMATIC', label: 'Programmatic', icon: '🤖' },
  { value: 'DIGITAL_MARKETING', label: 'Digital Marketing', icon: '📱' }
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

export default function ViewContact() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchContact(params.id as string);
    }
  }, [params.id]);

  const fetchContact = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orgs/contacts/${id}`);

      if (!response.ok) {
        throw new Error('Contact not found');
      }

      const contactData = await response.json();
      setContact(contactData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeniorityInfo = (seniority: string) => {
    return seniorityLevels.find(s => s.value === seniority);
  };

  const getDepartmentInfo = (department: string) => {
    return departments.find(d => d.value === department);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Contact Not Found</h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error || 'Contact not found'}</p>
            </div>
            <div className="mt-6">
              <Button variant="outline" onClick={() => router.push('/admin/orgs/contacts')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Contacts
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/orgs/contacts')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{contact.fullName}</h1>
              <p className="text-gray-600">{contact.title}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={contact.verified ? "default" : "secondary"}>
                  {contact.verified ? "Verified" : "Unverified"}
                </Badge>
                {!contact.isActive && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
                {contact.isDecisionMaker && (
                  <Badge variant="outline">Decision Maker</Badge>
                )}
                <span className="text-sm text-gray-500">
                  Created {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {contact.linkedinUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(contact.linkedinUrl, '_blank')}
              >
                <Globe className="w-4 h-4 mr-2" />
                LinkedIn
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}
            {contact.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
            <Link href={`/admin/orgs/contacts/${contact.id}/edit`}>
              <Button size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Business Email</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                    </div>
                  )}

                  {contact.personalEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Personal Email</p>
                        <p className="text-sm text-gray-600">{contact.personalEmail}</p>
                      </div>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      </div>
                    </div>
                  )}

                  {contact.preferredContact && (
                    <div className="flex items-center space-x-3">
                      <Star className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Preferred Contact</p>
                        <p className="text-sm text-gray-600">{contact.preferredContact?.replace(/_/g, ' ') || contact.preferredContact}</p>
                      </div>
                    </div>
                  )}
                </div>
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
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{contact.company.name}</h3>
                    <p className="text-gray-600">{contact.company.companyType?.replace(/_/g, ' ') || contact.company.companyType || 'N/A'}</p>
                    <p className="text-gray-600">{contact.company.industry?.replace(/_/g, ' ') || contact.company.industry || 'N/A'}</p>
                    {(contact.company.city || contact.company.state) && (
                      <div className="flex items-center space-x-1 mt-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {[contact.company.city, contact.company.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {contact.company.website && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a
                          href={contact.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {contact.company.website}
                          <ExternalLink className="w-3 h-3 inline ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                  <Link href={`/admin/orgs/companies/${contact.company.id}`}>
                    <Button variant="outline" size="sm">
                      View Company
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
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
                  {contact.department && getDepartmentInfo(contact.department) && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Department</p>
                      <Badge variant="outline">
                        {getDepartmentInfo(contact.department)?.icon} {getDepartmentInfo(contact.department)?.label}
                      </Badge>
                    </div>
                  )}

                  {getSeniorityInfo(contact.seniority) && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Seniority Level</p>
                      <Badge className={getSeniorityInfo(contact.seniority)?.color}>
                        {getSeniorityInfo(contact.seniority)?.icon} {getSeniorityInfo(contact.seniority)?.label}
                      </Badge>
                    </div>
                  )}

                  {contact.primaryRole && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Primary Role</p>
                      <p className="text-sm text-gray-600">{contact.primaryRole?.replace(/_/g, ' ') || contact.primaryRole}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Data Quality</p>
                    <Badge variant={contact.dataQuality === 'HIGH' ? 'default' : 'secondary'}>
                      {contact.dataQuality}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Activity Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interactions</span>
                  <Badge variant="outline">{contact._count.interactions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Notes</span>
                  <Badge variant="outline">{contact._count.notes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connections</span>
                  <Badge variant="outline">{contact._count.connections}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Community Score</span>
                  <Badge variant="outline">{contact.communityScore}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(contact.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{new Date(contact.updatedAt).toLocaleDateString()}</span>
                </div>
                {contact.lastVerified && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Last verified:</span>
                    <span className="font-medium">{new Date(contact.lastVerified).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {(contact.recentInteractions?.length > 0 || contact.recentNotes?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contact.recentInteractions?.slice(0, 3).map((interaction, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{interaction.type?.replace(/_/g, ' ')}</p>
                      <p className="text-gray-600">{new Date(interaction.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {contact.recentNotes?.slice(0, 3).map((note, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">Note added</p>
                      <p className="text-gray-600">{new Date(note.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}