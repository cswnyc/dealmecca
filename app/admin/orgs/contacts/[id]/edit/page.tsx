'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ContactForm from '@/components/admin/ContactForm';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  personalEmail?: string;
  department?: string;
  seniority: string;
  isDecisionMaker: boolean;
  preferredContact?: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  lastVerified?: string;
  company: {
    id: string;
    name: string;
    companyType: string;
    city?: string;
    state?: string;
  };
}

export default function EditContact() {
  const params = useParams();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchContact(params.id as string);
    }
  }, [params.id]);

  const fetchContact = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orgs/contacts/${id}`);

      if (!response.ok) {
        throw new Error('Contact not found');
      }

      const contactData = await response.json();
      setContact(contactData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-6">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Contact Not Found</h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
            <div className="mt-6">
              <a
                href="/admin/orgs/contacts"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                ← Back to Contacts
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <ContactForm mode="edit" contact={contact} />
    </div>
  );
}