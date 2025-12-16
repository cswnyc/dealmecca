'use client';

import { useState } from 'react';

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export default function LinkedInAuthV2() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOIDCFlow = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/linkedin/test-oidc-flow');
      const result = await response.json();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const startOAuthWithPKCE = async () => {
    try {
      // Generate PKCE parameters
      const codeVerifier = generateRandomString(128);
      const codeChallenge = base64URLEncode(await sha256(codeVerifier));
      const state = generateRandomString(32);

      // Store in cookies
      document.cookie = `li_pkce_verifier=${codeVerifier}; path=/; max-age=600; SameSite=Lax`;
      document.cookie = `li_oauth_state=${state}; path=/; max-age=600; SameSite=Lax`;

      // Build authorization URL with V2 callback
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
        redirect_uri: 'http://localhost:3000/api/linkedin/callback',
        scope: 'openid profile email',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      console.log('🚀 Starting OAuth with PKCE (V2):', authUrl);

      window.location.href = authUrl;
    } catch (error) {
      console.error('❌ Error starting OAuth:', error);
    }
  };

  const startOAuthNoPKCE = async () => {
    try {
      const state = generateRandomString(32);

      // Store state in cookie
      document.cookie = `li_oauth_state=${state}; path=/; max-age=600; SameSite=Lax`;

      // Build authorization URL with V2 callback (no PKCE)
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
        redirect_uri: 'http://localhost:3000/api/linkedin/callback',
        scope: 'openid profile email',
        state,
      });

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      console.log('🚀 Starting OAuth without PKCE (V2):', authUrl);

      window.location.href = authUrl;
    } catch (error) {
      console.error('❌ Error starting OAuth:', error);
    }
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            LinkedIn OAuth V2 Testing
          </h1>
          <p className="text-lg text-muted-foreground">
            Testing improved OAuth flow per Microsoft documentation
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Test</h2>
          <p className="text-muted-foreground mb-4">
            Test the OpenID Connect configuration and endpoints
          </p>
          <button
            onClick={testOIDCFlow}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test OIDC Configuration'}
          </button>

          {testResult && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Test Results:</h3>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">OAuth Flow Testing</h2>
          <p className="text-muted-foreground mb-4">
            Test the actual OAuth authentication flows using the V2 callback endpoint
          </p>

          <div className="space-y-4">
            <div>
              <button
                onClick={startOAuthWithPKCE}
                className="bg-[#0077B5] text-white px-6 py-3 rounded-lg hover:bg-[#005885] font-medium w-full sm:w-auto"
              >
                🔐 Start OAuth with PKCE (V2)
              </button>
              <p className="text-sm text-muted-foreground mt-1">
                Uses PKCE for enhanced security (recommended)
              </p>
            </div>

            <div>
              <button
                onClick={startOAuthNoPKCE}
                className="bg-[#0077B5] text-white px-6 py-3 rounded-lg hover:bg-[#005885] font-medium w-full sm:w-auto"
              >
                🔓 Start OAuth without PKCE (V2)
              </button>
              <p className="text-sm text-muted-foreground mt-1">
                Traditional OAuth flow without PKCE
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> This page uses the new V2 callback endpoint
                (<code>/api/linkedin/callback-v2</code>) that follows Microsoft's
                OpenID Connect documentation exactly. Check the browser console
                and server logs for detailed debugging information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}