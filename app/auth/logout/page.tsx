'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function LogoutPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut(auth);
        console.log('✅ Successfully logged out');
        // Redirect to sign in page after logout
        router.push('/auth/signin');
      } catch (error) {
        console.error('❌ Logout error:', error);
        setIsLoggingOut(false);
      }
    };

    handleLogout();
  }, [router]);

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Signing out...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Logout Failed</h2>
        <p className="text-muted-foreground mb-4">There was an error signing you out.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}