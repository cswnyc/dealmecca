'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/firebase-auth';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  AlertCircle,
  CheckCircle,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

export default function SignInPage(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false); // Prevent useEffect redirect during sign-in

  const router = useRouter();

  // Handle cases where Firebase provider might not be available
  let user = null;
  let authLoading = false;
  let signInWithGoogle = null;
  let signInWithLinkedIn = null;
  let signInWithEmail = null;

  try {
    const authContext = useAuth();
    user = authContext.user;
    authLoading = authContext.loading;
    signInWithGoogle = authContext.signInWithGoogle;
    signInWithLinkedIn = authContext.signInWithLinkedIn;
    signInWithEmail = authContext.signInWithEmail;
  } catch (error) {
    console.log('Auth context not available during build');
  }

  // Redirect if already logged in - check approval status first
  // Skip this check if we're actively signing in (handler will do the redirect)
  useEffect(() => {
    const checkAndRedirect = async (): Promise<void> => {
      if (user && !authLoading && !isSigningIn) {
        try {
          console.log('🔄 Already logged in useEffect: Syncing user', user.email);
          
          // ALWAYS sync user to ensure cookie is up-to-date
          // This is critical because cookies can be stale from previous sessions
          const syncResponse = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              providerId: user.providerId,
              isNewUser: false
            }),
            credentials: 'include'
          });

          console.log('🔄 Sync response status:', syncResponse.status);

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            const accountStatus = syncData.user?.accountStatus;

            console.log('🔄 Already logged in - got account status:', {
              email: user.email,
              accountStatus,
              cookieShouldBeUpdated: true
            });

            // Redirect based on account status
            if (accountStatus === 'PENDING' || accountStatus === 'REJECTED') {
              router.replace('/auth/pending-approval');
            } else {
              // APPROVED or null (legacy users)
              router.replace('/forum');
            }
          } else {
            console.error('🔄 Sync failed, fallback to forum');
            // Fallback to forum if sync fails
            router.replace('/forum');
          }
        } catch (err) {
          console.error('🔄 Error in already-logged-in sync:', err);
          router.replace('/forum');
        }
      }
    };

    checkAndRedirect();
  }, [user, authLoading, router, isSigningIn]);

  const handleGoogleSignIn = async (): Promise<void> => {
    if (!signInWithGoogle) return;

    setLoading(true);
    setIsSigningIn(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result) {
        setSuccess('Signed in successfully! Checking account status...');
        
        // Sync user and check account status
        const syncResponse = await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            providerId: result.user.providerId,
            isNewUser: result.isNewUser
          }),
          credentials: 'include'
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          const accountStatus = syncData.user?.accountStatus;

          console.log('🔍 Google sign-in - Account status check:', {
            email: result.user.email,
            syncResponseStatus: syncResponse.status,
            accountStatus,
            fullSyncData: syncData
          });

          // Redirect based on account status - no delay needed
          if (accountStatus === 'PENDING' || accountStatus === 'REJECTED') {
            console.log('🚫 Redirecting to pending-approval because status is:', accountStatus);
            router.replace('/auth/pending-approval');
          } else {
            console.log('✅ Redirecting to forum because status is:', accountStatus);
            router.replace('/forum');
          }
        } else {
          console.error('⚠️ Google sync failed with status:', syncResponse.status);
          router.replace('/forum');
        }
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setIsSigningIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      window.location.href = '/api/linkedin/start';
    } catch (err) {
      setError('Failed to initiate LinkedIn authentication. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!signInWithEmail) return;

    setLoading(true);
    setIsSigningIn(true);
    setError('');

    try {
      const result = await signInWithEmail(email, password);
      if (result) {
        // Sync user and check account status
        const syncResponse = await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            providerId: result.user.providerId,
            isNewUser: result.isNewUser
          }),
          credentials: 'include'
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          const accountStatus = syncData.user?.accountStatus;

          console.log('🔍 Email sign-in - Account status check:', {
            email: result.user.email,
            syncResponseStatus: syncResponse.status,
            accountStatus,
            fullSyncData: syncData
          });

          // Redirect based on account status - immediate redirect, no delay
          if (accountStatus === 'PENDING' || accountStatus === 'REJECTED') {
            console.log('🚫 Redirecting to pending-approval because status is:', accountStatus);
            router.replace('/auth/pending-approval');
          } else {
            console.log('✅ Redirecting to forum because status is:', accountStatus);
            router.replace('/forum');
          }
        } else {
          console.error('⚠️ Sync failed with status:', syncResponse.status);
          const errorText = await syncResponse.text();
          console.error('Sync error details:', errorText);
          router.replace('/forum');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setIsSigningIn(false);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flk min-h-screen bg-flk-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flk-primary"></div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account"
      altPageText="Don't have an account?"
      altPageHref="/auth/signup"
      altPageLinkText="Sign up"
    >
      {error && (
        <div className="rounded-flk-lg border border-flk-status-error/20 bg-flk-status-error/5 p-4 mb-6 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-flk-status-error flex-shrink-0" />
          <p className="text-flk-body-s text-flk-text-primary">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-flk-lg border border-flk-status-success/20 bg-flk-status-success/5 p-4 mb-6 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-flk-status-success flex-shrink-0" />
          <p className="text-flk-body-s text-flk-text-primary">{success}</p>
        </div>
      )}

      {!showEmailForm ? (
        <div className="space-y-3">
          {/* OAuth Buttons */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface hover:bg-flk-surface-subtle text-flk-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <button
            onClick={handleLinkedInSignIn}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface hover:bg-flk-surface-subtle text-flk-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <svg className="w-5 h-5 flex-shrink-0 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="font-medium">Continue with LinkedIn</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-flk-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-flk-body-s">
              <span className="px-3 bg-flk-surface text-flk-text-muted">or</span>
            </div>
          </div>

          <button
            onClick={(): void => setShowEmailForm(true)}
            className="w-full h-12 flex items-center justify-center gap-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface hover:bg-flk-surface-subtle text-flk-text-primary transition-all"
            type="button"
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Continue with Email</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-flk-body-s font-medium text-flk-text-primary mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e): void => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface-subtle text-flk-text-primary focus:outline-none focus:ring-2 focus:ring-flk-primary focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-flk-body-s font-medium text-flk-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e): void => setPassword(e.target.value)}
                required
                className="w-full px-3 py-3 pr-10 border border-flk-border-subtle rounded-flk-lg bg-flk-surface-subtle text-flk-text-primary focus:outline-none focus:ring-2 focus:ring-flk-primary focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={(): void => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-flk-text-muted" />
                ) : (
                  <Eye className="h-5 w-5 text-flk-text-muted" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-flk-body-s">
            <Link href="/auth/forgot-password" className="text-flk-primary hover:text-flk-primary-hover">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-flk-primary hover:bg-flk-primary-hover active:bg-flk-primary-active text-white font-medium rounded-flk-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-flk-card hover:shadow-flk-card-hover dark:shadow-flk-card-dark"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(): void => setShowEmailForm(false)}
            className="w-full h-10 text-flk-text-muted hover:text-flk-text-primary transition-colors text-flk-body-s"
          >
            ← Back to other options
          </button>
        </form>
      )}
    </AuthShell>
  );
}
