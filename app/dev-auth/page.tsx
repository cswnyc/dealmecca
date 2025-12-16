'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function DevAuthPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithLinkedIn, signInWithEmail, signUpWithEmail, signOut, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Quick test credentials
  const testCredentials = {
    admin: { email: 'admin@dealmecca.pro', password: 'password123' },
    pro: { email: 'pro@dealmecca.pro', password: 'test123' }
  };

  const handleQuickAuth = async (type: 'admin' | 'pro') => {
    setIsSigningIn(true);
    clearError();
    setSuccessMessage('');

    const creds = testCredentials[type];
    setEmail(creds.email);
    setPassword(creds.password);

    try {
      const result = await signInWithEmail(creds.email, creds.password);
      if (result) {
        setSuccessMessage(`✅ Signed in as ${type.toUpperCase()}!`);

        // Sync with backend
        await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            providerId: result.user.providerId,
            isNewUser: result.isNewUser
          })
        });

        setTimeout(() => {
          router.push('/forum');
        }, 1500);
      }
    } catch (err) {
      console.error('Quick auth failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    clearError();
    setSuccessMessage('');

    try {
      const result = await signInWithEmail(email, password);
      if (result) {
        setSuccessMessage('✅ Signed in successfully!');

        // Sync with backend
        await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            providerId: result.user.providerId,
            isNewUser: result.isNewUser
          })
        });

        setTimeout(() => {
          router.push('/forum');
        }, 1500);
      }
    } catch (err) {
      console.error('Email sign in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    clearError();

    try {
      const result = await signInWithGoogle();
      if (result) {
        setSuccessMessage('✅ Signed in with Google!');

        // Sync with backend
        await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            providerId: result.user.providerId,
            isNewUser: result.isNewUser
          })
        });

        setTimeout(() => {
          router.push('/forum');
        }, 1500);
      }
    } catch (err) {
      console.error('Google sign in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsSigningIn(true);
    clearError();

    try {
      const result = await signInWithLinkedIn();
      if (result) {
        setSuccessMessage('✅ Signed in with LinkedIn!');

        // Sync with backend
        await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            providerId: result.user.providerId,
            isNewUser: result.isNewUser
          })
        });

        setTimeout(() => {
          router.push('/forum');
        }, 1500);
      }
    } catch (err) {
      console.error('LinkedIn sign in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Already Signed In
            </CardTitle>
            <CardDescription>
              You're currently authenticated as:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-900">{user.email}</p>
              <p className="text-sm text-green-700">UID: {user.uid}</p>
              <p className="text-sm text-green-700">Provider: {user.providerId}</p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/forum')}
                  className="flex-1"
                >
                  Go to Forum
                </Button>
                <Button
                  onClick={() => router.push('/orgs')}
                  variant="outline"
                  className="flex-1"
                >
                  Organizations
                </Button>
              </div>
              <Button
                onClick={async () => {
                  await signOut();
                  setSuccessMessage('');
                  clearError();
                }}
                variant="destructive"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔧 Dev Authentication</CardTitle>
          <CardDescription>
            Quick sign-in for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Quick Auth Buttons */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Quick Test Accounts:</h3>

            <Button
              onClick={() => handleQuickAuth('admin')}
              disabled={isSigningIn || loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  🔑 Sign in as Admin
                  <span className="ml-auto text-xs opacity-75">admin@dealmecca.pro</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => handleQuickAuth('pro')}
              disabled={isSigningIn || loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  👤 Sign in as Pro User
                  <span className="ml-auto text-xs opacity-75">pro@dealmecca.pro</span>
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Or sign in with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn || loading}
              variant="outline"
              className="w-full"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              onClick={handleLinkedInSignIn}
              disabled={isSigningIn || loading}
              variant="outline"
              className="w-full"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              )}
              Continue with LinkedIn
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Or use email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSigningIn || loading}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSigningIn || loading}
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSigningIn || loading}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In with Email'
              )}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Development authentication page • Not for production use
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
