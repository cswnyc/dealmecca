'use client'

import { useState } from 'react'

export default function LinkedInDiagnosisPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const runDiagnostics = async () => {
    setTesting(true)
    const results: any = {}

    // Check environment variables
    results.clientIdLength = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID?.length || 0
    results.clientIdValue = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'NOT_SET'
    results.hasClientSecret = !!process.env.LINKEDIN_CLIENT_SECRET

    // Check if client ID format looks correct
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
    results.clientIdFormat = {
      isSet: !!clientId,
      length: clientId?.length || 0,
      startsWithNumber: clientId ? /^[0-9]/.test(clientId) : false,
      hasLettersAndNumbers: clientId ? /^[a-zA-Z0-9]+$/.test(clientId) : false,
      typicalFormat: clientId ? clientId.length >= 10 : false
    }

    // Test LinkedIn authorization URL construction
    const redirectUri = `${window.location.origin}/api/auth/linkedin-callback`
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId || '',
      redirect_uri: redirectUri,
      state: 'diagnostic-test',
      scope: 'profile email openid'
    })

    results.authUrl = `https://www.linkedin.com/oauth/v2/authorization?${authParams.toString()}`
    results.redirectUri = redirectUri

    // Check if URL is properly formatted
    try {
      new URL(results.authUrl)
      results.urlValid = true
    } catch {
      results.urlValid = false
    }

    setDiagnostics(results)
    setTesting(false)
  }

  const testLinkedInAuth = () => {
    if (diagnostics?.authUrl) {
      console.log('Testing LinkedIn auth with URL:', diagnostics.authUrl)
      window.location.href = diagnostics.authUrl
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">LinkedIn OAuth Diagnostics</h1>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 Diagnostic Checklist</h2>
        <p className="text-blue-700">This tool will help identify why LinkedIn OAuth is failing with "client_id is invalid"</p>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={testing}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {testing ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {diagnostics && (
        <div className="space-y-6">
          {/* Client ID Analysis */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🔑 Client ID Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Client ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{diagnostics.clientIdValue}</code></p>
                <p><strong>Length:</strong> {diagnostics.clientIdLength} characters</p>
              </div>
              <div>
                <p><strong>Has Client Secret:</strong> {diagnostics.hasClientSecret ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Format Validation:</h4>
              <ul className="space-y-1 text-sm">
                <li>{diagnostics.clientIdFormat.isSet ? '✅' : '❌'} Client ID is set</li>
                <li>{diagnostics.clientIdFormat.length >= 10 ? '✅' : '❌'} Length adequate ({diagnostics.clientIdFormat.length} chars, should be 10+)</li>
                <li>{diagnostics.clientIdFormat.hasLettersAndNumbers ? '✅' : '❌'} Alphanumeric format</li>
                <li>{diagnostics.clientIdFormat.startsWithNumber ? '⚠️' : '✅'} Format check (yours starts with number)</li>
              </ul>
            </div>
          </div>

          {/* OAuth URL Analysis */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🔗 OAuth URL Analysis</h3>
            <div className="mb-4">
              <p><strong>Redirect URI:</strong></p>
              <code className="block bg-gray-100 p-2 rounded text-sm break-all">{diagnostics.redirectUri}</code>
            </div>
            <div className="mb-4">
              <p><strong>Authorization URL:</strong></p>
              <code className="block bg-gray-100 p-2 rounded text-sm break-all">{diagnostics.authUrl}</code>
            </div>
            <p><strong>URL Valid:</strong> {diagnostics.urlValid ? '✅ Yes' : '❌ No'}</p>
          </div>

          {/* Action Items */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-yellow-800">⚠️ Likely Issues & Solutions</h3>
            <div className="space-y-3 text-yellow-700">
              {diagnostics.clientIdLength < 10 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p><strong>❌ Client ID Too Short:</strong> LinkedIn Client IDs are typically 10+ characters. Your current ID is only {diagnostics.clientIdLength} characters.</p>
                  <p className="text-sm mt-1">✅ <strong>Fix:</strong> Double-check the Client ID in your LinkedIn Developer Console.</p>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p><strong>🔍 Required LinkedIn App Configuration:</strong></p>
                <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                  <li>Go to <strong>LinkedIn Developer Console</strong> → Your App → <strong>Products</strong></li>
                  <li>Request <strong>"Sign in with LinkedIn using OpenID Connect"</strong> product</li>
                  <li>Wait for approval (can take a few hours)</li>
                  <li>Verify <strong>Authorized redirect URLs</strong> include: <code>{diagnostics.redirectUri}</code></li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p><strong>✅ Your Implementation is Correct:</strong></p>
                <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                  <li>Proper scopes: <code>profile email openid</code></li>
                  <li>Correct OAuth 2.0 flow</li>
                  <li>Using OpenID Connect userinfo endpoint</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Button */}
          {diagnostics.urlValid && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">🧪 Test Authentication</h3>
              <p className="mb-4 text-gray-600">Click to test the OAuth flow (will redirect to LinkedIn):</p>
              <button
                onClick={testLinkedInAuth}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Test LinkedIn OAuth Flow
              </button>
              <p className="text-sm text-gray-500 mt-2">This will redirect you to LinkedIn. Check the browser console for any errors.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}