'use client';

import { useAuth } from "@/lib/auth/firebase-auth";;
import { useEffect, useState } from 'react';

export function SessionDebugComponent() {
  const { user, loading } = useAuth();
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [serverSession, setServerSession] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Check cookies
    const cookies = document.cookie;
    const cookieObj: Record<string, string> = {};
    cookies.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) cookieObj[name] = value;
    });

    setCookieInfo({
      hasSessionToken: cookies.includes('next-auth.session-token'),
      hasCallbackUrl: cookies.includes('next-auth.callback-url'),
      hasCSRFToken: cookies.includes('next-auth.csrf-token'),
      cookieCount: Object.keys(cookieObj).length,
      raw: cookies
    });

    // Check server session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setServerSession(data))
      .catch(err => setServerSession({ error: err.message }));
  }, []);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setShowDebug(true)}
          className="bg-red-600 text-white px-4 py-2 rounded shadow-lg hover:bg-red-700"
        >
          🔍 Debug Session
        </button>
      </div>
    );
  }

  const hasValidSession = user;
  const canAccessAdmin = hasValidSession && (session.user.role === 'ADMIN' || session.user.role === 'PRO');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🔍 Session Debug</h2>
          <button 
            onClick={() => setShowDebug(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Client Session */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">🖥️ Client Session</h3>
            <div className="text-sm space-y-1">
              <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                !loading && user ? 'bg-green-100 text-green-800' :
                loading ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{status}</span></div>
              
              {hasValidSession ? (
                <>
                  <div><strong>Email:</strong> {session.user.email}</div>
                  <div><strong>Role:</strong> <span className="bg-gray-100 px-2 py-1 rounded text-xs">{session.user.role}</span></div>
                  <div><strong>ID:</strong> {session.user.id}</div>
                </>
              ) : (
                <div className="text-red-600">❌ No client session</div>
              )}
            </div>
          </div>

          {/* Server Session */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">🖧 Server Session</h3>
            <div className="text-sm space-y-1">
              {serverSession?.user ? (
                <>
                  <div><strong>Email:</strong> {serverSession.user.email}</div>
                  <div><strong>Role:</strong> <span className="bg-gray-100 px-2 py-1 rounded text-xs">{serverSession.user.role}</span></div>
                  <div className="text-green-600">✅ Server session active</div>
                </>
              ) : serverSession?.error ? (
                <div className="text-red-600">❌ Error: {serverSession.error}</div>
              ) : (
                <div className="text-red-600">❌ No server session</div>
              )}
            </div>
          </div>

          {/* Cookies */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">🍪 Cookies</h3>
            {cookieInfo && (
              <div className="text-sm space-y-1">
                <div><strong>Session Token:</strong> <span className={cookieInfo.hasSessionToken ? 'text-green-600' : 'text-red-600'}>
                  {cookieInfo.hasSessionToken ? '✅' : '❌'}
                </span></div>
                <div><strong>CSRF Token:</strong> <span className={cookieInfo.hasCSRFToken ? 'text-green-600' : 'text-red-600'}>
                  {cookieInfo.hasCSRFToken ? '✅' : '❌'}
                </span></div>
                <div><strong>Total:</strong> {cookieInfo.cookieCount}</div>
              </div>
            )}
          </div>

          {/* Diagnosis */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">🩺 Diagnosis</h3>
            <div className="text-sm space-y-2">
              {canAccessAdmin ? (
                <>
                  <div className="text-green-600 font-medium">✅ Admin Access Available</div>
                  <button 
                    onClick={() => window.location.href = '/admin'}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                  >
                    🚀 Go to Admin
                  </button>
                </>
              ) : hasValidSession ? (
                <div className="text-orange-600">⚠️ Session valid but role is: {session.user.role}</div>
              ) : (
                <>
                  <div className="text-red-600 font-medium">❌ No valid session</div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => window.location.href = '/auth/signin'}
                      className="block bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      🔑 Regular Login
                    </button>
                    <button 
                      onClick={async () => {
                        const email = prompt('Email:', 'pro@dealmecca.pro');
                        const password = prompt('Password:', 'test123');
                        if (email && password) {
                          try {
                            const res = await fetch('/api/manual-login', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email, password })
                            });
                            if (res.ok) {
                              alert('✅ Success! Redirecting...');
                              window.location.href = '/admin';
                            } else {
                              const err = await res.json();
                              alert(`❌ ${err.error}`);
                            }
                          } catch (e) {
                            alert(`❌ ${e instanceof Error ? e.message : 'Unknown error'}`);
                          }
                        }
                      }}
                      className="block bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
                    >
                      ⚡ Manual Login
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">📊 Raw Data</h3>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
{JSON.stringify({
  clientSession: session,
  serverSession,
  cookies: cookieInfo,
  timestamp: new Date().toISOString()
}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}