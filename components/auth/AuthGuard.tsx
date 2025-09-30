'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import { Button } from '@/components/ui/button';
import { LogoWithIcon } from '@/components/brand/Logo';
import { Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  requireAuth?: boolean;
  showSignUpPage?: boolean;
}

export function AuthGuard({
  children,
  fallbackUrl = '/auth/signup',
  requireAuth = true,
  showSignUpPage = true
}: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // Try to get Firebase auth, but handle errors gracefully
  let user = null;
  let loading = false;
  try {
    const authContext = useAuth();
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    // Firebase auth not available, continue with LinkedIn-only auth
    console.log('Firebase auth not available, using LinkedIn-only authentication');
  }

  useEffect(() => {
    const checkAccess = async () => {
      console.log('AuthGuard: Checking access...', {
        requireAuth,
        user: !!user,
        loading,
        hasLinkedInSession: !!localStorage.getItem('linkedin-session')
      });

      // If auth is not required, allow access
      if (!requireAuth) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check for LinkedIn session first (prioritize over Firebase to avoid conflicts)
      try {
        const linkedinSession = localStorage.getItem('linkedin-session');
        if (linkedinSession) {
          const sessionData = JSON.parse(linkedinSession);

          // Validate session token hasn't expired
          if (sessionData.exp && Date.now() < sessionData.exp) {
            console.log('AuthGuard: LinkedIn user authenticated');
            setIsAuthorized(true);
            setIsChecking(false);
            return;
          } else {
            console.log('AuthGuard: LinkedIn session expired, removing');
            localStorage.removeItem('linkedin-session');
          }
        }
      } catch (error) {
        console.log('AuthGuard: Invalid LinkedIn session data, removing');
        localStorage.removeItem('linkedin-session');
      }

      // Wait for Firebase auth to load (if available)
      if (loading) {
        console.log('AuthGuard: Waiting for Firebase auth to load...');
        return;
      }

      // Check for Firebase user as fallback
      if (user) {
        console.log('AuthGuard: Firebase user authenticated');
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // No authenticated user found
      if (!showSignUpPage) {
        // Redirect immediately
        router.replace(fallbackUrl);
        return;
      }
      // Show sign-up page instead of redirecting
      setIsAuthorized(false);
      setIsChecking(false);
    };

    checkAccess();

    // Listen for localStorage changes (e.g., when LinkedIn auth completes)
    const handleStorageChange = () => {
      console.log('AuthGuard: Storage changed, rechecking authentication...');
      checkAccess();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, loading, router, fallbackUrl, requireAuth, showSignUpPage]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <LogoWithIcon size="lg" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show sign-up page for unauthenticated users
  if (!isAuthorized && requireAuth && showSignUpPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/">
                <LogoWithIcon size="md" className="cursor-pointer" />
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/auth/signup">
                  <Button variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Sign up to continue
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Access to our forum, org charts, and intelligence tools requires an account.
              Join thousands of media sales professionals already using DealMecca.
            </p>

            {/* Features List */}
            <div className="text-left mb-8 space-y-3">
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span>Access to exclusive forum discussions</span>
              </div>
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span>Interactive organization charts</span>
              </div>
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span>AI-powered sales intelligence</span>
              </div>
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span>Connect with industry professionals</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Link href="/auth/signup" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </div>
            </div>

            {/* Back to homepage */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Link href="/" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm transition-colors">
                ← Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized message (fallback)
  if (!isAuthorized && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">You need to sign in to access this content.</p>
          <Link href={fallbackUrl}>
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // User is authorized or auth not required - render content
  return <>{children}</>;
}