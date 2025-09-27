'use client'

import { useState } from 'react'
import { initiateLinkedInAuth } from '@/lib/auth/linkedin-oauth'

export default function TestLinkedInConfig() {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testLinkedInRedirect = () => {
    setTesting(true)
    setError(null)

    try {
      console.log('Testing LinkedIn redirect...')
      const redirectUri = `${window.location.origin}/api/auth/linkedin-callback`
      console.log('Redirect URI:', redirectUri)
      console.log('Client ID:', clientId)

      // Test the LinkedIn OAuth initiation
      initiateLinkedInAuth(redirectUri, 'test-state')
    } catch (err) {
      console.error('LinkedIn redirect error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setTesting(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">LinkedIn Configuration Test</h1>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <p><strong>Client ID:</strong> {clientId ? `${clientId.substring(0, 8)}...` : 'NOT FOUND'}</p>
        <p><strong>Status:</strong> {clientId ? '✅ Configured' : '❌ Missing'}</p>
      </div>

      <div className="bg-white border p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Test LinkedIn Redirect</h2>
        <button
          onClick={testLinkedInRedirect}
          disabled={testing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test LinkedIn OAuth'}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded">
            <p className="text-red-800"><strong>Error:</strong> {error}</p>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>This will attempt to redirect to LinkedIn OAuth. Check the console for detailed logs.</p>
        </div>
      </div>
    </div>
  )
}