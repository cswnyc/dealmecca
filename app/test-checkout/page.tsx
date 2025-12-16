'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/firebase-auth'

export default function TestCheckoutPage() {
  const { user, idToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  const testCheckout = async (tier: 'PRO' | 'TEAM', interval: 'monthly' | 'annual') => {
    setLoading(true)
    setResponse(null)
    setError(null)

    try {
      console.log('🔍 Testing checkout with:', { tier, interval, hasUser: !!user, hasToken: !!idToken })

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          tier,
          interval,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`
        })
      })

      const data = await res.json()

      console.log('✅ Response:', {
        status: res.status,
        ok: res.ok,
        data
      })

      if (res.ok) {
        setResponse(data)
      } else {
        setError({
          status: res.status,
          data
        })
      }
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError({
        message: err.message,
        stack: err.stack
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stripe Checkout Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user?.email || 'Not authenticated'}</p>
            <p><strong>User ID:</strong> {user?.uid || 'N/A'}</p>
            <p><strong>Has Token:</strong> {idToken ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Checkout</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => testCheckout('PRO', 'monthly')}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Test PRO Monthly
            </button>
            <button
              onClick={() => testCheckout('PRO', 'annual')}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Test PRO Annual
            </button>
            <button
              onClick={() => testCheckout('TEAM', 'monthly')}
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              Test TEAM Monthly
            </button>
            <button
              onClick={() => testCheckout('TEAM', 'annual')}
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              Test TEAM Annual
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-blue-900 font-semibold">Loading...</p>
          </div>
        )}

        {response && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Success</h3>
            <pre className="bg-white p-4 rounded text-xs overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
            {response.url && (
              <a
                href={response.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Open Checkout
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">❌ Error</h3>
            <pre className="bg-white p-4 rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">📝 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-900">
            <li>Make sure you're logged in</li>
            <li>Click one of the test buttons above</li>
            <li>Check the console for detailed logs</li>
            <li>If successful, you'll see the checkout URL</li>
            <li>If it fails, you'll see the error details</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
