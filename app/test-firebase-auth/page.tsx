'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function TestFirebaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Check Firebase configuration
    setConfig({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasAuth: !!auth,
      authApp: auth?.app?.name,
    });

    // Listen to auth state changes
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        console.log('Auth state changed:', user);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError('Firebase auth not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔥 Starting Google sign-in...');
      console.log('Auth domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
      console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful:', result);

      setUser(result.user);
    } catch (error: any) {
      console.error('❌ Google sign-in failed:', error);
      setError(error.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      setUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Firebase Authentication Test</h1>

        {/* Configuration Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Firebase Configuration</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>

        {/* Authentication Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          {user ? (
            <div>
              <p className="text-green-600 mb-2">✅ Signed in as: {user.email}</p>
              <p className="text-sm text-gray-600 mb-4">UID: {user.uid}</p>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p className="text-gray-600">❌ Not signed in</p>
          )}
        </div>

        {/* Sign In Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Sign In Test</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !!user}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>🔄 Signing in...</>
            ) : (
              <>🔐 Sign in with Google</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}