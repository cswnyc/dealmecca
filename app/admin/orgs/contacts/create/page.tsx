'use client';

import ContactForm from '@/components/admin/ContactForm';

export default function CreateContact() {
  return (
    <div className="container mx-auto py-6 px-4">
      <ContactForm mode="create" />
    </div>
  );
}