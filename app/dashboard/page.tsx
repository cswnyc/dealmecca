'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge';
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
  AlertTriangle,
  Star,
  Zap,
  Target,
  Activity,
  Building2,
  Brain,
  CalendarDays,
  MessageSquare,
  Plus
} from 'lucide-react'

// Import our new dashboard components
import MetricsOverview from '@/components/dashboard/MetricsOverview'
import SearchUsageWidget from '@/components/dashboard/SearchUsageWidget'
import UpcomingEventsWidget from '@/components/dashboard/UpcomingEventsWidget'
import MarketInsightsWidget from '@/components/dashboard/MarketInsightsWidget';
import { NetworkingActivityWidget } from '@/components/dashboard/NetworkingActivityWidget'
import { DashboardPageLayout } from '@/components/navigation/PageLayout';

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  subscriptionTier: string
  searchLimit: number
  searchesRemaining: number
  searchesUsedThisMonth: number
  searchesResetAt: string
  createdAt: string
  searchesByDay: Record<string, number>
  searchStats: {
    total: number
    thisMonth: number
    avgResultsPerSearch: number
  }
  searches: Array<{
    id: string
    query: string
    resultsCount: number
    searchType: string
    createdAt: string
  }>
  posts: Array<{
    id: string
    title: string
    category: string
    votes: number
    createdAt: string
    _count: {
      comments: number
    }
  }>
  _count: {
    posts: number
    comments: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (session) {
      fetchProfile()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
            Free Plan
          </span>
        )
      case 'PRO':
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <Crown className="w-3 h-3" /> Pro Plan
          </span>
        )
      case 'TEAM':
        return (
          <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <Crown className="w-3 h-3" /> Team Plan
          </span>
        )
      case 'ADMIN':
        return (
          <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-3 h-3" /> Admin
          </span>
        )
      default:
        return null
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const usagePercentage = profile ? getUsagePercentage(profile.searchesUsedThisMonth, profile.searchLimit) : 0
  const isNearLimit = profile?.subscriptionTier === 'FREE' && usagePercentage >= 75

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardPageLayout
      title="Dashboard"
      description={`Welcome back, ${profile?.name || 'User'}`}
      actions={
        <div className="flex items-center gap-4">
          {profile && getSubscriptionBadge(profile.subscriptionTier)}
          {profile?.subscriptionTier === 'FREE' && (
            <Button 
              onClick={() => router.push('/upgrade')}
              className="bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      }
    >
      {/* Upgrade Alert for Free Users Near Limit */}
      {isNearLimit && (
        <Card className="mb-6 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">
                  Approaching Search Limit
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You've used {Math.round(usagePercentage)}% of your monthly searches. 
                  <Button 
                    variant="link" 
                    className="h-auto p-0 ml-1 text-yellow-800 underline"
                    onClick={() => router.push('/upgrade')}
                  >
                    Upgrade to Pro
                  </Button> for unlimited searches.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Bar */}
      <Card className="mb-8 bg-gradient-to-r from-sky-50 to-teal-50 border-sky-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Your daily tools for media sales success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 px-4 bg-white hover:bg-sky-50 border-sky-200"
              onClick={() => router.push('/search')}
            >
              <div className="text-center">
                <Search className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                <p className="font-medium">Search Database</p>
                <p className="text-xs text-gray-600">Find prospects</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 px-4 bg-white hover:bg-blue-50 border-blue-200"
              onClick={() => router.push('/intelligence')}
            >
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">Intelligence</p>
                <p className="text-xs text-gray-600">AI insights</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 px-4 bg-white hover:bg-emerald-50 border-emerald-200"
              onClick={() => router.push('/orgs')}
            >
              <div className="text-center relative">
                <Building2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="font-medium">Organizations</p>
                <p className="text-xs text-gray-600">Org charts</p>
                <span className="absolute -top-1 -right-1 bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">New</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 px-4 bg-white hover:bg-indigo-50 border-indigo-200"
              onClick={() => router.push('/events')}
            >
              <div className="text-center">
                <CalendarDays className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <p className="font-medium">Events</p>
                <p className="text-xs text-gray-600">Track ROI</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 px-4 bg-white hover:bg-teal-50 border-teal-200"
              onClick={() => router.push('/forum')}
            >
              <div className="text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">Community</p>
                <p className="text-xs text-gray-600">Network</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 px-4 bg-white hover:bg-purple-50 border-purple-200"
              onClick={() => router.push('/analytics')}
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

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Metrics Overview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <MetricsOverview userId={profile?.id || ''} period="month" />
        </div>
        
        {/* Search Usage Widget - Takes 1 column */}
        <div className="lg:col-span-1">
          <SearchUsageWidget userId={profile?.id || ''} />
        </div>
      </div>

      {/* Upcoming Events Widget - Full width */}
      <div className="mb-8">
        <UpcomingEventsWidget userId={profile?.id || ''} />
      </div>

      {/* Networking Activity Widget - Full width */}
      <div className="mb-8">
        <NetworkingActivityWidget userId={profile?.id || ''} />
      </div>

      {/* Activity Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Searches */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-600" />
                Recent Searches
              </span>
              <TrendingUp className="w-5 h-5 text-gray-700" />
            </CardTitle>
            <CardDescription>Your latest search activity</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.searches?.length ? (
              <div className="space-y-3">
                {profile.searches.slice(0, 5).map((search) => (
                  <div key={search.id} className="flex justify-between items-center p-3 bg-white rounded-lg hover:bg-sky-50 transition-colors border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{search.query}</p>
                      <p className="text-sm text-gray-600">
                        {search.resultsCount} results • {new Date(search.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full">
                      {search.searchType}
                    </span>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => router.push('/search')}
                >
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-700">No searches yet</p>
                <p className="text-sm text-gray-600 mb-4">Start exploring our database!</p>
                <Button 
                  onClick={() => router.push('/search')}
                  className="bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Start Searching
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Forum Posts */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
              </span>
              <Users className="w-5 h-5 text-gray-400" />
            </CardTitle>
            <CardDescription>Your community contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.posts?.length ? (
              <div className="space-y-3">
                {profile.posts.slice(0, 4).map((post) => (
                  <div key={post.id} className="p-3 bg-white rounded-lg hover:bg-teal-50 transition-colors border border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{post.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs">
                        {post.category.replace('_', ' ')}
                      </span>
                      <span>{post.votes} votes</span>
                      <span>{post._count.comments} comments</span>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => router.push('/forum')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Visit Forum
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-700">No forum posts yet</p>
                <p className="text-sm text-gray-600 mb-4">Join the conversation!</p>
                <Button 
                  onClick={() => router.push('/forum')}
                  className="bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Overview Card */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Account Overview
          </CardTitle>
          <CardDescription>
            Manage your DealMecca experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-semibold text-gray-900">{profile?.subscriptionTier}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-sky-600" />
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold text-gray-900">
                {profile?.createdAt 
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : 'N/A'}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-teal-600" />
              <p className="text-sm text-gray-600">Forum Posts</p>
              <p className="font-semibold text-gray-900">{profile?._count?.posts || 0}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/settings')}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
} 