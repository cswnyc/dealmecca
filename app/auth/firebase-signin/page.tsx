'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ConfettiCelebration, useConfettiCelebration, getCelebrationTypeForUser, CelebrationTrigger } from '@/components/auth/ConfettiCelebration';
import { 
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  onAuthStateChanged,
  signOut
} from '@/lib/firebase';
import { clearNextAuthCookies } from '@/lib/clear-nextauth-cookies';

function FirebaseSignInContent() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [useRedirect, setUseRedirect] = useState(false);
  const router = useRouter();

  // Suppress NextAuth.js client-side API calls on this page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any conflicting NextAuth cookies first
      clearNextAuthCookies();
      
      // Set a flag to indicate we're on Firebase auth page
      (window as any).__DISABLE_NEXTAUTH = true;
      
      // Override fetch for NextAuth.js API routes
      const originalFetch = window.fetch;
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        
        // Block NextAuth.js API calls (but not our session verification)
        if (url.includes('/api/auth/') && 
            !url.includes('/api/auth/firebase-sync') && 
            !url.includes('/api/auth/verify-session')) {
          console.log('🚫 Blocked NextAuth.js fetch call:', url);
          return Promise.resolve(new Response(JSON.stringify({ 
            message: 'NextAuth blocked on Firebase auth page',
            blocked: true 
          }), { 
            status: 200, 
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        return originalFetch.call(this, input, init);
      };
      
      // Cleanup on unmount
      return () => {
        (window as any).__DISABLE_NEXTAUTH = false;
        window.fetch = originalFetch;
      };
    }
  }, []);
  
  // Confetti celebration setup
  const { initTrigger, celebrate } = useConfettiCelebration();
  const celebrationTriggered = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle auth state changes
  useEffect(() => {
    if (!mounted) return;
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const authUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          providerId: firebaseUser.providerData[0]?.providerId || 'firebase'
        };
        setUser(authUser);
        console.log('🔥 Firebase Auth: User signed in', authUser);
      } else {
        setUser(null);
        console.log('🔥 Firebase Auth: User signed out');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mounted]);

  // Only redirect after successful sign-in, not for existing Firebase sessions
  // The redirect should happen in the sign-in handlers, not here

  // Set up global celebration trigger for redirect flows
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerAuthCelebration = (authUser: any, isNewUser: boolean) => {
        if (!celebrationTriggered.current) {
          celebrationTriggered.current = true;
          const provider = authUser.providerId === 'google.com' ? 'google' : 
                          authUser.providerId === 'oidc.linkedin' ? 'linkedin' : 'credentials';
          const celebrationType = getCelebrationTypeForUser(isNewUser, provider);
          
          console.log('🎉 Triggering celebration:', { celebrationType, isNewUser, provider });
          celebrate(celebrationType);
          
          // Show welcome message
          setTimeout(() => {
            console.log(`🎉 Welcome ${isNewUser ? 'to DealMecca' : 'back'}, ${authUser.displayName || authUser.email}!`);
          }, 500);
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).triggerAuthCelebration;
      }
    };
  }, [celebrate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      
      console.log('🔥 Starting Google sign-in with Firebase');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      let result;
      
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
        return; // Result will be handled by auth state change
      } else {
        result = await signInWithPopup(auth, provider);
      }
      
      if (result && result.user && !celebrationTriggered.current) {
        celebrationTriggered.current = true;
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        const celebrationType = getCelebrationTypeForUser(isNewUser, 'google');
        
        console.log('🎉 Triggering Google celebration:', { celebrationType, isNewUser });
        celebrate(celebrationType);
        
        const authUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          providerId: 'google.com'
        };
        
        // Show welcome message
        setTimeout(() => {
          console.log(`🎉 Welcome ${isNewUser ? 'to DealMecca' : 'back'}, ${result.user.displayName || result.user.email}!`);
        }, 500);
        
        // Sync with database
        await syncUserWithDatabase(authUser, isNewUser, 'google');
        
        // Wait for celebration, then verify session before redirecting
        setTimeout(async () => {
          await verifySessionAndRedirect();
        }, 2000);
      }
    } catch (error: any) {
      console.error('🔥 Google sign-in error:', error);
      setError(error.message || 'Google sign-in failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Fallback LinkedIn OAuth (bypasses Firebase)
  const handleDirectLinkedInAuth = async () => {
    try {
      console.log('🔗 Starting direct LinkedIn OAuth (bypassing Firebase)');
      
      // Import the direct LinkedIn OAuth function
      const { initiateLinkedInAuth } = await import('@/lib/auth/linkedin-oauth');
      
      const redirectUri = `${window.location.origin}/api/auth/linkedin-callback`;
      console.log('🔗 Redirect URI:', redirectUri);
      
      // Start LinkedIn OAuth flow
      initiateLinkedInAuth(redirectUri, 'linkedin-direct-auth');
      
    } catch (error: any) {
      console.error('🔗 Direct LinkedIn auth error:', error);
      setError(`LinkedIn authentication setup error: ${error.message}`);
      setIsSigningIn(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      
      console.log('🔥 Starting LinkedIn sign-in with Firebase');
      console.log('🔥 Creating LinkedIn OAuth provider with ID: oidc.linkedin');
      
      const provider = new OAuthProvider('oidc.linkedin');
      
      // Add minimal LinkedIn scopes to avoid Google API conflicts
      provider.addScope('openid');
      provider.addScope('profile');
      provider.addScope('email');
      
      // Try without custom parameters first to avoid Google API conflicts
      console.log('🔥 LinkedIn provider configured with minimal config');
      console.log('🔥 Provider ID:', provider.providerId);
      console.log('🔥 Scopes:', provider.scopes);
      
      // Log additional debugging info
      console.log('🔥 Testing LinkedIn auth with simplified configuration to bypass Google API conflicts');
      
      let result;
      
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
        return; // Result will be handled by auth state change
      } else {
        result = await signInWithPopup(auth, provider);
      }
      
      if (result && result.user && !celebrationTriggered.current) {
        celebrationTriggered.current = true;
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        const celebrationType = getCelebrationTypeForUser(isNewUser, 'linkedin');
        
        console.log('🎉 Triggering LinkedIn celebration:', { celebrationType, isNewUser });
        celebrate(celebrationType);
        
        const authUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          providerId: 'oidc.linkedin'
        };
        
        // Show welcome message
        setTimeout(() => {
          console.log(`🎉 Welcome ${isNewUser ? 'to DealMecca' : 'back'}, ${result.user.displayName || result.user.email}!`);
        }, 500);
        
        // Sync with database
        await syncUserWithDatabase(authUser, isNewUser, 'linkedin');
        
        // Wait for celebration, then verify session before redirecting
        setTimeout(async () => {
          await verifySessionAndRedirect();
        }, 2000);
      }
    } catch (error: any) {
      console.error('🔥 LinkedIn sign-in error FULL DETAILS:');
      console.error('🔥 Error object:', error);
      console.error('🔥 Error code:', error.code);
      console.error('🔥 Error message:', error.message);
      console.error('🔥 Error name:', error.name);
      console.error('🔥 Error stack:', error.stack);
      console.error('🔥 Error customData:', error.customData);
      
      // Log provider configuration for debugging
      console.error('🔥 Provider details:');
      console.error('  - Provider ID:', 'oidc.linkedin');
      console.error('  - Scopes:', ['openid', 'profile', 'email']);
      console.error('  - Custom parameters:', {
        'prompt': 'select_account',
        'response_type': 'code',
        'scope': 'openid profile email'
      });
      
      // Specific error handling for LinkedIn
      if (error.code === 'auth/invalid-credential') {
        setError('LinkedIn OAuth provider not configured properly in Firebase Console.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized. Please add this domain to Firebase authorized domains.');
      } else if (error.code === 'auth/internal-error') {
        setError('Firebase internal error - likely LinkedIn provider configuration issue or LinkedIn app configuration.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('LinkedIn provider not enabled in Firebase Console.');
      } else {
        setError(`LinkedIn sign-in failed: ${error.code || 'unknown-error'} - ${error.message || 'No error message'}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Function to verify session is ready before redirecting
  const verifySessionAndRedirect = async (maxRetries = 5, retryDelay = 1000) => {
    console.log('🔍 Verifying session before redirect...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('/api/auth/verify-session', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.sessionReady) {
            console.log('✅ Session verified, redirecting to dashboard');
            router.push('/forum');
            return;
          }
        }
        
        console.log(`🔄 Session not ready yet, attempt ${attempt}/${maxRetries}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`❌ Session verification attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // If we get here, session verification failed after all retries
    console.log('⚠️ Session verification failed after all retries, redirecting anyway');
    setError('Session verification took longer than expected. You may need to refresh the page.');
    setTimeout(() => {
      router.push('/forum');
    }, 2000);
  };

  // Function to sync Firebase user with your database
  const syncUserWithDatabase = async (authUser: any, isNewUser: boolean, provider: string) => {
    try {
      console.log('📊 Syncing user with database:', { authUser, isNewUser, provider });
      
      const response = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUser: {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            provider
          },
          isNewUser
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('📊 Database sync failed:', errorData);
      } else {
        const userData = await response.json();
        console.log('📊 Database sync successful:', userData);
      }
    } catch (error) {
      console.error('📊 Database sync error:', error);
    }
  };

  // Show loading until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already signed in with Firebase, show their info and options
  if (user && !isSigningIn) {
    return (
      <>
        {/* Confetti Canvas */}
        <ConfettiCelebration onInit={initTrigger} />
        
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Already Signed In</CardTitle>
              <CardDescription className="text-gray-600">
                You're currently signed in with Firebase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || user.email} 
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                    />
                  )}
                  <p className="font-semibold">{user.displayName || user.email}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={async () => {
                      console.log('🚀 Continuing to dashboard, ensuring session sync...')
                      
                      // Ensure user is synced with database before navigating
                      if (user) {
                        await syncUserWithDatabase(user, false, user.providerId || 'firebase')
                      }
                      
                      // Small delay to ensure session cookie is set
                      setTimeout(() => {
                        router.push('/forum')
                      }, 500)
                    }}
                  >
                    Continue to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      try {
                        await signOut(auth);
                        console.log('🔥 Firebase sign-out successful');
                      } catch (error) {
                        console.error('🔥 Firebase sign-out error:', error);
                      }
                    }}
                  >
                    Sign Out & Use Different Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Confetti Canvas */}
      <ConfettiCelebration onInit={initTrigger} />
      
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to DealMecca</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in with your Google or LinkedIn account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* OAuth Sign-in Options */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-12"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-12"
                onClick={handleLinkedInSignIn}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                )}
                LinkedIn (Firebase)
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={handleDirectLinkedInAuth}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                )}
                LinkedIn (Direct)
              </Button>
            </div>

            {/* Sign-in Method Toggle */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useRedirect}
                    onChange={(e) => setUseRedirect(e.target.checked)}
                    className="rounded"
                  />
                  <span>Use redirect instead of popup</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Check this if popups are blocked in your browser
              </p>
            </div>

            {/* Link to NextAuth version */}
            <div className="text-center text-sm text-gray-600 border-t pt-4">
              Having trouble?{' '}
              <Link href="/auth/signin" className="text-sky-600 hover:text-sky-700 font-medium">
                Try the original sign-in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function FirebaseSignInPage() {
  return <FirebaseSignInContent />;
}