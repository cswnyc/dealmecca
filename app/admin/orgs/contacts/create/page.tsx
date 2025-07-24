'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import ContactForm from '@/components/admin/ContactForm';

export default function CreateContactPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (contactData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });

      if (response.ok) {
        window.location.href = '/admin/orgs/contacts';
      } else {
        console.error('Failed to create contact');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="space-y-2">
        <Link href="/admin/orgs/contacts" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Contacts
        </Link>
        <Breadcrumb items={[
          { label: 'Organizations', href: '/admin/orgs' },
          { label: 'Contacts', href: '/admin/orgs/contacts', icon: Users },
          { label: 'Add Contact', icon: Plus }
        ]} />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Contact</h1>
        <p className="text-gray-600">Create a new professional contact</p>
      </div>

      {/* Contact Form */}
      <ContactForm
        mode="create"
        onSave={handleSave}
        onCancel={() => window.location.href = '/admin/orgs/contacts'}
      />
    </div>
  );
} 