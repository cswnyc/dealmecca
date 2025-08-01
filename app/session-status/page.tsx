'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionStatusPage() {
  const { data: session, status } = useSession();
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Check cookies on client side
    const cookies = document.cookie;
    const cookieObj: Record<string, string> = {};
    cookies.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) cookieObj[name] = value;
    });

    setCookieInfo({
      hasCookies: cookies.length > 0,
      cookieString: cookies,
      hasSessionToken: cookies.includes('next-auth.session-token'),
      hasCallbackUrl: cookies.includes('next-auth.callback-url'),
      hasCSRFToken: cookies.includes('next-auth.csrf-token'),
      cookieCount: Object.keys(cookieObj).length,
      allCookies: cookieObj
    });

    // Try to fetch session from server
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setDebugInfo({
          serverSession: data,
          fetchSuccessful: true
        });
      })
      .catch(err => {
        setDebugInfo({
          serverSession: null,
          fetchSuccessful: false,
          error: err.message
        });
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Session Status Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Client Session */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🖥️ Client Session (useSession)</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Status:</strong> <span className={`font-mono px-2 py-1 rounded ${
              status === 'authenticated' ? 'bg-green-100 text-green-800' :
              status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>{status}</span></div>
            
            {session ? (
              <>
                <div><strong>User ID:</strong> {session.user?.id || 'N/A'}</div>
                <div><strong>Email:</strong> {session.user?.email || 'N/A'}</div>
                <div><strong>Role:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{(session.user as any)?.role || 'N/A'}</span></div>
                <div><strong>Expires:</strong> {session.expires || 'N/A'}</div>
              </>
            ) : (
              <div className="text-red-600">❌ No client session found</div>
            )}
          </div>
        </div>
        
        {/* Server Session */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🖧 Server Session (/api/auth/session)</h2>
          {debugInfo ? (
            <div className="space-y-2 text-sm">
              <div><strong>Fetch:</strong> <span className={`${
                debugInfo.fetchSuccessful ? 'text-green-600' : 'text-red-600'
              }`}>{debugInfo.fetchSuccessful ? '✅ Success' : '❌ Failed'}</span></div>
              
              {debugInfo.serverSession ? (
                <>
                  <div><strong>Email:</strong> {debugInfo.serverSession.user?.email || 'N/A'}</div>
                  <div><strong>Role:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{debugInfo.serverSession.user?.role || 'N/A'}</span></div>
                  <div><strong>Expires:</strong> {debugInfo.serverSession.expires || 'N/A'}</div>
                </>
              ) : (
                <div className="text-red-600">❌ No server session found</div>
              )}
              
              {debugInfo.error && (
                <div className="text-red-600"><strong>Error:</strong> {debugInfo.error}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading server session...</div>
          )}
        </div>
        
        {/* Cookies */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🍪 Cookies</h2>
          {cookieInfo ? (
            <div className="space-y-2 text-sm">
              <div><strong>Has Cookies:</strong> <span className={`${
                cookieInfo.hasCookies ? 'text-green-600' : 'text-red-600'
              }`}>{cookieInfo.hasCookies ? '✅ Yes' : '❌ No'}</span></div>
              
              <div><strong>Session Token:</strong> <span className={`${
                cookieInfo.hasSessionToken ? 'text-green-600' : 'text-red-600'
              }`}>{cookieInfo.hasSessionToken ? '✅ Present' : '❌ Missing'}</span></div>
              
              <div><strong>Callback URL:</strong> <span className={`${
                cookieInfo.hasCallbackUrl ? 'text-green-600' : 'text-red-600'
              }`}>{cookieInfo.hasCallbackUrl ? '✅ Present' : '❌ Missing'}</span></div>
              
              <div><strong>CSRF Token:</strong> <span className={`${
                cookieInfo.hasCSRFToken ? 'text-green-600' : 'text-red-600'
              }`}>{cookieInfo.hasCSRFToken ? '✅ Present' : '❌ Missing'}</span></div>
              
              <div><strong>Total Cookies:</strong> {cookieInfo.cookieCount}</div>
            </div>
          ) : (
            <div className="text-gray-500">Loading cookie info...</div>
          )}
        </div>
        
        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🔧 Actions</h2>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/manual-login'}
              className="block w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Manual Login
            </button>
            
            <button 
              onClick={() => window.location.href = '/auth/signin'}
              className="block w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Try Regular Login
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="block w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
      
      {/* Raw Data */}
      {cookieInfo && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Raw Cookie Data:</h3>
          <pre className="text-xs overflow-auto bg-white p-4 rounded border max-h-40">
            {JSON.stringify(cookieInfo, null, 2)}
          </pre>
        </div>
      )}
      
      {debugInfo && (
        <div className="mt-4 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Raw Server Session Data:</h3>
          <pre className="text-xs overflow-auto bg-white p-4 rounded border max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}