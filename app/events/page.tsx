'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { Calendar, Users, Search, Filter, Plus, MapPin, ChevronDown, X, Globe, Clock, Building2, Star, ExternalLink, Ticket, Wifi, Home, Briefcase, Monitor, Satellite, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Force dynamic rendering for user-specific content
export const dynamic = 'force-dynamic'

interface Event {
  id: string;
  name: string;
  description?: string;
  website?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  category: string;
  industry: string;
  estimatedCost?: number;
  attendeeCount?: number;
  isVirtual: boolean;
  isHybrid: boolean;
  imageUrl?: string;
  logoUrl?: string;
  organizerName?: string;
  organizerUrl?: string;
  registrationUrl?: string;
  callForSpeakers: boolean;
  sponsorshipAvailable: boolean;
  status: string;
  capacity?: number;
  registrationDeadline?: string;
  eventType?: string;
  avgOverallRating?: number;
  avgNetworkingRating?: number;
  avgContentRating?: number;
  avgROIRating?: number;
  totalRatings?: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    attendees: number;
    ratings: number;
    forumPosts: number;
  };
}

// Comprehensive mock events data - mirrors the rich sample data
const MOCK_EVENTS: Event[] = [
  // Major Industry Conferences
  {
    id: '1',
    name: 'Advertising Week New York 2025',
    description: 'The world\'s premier advertising and marketing event, bringing together industry leaders, brands, agencies, and technology providers for five days of networking, learning, and inspiration.',
    website: 'https://advertisingweek.com/new-york',
    startDate: '2025-10-20T09:00:00Z',
    endDate: '2025-10-24T18:00:00Z',
    location: 'New York, NY',
    venue: 'Multiple venues across NYC (Times Square, Hudson Yards, etc.)',
    category: 'CONFERENCE',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 1500,
    attendeeCount: 120000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'Stillwell Partners',
    organizerUrl: 'https://stillwellpartners.com',
    registrationUrl: 'https://advertisingweek.com/new-york/registration',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 130000,
    registrationDeadline: '2025-10-15T23:59:59Z',
    eventType: 'Multi-day Conference',
    avgOverallRating: 4.3,
    avgNetworkingRating: 4.6,
    avgContentRating: 4.1,
    avgROIRating: 4.0,
    totalRatings: 1847,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    creator: {
      id: '1',
      name: 'Stillwell Partners',
      email: 'events@stillwellpartners.com'
    },
    _count: {
      attendees: 120000,
      ratings: 1847,
      forumPosts: 234
    }
  },
  {
    id: '2',
    name: 'IAB NewFronts 2025',
    description: 'The premier showcase of digital video programming and advertising opportunities from leading publishers and platforms. Essential for media buyers and advertisers planning their digital video investments.',
    website: 'https://www.iab.com/newfronts',
    startDate: '2025-05-05T09:00:00Z',
    endDate: '2025-05-09T18:00:00Z',
    location: 'New York, NY',
    venue: 'Various venues in Manhattan',
    category: 'CONFERENCE',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 800,
    attendeeCount: 15000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'Interactive Advertising Bureau (IAB)',
    organizerUrl: 'https://www.iab.com',
    registrationUrl: 'https://www.iab.com/newfronts/registration',
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 16000,
    registrationDeadline: '2025-04-28T23:59:59Z',
    eventType: 'Upfront Presentations',
    avgOverallRating: 4.5,
    avgNetworkingRating: 4.8,
    avgContentRating: 4.4,
    avgROIRating: 4.7,
    totalRatings: 923,
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
    creator: {
      id: '2',
      name: 'IAB',
      email: 'events@iab.com'
    },
    _count: {
      attendees: 15000,
      ratings: 923,
      forumPosts: 156
    }
  },
  {
    id: '3',
    name: 'Programmatic I/O 2025',
    description: 'The leading conference for programmatic advertising professionals. Deep dive into the latest trends, technology, and strategies shaping automated media buying.',
    website: 'https://programmatic-io.com',
    startDate: '2025-09-24T09:00:00Z',
    endDate: '2025-09-25T18:00:00Z',
    location: 'San Francisco, CA',
    venue: 'Moscone Center',
    category: 'CONFERENCE',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 1200,
    attendeeCount: 8500,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'AdExchanger',
    organizerUrl: 'https://adexchanger.com',
    registrationUrl: 'https://programmatic-io.com/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 9000,
    registrationDeadline: '2025-09-20T23:59:59Z',
    eventType: 'Programmatic Focus',
    avgOverallRating: 4.4,
    avgNetworkingRating: 4.2,
    avgContentRating: 4.6,
    avgROIRating: 4.3,
    totalRatings: 654,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
    creator: {
      id: '3',
      name: 'AdExchanger',
      email: 'events@adexchanger.com'
    },
    _count: {
      attendees: 8500,
      ratings: 654,
      forumPosts: 89
    }
  },
  // Trade Shows
  {
    id: '4',
    name: 'NAB Show 2025',
    description: 'The ultimate event for media, entertainment and technology professionals. Explore cutting-edge broadcast technology, network with industry leaders, and discover solutions for content creation and distribution.',
    website: 'https://nabshow.com',
    startDate: '2025-04-12T09:00:00Z',
    endDate: '2025-04-15T18:00:00Z',
    location: 'Las Vegas, NV',
    venue: 'Las Vegas Convention Center',
    category: 'TRADE_SHOW',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 950,
    attendeeCount: 80000,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'National Association of Broadcasters',
    organizerUrl: 'https://nab.org',
    registrationUrl: 'https://nabshow.com/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 85000,
    registrationDeadline: '2025-04-05T23:59:59Z',
    eventType: 'Technology Showcase',
    avgOverallRating: 4.2,
    avgNetworkingRating: 4.4,
    avgContentRating: 4.0,
    avgROIRating: 4.1,
    totalRatings: 2341,
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
    creator: {
      id: '4',
      name: 'NAB',
      email: 'events@nab.org'
    },
    _count: {
      attendees: 80000,
      ratings: 2341,
      forumPosts: 167
    }
  },
  {
    id: '5',
    name: 'SXSW 2025',
    description: 'The convergence of technology, music, and film industries. Discover emerging trends, innovative startups, and breakthrough technologies that will shape the future of media and entertainment.',
    website: 'https://sxsw.com',
    startDate: '2025-03-07T09:00:00Z',
    endDate: '2025-03-16T23:00:00Z',
    location: 'Austin, TX',
    venue: 'Austin Convention Center & downtown venues',
    category: 'SUMMIT',
    industry: 'ENTERTAINMENT_MEDIA',
    estimatedCost: 1350,
    attendeeCount: 400000,
    isVirtual: false,
    isHybrid: false,
    organizerName: 'SXSW, LLC',
    organizerUrl: 'https://sxsw.com',
    registrationUrl: 'https://sxsw.com/attend',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 420000,
    registrationDeadline: '2025-02-15T23:59:59Z',
    eventType: 'Festival & Conference',
    avgOverallRating: 4.6,
    avgNetworkingRating: 4.9,
    avgContentRating: 4.5,
    avgROIRating: 4.3,
    totalRatings: 5678,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
    creator: {
      id: '5',
      name: 'SXSW',
      email: 'info@sxsw.com'
    },
    _count: {
      attendees: 400000,
      ratings: 5678,
      forumPosts: 892
    }
  },
  // Summits
  {
    id: '6',
    name: 'Data & Marketing Association Summit',
    description: 'The premier event for data-driven marketers. Learn about customer data platforms, privacy regulations, marketing automation, and analytics from industry thought leaders.',
    website: 'https://thedma.org/conference',
    startDate: '2025-06-10T09:00:00Z',
    endDate: '2025-06-12T17:00:00Z',
    location: 'Chicago, IL',
    venue: 'McCormick Place',
    category: 'SUMMIT',
    industry: 'RETAIL',
    estimatedCost: 1100,
    attendeeCount: 5500,
    isVirtual: false,
    isHybrid: true,
    organizerName: 'Data & Marketing Association',
    organizerUrl: 'https://thedma.org',
    registrationUrl: 'https://thedma.org/conference/register',
    callForSpeakers: true,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 6000,
    registrationDeadline: '2025-06-03T23:59:59Z',
    eventType: 'Data Marketing Summit',
    avgOverallRating: 4.1,
    avgNetworkingRating: 4.0,
    avgContentRating: 4.3,
    avgROIRating: 3.9,
    totalRatings: 387,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
    creator: {
      id: '6',
      name: 'DMA',
      email: 'events@thedma.org'
    },
    _count: {
      attendees: 5500,
      ratings: 387,
      forumPosts: 76
    }
  },
  // Networking Events
  {
    id: '7',
    name: 'AdTech Leaders Dinner - NYC',
    description: 'Exclusive invitation-only dinner for C-level executives in advertising technology. Limited to 50 senior leaders for intimate networking and strategic discussions.',
    startDate: '2025-05-15T18:00:00Z',
    endDate: '2025-05-15T22:00:00Z',
    location: 'New York, NY',
    venue: 'The Four Seasons Restaurant',
    category: 'NETWORKING',
    industry: 'TECHNOLOGY',
    estimatedCost: 350,
    attendeeCount: 50,
    isVirtual: false,
    isHybrid: false,
    organizerName: 'AdTech Executive Network',
    registrationUrl: 'https://adtechleaders.com/dinner-nyc',
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 50,
    registrationDeadline: '2025-05-10T23:59:59Z',
    eventType: 'Executive Dinner',
    avgOverallRating: 4.8,
    avgNetworkingRating: 4.9,
    avgContentRating: 4.6,
    avgROIRating: 4.7,
    totalRatings: 45,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
    creator: {
      id: '7',
      name: 'AdTech Executive Network',
      email: 'events@adtechleaders.com'
    },
    _count: {
      attendees: 50,
      ratings: 45,
      forumPosts: 8
    }
  },
  // Webinars
  {
    id: '8',
    name: 'Future of Programmatic Advertising Webinar',
    description: 'Join industry experts as they discuss the evolution of programmatic advertising, emerging technologies like AI and machine learning, and predictions for 2025 and beyond.',
    website: 'https://adtech.com/webinar-future-programmatic',
    startDate: '2025-03-20T14:00:00Z',
    endDate: '2025-03-20T15:30:00Z',
    location: 'Virtual Event',
    category: 'WEBINAR',
    industry: 'TECHNOLOGY',
    estimatedCost: 0,
    attendeeCount: 2500,
    isVirtual: true,
    isHybrid: false,
    organizerName: 'AdTech Magazine',
    organizerUrl: 'https://adtech.com',
    registrationUrl: 'https://adtech.com/webinar-future-programmatic/register',
    callForSpeakers: false,
    sponsorshipAvailable: true,
    status: 'PUBLISHED',
    capacity: 5000,
    registrationDeadline: '2025-03-19T23:59:59Z',
    eventType: 'Educational Webinar',
    avgOverallRating: 4.0,
    avgNetworkingRating: 3.5,
    avgContentRating: 4.4,
    avgROIRating: 4.1,
    totalRatings: 198,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-02-15T00:00:00Z',
    creator: {
      id: '8',
      name: 'AdTech Magazine',
      email: 'webinars@adtech.com'
    },
    _count: {
      attendees: 2500,
      ratings: 198,
      forumPosts: 23
    }
  },
  // Workshops
  {
    id: '9',
    name: 'Hands-on Google Ads Workshop',
    description: 'Intensive 2-day workshop covering advanced Google Ads strategies, campaign optimization, bidding strategies, and performance measurement. Limited to 25 participants for personalized attention.',
    website: 'https://digitalmarketingpro.com/google-ads-workshop',
    startDate: '2025-04-08T09:00:00Z',
    endDate: '2025-04-09T17:00:00Z',
    location: 'San Francisco, CA',
    venue: 'Google San Francisco Office',
    category: 'WORKSHOP',
    industry: 'TECHNOLOGY',
    estimatedCost: 850,
    attendeeCount: 25,
    isVirtual: false,
    isHybrid: false,
    organizerName: 'Digital Marketing Pro',
    organizerUrl: 'https://digitalmarketingpro.com',
    registrationUrl: 'https://digitalmarketingpro.com/google-ads-workshop/register',
    callForSpeakers: false,
    sponsorshipAvailable: false,
    status: 'PUBLISHED',
    capacity: 25,
    registrationDeadline: '2025-04-01T23:59:59Z',
    eventType: 'Hands-on Workshop',
    avgOverallRating: 4.7,
    avgNetworkingRating: 4.3,
    avgContentRating: 4.8,
    avgROIRating: 4.6,
    totalRatings: 23,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
    creator: {
      id: '9',
      name: 'Digital Marketing Pro',
      email: 'workshops@digitalmarketingpro.com'
    },
    _count: {
      attendees: 25,
      ratings: 23,
      forumPosts: 5
    }
  },
  // Virtual Events
  {
    id: '10',
    name: 'AdTech Virtual Meetup',
    description: 'Monthly virtual meetup for AdTech professionals featuring guest speakers, product demos, and networking breakout rooms. Free event for community building.',
    startDate: '2025-03-25T15:00:00Z',
    endDate: '2025-03-25T17:00:00Z',
    location: 'Virtual Event',
    category: 'MEETUP',
    industry: 'TECHNOLOGY',
    estimatedCost: 0,
    attendeeCount: 350,
    isVirtual: true,
    isHybrid: false,
    organizerName: 'AdTech Community',
    registrationUrl: 'https://meetup.com/adtech-virtual',
    callForSpeakers: true,
    sponsorshipAvailable: false,
    status: 'PUBLISHED',
    capacity: 500,
    eventType: 'Virtual Meetup',
    avgOverallRating: 4.0,
    totalRatings: 42,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-02-20T00:00:00Z',
    creator: {
      id: '10',
      name: 'AdTech Community',
      email: 'community@adtech.org'
    },
    _count: {
      attendees: 350,
      ratings: 42,
      forumPosts: 12
    }
  }
];

export default function EventsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'conferences' | 'meetups' | 'webinars' | 'virtual' | 'networking'>('upcoming');

  // Filter states
  const [filterState, setFilterState] = useState({
    category: 'all',
    industry: 'all',
    location: 'all',
    eventType: 'all',
    isVirtual: 'all',
    upcoming: 'all'
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('startDate');

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue as any);
  };

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: '1',
          limit: '50',
          sortBy: sortBy,
          upcoming: 'true'
        });

        if (searchQuery) params.set('search', searchQuery);
        if (filterState.category !== 'all') params.set('category', filterState.category);
        if (filterState.industry !== 'all') params.set('industry', filterState.industry);
        if (filterState.isVirtual !== 'all') params.set('isVirtual', filterState.isVirtual);

        const response = await fetch(`/api/events?${params}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        } else {
          console.error('Failed to fetch events:', response.statusText);
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, filterState, sortBy]);

  // Filter events based on active tab and search
  useEffect(() => {
    let filtered = [...events];

    // Apply tab filter
    switch (activeTab) {
      case 'upcoming':
        const now = new Date();
        filtered = filtered.filter(event => new Date(event.startDate) > now);
        break;
      case 'conferences':
        filtered = filtered.filter(event => event.category === 'CONFERENCE');
        break;
      case 'meetups':
        filtered = filtered.filter(event => event.category === 'MEETUP');
        break;
      case 'webinars':
        filtered = filtered.filter(event => event.category === 'WEBINAR');
        break;
      case 'virtual':
        filtered = filtered.filter(event => event.isVirtual);
        break;
      case 'networking':
        filtered = filtered.filter(event => event.eventType === 'NETWORKING' || event.category === 'MEETUP');
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [searchQuery, events, activeTab]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CONFERENCE': return 'bg-blue-100 text-blue-800';
      case 'MEETUP': return 'bg-green-100 text-green-800';
      case 'WEBINAR': return 'bg-purple-100 text-purple-800';
      case 'WORKSHOP': return 'bg-orange-100 text-orange-800';
      case 'NETWORKING': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostDisplay = (cost?: number) => {
    if (!cost || cost === 0) return 'Free';
    return `$${cost.toLocaleString()}`;
  };

  const getEventTypeIcon = (event: Event) => {
    if (event.isVirtual) return <Wifi className="w-4 h-4" />;
    if (event.isHybrid) return <Globe className="w-4 h-4" />;
    return <Building2 className="w-4 h-4" />;
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-full bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Calendar className="h-8 w-8 mr-3 text-sky-600" />
                    Events
                  </h1>
                  <p className="mt-1 text-gray-600">
                    Discover industry events and networking opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 pb-6 mb-6">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
                    { id: 'conferences', label: 'Conferences', icon: Building2 },
                    { id: 'meetups', label: 'Meetups', icon: Users },
                    { id: 'webinars', label: 'Webinars', icon: Monitor },
                    { id: 'virtual', label: 'Virtual', icon: Wifi },
                    { id: 'networking', label: 'Networking', icon: Globe }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar and Action Buttons */}
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-white shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  {firebaseUser && (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Events</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {filteredEvents.reduce((total, event) => total + (event.attendeeCount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                      <Wifi className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Virtual Events</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {filteredEvents.filter(e => e.isVirtual).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchQuery ? `Search Results (${filteredEvents.length})` : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Events`}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery ? `Found ${filteredEvents.length} events matching your search` : `Discover ${activeTab} events and opportunities`}
                </p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No events found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Event Image/Logo */}
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-8 h-8 text-white" />
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {event.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {event.description}
                                  </p>
                                  
                                  {/* Event Details */}
                                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {event.location}
                                    </div>
                                    <div className="flex items-center">
                                      {getEventTypeIcon(event)}
                                      <span className="ml-1">
                                        {event.isVirtual ? 'Virtual' : event.isHybrid ? 'Hybrid' : 'In-Person'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Tags */}
                                  <div className="flex items-center space-x-2 mt-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                                      {event.category}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {event.industry}
                                    </span>
                                    {event.callForSpeakers && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                        Call for Speakers
                                      </span>
                                    )}
                                    {event.sponsorshipAvailable && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                        Sponsorship Available
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Event Stats */}
                                <div className="text-right ml-4">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {getCostDisplay(event.estimatedCost)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {event.attendeeCount?.toLocaleString()} attendees
                                  </div>
                                  {event.avgOverallRating && (
                                    <div className="flex items-center mt-1">
                                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                      <span className="text-sm text-gray-600 ml-1">
                                        {event.avgOverallRating.toFixed(1)} ({event.totalRatings})
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-3 mt-4">
                                {event.registrationUrl && (
                                  <Link href={event.registrationUrl} target="_blank">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                      <Ticket className="w-4 h-4 mr-2" />
                                      Register
                                    </Button>
                                  </Link>
                                )}
                                {event.website && (
                                  <Link href={event.website} target="_blank">
                                    <Button variant="outline" size="sm">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Website
                                    </Button>
                                  </Link>
                                )}
                                <Button variant="outline" size="sm">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Add to Calendar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
                  <p className="text-sm text-gray-600 mt-1">Refine your search to find the perfect events</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* By Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Category</label>
                      <Select 
                        value={filterState.category} 
                        onValueChange={(value) => setFilterState(prev => ({...prev, category: value}))}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="CONFERENCE">Conference</SelectItem>
                          <SelectItem value="MEETUP">Meetup</SelectItem>
                          <SelectItem value="WEBINAR">Webinar</SelectItem>
                          <SelectItem value="WORKSHOP">Workshop</SelectItem>
                          <SelectItem value="NETWORKING">Networking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* By Industry */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Industry</label>
                      <Select 
                        value={filterState.industry} 
                        onValueChange={(value) => setFilterState(prev => ({...prev, industry: value}))}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Industries</SelectItem>
                          <SelectItem value="ADVERTISING">Advertising</SelectItem>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                          <SelectItem value="ADTECH">AdTech</SelectItem>
                          <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                          <SelectItem value="MEDIA">Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* By Event Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Format</label>
                      <Select 
                        value={filterState.isVirtual} 
                        onValueChange={(value) => setFilterState(prev => ({...prev, isVirtual: value}))}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Formats</SelectItem>
                          <SelectItem value="true">Virtual</SelectItem>
                          <SelectItem value="false">In-Person</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {filteredEvents.length} events
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setFilterState({
                        category: 'all',
                        industry: 'all',
                        location: 'all',
                        eventType: 'all',
                        isVirtual: 'all',
                        upcoming: 'all'
                      })}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}