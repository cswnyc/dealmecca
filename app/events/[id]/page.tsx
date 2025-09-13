'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ForumLayout } from '@/components/layout/ForumLayout';
import EventHeader from '@/components/events/EventHeader';
import AttendanceActions from '@/components/events/AttendanceActions';
import EventStats from '@/components/events/EventStats';
import AttendeesSection from '@/components/events/AttendeesSection';
import { EventDiscussions } from '@/components/events/EventDiscussions';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  Share2,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Network,
  Target,
  ArrowLeft,
  Clock,
  Globe,
  Building
} from 'lucide-react';

interface EventDetailData {
  event: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    venue: string;
    category: string;
    industry: string;
    isVirtual: boolean;
    isHybrid: boolean;
    websiteUrl: string;
    registrationUrl: string;
    logoUrl?: string;
    bannerUrl?: string;
    estimatedCost: number;
    // New schema fields
    status: string;
    capacity?: number;
    registrationDeadline?: string;
    eventType?: string;
    creator?: {
      id: string;
      name: string;
    };
    capacityStatus: {
      isAtCapacity: boolean;
      isNearCapacity: boolean;
      isRegistrationClosed: boolean;
      availableSpots: number | null;
      fillPercentage: number;
    };
    _count: {
      attendees: number;
      ratings: number;
    };
  };
  currentUserAttendance?: {
    id: string;
    status: string;
    isGoing: boolean;
    hasAttended: boolean;
    registeredAt: string;
    companyId?: string;
    contactId?: string;
    createdAt: string;
  };
  avgRatings: {
    overall: number;
    networking: number;
    content: number;
    roi: number;
  };
  avgCosts: {
    registration: number;
    travel: number;
    accommodation: number;
    total: number;
  };
  roiStats: {
    avgConnections: number;
    avgDeals: number;
    avgRevenue: number;
  };
  attendees: any[];
  reviews: any[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: firebaseUser } = useAuth();
  const [eventData, setEventData] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchEventDetails();
    }
  }, [params.id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${params.id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await response.json();
      setEventData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (status: string, isGoing: boolean = true) => {
    try {
      const response = await fetch(`/api/events/${params.id}/rsvp`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, isGoing }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update attendance');
      }

      fetchEventDetails(); // Refresh data
    } catch (err) {
      console.error('Failed to update attendance:', err);
      alert(err instanceof Error ? err.message : 'Failed to update attendance');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <ForumLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </ForumLayout>
    );
  }

  if (error || !eventData) {
    return (
      <ForumLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'This event could not be found.'}</p>
            <Button onClick={() => router.push('/events')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </ForumLayout>
    );
  }

  const { event, avgRatings, avgCosts, roiStats } = eventData;

  return (
    <ForumLayout>
      <div className="bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/events')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <EventHeader
        event={event}
        currentUserAttendance={eventData.currentUserAttendance}
        avgRatings={avgRatings}
        avgCosts={avgCosts}
        roiStats={roiStats}
        onAttendanceChange={handleAttendanceChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Building },
              { id: 'attendees', label: 'Attendees', icon: Users },
              { id: 'discussions', label: 'Discussions', icon: MessageSquare },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'roi', label: 'ROI Insights', icon: TrendingUp },
              { id: 'networking', label: 'Networking', icon: Network },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Capacity and Registration Status */}
        {(event.capacity || event.registrationDeadline || event.capacityStatus.isAtCapacity) && (
          <div className="mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {event.capacity && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {event._count.attendees}/{event.capacity}
                      </div>
                      <div className="text-sm text-gray-600">Attendees</div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              event.capacityStatus.isAtCapacity ? 'bg-red-500' :
                              event.capacityStatus.isNearCapacity ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${event.capacityStatus.fillPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {event.registrationDeadline && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(event.registrationDeadline) > new Date() ? (
                          Math.ceil((new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        ) : (
                          'Closed'
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.registrationDeadline) > new Date() ? 'Days to Register' : 'Registration Closed'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Deadline: {formatDate(event.registrationDeadline)}
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="space-y-2">
                      {event.capacityStatus.isAtCapacity ? (
                        <Badge variant="destructive" className="text-sm">
                          <Users className="w-4 h-4 mr-1" />
                          Event Full
                        </Badge>
                      ) : event.capacityStatus.isRegistrationClosed ? (
                        <Badge variant="secondary" className="text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          Registration Closed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-sm text-green-700 border-green-300">
                          <Users className="w-4 h-4 mr-1" />
                          Open for Registration
                        </Badge>
                      )}
                      {event.capacityStatus.availableSpots !== null && event.capacityStatus.availableSpots > 0 && (
                        <div className="text-xs text-gray-600">
                          {event.capacityStatus.availableSpots} spots remaining
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {event.description}
                      </p>
                      
                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Badge variant="outline" className="mr-2">Category</Badge>
                            <span className="text-gray-700">{event.category.replace('_', ' ')}</span>
                          </div>
                          {event.eventType && (
                            <div className="flex items-center text-sm">
                              <Badge variant="outline" className="mr-2">Type</Badge>
                              <span className="text-gray-700">{event.eventType.replace('_', ' ')}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <Badge variant="outline" className="mr-2">Format</Badge>
                            <div className="flex space-x-1">
                              {event.isVirtual && <Badge variant="secondary">Virtual</Badge>}
                              {event.isHybrid && <Badge variant="secondary">Hybrid</Badge>}
                              {!event.isVirtual && !event.isHybrid && <Badge variant="secondary">In-Person</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {event.creator && (
                            <div className="flex items-center text-sm">
                              <Badge variant="outline" className="mr-2">Organizer</Badge>
                              <span className="text-gray-700">{event.creator.name}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <Badge variant="outline" className="mr-2">Status</Badge>
                            <Badge 
                              variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className={event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          {event.capacity && (
                            <div className="flex items-center text-sm">
                              <Badge variant="outline" className="mr-2">Capacity</Badge>
                              <span className="text-gray-700">{event.capacity} attendees</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <EventStats 
                  event={event}
                  avgRatings={avgRatings}
                  avgCosts={avgCosts}
                  roiStats={roiStats}
                />
              </div>
            )}

            {activeTab === 'attendees' && (
              <AttendeesSection
                eventId={event.id}
                attendees={eventData.attendees || []}
                currentUserId={session?.user?.email ?? undefined}
                onConnect={(attendeeId) => {
                  console.log('Connect to attendee:', attendeeId);
                  // TODO: Implement connection logic
                }}
                onMessage={(attendeeId) => {
                  console.log('Message attendee:', attendeeId);
                  // TODO: Implement messaging logic
                }}
              />
            )}

            {activeTab === 'discussions' && (
              <EventDiscussions
                eventId={event.id}
                eventName={event.name}
              />
            )}

            {activeTab === 'reviews' && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-bold text-lg">{avgRatings.overall.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">Overall</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Network className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="font-bold text-lg">{avgRatings.networking.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">Networking</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageSquare className="w-4 h-4 text-green-500 mr-1" />
                        <span className="font-bold text-lg">{avgRatings.content.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">Content</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                        <span className="font-bold text-lg">{avgRatings.roi.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">ROI</p>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Detailed reviews coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'roi' && (
              <Card>
                <CardHeader>
                  <CardTitle>ROI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="font-bold text-lg">{formatCurrency(roiStats.avgRevenue)}</div>
                      <p className="text-sm text-gray-600">Avg Revenue Generated</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="font-bold text-lg">{roiStats.avgConnections}</div>
                      <p className="text-sm text-gray-600">Avg New Connections</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="font-bold text-lg">{roiStats.avgDeals}</div>
                      <p className="text-sm text-gray-600">Avg Deals Closed</p>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ROI calculator and detailed insights coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'networking' && (
              <Card>
                <CardHeader>
                  <CardTitle>Networking Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Plan your networking strategy and connect with other attendees before the event.
                  </p>
                  <div className="text-center py-8">
                    <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Pre-event networking features coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Registration</span>
                      <span className="font-medium">{formatCurrency(avgCosts.registration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Travel</span>
                      <span className="font-medium">{formatCurrency(avgCosts.travel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hotel</span>
                      <span className="font-medium">{formatCurrency(avgCosts.accommodation)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(avgCosts.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced RSVP with Org Chart Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your RSVP</CardTitle>
                </CardHeader>
                <CardContent>
                  {eventData.currentUserAttendance ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-green-800">
                              {eventData.currentUserAttendance.status === 'REGISTERED' && 'Registered'}
                              {eventData.currentUserAttendance.status === 'ATTENDING' && 'Attending'}
                              {eventData.currentUserAttendance.status === 'ATTENDED' && 'Attended'}
                              {eventData.currentUserAttendance.status === 'WAITLISTED' && 'Waitlisted'}
                            </div>
                            <div className="text-sm text-green-600">
                              Since {formatDate(eventData.currentUserAttendance.registeredAt)}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            ✓ Confirmed
                          </Badge>
                        </div>
                        {eventData.currentUserAttendance.companyId && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="text-sm text-green-700">
                              <div className="flex items-center">
                                <Building className="w-4 h-4 mr-2" />
                                Attending as org chart member
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAttendanceChange('CANCELLED', false)}
                          className="flex-1"
                        >
                          Cancel RSVP
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAttendanceChange('ATTENDING', true)}
                          className="flex-1"
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {event.capacityStatus.isAtCapacity ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                          <Users className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <div className="font-medium text-red-800">Event is Full</div>
                          <div className="text-sm text-red-600">
                            This event has reached maximum capacity
                          </div>
                        </div>
                      ) : event.capacityStatus.isRegistrationClosed ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                          <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <div className="font-medium text-yellow-800">Registration Closed</div>
                          <div className="text-sm text-yellow-600">
                            Registration deadline has passed
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm text-blue-800">
                              <div className="flex items-center">
                                <Building className="w-4 h-4 mr-2" />
                                Your org chart profile will be linked to this RSVP
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                This helps with networking and attendee insights
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleAttendanceChange('REGISTERED', true)}
                            className="w-full"
                            disabled={event.capacityStatus.isAtCapacity || event.capacityStatus.isRegistrationClosed}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            RSVP to Attend
                          </Button>
                          {event.capacityStatus.availableSpots !== null && event.capacityStatus.availableSpots <= 10 && event.capacityStatus.availableSpots > 0 && (
                            <div className="text-xs text-orange-600 text-center">
                              Only {event.capacityStatus.availableSpots} spots remaining!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendanceActions 
                    eventId={event.id}
                    currentStatus={eventData.currentUserAttendance?.status as any || 'none'}
                    onStatusChange={(status) => handleAttendanceChange(status)}
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      onClick={() => window.open(event.websiteUrl, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      View Event Website
                    </Button>
                    <Button
                      onClick={() => window.open(event.registrationUrl, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      Register Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Add to Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ForumLayout>
  );
} 