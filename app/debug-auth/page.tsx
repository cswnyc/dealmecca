'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';

export default function DebugAuthPage() {
  const { user, idToken, loading } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (user && idToken) {
      // Test API call
      fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      })
        .then(async res => {
          if (res.ok) {
            return res.json();
          } else {
            const errorData = await res.json().catch(() => null);
            throw new Error(`API returned ${res.status}: ${JSON.stringify(errorData)}`);
          }
        })
        .then(data => {
          setDbUser(data);
          setApiError(null);
        })
        .catch(err => {
          setApiError(err.message);
        });
    }
  }, [user, idToken]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Firebase Auth User</h2>
          {user ? (
            <pre className="bg-gray-900 text-white p-4 rounded overflow-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600 font-bold text-lg">Not logged in</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">ID Token</h2>
          {idToken ? (
            <div>
              <p className="text-green-600 font-bold text-lg mb-2">✓ Token present</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-xs break-all">
                {idToken}
              </pre>
            </div>
          ) : (
            <p className="text-red-600 font-bold text-lg">No token</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Database User (API Test)</h2>
          {apiError ? (
            <div>
              <p className="font-bold text-lg text-red-600 mb-2">❌ API Error</p>
              <p className="text-sm text-gray-700 mb-2">The API call to /api/users/profile failed.</p>
              <pre className="bg-red-100 border-2 border-red-500 text-red-900 p-4 rounded overflow-auto text-sm mt-2">
                {apiError}
              </pre>
            </div>
          ) : dbUser ? (
            <div>
              <p className="font-bold text-lg text-green-600 mb-2">✓ Database user found</p>
              <pre className="bg-gray-900 text-white p-4 rounded overflow-auto text-sm">
                {JSON.stringify(dbUser, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-700 font-semibold">Loading database user...</p>
          )}
        </div>
      </div>
    </div>
  );
}
