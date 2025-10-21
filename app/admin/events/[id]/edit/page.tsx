'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EventForm from '@/components/admin/EventForm';

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
  status: string;
  capacity?: number;
  registrationDeadline?: string;
  eventType?: string;
  isVirtual: boolean;
  isHybrid: boolean;
  imageUrl?: string;
  logoUrl?: string;
  organizerName?: string;
  organizerUrl?: string;
  registrationUrl?: string;
  estimatedCost?: number;
  attendeeCount?: number;
  callForSpeakers: boolean;
  sponsorshipAvailable: boolean;
  avgOverallRating?: number;
  avgNetworkingRating?: number;
  avgContentRating?: number;
  avgROIRating?: number;
  totalRatings: number;
  creator?: {
    id: string;
    name: string;
  };
  attendeesCount: number;
  ratingsCount: number;
  createdAt: string;
}

export default function EditEvent() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/events/${eventId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }

        const eventData = await response.json();
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Event not found'}
            </h1>
            <p className="text-gray-600 mb-4">
              {error ? 'There was an error loading the event.' : "The event you're looking for doesn't exist."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <EventForm mode="edit" event={event} />
      </div>
    </div>
  );
}
