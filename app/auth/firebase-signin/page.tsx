'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/firebase-auth';
import { useConfettiCelebration, getCelebrationTypeForUser } from '@/components/auth/ConfettiCelebration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Pre-load confetti component
import { ConfettiCelebration } from '@/components/auth/ConfettiCelebration';

export default function FirebaseSignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useRedirect, setUseRedirect] = useState(false);
  
  // Handle cases where Firebase provider might not be available (e.g., during build)
  let user = null;
  let authLoading = false;
  let signInWithGoogle = null;
  let signInWithLinkedIn = null;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    authLoading = authContext.loading;
    signInWithGoogle = authContext.signInWithGoogle;
    signInWithLinkedIn = authContext.signInWithLinkedIn;
  } catch (error) {
    // If useAuth fails (e.g., during build), just use defaults
    console.log('FirebaseSignInPage: Firebase context not available, using defaults');
  }

  const router = useRouter();
  const { initTrigger, celebrate } = useConfettiCelebration();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      console.log('👤 User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);
  
  const handleSignIn = useCallback(async (provider: 'google' | 'linkedin') => {
    if (!signInWithGoogle || !signInWithLinkedIn) {
      setError('Authentication is not available. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🔐 Starting ${provider} authentication...`);
      
      let result;
      if (provider === 'google') {
        result = await signInWithGoogle(useRedirect);
      } else {
        result = await signInWithLinkedIn(useRedirect);
      }

      if (result?.user) {
        console.log('✅ Authentication successful:', result.user.email);
        
        // Sync user data to our database
        try {
          const syncResponse = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUser: {
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.displayName,
                photoURL: result.user.photoURL,
                provider: provider
              }
            })
          });

          const syncData = await syncResponse.json();
          console.log('🔄 User sync result:', syncData);

          // Celebrate based on user type
          const isNewUser = syncData?.isNewUser || false;
          const celebrationType = getCelebrationTypeForUser(isNewUser, provider);
          
          console.log('🎉 Triggering celebration:', { celebrationType, isNewUser, provider });
          celebrate(celebrationType);

          // Show success message
          setSuccess(isNewUser ? 'Welcome to DealMecca! 🎉' : 'Welcome back! ✨');

          // Delay redirect to show confetti
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);

        } catch (syncError) {
          console.error('❌ User sync failed:', syncError);
          // Still redirect even if sync fails
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      }

    } catch (error: any) {
      console.error(`❌ ${provider} authentication failed:`, error);
      
      // Handle specific error cases
      if (error?.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please enable popups or use redirect method.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (error?.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error?.message || `Failed to sign in with ${provider}`);
      }
    } finally {
      setLoading(false);
    }
  }, [useRedirect, router, celebrate]);

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Confetti Component */}
      <ConfettiCelebration onInit={initTrigger} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Welcome to DealMecca
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Success Message */}
            {success && (
              <div className="flex items-center p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Google Sign In */}
              <Button
                onClick={() => handleSignIn('google')}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>

              {/* LinkedIn Sign In */}
              <Button
                onClick={() => handleSignIn('linkedin')}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <svg className="w-5 h-5 mr-3" fill="#0077b5" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Continue with LinkedIn
                  </div>
                )}
              </Button>
            </div>

            {/* Redirect Option */}
            <div className="flex items-center justify-center space-x-2 py-2">
              <input
                type="checkbox"
                id="useRedirect"
                checked={useRedirect}
                onChange={(e) => setUseRedirect(e.target.checked)}
                className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 focus:ring-offset-0"
              />
              <label htmlFor="useRedirect" className="text-sm text-slate-600">
                Use redirect instead of popup
              </label>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                If popups are blocked, try enabling the checkbox above
              </p>
            </div>

            {/* Navigation Links */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors">
                  ← Back to Home
                </Link>
                <Link href="/auth/signup" className="text-slate-600 hover:text-slate-800 transition-colors">
                  Need an account?
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 pt-4">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-slate-600 hover:text-slate-800">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-slate-600 hover:text-slate-800">Privacy Policy</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}