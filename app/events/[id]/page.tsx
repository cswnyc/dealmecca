'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { CountdownTimer, CountdownBadge } from '@/components/events/CountdownTimer';
import { RatingProgressBars, RatingHero, StarRating } from '@/components/events/RatingProgressBars';
import { AttendeePreview } from '@/components/events/AttendeePreview';
import { StickyCtaBar } from '@/components/events/StickyCtaBar';
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  DollarSign,
  ExternalLink,
  Star,
  TrendingUp,
  Share2,
  Bookmark,
  ChevronLeft,
  Award,
  Briefcase,
  Wifi,
  Building2,
  Clock,
  MessageSquare,
  Mic,
  Target
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  startDate: string;
  endDate: string;
  location: string;
  venue: string | null;
  category: string;
  industry: string;
  estimatedCost: number | null;
  attendeeCount: number | null;
  isVirtual: boolean;
  isHybrid: boolean;
  imageUrl: string | null;
  logoUrl: string | null;
  organizerName: string | null;
  organizerUrl: string | null;
  registrationUrl: string | null;
  callForSpeakers: boolean;
  sponsorshipAvailable: boolean;
  status: string;
  capacity: number | null;
  registrationDeadline: string | null;
  eventType: string | null;
  avgOverallRating: number | null;
  avgNetworkingRating: number | null;
  avgContentRating: number | null;
  avgROIRating: number | null;
  totalRatings: number;
  creator: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count: {
    attendees: number;
    ratings: number;
    forumPosts: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cost);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${event?.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    });
  };

  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      'CONFERENCE': 'from-blue-500 to-indigo-600',
      'TRADE_SHOW': 'from-green-500 to-emerald-600',
      'SUMMIT': 'from-purple-500 to-violet-600',
      'WORKSHOP': 'from-orange-500 to-amber-600',
      'NETWORKING': 'from-green-500 to-emerald-600',
      'AWARDS': 'from-yellow-500 to-amber-600',
      'WEBINAR': 'from-purple-500 to-pink-600',
      'MASTERCLASS': 'from-rose-500 to-pink-600',
      'MEETUP': 'from-pink-500 to-rose-600'
    };
    return gradients[category] || 'from-muted to-muted';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          {/* Hero Skeleton */}
          <div className="h-[500px] bg-gradient-to-br from-muted to-muted animate-pulse" />
          <div className="max-w-7xl mx-auto px-4 py-8 -mt-24 relative z-10">
            <div className="bg-card rounded-2xl shadow-xl p-8 animate-pulse">
              <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {error || 'Event not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              This event may have been removed or doesn't exist.
            </p>
            <button
              onClick={() => router.push('/events')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Events
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isUpcoming = new Date(event.startDate) > new Date();
  const isPast = new Date(event.endDate) < new Date();
  const isOngoing = !isUpcoming && !isPast;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Immersive Hero Section */}
        <div className={`relative min-h-[550px] md:min-h-[600px] bg-gradient-to-br ${getCategoryGradient(event.category)} overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push('/events')}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Events
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmark}
                  className={`p-3 rounded-full transition-all ${
                    isBookmarked
                      ? 'bg-white text-blue-600'
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all relative"
                >
                  <Share2 className="w-5 h-5" />
                  {shareSuccess && (
                    <span className="absolute -bottom-10 right-0 bg-card text-foreground text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      Link copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              {isUpcoming && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500 text-white animate-pulse-glow">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Upcoming Event
                </span>
              )}
              {isOngoing && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500 text-white">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Happening Now
                </span>
              )}
              {isPast && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-500 text-white">
                  Past Event
                </span>
              )}
            </div>

            {/* Event Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 max-w-4xl leading-tight">
              {event.name}
            </h1>

            {/* Category & Industry */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white">
                <Briefcase className="w-4 h-4" />
                {event.category.replace(/_/g, ' ')}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white">
                {event.industry.replace(/_/g, ' ')}
              </span>
              {event.isVirtual && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/80 text-white">
                  <Wifi className="w-4 h-4" />
                  Virtual
                </span>
              )}
              {event.isHybrid && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/80 text-white">
                  <Globe className="w-4 h-4" />
                  Hybrid
                </span>
              )}
            </div>

            {/* Countdown Timer for Upcoming Events */}
            {isUpcoming && (
              <div className="mb-8">
                <p className="text-white/80 text-sm font-medium mb-3 uppercase tracking-wider">Starts In</p>
                <CountdownTimer
                  targetDate={event.startDate}
                  size="lg"
                  variant="light"
                />
              </div>
            )}
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Date Card */}
            <div className="bg-card rounded-xl shadow-lg p-5 border border-border hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Date</span>
              </div>
              <p className="font-bold text-foreground">{formatDate(event.startDate)}</p>
              {event.startDate !== event.endDate && (
                <p className="text-sm text-muted-foreground">to {formatDate(event.endDate)}</p>
              )}
            </div>

            {/* Location Card */}
            <div className="bg-card rounded-xl shadow-lg p-5 border border-border hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Location</span>
              </div>
              <p className="font-bold text-foreground">{event.location}</p>
              {event.venue && (
                <p className="text-sm text-muted-foreground">{event.venue}</p>
              )}
            </div>

            {/* Attendees Card */}
            <div className="bg-card rounded-xl shadow-lg p-5 border border-border hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Attendees</span>
              </div>
              <p className="font-bold text-foreground">
                {event.attendeeCount?.toLocaleString() || 'TBA'}
              </p>
              {event.capacity && (
                <p className="text-sm text-muted-foreground">Capacity: {event.capacity.toLocaleString()}</p>
              )}
            </div>

            {/* Cost Card */}
            <div className="bg-card rounded-xl shadow-lg p-5 border border-border hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Est. Cost</span>
              </div>
              <p className="font-bold text-foreground">
                {event.estimatedCost !== null ? formatCost(event.estimatedCost) : 'TBA'}
              </p>
              {event.estimatedCost === 0 && (
                <p className="text-sm text-emerald-600 font-medium">Free Event</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {event.description && (
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">About This Event</h2>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Ratings Section */}
              {event.totalRatings > 0 && (
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <RatingProgressBars
                    overall={event.avgOverallRating}
                    networking={event.avgNetworkingRating}
                    content={event.avgContentRating}
                    roi={event.avgROIRating}
                    totalReviews={event.totalRatings}
                  />
                </div>
              )}

              {/* Opportunities Section */}
              {(event.callForSpeakers || event.sponsorshipAvailable) && (
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Opportunities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.callForSpeakers && (
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200 hover:shadow-lg transition-all group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Mic className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">Call for Speakers</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Share your expertise with industry peers. Submit your talk proposal.
                        </p>
                        <span className="text-purple-600 font-medium text-sm flex items-center gap-1">
                          Apply Now
                          <ChevronLeft className="w-4 h-4 rotate-180" />
                        </span>
                      </div>
                    )}
                    {event.sponsorshipAvailable && (
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200 hover:shadow-lg transition-all group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">Sponsorship Available</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get your brand in front of thousands of industry professionals.
                        </p>
                        <span className="text-emerald-600 font-medium text-sm flex items-center gap-1">
                          Learn More
                          <ChevronLeft className="w-4 h-4 rotate-180" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Discussion Section */}
              {event._count.forumPosts > 0 && (
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Discussions
                    </h2>
                    <Link
                      href={`/community?event=${event.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View All ({event._count.forumPosts})
                    </Link>
                  </div>
                  <p className="text-muted-foreground">
                    Join the conversation about this event in our community forum.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Register CTA */}
              {isUpcoming && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Ready to Attend?</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Secure your spot at this event.
                  </p>
                  {event.registrationUrl ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg"
                    >
                      Register Now
                      <span className="ml-2">{event.estimatedCost !== null && event.estimatedCost > 0 ? `- ${formatCost(event.estimatedCost)}` : '- Free'}</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center px-6 py-3 bg-gray-600 text-white/50 font-medium rounded-lg cursor-not-allowed"
                    >
                      Registration Not Available
                    </button>
                  )}
                  {event.registrationDeadline && (
                    <p className="text-xs text-white/60 mt-3 text-center">
                      Registration closes {formatDate(event.registrationDeadline)}
                    </p>
                  )}
                </div>
              )}

              {/* Attendee Preview */}
              <AttendeePreview
                totalCount={event._count.attendees || event.attendeeCount || 0}
                eventId={event.id}
              />

              {/* Organizer Info */}
              {event.organizerName && (
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="font-bold text-foreground mb-4">Organized By</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {event.organizerName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{event.organizerName}</p>
                      {event.organizerUrl && (
                        <a
                          href={event.organizerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
                <div className="space-y-3">
                  {event.website && (
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Event Website</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                  {event.registrationUrl && (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Registration</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA Bar */}
        <StickyCtaBar
          eventName={event.name}
          registrationUrl={event.registrationUrl}
          cost={event.estimatedCost}
          isUpcoming={isUpcoming}
          onShare={handleShare}
        />
      </div>
    </MainLayout>
  );
}
