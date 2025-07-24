'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ContactForm from '@/components/admin/ContactForm';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Users, Eye } from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';

interface Company {
  id: string;
  name: string;
  companyType: string;
}

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
  company: Company;
}

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = params.id as string;
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/contacts/${contactId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contact');
      }
      
      const data = await response.json();
      setContact(data.contact);
    } catch (error: any) {
      console.error('Error fetching contact:', error);
      setError(error.message || 'Failed to load contact');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (contactData: any) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });

      if (response.ok) {
        window.location.href = '/admin/orgs/contacts';
      } else {
        console.error('Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await fetch(`/api/admin/contacts/${contactId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          window.location.href = '/admin/orgs/contacts';
        } else {
          console.error('Failed to delete contact');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
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

  if (error || !contact) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error || 'Contact not found'}</p>
              <Link href="/admin/orgs/contacts">
                <button className="text-blue-600 hover:text-blue-700">
                  ← Back to Contacts
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
        <Link href="/admin/orgs/contacts" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Contacts
        </Link>
        <Breadcrumb items={[
          { label: 'Organizations', href: '/admin/orgs' },
          { label: 'Contacts', href: '/admin/orgs/contacts', icon: Users },
          { label: `${contact.firstName} ${contact.lastName}`, icon: Eye }
        ]} />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Contact</h1>
        <p className="text-gray-600">Update contact information and details</p>
      </div>

      {/* Contact Form */}
      <ContactForm
        mode="edit"
        contact={contact}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => window.location.href = '/admin/orgs/contacts'}
      />
    </div>
  );
} 