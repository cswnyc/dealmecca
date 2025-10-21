'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
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
  Briefcase
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cost);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, you would save this to a backend/localStorage
    const message = !isBookmarked ? 'Event saved to bookmarks!' : 'Event removed from bookmarks';
    alert(message);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${event?.name} - ${event?.description?.slice(0, 100)}...`;

    // Try to use native Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback to copying to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy link to clipboard');
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Event not found'}
            </h1>
            <button
              onClick={() => router.push('/events')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto"
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </button>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Hero Image/Banner */}
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isUpcoming ? 'bg-green-100 text-green-800' :
                isOngoing ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {isUpcoming ? 'Upcoming' : isOngoing ? 'Ongoing' : 'Past Event'}
              </span>
            </div>
          </div>

          {/* Event Info */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {event.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>{event.industry.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 relative">
                <button
                  onClick={handleBookmark}
                  className={`p-2 border rounded-lg transition-all ${
                    isBookmarked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark this event'}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  title="Share this event"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                {shareSuccess && (
                  <div className="absolute -bottom-12 right-0 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                    ✓ Link copied to clipboard!
                  </div>
                )}
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600 mb-1">Dates</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(event.startDate)}
                  </div>
                  {event.startDate !== event.endDate && (
                    <div className="text-sm text-gray-600">
                      to {formatDate(event.endDate)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600 mb-1">Location</div>
                  <div className="font-medium text-gray-900">{event.location}</div>
                  {event.venue && (
                    <div className="text-sm text-gray-600">{event.venue}</div>
                  )}
                  {event.isVirtual && (
                    <div className="text-sm text-blue-600">Virtual Event</div>
                  )}
                  {event.isHybrid && (
                    <div className="text-sm text-blue-600">Hybrid Event</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600 mb-1">Attendees</div>
                  <div className="font-medium text-gray-900">
                    {event.attendeeCount?.toLocaleString() || 'TBA'}
                  </div>
                  {event.capacity && (
                    <div className="text-sm text-gray-600">
                      Capacity: {event.capacity.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {event.estimatedCost && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Est. Cost</div>
                    <div className="font-medium text-gray-900">
                      {formatCost(event.estimatedCost)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ratings */}
            {event.totalRatings > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Event Ratings
                  <span className="text-sm text-gray-500">
                    ({event.totalRatings} reviews)
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {event.avgOverallRating?.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Overall</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {event.avgNetworkingRating?.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Networking</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {event.avgContentRating?.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Content</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {event.avgROIRating?.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">ROI</div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="border-t border-gray-200 pt-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">About This Event</h3>
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Organizer & Links */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.organizerName && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Organized By</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{event.organizerName}</span>
                      {event.organizerUrl && (
                        <a
                          href={event.organizerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {event.website && (
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      Event Website
                    </a>
                  )}
                  {event.registrationUrl && isUpcoming && (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium justify-center"
                    >
                      Register Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Opportunities */}
            {(event.callForSpeakers || event.sponsorshipAvailable) && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Opportunities</h3>
                <div className="flex gap-4">
                  {event.callForSpeakers && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Call for Speakers
                    </span>
                  )}
                  {event.sponsorshipAvailable && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Sponsorship Available
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discussion Section */}
        {event._count.forumPosts > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Related Discussions ({event._count.forumPosts})
            </h2>
            <p className="text-gray-600 text-sm">
              Join the conversation about this event in our community forum
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
