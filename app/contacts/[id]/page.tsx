'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ContactRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing contact profile page
    if (params.id) {
      router.replace(`/orgs/contacts/${params.id}`);
    }
  }, [params.id, router]);

  // Show minimal loading state during redirect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading contact profile...</p>
      </div>
    </div>
  );
}