'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  LinkedinIcon,
  Network,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { CompanyActivityFeed } from '@/components/forum/CompanyActivityFeed';
import { ActivityTracker } from '@/lib/activity-tracking';
import { OrgChartViewer } from '@/components/org-charts/OrgChartViewer';
import { DepartmentView } from '@/components/org-charts/DepartmentView';

export default function CompanyProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [orgChart, setOrgChart] = useState<any>(null);
  const [orgChartLoading, setOrgChartLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCompany();
    }
  }, [params.id]);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['contacts', 'org-chart', 'events', 'forum', 'overview'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/orgs/companies/${params.id}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
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

  const fetchOrgChart = async () => {
    if (!params.id) return;
    
    try {
      setOrgChartLoading(true);
      const response = await fetch(`/api/companies/${params.id}/org-chart`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrgChart(data);
      } else {
        // If no org chart exists, create mock data for demo
        setOrgChart({
          positions: [
            {
              id: '1',
              title: 'Chief Executive Officer',
              department: 'Executive',
              level: 1,
              contact: {
                id: '1',
                fullName: 'Leadership Team',
                email: 'leadership@' + (company?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company') + '.com'
              },
              children: []
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch org chart:', error);
      // Fallback to basic structure
      setOrgChart({
        positions: [{
          id: '1',
          title: 'Organization Chart Coming Soon',
          department: 'General',
          level: 1,
          contact: null,
          children: []
        }]
      });
    } finally {
      setOrgChartLoading(false);
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
          if (value === 'org-chart' && !orgChart && !orgChartLoading) {
            fetchOrgChart();
          }
        }} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="duties">Duties</TabsTrigger>
            <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Info Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Industry</h4>
                        <p className="text-gray-600">{company.industry}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Type</h4>
                        <p className="text-gray-600">{company.companyType?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Location</h4>
                        <p className="text-gray-600">{company.city}, {company.state}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Team Size</h4>
                        <p className="text-gray-600">{company._count?.contacts || 0} team members</p>
                      </div>
                    </div>
                    
                    {company.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600">{company.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Posts</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team Members</span>
                      <span className="font-medium">{company._count?.contacts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Activity</span>
                      <span className="font-medium">2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Founded</span>
                      <span className="font-medium">2 years ago</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Latest Contributions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">New team member added</p>
                        <p className="text-gray-500">22 hrs</p>
                      </div>
                      <div>
                        <p className="font-medium">Company info updated</p>
                        <p className="text-gray-500">3 mos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <p className="text-sm text-gray-600">Department and team structure</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Example teams based on org chart */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Account Management</h3>
                      <Badge variant="outline">3 members</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Handles client relationships and account strategy</p>
                    <div className="text-sm text-gray-500">Last activity: 1 year</div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Creative Department</h3>
                      <Badge variant="outline">5 members</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Develops creative campaigns and brand strategies</p>
                    <div className="text-sm text-gray-500">Last activity: 1 year</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Posts about {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Company update posted</p>
                    <p className="text-sm text-gray-600 mt-1">New team members announced and organizational changes.</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <span>SC Admin</span>
                      <span>•</span>
                      <span>22 hrs</span>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Industry insights shared</p>
                    <p className="text-sm text-gray-600 mt-1">Market analysis and strategic positioning discussion.</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <span>Packing Ticket</span>
                      <span>•</span>
                      <span>2 years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="people">
            <Card>
              <CardHeader>
                <CardTitle>People</CardTitle>
                <p className="text-sm text-gray-600">Team members and key contacts</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This will show the existing contacts */}
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Contact information will be displayed here</p>
                    <p className="text-sm">Including roles, responsibilities, and contact details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duties">
            <Card>
              <CardHeader>
                <CardTitle>What does {company.name} do?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Strategic Planning</h3>
                      <p className="text-sm text-gray-600 mt-1">Develops comprehensive marketing strategies and campaign planning</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-medium text-green-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Client Services</h3>
                      <p className="text-sm text-gray-600 mt-1">Manages client relationships and ensures project delivery</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-medium text-purple-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Creative Development</h3>
                      <p className="text-sm text-gray-600 mt-1">Creates and executes creative campaigns across multiple channels</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact-info">
            <Card>
              <CardHeader>
                <CardTitle>Contact Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                    <p className="text-gray-600">
                      {company.city && company.state ? `${company.city}, ${company.state}` : 'Address not available'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                    <p className="text-gray-600">
                      {company.website ? `contact@${company.website.replace('https://', '').replace('http://', '')}` : 'Email not available'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Website</h4>
                    {company.website ? (
                      <Link href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Website
                      </Link>
                    ) : (
                      <p className="text-gray-600">Website not available</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact information last updated</h4>
                    <p className="text-gray-600">2 years ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keep old content for fallback - will be removed */}
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                window.location.href = `mailto:${contact.email}`;
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          {contact.phone && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                window.location.href = `tel:${contact.phone}`;
                              }}
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
                          {contact.linkedinUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                window.open(contact.linkedinUrl, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              <LinkedinIcon className="w-4 h-4" />
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

          <TabsContent value="org-chart">
            {orgChartLoading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
                    <span className="text-gray-600">Loading organizational chart...</span>
                  </div>
                </CardContent>
              </Card>
            ) : orgChart && orgChart.positions && orgChart.positions.length > 0 ? (
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-secondary/5 to-accent/5 border-secondary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary font-headline">
                      <Network className="w-6 h-6 mr-3 text-secondary" />
                      {company.name} - Organization Chart
                    </CardTitle>
                    <p className="body-medium">
                      Interactive organizational structure and team hierarchies
                    </p>
                  </CardHeader>
                </Card>
                
                <OrgChartViewer 
                  companyId={params.id as string}
                  chartData={orgChart.positions}
                  companyName={company.name}
                  loading={false}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-accent" />
                      Department Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DepartmentView 
                      positions={orgChart.positions}
                      companyName={company.name}
                      onPositionClick={(position) => console.log('Position clicked:', position)}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Network className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Org Chart Available</h3>
                  <p className="text-neutral-600 mb-6">
                    The organizational chart for {company.name} is not yet available in our system.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={() => window.location.href = `mailto:support@getmecca.com?subject=Request%20Org%20Chart%20for%20${company.name}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Request Org Chart
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('contacts')}>
                      <Users className="w-4 h-4 mr-2" />
                      View Contacts Instead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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