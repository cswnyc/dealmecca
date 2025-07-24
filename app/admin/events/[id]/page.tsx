'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import EventForm from '@/components/admin/EventForm';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';

interface Event {
  id: string;
  name: string;
  description?: string;
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
  website?: string;
  registrationUrl?: string;
  imageUrl?: string;
  logoUrl?: string;
  organizerName?: string;
  organizerUrl?: string;
  estimatedCost?: number;
  attendeeCount?: number;
  callForSpeakers: boolean;
  sponsorshipAvailable: boolean;
  creator?: {
    id: string;
    name: string;
  };
  attendeesCount: number;
  ratingsCount: number;
  createdAt: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch event');
      }
      
      const data = await response.json();
      setEvent(data.event);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      setError(error.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (eventData: any) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        window.location.href = '/admin/events';
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }
    } catch (error: any) {
      console.error('Error updating event:', error);
      alert(`Failed to update event: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${event?.name}"?`)) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          window.location.href = '/admin/events';
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete event');
        }
      } catch (error: any) {
        console.error('Error deleting event:', error);
        alert(`Failed to delete event: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
              <Link href="/admin/events">
                <button className="text-blue-600 hover:text-blue-700">
                  ← Back to Events
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="space-y-2">
        <Link href="/admin/events" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Events
        </Link>
        <Breadcrumb items={[
          { label: 'Events', href: '/admin/events', icon: Calendar },
          { label: event.name, icon: Eye }
        ]} />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600">Update event information and settings</p>
      </div>

      {/* Event Form */}
      <EventForm
        mode="edit"
        event={event}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => window.location.href = '/admin/events'}
      />
    </div>
  );
} 