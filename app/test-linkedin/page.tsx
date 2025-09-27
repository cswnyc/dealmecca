'use client';

import { useState } from 'react';
import LinkedInSignInButton, { LinkedInSignInButtonLarge, LinkedInSignInButtonOutline } from '@/components/auth/LinkedInSignInButton';
import { Linkedin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function TestLinkedIn() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const testLinkedInConfig = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      // Test the LinkedIn configuration
      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;

      const results = {
        clientId: {
          status: clientId ? 'configured' : 'missing',
          value: clientId ? `${clientId.substring(0, 8)}...` : 'Not found'
        },
        redirectUri: {
          status: 'configured',
          value: `${window.location.origin}/api/auth/linkedin-callback`
        },
        scopes: {
          status: 'configured',
          value: 'profile email openid'
        },
        authUrl: {
          status: 'ready',
          value: 'https://www.linkedin.com/oauth/v2/authorization'
        }
      };

      setTestResults(results);
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Configuration test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">LinkedIn OAuth Integration Test</h1>

        {/* Configuration Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Linkedin className="w-6 h-6 text-blue-600 mr-2" />
            LinkedIn Configuration Status
          </h2>

          <button
            onClick={testLinkedInConfig}
            disabled={testing}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {testing ? 'Testing Configuration...' : 'Test Configuration'}
          </button>

          {testResults && (
            <div className="space-y-3">
              {testResults.error ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <p className="text-red-800">{testResults.error}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Client ID:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.clientId.status)}
                      <span className="text-sm">{testResults.clientId.value}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Redirect URI:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.redirectUri.status)}
                      <span className="text-sm">{testResults.redirectUri.value}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">OAuth Scopes:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.scopes.status)}
                      <span className="text-sm">{testResults.scopes.value}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Authorization URL:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.authUrl.status)}
                      <span className="text-sm">{testResults.authUrl.value}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Authentication Flow Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test LinkedIn Authentication</h2>
          <p className="text-gray-600 mb-6">
            Click any button below to test the LinkedIn OAuth flow. You'll be redirected to LinkedIn to authorize the application.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Standard Button:</p>
              <LinkedInSignInButton />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Large Button:</p>
              <LinkedInSignInButtonLarge />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Outline Button:</p>
              <LinkedInSignInButtonOutline />
            </div>
          </div>
        </div>

        {/* Integration Flow Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">LinkedIn Integration Flow</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <span>User clicks LinkedIn sign-in button</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <span>Redirect to LinkedIn OAuth authorization</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <span>User authorizes application on LinkedIn</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              <span>LinkedIn redirects back with authorization code</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">5.</span>
              <span>Exchange code for access token</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">6.</span>
              <span>Fetch user profile and email from LinkedIn</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">7.</span>
              <span>Create or update user in database</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">8.</span>
              <span>Create Firebase custom token</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">9.</span>
              <span>Redirect to success page with authentication</span>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 LinkedIn App Configuration Required</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>To test LinkedIn OAuth, ensure your LinkedIn app has these settings:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Redirect URLs:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/linkedin-callback` : 'http://localhost:3001/api/auth/linkedin-callback'}</li>
              <li><strong>Scopes:</strong> profile, email, openid</li>
              <li><strong>Product:</strong> "Sign In with LinkedIn using OpenID Connect" enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}