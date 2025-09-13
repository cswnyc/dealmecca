'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Calendar,
  Crown,
  Settings,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { NetworkingActivityWidget } from '@/components/dashboard/NetworkingActivityWidget';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    eventAttendees: number;
    posts: number;
    comments: number;
    searches: number;
  };
  company?: {
    id: string;
    name: string;
    companyType: string;
    industry?: string;
    logoUrl?: string;
  };
  contact?: {
    id: string;
    fullName: string;
    title: string;
    department?: string;
    seniority: string;
  };
}

interface UserEvent {
  id: string;
  status: string;
  isGoing: boolean;
  hasAttended: boolean;
  registeredAt: string;
  event: {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    location: string;
    category: string;
    status: string;
    isVirtual: boolean;
    isHybrid: boolean;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const { user: firebaseUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  
  const isOwnProfile = session?.user?.id === params.id;

  useEffect(() => {
    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data);
      } else {
        console.error('Failed to fetch user profile:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    if (!params.id) return;
    
    try {
      setEventsLoading(true);
      const response = await fetch(`/api/users/${params.id}/events`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch user events:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return (
          <Badge variant="outline" className="text-gray-600">
            Free Plan
          </Badge>
        );
      case 'PRO':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Crown className="w-3 h-3 mr-1" /> 
            Pro Plan
          </Badge>
        );
      case 'TEAM':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3 mr-1" /> 
            Team Plan
          </Badge>
        );
      case 'ADMIN':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Star className="w-3 h-3 mr-1" /> 
            Admin
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAttendeeStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'bg-green-100 text-green-800';
      case 'ATTENDING': return 'bg-blue-100 text-blue-800';
      case 'ATTENDED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      case 'WAITLISTED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <p className="text-gray-600 mt-2">The user profile you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Profile</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{profile.name}</span>
          </nav>
        </div>

        {/* User Header */}
        <Card className="mb-8">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 w-full md:w-auto">
                {/* Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold flex-shrink-0">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </div>

                <div className="flex-1 text-center sm:text-left w-full">
                  {/* Name and Role */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
                    {profile.subscriptionTier && getSubscriptionBadge(profile.subscriptionTier)}
                  </div>

                  {/* Contact & Company Info */}
                  {profile.contact && (
                    <div className="mb-4">
                      <h2 className="text-lg md:text-xl text-gray-700 mb-2">{profile.contact.title}</h2>
                      {profile.company && (
                        <Link 
                          href={`/orgs/companies/${profile.company.id}`}
                          className="text-base md:text-lg text-blue-600 hover:text-blue-700 font-medium inline-flex items-center justify-center sm:justify-start w-full sm:w-auto py-2 sm:py-0"
                        >
                          <Building2 className="w-4 h-4 mr-1" />
                          {profile.company.name}
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{profile._count?.eventAttendees || 0} events</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{profile._count?.posts || 0} posts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{profile._count?.searches || 0} searches</span>
                    </div>
                  </div>

                  {/* Member Since */}
                  <p className="text-gray-500 mt-2 text-center sm:text-left">
                    Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {isOwnProfile && (
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:flex-shrink-0">
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'events' && events.length === 0) {
            fetchUserEvents();
          }
        }} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events ({profile._count?.eventAttendees || 0})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Name</div>
                      <div className="text-sm">{profile.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Email</div>
                      <div className="text-sm">{isOwnProfile ? profile.email : '••••••••@••••.com'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Account Type</div>
                      <div className="text-sm">{getSubscriptionBadge(profile.subscriptionTier)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Member Since</div>
                      <div className="text-sm">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              {(profile.contact || profile.company) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.contact && (
                        <>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Job Title</div>
                            <div className="text-sm">{profile.contact.title}</div>
                          </div>
                          {profile.contact.department && (
                            <div>
                              <div className="text-sm font-medium text-gray-500">Department</div>
                              <div className="text-sm">{profile.contact.department.replace(/_/g, ' ')}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-500">Seniority Level</div>
                            <div className="text-sm">{profile.contact.seniority.replace(/_/g, ' ')}</div>
                          </div>
                        </>
                      )}
                      {profile.company && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">Company</div>
                          <Link 
                            href={`/orgs/companies/${profile.company.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {profile.company.name}
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Participation</CardTitle>
                <p className="text-sm text-gray-600">
                  Events that {isOwnProfile ? 'you have' : `${profile.name} has`} registered for or attended
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
                    {events.map((userEvent) => (
                      <div key={userEvent.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-lg">
                                <Link href={`/events/${userEvent.event.id}`} className="text-blue-600 hover:text-blue-700">
                                  {userEvent.event.name}
                                </Link>
                              </h4>
                              <Badge className={getAttendeeStatusColor(userEvent.status)} variant="outline">
                                {userEvent.status}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(userEvent.event.startDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{userEvent.event.isVirtual ? 'Virtual Event' : userEvent.event.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">Registered {formatDate(userEvent.registeredAt)}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{userEvent.event.category}</Badge>
                              <Badge 
                                className={
                                  userEvent.event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                  userEvent.event.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {userEvent.event.status}
                              </Badge>
                              {userEvent.event.isVirtual && <Badge variant="secondary">Virtual</Badge>}
                              {userEvent.event.isHybrid && <Badge variant="secondary">Hybrid</Badge>}
                            </div>
                            
                            {userEvent.event.description && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {userEvent.event.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            <Link href={`/events/${userEvent.event.id}`}>
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
                      {isOwnProfile ? "You haven't" : `${profile.name} hasn't`} registered for any events yet.
                    </p>
                    {isOwnProfile && (
                      <Link href="/events">
                        <Button className="mt-4">
                          <Calendar className="w-4 h-4 mr-2" />
                          Browse Events
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <NetworkingActivityWidget 
              userId={profile.id}
              showHeader={true}
              className="mb-6"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 