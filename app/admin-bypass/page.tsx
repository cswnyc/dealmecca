'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminBypassPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session-status')
      const data = await response.json()
      setSessionData(data)
    } catch (err) {
      setError('Failed to check session')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Bypass</h1>
          <p className="text-gray-600 mb-4">
            Admin bypass functionality temporarily simplified during deployment.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {sessionData && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>Session status: {JSON.stringify(sessionData, null, 2)}</p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}