'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  Users, 
  ExternalLink, 
  Shield, 
  Phone, 
  Mail,
  Globe,
  ChevronRight,
  ArrowLeft,
  Calendar,
  MessageSquare,
  LinkedinIcon
} from 'lucide-react';
import Link from 'next/link';
import { CompanyActivityFeed } from '@/components/forum/CompanyActivityFeed';
import { ActivityTracker } from '@/lib/activity-tracking';

export default function CompanyProfilePage() {
  const params = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contacts');
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCompany();
    }
  }, [params.id]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/orgs/companies/${params.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setCompany(data.company);
      
      // Track company profile view
      if (data.company) {
        ActivityTracker.viewCompanyProfile(data.company.id, data.company.name);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyEvents = async () => {
    if (!params.id) return;
    
    try {
      setEventsLoading(true);
      const response = await fetch(`/api/orgs/companies/${params.id}/events`, {
        credentials: 'include'
      });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch company events:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
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

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Company not found</h1>
        </div>
      </div>
    );
  }

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'INDEPENDENT_AGENCY': return 'bg-blue-100 text-blue-800';
      case 'HOLDING_COMPANY_AGENCY': return 'bg-purple-100 text-purple-800';
      case 'NATIONAL_ADVERTISER': return 'bg-green-100 text-green-800';
      case 'MEDIA_HOLDING_COMPANY': return 'bg-indigo-100 text-indigo-800';
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
            <span>Companies</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{company.name}</span>
          </nav>
        </div>

        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 w-full md:w-auto">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {company.logoUrl ? (
                    <img 
                      src={company.logoUrl} 
                      alt={`${company.name} logo`}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1 text-center sm:text-left w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{company.name}</h1>
                    {company.verified && (
                      <Badge className="flex items-center justify-center sm:justify-start space-x-1 bg-green-100 text-green-800 w-fit mx-auto sm:mx-0">
                        <Shield className="w-4 h-4" />
                        <span>Verified</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                    <Badge className={getCompanyTypeColor(company.companyType)}>
                      {company.companyType.replace(/_/g, ' ')}
                    </Badge>
                    {company.agencyType && (
                      <Badge variant="outline">
                        {company.agencyType.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Location & Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600">
                    {company.city && company.state && (
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.city}, {company.state}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{company._count?.contacts || 0} contacts</span>
                    </div>
                    {company._count?.subsidiaries > 0 && (
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Building2 className="w-4 h-4" />
                        <span>{company._count.subsidiaries} subsidiaries</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {company.description && (
                    <p className="text-gray-700 mt-4 text-center sm:text-left">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:flex-shrink-0">
                {company.website && (
                  <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]" asChild>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
                <Button size="sm" className="w-full sm:w-auto min-h-[44px]">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'events' && events.length === 0) {
            fetchCompanyEvents();
          }
        }} className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts">Contacts ({company._count?.contacts || 0})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="forum">
              <MessageSquare className="w-4 h-4 mr-2" />
              Forum Discussions
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {company._count?.subsidiaries > 0 && (
              <TabsTrigger value="subsidiaries">Subsidiaries ({company._count.subsidiaries})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Company Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {company.contacts && company.contacts.length > 0 ? (
                  <div className="space-y-4">
                    {company.contacts.map((contact: any) => (
                      <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {contact.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <Link href={`/contacts/${contact.id}`} className="group">
                              <h4 className="font-semibold group-hover:text-blue-600 group-hover:underline cursor-pointer">{contact.fullName}</h4>
                            </Link>
                            <p className="text-sm text-gray-600">{contact.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="text-xs">
                                {contact.seniority.replace(/_/g, ' ')}
                              </Badge>
                              {contact.department && (
                                <Badge variant="outline" className="text-xs">
                                  {contact.department.replace(/_/g, ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {contact.email && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`mailto:${contact.email}`}>
                                <Mail className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {contact.phone && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`tel:${contact.phone}`}>
                                <Phone className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {contact.linkedinUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                <LinkedinIcon className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/contacts/${contact.id}`}>
                              View Profile
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No contacts found for this company.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Company Events</CardTitle>
                <p className="text-sm text-gray-600">
                  Events where {company.name} employees are attending or have attended
                </p>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading events...</p>
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">
                              <Link href={`/events/${event.id}`} className="text-blue-600 hover:text-blue-700">
                                {event.name}
                              </Link>
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(event.startDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{event.isVirtual ? 'Virtual Event' : event.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{event.companyAttendeeCount} from {company.name}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{event.category}</Badge>
                              <Badge 
                                className={
                                  event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                  event.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {event.status}
                              </Badge>
                              {event.isVirtual && <Badge variant="secondary">Virtual</Badge>}
                              {event.isHybrid && <Badge variant="secondary">Hybrid</Badge>}
                            </div>
                            {event.description && (
                              <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            <Link href={`/events/${event.id}`}>
                              <Button variant="outline" size="sm">
                                View Event
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No events found with attendees from {company.name}.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forum">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Forum Discussions</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Posts where {company.name} was mentioned or posts from company employees
                </p>
              </CardHeader>
              <CardContent>
                <CompanyActivityFeed 
                  companyId={company.id} 
                  limit={20}
                  showHeader={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Company Type</div>
                      <div className="text-sm">{company.companyType.replace(/_/g, ' ')}</div>
                    </div>
                    {company.agencyType && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Agency Type</div>
                        <div className="text-sm">{company.agencyType.replace(/_/g, ' ')}</div>
                      </div>
                    )}
                    {company.industry && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Industry</div>
                        <div className="text-sm">{company.industry}</div>
                      </div>
                    )}
                    {company.website && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Website</div>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {company.address && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Address</div>
                        <div className="text-sm">{company.address}</div>
                      </div>
                    )}
                    {company.phone && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Phone</div>
                        <div className="text-sm">{company.phone}</div>
                      </div>
                    )}
                    {company.email && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div className="text-sm">{company.email}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {company._count?.subsidiaries > 0 && (
            <TabsContent value="subsidiaries">
              <Card>
                <CardHeader>
                  <CardTitle>Subsidiaries</CardTitle>
                </CardHeader>
                <CardContent>
                  {company.subsidiaries && company.subsidiaries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {company.subsidiaries.map((subsidiary: any) => (
                        <Card key={subsidiary.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">{subsidiary.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {subsidiary.companyType.replace(/_/g, ' ')}
                            </p>
                            {subsidiary.city && subsidiary.state && (
                              <p className="text-xs text-gray-500">
                                {subsidiary.city}, {subsidiary.state}
                              </p>
                            )}
                            <Link href={`/orgs/companies/${subsidiary.id}`} className="text-blue-600 hover:underline text-sm">
                              View Profile →
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No subsidiaries found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
} 