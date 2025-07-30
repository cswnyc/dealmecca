'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Users, 
  Building, 
  BarChart3, 
  Settings, 
  LogOut, 
  Crown, 
  TrendingUp, 
  Calendar,
  Star,
  Zap,
  Target,
  Activity,
  Building2,
  Brain,
  CalendarDays,
  MessageSquare
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  subscriptionTier: string
  createdAt: string
}

export default function DashboardTestPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      console.log('🔍 Testing profile fetch...')
      const response = await fetch('/api/users/profile', {
        credentials: 'include'
      })
      
      console.log('📱 Profile response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profile data:', data)
        setProfile(data)
      } else {
        const errorData = await response.json()
        console.log('❌ Profile error:', errorData)
        setError(`Authentication failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Profile fetch error:', error)
      setError('Network error fetching profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear any session cookies and redirect
    document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login')
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Free Plan
          </Badge>
        )
      case 'PRO':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Crown className="w-3 h-3 mr-1" /> Pro Plan
          </Badge>
        )
      case 'TEAM':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3 mr-1" /> Team Plan
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-800">Dashboard Access Error</CardTitle>
            <CardDescription>Authentication issue detected</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Test</h1>
              <p className="text-gray-600">Welcome back, {profile?.name || 'User'}</p>
            </div>
            <div className="flex items-center gap-4">
              {profile && getSubscriptionBadge(profile.subscriptionTier)}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Dashboard Access Working!</h3>
                <p className="text-green-700">
                  Your authentication is working correctly. User role: <strong>{profile?.role}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium">{profile?.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-medium">{profile?.subscriptionTier}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Test different parts of the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 px-4"
                onClick={() => window.location.href = '/search'}
              >
                <div className="text-center">
                  <Search className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                  <p className="font-medium">Search Database</p>
                  <p className="text-xs text-gray-600">Find prospects</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 px-4"
                onClick={() => window.location.href = '/orgs'}
              >
                <div className="text-center">
                  <Building2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Organizations</p>
                  <p className="text-xs text-gray-600">Org charts</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto py-4 px-4"
                onClick={() => window.location.href = '/intelligence'}
              >
                <div className="text-center">
                  <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Intelligence</p>
                  <p className="text-xs text-gray-600">AI insights</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto py-4 px-4"
                onClick={() => window.location.href = '/events'}
              >
                <div className="text-center">
                  <CalendarDays className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-medium">Events</p>
                  <p className="text-xs text-gray-600">Track ROI</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto py-4 px-4"
                onClick={() => window.location.href = '/forum'}
              >
                <div className="text-center">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Community</p>
                  <p className="text-xs text-gray-600">Network</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto py-4 px-4"
                onClick={() => window.location.href = '/analytics'}
              >
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="font-medium">Analytics</p>
                  <p className="text-xs text-gray-600">Insights</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Authentication and session details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-mono text-sm">{profile?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-mono text-sm">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Authentication Method</p>
                <p className="font-mono text-sm">Custom JWT (/api/auth-login)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 