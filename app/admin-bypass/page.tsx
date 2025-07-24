'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, Calendar, Settings, Shield, CheckCircle } from 'lucide-react'

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
      
      if (data.success && data.activeToken) {
        setSessionData(data.activeToken)
        if (data.activeToken.role !== 'ADMIN') {
          setError('Admin access required')
        }
      } else {
        setError('No active session found')
      }
    } catch (error) {
      setError('Failed to check session')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear the session cookie by setting it to expire
    document.cookie = 'dealmecca-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/direct-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking session...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/direct-login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (sessionData.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-orange-600">Insufficient Privileges</CardTitle>
            <CardDescription>Admin role required to access this page</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Badge variant="secondary">{sessionData.role} User</Badge>
            <div className="flex space-x-2">
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="flex-1">
                Dashboard
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="flex-1">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-sky-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard (Bypass)</h1>
                <p className="text-sm text-gray-500">Middleware bypass version</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                {sessionData.role}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{sessionData.name}</p>
                <p className="text-xs text-gray-500">{sessionData.email}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Authentication Successful!</h3>
                <p className="text-sm text-blue-700">
                  This page bypasses middleware and authenticates directly via API. 
                  Session token source: {sessionData.tokenSource || 'custom'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">~3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Events</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Manage Companies
              </CardTitle>
              <CardDescription>
                View and manage company data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/orgs')} 
                className="w-full"
              >
                View Companies
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => alert('Feature available in normal admin dashboard')} 
                variant="outline" 
                className="w-full"
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => alert('Feature available in normal admin dashboard')} 
                variant="outline" 
                className="w-full"
              >
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Information</h3>
          <div className="text-xs font-mono text-yellow-700 space-y-1">
            <div>User ID: {sessionData.sub}</div>
            <div>Email: {sessionData.email}</div>
            <div>Role: {sessionData.role}</div>
            <div>Subscription: {sessionData.subscriptionTier}</div>
            <div>Token Source: {sessionData.tokenSource || 'custom'}</div>
          </div>
        </div>
      </main>
    </div>
  )
} 