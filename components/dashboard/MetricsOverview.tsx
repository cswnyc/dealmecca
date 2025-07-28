'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Target,
  DollarSign,
  Trophy,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface MetricsData {
  searches: {
    used: number
    limit: number
    remaining: number
    resetDate: Date
  }
  events: {
    attended: number
    planned: number
    totalCost: number
    estimatedROI: number
    progress: number
  }
  networking: {
    connectionsThisMonth: number
    totalConnections: number
    activeDeals: number
    progress: number
  }
  forum: {
    postsCreated: number
    helpfulVotes: number
    questionsAnswered: number
  }
  achievements: {
    total: number
    unlocked: number
  }
  engagement: {
    dashboardVisits: number
    lastVisit: Date | null
  }
}

interface MetricsOverviewProps {
  userId: string
  period: 'month' | 'quarter' | 'year'
  onPeriodChange?: (period: 'month' | 'quarter' | 'year') => void
}

export default function MetricsOverview({ userId, period, onPeriodChange }: MetricsOverviewProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [period])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/metrics?period=${period}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      
      const data = await response.json()
      
      // Convert date strings to Date objects
      data.searches.resetDate = new Date(data.searches.resetDate)
      if (data.engagement.lastVisit) {
        data.engagement.lastVisit = new Date(data.engagement.lastVisit)
      }
      
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getSearchUsageColor = (used: number, limit: number) => {
    if (limit === -1) return 'bg-blue-500' // Unlimited
    const percentage = (used / limit) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-700" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          {error && (
            <p className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">Error loading metrics: {error}</p>
          )}
          <Button onClick={fetchMetrics} className="mt-2" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange?.(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search Usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Search className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Searches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.searches.used}
                    {metrics.searches.limit !== -1 && `/${metrics.searches.limit}`}
                  </p>
                </div>
              </div>
            </div>
            
            {metrics.searches.limit !== -1 && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getSearchUsageColor(metrics.searches.used, metrics.searches.limit)}`}
                    style={{ width: `${Math.min((metrics.searches.used / metrics.searches.limit) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {metrics.searches.remaining} remaining • Resets {metrics.searches.resetDate.toLocaleDateString()}
                </p>
              </>
            )}
            {metrics.searches.limit === -1 && (
              <p className="text-xs text-blue-600 font-medium">Unlimited searches</p>
            )}
          </CardContent>
        </Card>

        {/* Event ROI */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Event ROI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(metrics.events.estimatedROI)}
                  </p>
                </div>
              </div>
              {getTrendIcon(metrics.events.estimatedROI)}
            </div>
            <p className="text-xs text-gray-500">
              {metrics.events.attended} events • {formatCurrency(metrics.events.totalCost)} invested
            </p>
          </CardContent>
        </Card>

        {/* Networking Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Connections</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.networking.connectionsThisMonth}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.networking.progress)}`}
                style={{ width: `${Math.min(metrics.networking.progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {formatPercentage(metrics.networking.progress)} of annual goal • {metrics.networking.activeDeals} active deals
            </p>
          </CardContent>
        </Card>

        {/* Event Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.events.attended}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.events.progress)}`}
                style={{ width: `${Math.min(metrics.events.progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {formatPercentage(metrics.events.progress)} of annual goal • {metrics.events.planned} planned
            </p>
          </CardContent>
        </Card>

        {/* Forum Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Forum Posts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.forum.postsCreated}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {metrics.forum.helpfulVotes} helpful votes • {metrics.forum.questionsAnswered} answers
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.achievements.unlocked}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {metrics.achievements.total} points earned
            </p>
          </CardContent>
        </Card>

        {/* Engagement Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-teal-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Dashboard Visits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.engagement.dashboardVisits}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Last visit: {metrics.engagement.lastVisit 
                ? metrics.engagement.lastVisit.toLocaleDateString()
                : 'Never'
              }
            </p>
          </CardContent>
        </Card>

        {/* Overall Performance Score */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-700">Overall Score</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round((metrics.networking.progress + metrics.events.progress) / 2)}%
                  </p>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600">
              Based on goal progress and activity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 