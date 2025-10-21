'use client';

import EventForm from '@/components/admin/EventForm';

export default function AdminNewEventPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <EventForm mode="create" />
      </div>
    </div>
  );
}