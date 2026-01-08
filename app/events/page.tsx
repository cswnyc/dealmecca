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
import { PageFrame, PageContent, PageCard } from '@/components/layout/PageFrame';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BrandTabs } from '@/components/ui/BrandTabs';
import { EmptyState } from '@/components/events/EmptyState';
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
import { Label } from '@/components/ui/label';
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
] as const;

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
      'CONFERENCE': 'bg-primary/10 text-primary border-primary/20',
      'TRADE_SHOW': 'bg-accent/10 text-accent border-accent/20',
      'SUMMIT': 'bg-secondary/10 text-secondary border-secondary/20',
      'WORKSHOP': 'bg-accent/10 text-accent border-accent/20',
      'NETWORKING': 'bg-accent/10 text-accent border-accent/20',
      'AWARDS': 'bg-accent/10 text-accent border-accent/20',
      'WEBINAR': 'bg-secondary/10 text-secondary border-secondary/20',
      'MASTERCLASS': 'bg-destructive/10 text-destructive border-destructive/20',
      'MEETUP': 'bg-accent/10 text-accent border-accent/20'
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
      <PageFrame maxWidth="7xl">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </PageFrame>
    );
  }

  return (
    <AuthGuard>
    <PageFrame maxWidth="full" className="p-0">
      <div className="bg-background">
        {/* Featured Event Hero */}
        {featuredEvent && (
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}>
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
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2575FC] font-semibold rounded-lg hover:bg-white/90 transition-all"
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
          <BrandTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-6"
          />

          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA7C2]" />
              <input
                type="text"
                placeholder="Search events by name, location, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl text-sm text-[#162B54] dark:text-[#EAF0FF] placeholder-[#9AA7C2] focus:outline-none focus:ring-2 focus:ring-[#2575FC]/20 focus:border-[#2575FC] dark:focus:ring-[#5B8DFF]/20 dark:focus:border-[#5B8DFF] transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl text-sm font-medium text-[#64748B] dark:text-[#9AA7C2] hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-all whitespace-nowrap ${showFilters ? 'border-[#2575FC] dark:border-[#5B8DFF] text-[#2575FC] dark:text-[#5B8DFF]' : ''}`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={() => {
                resetSuggestionDialog();
                setShowSuggestionDialog(true);
              }}
              className="text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
            >
              <Lightbulb className="w-5 h-5" />
              Suggest Event
            </button>
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
              { icon: Calendar, label: 'Total Events', value: filteredEvents.length, colorClass: 'bg-[#2575FC]/10 dark:bg-[#5B8DFF]/10 text-[#2575FC] dark:text-[#5B8DFF]' },
              { icon: Users, label: 'Total Attendees', value: totalAttendees.toLocaleString(), colorClass: 'bg-[#8B5CF6]/10 text-[#8B5CF6]' },
              { icon: Wifi, label: 'Virtual Events', value: virtualCount, colorClass: 'bg-cyan-500/10 text-cyan-500' },
              { icon: Star, label: 'Avg Rating', value: avgRating ? avgRating.toFixed(1) : '—', colorClass: 'bg-yellow-500/10 text-yellow-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`stat-card rounded-xl p-5 flex items-center gap-4 transition-all duration-500 ${
                    statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#162B54] dark:text-[#EAF0FF]">{stat.value}</p>
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
              <EmptyState
                onClearFilters={() => {
                  setSearchQuery('');
                  setFilterState({ category: 'all', industry: 'all', isVirtual: 'all' });
                  setActiveTab('upcoming');
                }}
                onSuggestEvent={() => {
                  resetSuggestionDialog();
                  setShowSuggestionDialog(true);
                }}
              />
            ) : (
              filteredEvents.map((event, index) => {
                const isUpcoming = new Date(event.startDate) > new Date();
                return (
                  <PageCard
                    key={event.id}
                    hover
                    className="cursor-pointer animate-slide-up overflow-hidden"
                  >
                    <div onClick={() => router.push(`/events/${event.id}`)}>
                          {/* Gradient Accent Bar */}
                      <div className={`h-1 ${getCategoryGradient(event.category)}`} />

                      <div className="p-6">
                        <div className="flex items-start gap-5">
                          {/* Event Icon/Logo */}
                          <div className="w-16 h-16 rounded-xl icon-gradient-bg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-8 h-8 text-[#2575FC] dark:text-[#5B8DFF]" />
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
                                  <Badge variant="outline" className={getCategoryBadgeColor(event.category)}>
                                    {event.category.replace(/_/g, ' ')}
                                  </Badge>
                                  <Badge variant="outline">
                                    {event.industry.replace(/_/g, ' ')}
                                  </Badge>
                                  {isUpcoming && <CountdownBadge targetDate={event.startDate} />}
                                  {event.callForSpeakers && (
                                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                                      Call for Speakers
                                    </Badge>
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
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E6EAF2] dark:border-dark-border" onClick={(e) => e.stopPropagation()}>
                              {event.registrationUrl && (
                                <a
                                  href={event.registrationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                  style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
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
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-lg text-sm font-medium text-[#64748B] dark:text-[#9AA7C2] hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-all"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Website
                                </a>
                              )}
                              <Link
                                href={`/events/${event.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] text-sm font-medium transition-colors ml-auto"
                              >
                                View Details
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PageCard>
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
                <button
                  type="submit"
                  disabled={submittingSuggestion}
                  className="flex-1 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
                >
                  {submittingSuggestion ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Suggestion'
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageFrame>
    </AuthGuard>
  );
}
