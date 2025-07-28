'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function TestSearchWorking() {
  const { data: session, status } = useSession()
  const [query, setQuery] = useState('WPP')
  const [debugResult, setDebugResult] = useState<any>(null)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDebugEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test-search-debug?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setDebugResult({
        status: response.status,
        success: response.ok,
        data
      })
    } catch (error) {
      setDebugResult({
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testSearchEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/companies?q=${encodeURIComponent(query)}&limit=3`, {
        credentials: 'include'
      })
      const data = await response.json()
      setSearchResult({
        status: response.status,
        success: response.ok,
        data
      })
    } catch (error) {
      setSearchResult({
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Search Functionality Test</CardTitle>
            <CardDescription>
              Test both the debug endpoint and authenticated search APIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Session Status:</strong> {status}
            </div>
            {session && (
              <div>
                <strong>User:</strong> {session.user?.email} ({session.user?.role})
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search query (e.g., WPP)"
                className="flex-1"
              />
              <Button 
                onClick={testDebugEndpoint}
                disabled={loading}
                variant="outline"
              >
                Test Debug API
              </Button>
              <Button 
                onClick={testSearchEndpoint}
                disabled={loading || status !== 'authenticated'}
              >
                Test Search API
              </Button>
            </div>
            
            {status !== 'authenticated' && (
              <div className="text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                ⚠️ You need to be logged in to test the search API. Visit{' '}
                <a href="/test-login-simple" className="underline font-medium">
                  /test-login-simple
                </a>{' '}
                to authenticate first.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Endpoint Results */}
        {debugResult && (
          <Card>
            <CardHeader>
              <CardTitle>🔧 Debug Endpoint Results</CardTitle>
              <CardDescription>/api/test-search-debug (No auth required)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border ${
                debugResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    Status: {debugResult.status} {debugResult.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </h3>
                </div>
                
                {debugResult.success ? (
                  <div className="space-y-3">
                    <div>
                      <strong>Database Info:</strong>
                      <ul className="ml-4 mt-1">
                        <li>Users: {debugResult.data?.debug?.userCount || 0}</li>
                        <li>Companies: {debugResult.data?.debug?.companyCount || 0}</li>
                        <li>Search Results: {debugResult.data?.debug?.searchResultsCount || 0}</li>
                      </ul>
                    </div>
                    
                    {debugResult.data?.sampleCompanies?.length > 0 && (
                      <div>
                        <strong>Sample Companies:</strong>
                        <ul className="ml-4 mt-1">
                          {debugResult.data.sampleCompanies.map((company: any) => (
                            <li key={company.id}>
                              {company.name} ({company.companyType})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {debugResult.data?.searchResults?.length > 0 && (
                      <div>
                        <strong>Search Results for "{query}":</strong>
                        <ul className="ml-4 mt-1">
                          {debugResult.data.searchResults.map((company: any) => (
                            <li key={company.id}>
                              {company.name} - {company._count?.contacts || 0} contacts
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700">
                    <strong>Error:</strong> {debugResult.error}
                    {debugResult.data?.message && (
                      <div className="mt-2">
                        <strong>Details:</strong> {debugResult.data.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search API Results */}
        {searchResult && (
          <Card>
            <CardHeader>
              <CardTitle>🔐 Authenticated Search API Results</CardTitle>
              <CardDescription>/api/companies (Authentication required)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border ${
                searchResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    Status: {searchResult.status} {searchResult.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </h3>
                </div>
                
                {searchResult.success ? (
                  <div className="space-y-3">
                    <div>
                      <strong>Results Summary:</strong>
                      <ul className="ml-4 mt-1">
                        <li>Companies Found: {searchResult.data?.companies?.length || 0}</li>
                        <li>Total Results: {searchResult.data?.total || 0}</li>
                        <li>Page: {searchResult.data?.page || 1}</li>
                      </ul>
                    </div>
                    
                    {searchResult.data?.companies?.length > 0 && (
                      <div>
                        <strong>Companies for "{query}":</strong>
                        <ul className="ml-4 mt-1">
                          {searchResult.data.companies.map((company: any) => (
                            <li key={company.id} className="mb-2">
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-gray-600">
                                {company.companyType} • {company.industry || 'No industry'} • {company._count?.contacts || 0} contacts
                              </div>
                              {company.contacts?.length > 0 && (
                                <div className="text-sm text-gray-500 ml-2">
                                  Key contacts: {company.contacts.map((c: any) => c.fullName || `${c.firstName} ${c.lastName}`).join(', ')}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700">
                    <strong>Error:</strong> {searchResult.error}
                    {searchResult.data?.code === 'UNAUTHORIZED' && (
                      <div className="mt-2 text-amber-700">
                        💡 This is expected if you're not logged in. Visit{' '}
                        <a href="/test-login-simple" className="underline font-medium">
                          /test-login-simple
                        </a>{' '}
                        to authenticate.
                      </div>
                    )}
                    {searchResult.data?.code === 'SEARCH_LIMIT_EXCEEDED' && (
                      <div className="mt-2 text-amber-700">
                        💡 Search limit exceeded. This is expected for free tier users.
                      </div>
                    )}
                    {searchResult.data?.message && (
                      <div className="mt-2">
                        <strong>Details:</strong> {searchResult.data.message}
                      </div>
                    )}
                    {searchResult.data?.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">Technical Details</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(searchResult.data.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">How to test:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>First, test the <strong>Debug API</strong> - this should work without authentication</li>
                <li>If debug works, login at <a href="/test-login-simple" className="text-blue-600 underline">/test-login-simple</a></li>
                <li>After logging in, test the <strong>Search API</strong> - this requires authentication</li>
                <li>Try different search terms like "WPP", "Omnicom", "marketing", etc.</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Expected Results:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Debug API:</strong> Should return database stats and sample data</li>
                <li><strong>Search API (authenticated):</strong> Should return company search results</li>
                <li><strong>Search API (not authenticated):</strong> Should return 401 with helpful message</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 