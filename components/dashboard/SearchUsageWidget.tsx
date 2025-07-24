'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Zap,
  RefreshCcw,
  Building,
  Users,
  Clock
} from 'lucide-react'

type SubscriptionTier = 'FREE' | 'PRO' | 'TEAM' | 'ADMIN'

interface SearchUsageData {
  searchesUsed: number
  searchLimit: number
  searchesRemaining: number
  resetDate: Date
  subscriptionTier: SubscriptionTier
  recentSearches: Array<{
    id: string
    query: string
    resultsCount: number
    searchType: string
    createdAt: string
  }>
  searchStats: {
    totalAllTime: number
    thisMonth: number
    lastMonth: number
    avgResultsPerSearch: number
  }
}

interface SearchUsageWidgetProps {
  userId: string
  onUpgradeClick?: () => void
}

export default function SearchUsageWidget({ userId, onUpgradeClick }: SearchUsageWidgetProps) {
  const [data, setData] = useState<SearchUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSearchUsage()
  }, [userId])

  const fetchSearchUsage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/search-usage')
      
      if (!response.ok) {
        throw new Error('Failed to fetch search usage data')
      }
      
      const responseData = await response.json()
      
      // Convert date string to Date object
      responseData.resetDate = new Date(responseData.resetDate)
      
      setData(responseData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load search usage')
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = () => {
    if (!data || data.searchLimit === -1) return 0
    return Math.min((data.searchesUsed / data.searchLimit) * 100, 100)
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'text-red-700 font-semibold'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDaysUntilReset = () => {
    if (!data) return 0
    const now = new Date()
    const reset = data.resetDate
    const diffTime = reset.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getUpgradeMessage = () => {
    if (!data || data.subscriptionTier !== 'FREE') return null
    
    const percentage = getUsagePercentage()
    const remaining = data.searchesRemaining
    
    if (percentage >= 100) {
      return {
        level: 'critical',
        title: 'Search limit reached!',
        message: 'Upgrade to Pro for unlimited searches',
        color: '#dc2626'
      }
    } else if (percentage >= 90) {
      return {
        level: 'warning',
        title: `Only ${remaining} searches left`,
        message: 'Consider upgrading to avoid interruptions',
        color: '#d97706'
      }
    } else if (percentage >= 75) {
      return {
        level: 'info',
        title: `${remaining} searches remaining`,
        message: 'Pro users get unlimited searches',
        color: 'blue'
      }
    }
    
    return null
  }

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick()
    } else {
      router.push('/upgrade')
    }
  }

  const handleSearchClick = () => {
    router.push('/search')
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">Error loading search usage: {error}</p>
          <Button onClick={fetchSearchUsage} className="mt-2" variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const upgradeMessage = getUpgradeMessage()
  const usagePercentage = getUsagePercentage()
  const daysUntilReset = getDaysUntilReset()

  return (
    <div className="space-y-4">
      {/* Upgrade Alert */}
      {upgradeMessage && (
        <Card className={`border-${upgradeMessage.color}-200 bg-${upgradeMessage.color}-50`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 text-${upgradeMessage.color}-600`} />
              <div className="flex-1">
                <p className={`text-${upgradeMessage.color}-800 font-medium`}>
                  {upgradeMessage.title}
                </p>
                <p className={`text-${upgradeMessage.color}-700 text-sm`}>
                  {upgradeMessage.message}
                </p>
              </div>
              <Button 
                onClick={handleUpgradeClick}
                className={`bg-${upgradeMessage.color}-600 hover:bg-${upgradeMessage.color}-700`}
                size="sm"
              >
                <Zap className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Search Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Usage
            {data.subscriptionTier === 'FREE' && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Free Plan
              </span>
            )}
            {data.subscriptionTier === 'PRO' && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                Pro Plan
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Track your search activity and subscription limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Overview */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {data.searchesUsed}
                {data.searchLimit !== -1 && (
                  <span className="text-xl text-gray-500">/{data.searchLimit}</span>
                )}
              </p>
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {data.searchLimit === -1 
                  ? 'Unlimited searches' 
                  : `${data.searchesRemaining} searches remaining`}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <div>
                  <p className="text-sm">Resets in</p>
                  <p className="font-semibold">
                    {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {data.searchLimit !== -1 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getUsageColor()}`}
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>{Math.round(usagePercentage)}% used</span>
                <span>{data.searchLimit}</span>
              </div>
            </div>
          )}
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xl font-semibold text-gray-900">
                {data.searchStats.thisMonth}
              </p>
              {data.searchStats.lastMonth > 0 && (
                <p className="text-xs text-gray-500">
                  {data.searchStats.thisMonth > data.searchStats.lastMonth ? '+' : ''}
                  {data.searchStats.thisMonth - data.searchStats.lastMonth} vs last month
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">All Time</p>
              <p className="text-xl font-semibold text-gray-900">
                {data.searchStats.totalAllTime}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Results</p>
              <p className="text-xl font-semibold text-gray-900">
                {Math.round(data.searchStats.avgResultsPerSearch)}
              </p>
            </div>
          </div>

          {/* Recent Searches */}
          {data.recentSearches.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Searches
              </h4>
              <div className="space-y-2">
                {data.recentSearches.slice(0, 3).map((search) => (
                  <div 
                    key={search.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(search.query)}`)}
                  >
                    <div className="flex items-center gap-3">
                      {search.searchType === 'company' ? (
                        <Building className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Users className="w-4 h-4 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {search.query}
                        </p>
                        <p className="text-xs text-gray-500">
                          {search.resultsCount} results
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(search.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSearchClick}
              className="flex-1"
              disabled={data.subscriptionTier === 'FREE' && data.searchesRemaining <= 0}
            >
              <Search className="w-4 h-4 mr-2" />
              {data.subscriptionTier === 'FREE' && data.searchesRemaining <= 0 
                ? 'Limit Reached' 
                : 'New Search'
              }
            </Button>
            
            {data.subscriptionTier === 'FREE' && (
              <Button 
                variant="outline" 
                onClick={handleUpgradeClick}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 