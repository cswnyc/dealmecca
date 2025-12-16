'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import {
  Calendar, Users, Search, Filter, Plus, MapPin, X, Globe, Clock,
  Building2, Star, ExternalLink, Ticket, Wifi, Briefcase, Monitor,
  ChevronRight, ChevronLeft, TrendingUp, Zap, ArrowRight, Lightbulb,
  CheckCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CountdownBadge } from '@/components/events/CountdownTimer';
import { StarRating, RatingBadge } from '@/components/events/RatingProgressBars';
import { AttendeeAvatarRow } from '@/components/events/AttendeePreview';

export const dynamic = 'force-dynamic';

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

const TABS = [
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'conferences', label: 'Conferences', icon: Building2 },
  { id: 'meetups', label: 'Meetups', icon: Users },
  { id: 'webinars', label: 'Webinars', icon: Monitor },
  { id: 'virtual', label: 'Virtual', icon: Wifi },
  { id: 'networking', label: 'Networking', icon: Globe }
];

export default function EventsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('startDate');
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const [filterState, setFilterState] = useState({
    category: 'all',
    industry: 'all',
    isVirtual: 'all'
  });

  // Suggestion dialog state
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({
    eventName: '',
    eventUrl: '',
    notes: '',
    submitterEmail: ''
  });
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  // Observe stats for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch events
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
          setEvents([]);
        }
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, filterState, sortBy]);

  // Filter events based on active tab
  useEffect(() => {
    let filtered = [...events];
    const now = new Date();

    switch (activeTab) {
      case 'upcoming':
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
        filtered = filtered.filter(event => event.category === 'NETWORKING' || event.category === 'MEETUP');
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.industry.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [searchQuery, events, activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      'CONFERENCE': 'event-card-gradient-conference',
      'TRADE_SHOW': 'event-card-gradient-trade_show',
      'SUMMIT': 'event-card-gradient-summit',
      'WORKSHOP': 'event-card-gradient-workshop',
      'NETWORKING': 'event-card-gradient-networking',
      'AWARDS': 'event-card-gradient-awards',
      'WEBINAR': 'event-card-gradient-webinar',
      'MASTERCLASS': 'event-card-gradient-workshop',
      'MEETUP': 'event-card-gradient-meetup'
    };
    return gradients[category] || 'bg-muted';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'CONFERENCE': 'bg-blue-100 text-blue-800 border-blue-200',
      'TRADE_SHOW': 'bg-green-100 text-green-800 border-green-200',
      'SUMMIT': 'bg-purple-100 text-purple-800 border-purple-200',
      'WORKSHOP': 'bg-orange-100 text-orange-800 border-orange-200',
      'NETWORKING': 'bg-teal-100 text-teal-800 border-teal-200',
      'AWARDS': 'bg-amber-100 text-amber-800 border-amber-200',
      'WEBINAR': 'bg-violet-100 text-violet-800 border-violet-200',
      'MASTERCLASS': 'bg-rose-100 text-rose-800 border-rose-200',
      'MEETUP': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[category] || 'bg-muted text-muted-foreground border-border';
  };

  const formatCost = (cost?: number) => {
    if (!cost || cost === 0) return 'Free';
    return `$${cost.toLocaleString()}`;
  };

  // Get featured event (highest rated upcoming)
  const featuredEvent = events
    .filter(e => new Date(e.startDate) > new Date())
    .sort((a, b) => (b.avgOverallRating || 0) - (a.avgOverallRating || 0))[0];

  // Handle suggestion submission
  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionForm.eventName.trim()) {
      setSuggestionError('Please enter an event name');
      return;
    }

    setSubmittingSuggestion(true);
    setSuggestionError('');

    try {
      const response = await fetch('/api/events/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestionForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit suggestion');
      }

      setSuggestionSuccess(true);
      setSuggestionForm({ eventName: '', eventUrl: '', notes: '', submitterEmail: '' });

      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowSuggestionDialog(false);
        setSuggestionSuccess(false);
      }, 3000);

    } catch (error) {
      setSuggestionError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const resetSuggestionDialog = () => {
    setSuggestionForm({ eventName: '', eventUrl: '', notes: '', submitterEmail: '' });
    setSuggestionSuccess(false);
    setSuggestionError('');
  };

  // Calculate stats
  const totalAttendees = filteredEvents.reduce((sum, e) => sum + (e.attendeeCount || 0), 0);
  const virtualCount = filteredEvents.filter(e => e.isVirtual).length;
  const avgRating = filteredEvents.length > 0
    ? filteredEvents.reduce((sum, e) => sum + (e.avgOverallRating || 0), 0) / filteredEvents.filter(e => e.avgOverallRating).length
    : 0;

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Featured Event Hero */}
        {featuredEvent && (
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 md:top-6 md:left-8">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-amber-900 uppercase tracking-wider">
                    <Zap className="w-3 h-3" />
                    Featured Event
                  </span>
                </div>

                <div className="flex-1 pt-8 md:pt-0">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                    {featuredEvent.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 mb-6 text-white/90">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredEvent.startDate)}
                    </span>
                    <span className="text-white/50">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {featuredEvent.location}
                    </span>
                    {featuredEvent.avgOverallRating && (
                      <>
                        <span className="text-white/50">•</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {featuredEvent.avgOverallRating.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-white/80 mb-6 max-w-2xl line-clamp-2">
                    {featuredEvent.description}
                  </p>

                  {/* Countdown */}
                  <div className="mb-6">
                    <CountdownBadge targetDate={featuredEvent.startDate} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/events/${featuredEvent.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 font-bold rounded-lg hover:bg-muted transition-all shadow-lg"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {featuredEvent.registrationUrl && (
                      <a
                        href={featuredEvent.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20"
                      >
                        Register Now
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:flex flex-col gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="text-center px-4">
                    <p className="text-3xl font-black text-white">{featuredEvent.attendeeCount?.toLocaleString() || '—'}</p>
                    <p className="text-sm text-white/70">Expected Attendees</p>
                  </div>
                  <div className="border-t border-white/20" />
                  <div className="text-center px-4">
                    <p className="text-3xl font-black text-white">{formatCost(featuredEvent.estimatedCost)}</p>
                    <p className="text-sm text-white/70">Registration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                        : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events by name, location, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 bg-card shadow-sm border-border text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-4 ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Button
                onClick={() => {
                  resetSuggestionDialog();
                  setShowSuggestionDialog(true);
                }}
                className="h-12 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggest Event
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                  <Select
                    value={filterState.category}
                    onValueChange={(value) => setFilterState(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="CONFERENCE">Conference</SelectItem>
                      <SelectItem value="MEETUP">Meetup</SelectItem>
                      <SelectItem value="WEBINAR">Webinar</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="NETWORKING">Networking</SelectItem>
                      <SelectItem value="TRADE_SHOW">Trade Show</SelectItem>
                      <SelectItem value="SUMMIT">Summit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Industry</label>
                  <Select
                    value={filterState.industry}
                    onValueChange={(value) => setFilterState(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                      <SelectItem value="ENTERTAINMENT_MEDIA">Entertainment & Media</SelectItem>
                      <SelectItem value="RETAIL">Retail</SelectItem>
                      <SelectItem value="FINANCIAL_SERVICES">Financial Services</SelectItem>
                      <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Format</label>
                  <Select
                    value={filterState.isVirtual}
                    onValueChange={(value) => setFilterState(prev => ({ ...prev, isVirtual: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Formats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      <SelectItem value="true">Virtual</SelectItem>
                      <SelectItem value="false">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {filteredEvents.length} events found
                </span>
                <button
                  onClick={() => setFilterState({ category: 'all', industry: 'all', isVirtual: 'all' })}
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Calendar, label: 'Total Events', value: filteredEvents.length, color: 'blue' },
              { icon: Users, label: 'Total Attendees', value: totalAttendees.toLocaleString(), color: 'emerald' },
              { icon: Wifi, label: 'Virtual Events', value: virtualCount, color: 'purple' },
              { icon: Star, label: 'Avg Rating', value: avgRating ? avgRating.toFixed(1) : '—', color: 'amber' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              const colors: Record<string, string> = {
                blue: 'bg-blue-100 text-blue-600',
                emerald: 'bg-emerald-100 text-emerald-600',
                purple: 'bg-purple-100 text-purple-600',
                amber: 'bg-amber-100 text-amber-600'
              };
              return (
                <div
                  key={stat.label}
                  className={`bg-card rounded-xl border border-border p-4 shadow-sm transition-all duration-500 ${
                    statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colors[stat.color]} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events Grid */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-border">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterState({ category: 'all', industry: 'all', isVirtual: 'all' });
                    setActiveTab('upcoming');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const isUpcoming = new Date(event.startDate) > new Date();
                return (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm event-card-hover cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradient Accent Bar */}
                    <div className={`h-1 ${getCategoryGradient(event.category)}`} />

                    <div className="p-6">
                      <div className="flex items-start gap-5">
                        {/* Event Icon/Logo */}
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                          event.category === 'CONFERENCE' ? 'from-blue-500 to-indigo-600' :
                          event.category === 'MEETUP' ? 'from-pink-500 to-rose-600' :
                          event.category === 'WEBINAR' ? 'from-purple-500 to-violet-600' :
                          event.category === 'WORKSHOP' ? 'from-orange-500 to-amber-600' :
                          'from-teal-500 to-cyan-600'
                        }`}>
                          <Calendar className="w-8 h-8 text-white" />
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                {event.name}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                {event.description}
                              </p>

                              {/* Details Row */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  {event.isVirtual ? <Wifi className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                  {event.isVirtual ? 'Virtual' : event.isHybrid ? 'Hybrid' : 'In-Person'}
                                </span>
                              </div>

                              {/* Badges Row */}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(event.category)}`}>
                                  {event.category.replace(/_/g, ' ')}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                                  {event.industry.replace(/_/g, ' ')}
                                </span>
                                {isUpcoming && <CountdownBadge targetDate={event.startDate} />}
                                {event.callForSpeakers && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                    Call for Speakers
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right Side - Stats & Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl font-bold text-foreground mb-1">
                                {formatCost(event.estimatedCost)}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                {event.attendeeCount?.toLocaleString() || '—'} attendees
                              </p>
                              {event.avgOverallRating && (
                                <RatingBadge value={event.avgOverallRating} reviews={event.totalRatings} />
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
                            {event.registrationUrl && (
                              <a
                                href={event.registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                              >
                                <Ticket className="w-4 h-4" />
                                Register
                              </a>
                            )}
                            {event.website && (
                              <a
                                href={event.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-all"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Website
                              </a>
                            )}
                            <Link
                              href={`/events/${event.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 text-primary text-sm font-medium rounded-lg hover:bg-primary/10 transition-all ml-auto"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Event Suggestion Dialog */}
      <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Suggest an Event
            </DialogTitle>
            <DialogDescription>
              Know of an event that should be listed? Let us know and we'll review it.
            </DialogDescription>
          </DialogHeader>

          {suggestionSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Thank You!</h3>
              <p className="text-muted-foreground">Your suggestion has been submitted. We'll review it shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSuggestionSubmit} className="space-y-4">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-foreground mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="eventName"
                  value={suggestionForm.eventName}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, eventName: e.target.value }))}
                  placeholder="e.g., AdWeek New York 2025"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="eventUrl" className="block text-sm font-medium text-foreground mb-1">
                  Event Website/Link
                </label>
                <Input
                  id="eventUrl"
                  type="url"
                  value={suggestionForm.eventUrl}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, eventUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
                  Additional Notes
                </label>
                <Textarea
                  id="notes"
                  value={suggestionForm.notes}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any other details about the event..."
                  className="w-full resize-none"
                  rows={3}
                />
              </div>

              {!firebaseUser && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Your Email (optional)
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={suggestionForm.submitterEmail}
                    onChange={(e) => setSuggestionForm(prev => ({ ...prev, submitterEmail: e.target.value }))}
                    placeholder="yourname@example.com"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">We'll notify you when the event is added</p>
                </div>
              )}

              {suggestionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {suggestionError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSuggestionDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingSuggestion}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {submittingSuggestion ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Suggestion'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
