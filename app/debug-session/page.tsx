'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, User, Database } from 'lucide-react'

export default function SessionDebugPage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Session Debug Page</h1>
        
        <div className="grid gap-6">
          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                {status === 'loading' && (
                  <>
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-600 font-medium">Loading...</span>
                  </>
                )}
                {status === 'authenticated' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Authenticated</span>
                  </>
                )}
                {status === 'unauthenticated' && (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">Not Authenticated</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Current NextAuth status: <code className="bg-gray-100 px-2 py-1 rounded">{status}</code>
              </p>
            </CardContent>
          </Card>

          {/* Session Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Session Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">User Info:</label>
                    <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(session.user, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Session:</label>
                    <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(session, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No session data available</p>
              )}
            </CardContent>
          </Card>

          {/* API Tests */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Test these endpoints:</h4>
                  <div className="space-y-2">
                    <div>
                      <a 
                        href="/api/auth/session" 
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        /api/auth/session
                      </a>
                      <span className="text-gray-500 ml-2">- Should show your session data</span>
                    </div>
                    <div>
                      <a 
                        href="/api/health" 
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        /api/health
                      </a>
                      <span className="text-gray-500 ml-2">- Database connectivity check</span>
                    </div>
                    <div>
                      <a 
                        href="/api/orgs/companies" 
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        /api/orgs/companies
                      </a>
                      <span className="text-gray-500 ml-2">- Protected companies API</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/">
                  <Button variant="outline">← Back to Homepage</Button>
                </Link>
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button>Dashboard</Button>
                    </Link>
                    <Link href="/orgs">
                      <Button variant="outline">Organizations</Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/auth/signin">
                    <Button>Sign In</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 