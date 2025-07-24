'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target, 
  DollarSign,
  Globe,
  Users,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  Filter,
  Download,
  Share2,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MarketTrend {
  id: string
  category: string
  metric: string
  value: number
  change: number
  period: string
  trend: 'up' | 'down' | 'stable'
  significance: 'high' | 'medium' | 'low'
  description: string
  impact: string
}

interface IndustryInsight {
  id: string
  title: string
  category: 'spending' | 'channels' | 'targeting' | 'technology' | 'regulation'
  summary: string
  impact: 'positive' | 'negative' | 'neutral'
  urgency: 'high' | 'medium' | 'low'
  dataPoints: string[]
  recommendations: string[]
  sources: string[]
  publishedAt: string
}

interface CompetitorActivity {
  id: string
  company: string
  activity: string
  type: 'campaign' | 'budget' | 'partnership' | 'acquisition' | 'expansion'
  spend: number
  channels: string[]
  impact: 'high' | 'medium' | 'low'
  date: string
  details: string
}

interface MarketInsightsWidgetProps {
  industry?: string
  region?: string
  timeframe?: '7d' | '30d' | '90d' | '1y'
  onTrendClick?: (trend: MarketTrend) => void
  onInsightClick?: (insight: IndustryInsight) => void
  onCompetitorClick?: (activity: CompetitorActivity) => void
  className?: string
}

export default function MarketInsightsWidget({
  industry = 'Media & Entertainment',
  region = 'North America',
  timeframe = '30d',
  onTrendClick,
  onInsightClick,
  onCompetitorClick,
  className = ''
}: MarketInsightsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'insights' | 'competitors'>('trends')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - in production, this would come from APIs
  const marketTrends: MarketTrend[] = [
    {
      id: 'trend-1',
      category: 'Digital Advertising',
      metric: 'CTV Ad Spend',
      value: 284.5,
      change: 23.4,
      period: '30d',
      trend: 'up',
      significance: 'high',
      description: 'Connected TV advertising spend increased significantly',
      impact: 'Opportunity for CTV inventory monetization'
    },
    {
      id: 'trend-2',
      category: 'Programmatic',
      metric: 'Programmatic Share',
      value: 67.8,
      change: 5.2,
      period: '30d',
      trend: 'up',
      significance: 'medium',
      description: 'Programmatic advertising continues to grow market share',
      impact: 'Increased demand for automated ad buying solutions'
    },
    {
      id: 'trend-3',
      category: 'Social Media',
      metric: 'Video Ad Engagement',
      value: 4.2,
      change: -8.7,
      period: '30d',
      trend: 'down',
      significance: 'medium',
      description: 'Video ad engagement rates declining across platforms',
      impact: 'Need for more creative and targeted video content'
    },
    {
      id: 'trend-4',
      category: 'Search',
      metric: 'Search Ad CPM',
      value: 12.45,
      change: 15.3,
      period: '30d',
      trend: 'up',
      significance: 'high',
      description: 'Search advertising costs rising due to increased competition',
      impact: 'Higher barrier to entry for search advertising'
    }
  ]

  const industryInsights: IndustryInsight[] = [
    {
      id: 'insight-1',
      title: 'Streaming Wars Drive Premium Inventory Demand',
      category: 'channels',
      summary: 'Major streaming platforms are competing for premium advertising inventory, driving up costs and creating new opportunities for content creators.',
      impact: 'positive',
      urgency: 'high',
      dataPoints: [
        'Netflix ad tier reaches 15M users',
        'Disney+ ad revenue up 45% QoQ',
        'Premium CTV inventory up 67%'
      ],
      recommendations: [
        'Expand CTV inventory partnerships',
        'Develop premium content sponsorship packages',
        'Create exclusive advertising opportunities'
      ],
      sources: ['IAB Report', 'Streaming Media Survey', 'Industry Analysis'],
      publishedAt: '2024-01-15'
    },
    {
      id: 'insight-2',
      title: 'AI-Powered Ad Targeting Regulations Incoming',
      category: 'regulation',
      summary: 'New privacy regulations specifically targeting AI-powered advertising are expected to reshape how advertisers collect and use consumer data.',
      impact: 'negative',
      urgency: 'high',
      dataPoints: [
        'EU AI Act implementation timeline',
        '12 states considering similar legislation',
        'Industry compliance costs estimated at $2.3B'
      ],
      recommendations: [
        'Audit current AI targeting practices',
        'Invest in privacy-compliant solutions',
        'Develop first-party data strategies'
      ],
      sources: ['Legal Brief', 'Privacy Institute', 'Regulatory Update'],
      publishedAt: '2024-01-12'
    },
    {
      id: 'insight-3',
      title: 'Retail Media Networks Expand Beyond E-commerce',
      category: 'spending',
      summary: 'Traditional retailers are launching media networks, creating new advertising opportunities beyond traditional e-commerce platforms.',
      impact: 'positive',
      urgency: 'medium',
      dataPoints: [
        'Walmart Connect revenue up 230%',
        'Target launches Roundel expansion',
        'CVS Health announces media platform'
      ],
      recommendations: [
        'Explore retail media partnerships',
        'Develop in-store advertising solutions',
        'Create omnichannel retail strategies'
      ],
      sources: ['Retail Dive', 'AdAge', 'Marketing Land'],
      publishedAt: '2024-01-10'
    }
  ]

  const competitorActivity: CompetitorActivity[] = [
    {
      id: 'comp-1',
      company: 'Disney',
      activity: 'Launches AI-powered ad targeting for Disney+',
      type: 'campaign',
      spend: 150000000,
      channels: ['CTV', 'Mobile', 'Social'],
      impact: 'high',
      date: '2024-01-14',
      details: 'Disney introduces machine learning algorithms for personalized ad delivery across its streaming platform'
    },
    {
      id: 'comp-2',
      company: 'NBCUniversal',
      activity: 'Acquires programmatic advertising technology startup',
      type: 'acquisition',
      spend: 75000000,
      channels: ['Programmatic', 'CTV'],
      impact: 'medium',
      date: '2024-01-12',
      details: 'Strategic acquisition to enhance programmatic capabilities and compete with Google and Amazon'
    },
    {
      id: 'comp-3',
      company: 'Warner Bros Discovery',
      activity: 'Expands Max advertising to European markets',
      type: 'expansion',
      spend: 200000000,
      channels: ['CTV', 'Digital', 'Social'],
      impact: 'high',
      date: '2024-01-08',
      details: 'Major international expansion of ad-supported streaming tier across 15 European countries'
    }
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value}`
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />
    } else if (trend === 'down' || change < 0) {
      return <ArrowDownRight className="w-4 h-4 text-red-700" />
    }
    return <TrendingUp className="w-4 h-4 text-gray-600" />
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'bg-green-50 text-green-700 border-green-200'
      case 'negative': return 'bg-red-50 text-red-700 border-red-200'
      case 'neutral': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Market Intelligence
            </CardTitle>
            <CardDescription>
              Industry insights for {industry} • {region} • Last {timeframe}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'trends'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Market Trends
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Industry Insights
          </button>
          <button
            onClick={() => setActiveTab('competitors')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'competitors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Competitor Activity
          </button>
        </div>

        {/* Market Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            {marketTrends.map((trend) => (
              <Card
                key={trend.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onTrendClick?.(trend)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend, trend.change)}
                        <div>
                          <div className="font-medium text-gray-900">{trend.metric}</div>
                          <div className="text-sm text-gray-600">{trend.category}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {trend.metric.includes('$') ? formatCurrency(trend.value) : 
                         trend.metric.includes('%') ? `${trend.value}%` : trend.value}
                      </div>
                      <div className={`text-sm font-medium ${
                        trend.change > 0 ? 'text-green-600' : 'text-red-700'
                      }`}>
                        {formatPercentage(trend.change)} {trend.period}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={trend.significance === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {trend.significance} significance
                      </Badge>
                      <span className="text-xs text-gray-500">{trend.impact}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Industry Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {industryInsights.map((insight) => (
              <Card
                key={insight.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onInsightClick?.(insight)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{insight.summary}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <Badge className={getUrgencyColor(insight.urgency)}>
                          {insight.urgency} urgency
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {insight.publishedAt}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">Key Data Points</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {insight.dataPoints.slice(0, 3).map((point, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">Recommendations</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {insight.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Competitor Activity Tab */}
        {activeTab === 'competitors' && (
          <div className="space-y-4">
            {competitorActivity.map((activity) => (
              <Card
                key={activity.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onCompetitorClick?.(activity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{activity.company}</h4>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                        <Badge className={`text-xs ${
                          activity.impact === 'high' ? 'bg-red-100 text-red-800' :
                          activity.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {activity.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{activity.activity}</p>
                      <p className="text-xs text-gray-600 mb-2">{activity.details}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(activity.spend)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {activity.date}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Channels:</span>
                    {activity.channels.map((channel) => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Last updated: 2 hours ago</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{marketTrends.length + industryInsights.length + competitorActivity.length} insights</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 