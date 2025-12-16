'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function LinkedInCustomAuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (user && !loading) {
      router.push(returnUrl);
      return;
    }

    // Handle error states from OAuth flow
    if (errorParam) {
      setIsAuthenticating(false);
      switch (errorParam) {
        case 'oauth_failed':
          setError('LinkedIn authorization failed. Please try again.');
          break;
        case 'no_code':
          setError('LinkedIn did not provide authorization code. Please try again.');
          break;
        case 'callback_failed':
          setError('Authentication process failed. Please try again.');
          break;
        case 'signin_failed':
          setError('Sign-in failed. Please try again.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
      }
    }
  }, [user, loading, errorParam, returnUrl, router]);

  const handleLinkedInSignIn = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // Redirect to LinkedIn OAuth initiation endpoint
      const oauthUrl = `/api/linkedin/oauth?returnUrl=${encodeURIComponent(returnUrl)}`;
      window.location.href = oauthUrl;
    } catch (err) {
      console.error('LinkedIn OAuth initiation error:', err);
      setError('Failed to start LinkedIn authentication. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleLinkedInSignIn();
  };

  const handleBackToSignIn = () => {
    router.push('/auth/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Continue with LinkedIn
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account using LinkedIn
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={error ? handleRetry : handleLinkedInSignIn}
            disabled={isAuthenticating}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAuthenticating && (
              <div className="absolute left-3 inset-y-0 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </div>
            )}

            <svg
              className={`${isAuthenticating ? 'ml-6' : 'mr-2'} h-5 w-5`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                clipRule="evenodd"
              />
            </svg>

            {isAuthenticating ? 'Connecting...' : error ? 'Try Again' : 'Continue with LinkedIn'}
          </button>

          <button
            onClick={handleBackToSignIn}
            className="w-full flex justify-center py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Sign In
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-input" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-muted text-muted-foreground">
                Secure authentication powered by LinkedIn
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}