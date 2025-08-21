'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  MapPin, 
  Building2, 
  Mail, 
  Phone,
  Globe,
  ChevronRight,
  ArrowLeft,
  LinkedinIcon,
  Shield,
  Star,
  Briefcase,
  Users,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { ActivityTracker } from '@/lib/activity-tracking';

interface ContactProfileData {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  department?: string;
  seniority: string;
  verified: boolean;
  dataQuality: string;
  lastVerified?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    companyType: string;
    industry?: string;
    city?: string;
    state?: string;
    headquarters?: string;
    website?: string;
    logoUrl?: string;
    verified: boolean;
  };
}

export default function ContactProfilePage() {
  const params = useParams();
  const [contact, setContact] = useState<ContactProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchContact();
    }
  }, [params.id]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setContact(data);
        
        // Track contact profile view
        if (data) {
          ActivityTracker.viewContactProfile(
            data.id,
            data.company?.id,
            data.fullName
          );
        }
      } else {
        console.error('Failed to fetch contact:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Contact not found</h1>
          <p className="text-gray-600 mt-2">The contact you're looking for doesn't exist or has been removed.</p>
          <Link href="/orgs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'C_LEVEL': return 'bg-purple-100 text-purple-800';
      case 'VP': return 'bg-blue-100 text-blue-800';
      case 'DIRECTOR': return 'bg-green-100 text-green-800';
      case 'MANAGER': return 'bg-yellow-100 text-yellow-800';
      case 'SENIOR': return 'bg-orange-100 text-orange-800';
      case 'ASSOCIATE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'PREMIUM': return 'bg-green-100 text-green-800';
      case 'VERIFIED': return 'bg-blue-100 text-blue-800';
      case 'BASIC': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/orgs" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Directory
          </Link>
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/orgs" className="hover:text-blue-600">Organizations</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Contacts</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{contact.fullName}</span>
          </nav>
        </div>

        {/* Contact Header */}
        <Card className="mb-8">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 w-full md:w-auto">
                {/* Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold flex-shrink-0">
                  {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                </div>

                <div className="flex-1 text-center sm:text-left w-full">
                  {/* Name and Verification */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{contact.fullName}</h1>
                    {contact.verified && (
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Title and Company */}
                  <div className="mb-4">
                    <h2 className="text-lg md:text-xl text-gray-700 mb-2">{contact.title}</h2>
                    <Link 
                      href={`/orgs/companies/${contact.company.id}`}
                      className="text-base md:text-lg text-blue-600 hover:text-blue-700 font-medium inline-flex items-center justify-center sm:justify-start w-full sm:w-auto py-2 sm:py-0"
                    >
                      <Building2 className="w-4 h-4 mr-1" />
                      {contact.company.name}
                    </Link>
                  </div>

                  {/* Tags and Badges */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                    <Badge className={getSeniorityColor(contact.seniority)}>
                      {contact.seniority.replace(/_/g, ' ')}
                    </Badge>
                    {contact.department && (
                      <Badge variant="outline">
                        {contact.department.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    <Badge className={getDataQualityColor(contact.dataQuality)}>
                      {contact.dataQuality.replace(/_/g, ' ')} Data
                    </Badge>
                  </div>

                  {/* Location and Company Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                    {contact.company.city && contact.company.state && (
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{contact.company.city}, {contact.company.state}</span>
                      </div>
                    )}
                    {contact.lastVerified && (
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Updated {new Date(contact.lastVerified).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:flex-shrink-0">
                {contact.email && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto min-h-[44px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      window.location.href = `mailto:${contact.email}`;
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
                {contact.phone && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto min-h-[44px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      window.location.href = `tel:${contact.phone}`;
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                )}
                {contact.linkedinUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto min-h-[44px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      window.open(contact.linkedinUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <LinkedinIcon className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="company">Company Context</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Full Name</div>
                      <div className="text-sm">{contact.fullName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Job Title</div>
                      <div className="text-sm">{contact.title}</div>
                    </div>
                    {contact.email && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Phone</div>
                        <a href={`tel:${contact.phone}`} className="text-sm text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.linkedinUrl && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">LinkedIn</div>
                        <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Seniority Level</div>
                      <div className="text-sm">{contact.seniority.replace(/_/g, ' ')}</div>
                    </div>
                    {contact.department && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Department</div>
                        <div className="text-sm">{contact.department.replace(/_/g, ' ')}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-500">Data Quality</div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDataQualityColor(contact.dataQuality)}>
                          {contact.dataQuality.replace(/_/g, ' ')}
                        </Badge>
                        {contact.lastVerified && (
                          <span className="text-xs text-gray-500">
                            Last verified {new Date(contact.lastVerified).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Status</div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${contact.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-sm">{contact.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Context</CardTitle>
                <CardDescription>
                  Information about {contact.fullName}'s organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Company</div>
                      {contact.company ? (
                        <Link 
                          href={`/orgs/companies/${contact.company.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {contact.company.name}
                        </Link>
                      ) : (
                        <div className="text-sm">No company information</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Company Type</div>
                      <div className="text-sm">{contact.company?.companyType?.replace(/_/g, ' ') || 'Unknown Company Type'}</div>
                    </div>
                    {contact.company?.industry && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Industry</div>
                        <div className="text-sm">{contact.company.industry}</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {contact.company?.headquarters && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Headquarters</div>
                        <div className="text-sm">{contact.company.headquarters}</div>
                      </div>
                    )}
                    {contact.company?.website && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Website</div>
                        <a href={contact.company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {contact.company.website}
                        </a>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-500">Company Status</div>
                      <div className="flex items-center space-x-2">
                        {contact.company?.verified && (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-sm">{contact.company?.verified ? 'Verified Company' : 'Unverified Company'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button asChild>
                    <Link href={`/orgs/companies/${contact.company.id}`}>
                      <Building2 className="w-4 h-4 mr-2" />
                      View Full Company Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity & Timeline</CardTitle>
                <CardDescription>
                  Recent activity and data updates for {contact.fullName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Contact Created</div>
                      <div className="text-xs text-gray-600">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Star className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Last Updated</div>
                      <div className="text-xs text-gray-600">
                        {new Date(contact.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {contact.lastVerified && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm font-medium">Last Verified</div>
                        <div className="text-xs text-gray-600">
                          {new Date(contact.lastVerified).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>More activity features coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 