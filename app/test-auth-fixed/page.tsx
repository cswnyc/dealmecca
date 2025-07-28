'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthFixed() {
  const { data: session, status } = useSession()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testAPI = async (endpoint: string, description: string) => {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include'
      })
      const data = await response.json()
      
      return {
        endpoint,
        description,
        status: response.status,
        success: response.ok,
        data: response.ok ? data : data.error,
        error: response.ok ? null : data.error
      }
    } catch (error) {
      return {
        endpoint,
        description,
        status: 0,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])
    
    const tests = [
      { endpoint: '/api/health', description: 'Health Check (Public)' },
      { endpoint: '/api/companies?q=WPP&limit=2', description: 'Companies Search (Auth Required)' },
      { endpoint: '/api/contacts?q=marketing&limit=2', description: 'Contacts Search (Auth Required)' },
      { endpoint: '/api/search/suggestions?q=test&limit=3', description: 'Search Suggestions (Auth Required)' },
      { endpoint: '/api/dashboard/metrics', description: 'Dashboard Metrics (Auth Required)' },
    ]

    const results = []
    for (const test of tests) {
      const result = await testAPI(test.endpoint, test.description)
      results.push(result)
      setTestResults([...results]) // Update UI progressively
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🔍 Authentication Test - Fixed Version</CardTitle>
            <CardDescription>
              Testing NextAuth session and API authentication with credentials: 'include'
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Session Status:</strong> {status}
              </div>
              
              {session && (
                <div>
                  <strong>User:</strong> {session.user?.email} ({session.user?.role})
                </div>
              )}
              
              <Button 
                onClick={runTests} 
                disabled={loading || status === 'loading'}
                className="w-full"
              >
                {loading ? 'Running Tests...' : 'Test API Authentication'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{result.description}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status} {result.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Endpoint:</strong> {result.endpoint}
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-700">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    {result.success && result.data && (
                      <div className="text-sm text-gray-700">
                        <strong>Response:</strong> 
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2).substring(0, 300)}
                          {JSON.stringify(result.data, null, 2).length > 300 ? '...' : ''}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 