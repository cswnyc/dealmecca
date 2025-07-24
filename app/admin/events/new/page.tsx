'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import EventForm from '@/components/admin/EventForm';

export default function CreateEventPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (eventData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        window.location.href = '/admin/events';
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

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
          { label: 'Create Event', icon: Plus }
        ]} />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600">Set up a new event with capacity management and org chart integration</p>
      </div>

      {/* Event Form */}
      <EventForm
        mode="create"
        onSave={handleSave}
        onCancel={() => window.location.href = '/admin/events'}
      />
    </div>
  );
} 