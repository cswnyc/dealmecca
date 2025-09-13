'use client'

// import { useFirebaseSession } from '@/hooks/useFirebaseSession'
import { useAuth } from '@/lib/auth/firebase-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Users, Crown } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  // const hasFirebaseSession = useFirebaseSession()
  const { user: firebaseUser, loading: authLoading } = useAuth()
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      console.log('❌ No Firebase authentication found in analytics page, redirecting to signin');
      router.push('/auth/firebase-signin');
    }
  }, [authLoading, firebaseUser, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">Advanced insights for Pro users</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Pro Feature
              </span>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Searches</p>
                  <p className="text-2xl font-bold text-gray-900">247</p>
                </div>
                <BarChart3 className="w-8 h-8 text-sky-600" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-green-600">+23% vs last month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Companies Viewed</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-green-600">+12% vs last month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-green-600">+5% vs last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Search Trends</CardTitle>
              <CardDescription>Your search activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                <p className="text-gray-500">Chart component will be implemented here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Industries</CardTitle>
              <CardDescription>Most searched company types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Advertising & Marketing</span>
                  <span className="text-sm font-medium">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-sky-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Technology</span>
                  <span className="text-sm font-medium">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Media & Entertainment</span>
                  <span className="text-sm font-medium">18%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Other</span>
                  <span className="text-sm font-medium">12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Search Activity</CardTitle>
            <CardDescription>Your latest searches and results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">&quot;advertising agencies new york&quot;</p>
                  <p className="text-sm text-gray-600">Found 24 results • 2 hours ago</p>
                </div>
                <span className="text-green-600 text-sm">Successful</span>
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">&quot;Nike marketing contacts&quot;</p>
                  <p className="text-sm text-gray-600">Found 8 results • 5 hours ago</p>
                </div>
                <span className="text-green-600 text-sm">Successful</span>
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">&quot;media companies los angeles&quot;</p>
                  <p className="text-sm text-gray-600">Found 15 results • 1 day ago</p>
                </div>
                <span className="text-green-600 text-sm">Successful</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 