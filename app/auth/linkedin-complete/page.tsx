'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

/**
 * LinkedIn OAuth completion page.
 *
 * After LinkedIn OAuth callback:
 * 1. Fetches custom token from cookie (via API endpoint)
 * 2. Signs into Firebase using custom token
 * 3. Redirects to forum
 *
 * User now has Firebase Auth session and can make authenticated API calls.
 */
export default function LinkedInCompletePage() {
  const [status, setStatus] = useState('Completing LinkedIn sign-in...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeSignIn() {
      try {
        console.log('🔄 Fetching custom token from cookie...');

        // Fetch custom token from cookie (one-time use)
        const response = await fetch('/api/linkedin/custom-token', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve custom token');
        }

        const { token } = await response.json();

        if (!token) {
          throw new Error('No custom token found - please sign in again');
        }

        console.log('✓ Custom token retrieved');

        setStatus('Signing into Firebase...');

        // Sign in to Firebase with custom token
        await signInWithCustomToken(auth, token);

        console.log('✅ Firebase sign-in successful');
        console.log('User:', auth.currentUser?.uid);

        setStatus('✅ Sign-in complete - redirecting to forum...');

        // Redirect to forum after short delay
        setTimeout(() => {
          window.location.replace('/forum');
        }, 1000);

      } catch (err: any) {
        console.error('❌ LinkedIn sign-in completion failed:', err);

        const errorMessage = err?.code || err?.message || 'Sign-in failed';
        setError(errorMessage);
        setStatus('❌ Sign-in failed');

        // Redirect to sign-in page after delay
        setTimeout(() => {
          window.location.replace('/auth/signin?error=linkedin_completion_failed');
        }, 3000);
      }
    }

    completeSignIn();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {error ? (
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          {error ? 'Sign-In Failed' : 'Completing Sign-In'}
        </h1>

        <p className="text-muted-foreground mb-4">{status}</p>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-2">Redirecting to sign-in page...</p>
          </div>
        )}

        {!error && (
          <div className="mt-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
