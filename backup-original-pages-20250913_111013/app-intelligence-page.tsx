'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseSession } from '@/hooks/useFirebaseSession'
import { useAuth } from '@/lib/auth/firebase-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Target, 
  Users, 
  TrendingUp, 
  Search, 
  Zap,
  BarChart3,
  Network,
  Star,
  ArrowRight,
  Clock,
  DollarSign,
  Award,
  Calendar,
  RefreshCw
} from 'lucide-react'

// Import our new components
import ConnectionMap from '@/components/search/ConnectionMap'
import MarketInsightsWidget from '@/components/dashboard/MarketInsightsWidget'
import ContactScoring from '@/components/search/ContactScoring'
import PageLayout from '@/components/navigation/PageLayout'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  priority: 'high' | 'medium' | 'low'
}

interface IntelligenceMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
}

export default function IntelligencePage() {
  const hasFirebaseSession = useFirebaseSession()
  const { user: firebaseUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'overview' | 'connections' | 'market' | 'contacts'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<any[]>([])

  // Authentication check
  useEffect(() => {
    if (!authLoading && !firebaseUser && !hasFirebaseSession) {
      console.log('❌ No Firebase authentication found in intelligence page, redirecting to signin');
      router.push('/auth/firebase-signin');
    }
  }, [authLoading, firebaseUser, hasFirebaseSession, router]);

  // Mock data for demonstration
  const mockTargetCompany = {
    id: 'company-1',
    name: 'Disney',
    type: 'Entertainment',
    industry: 'Media & Entertainment',
    headquarters: 'Burbank, CA',
    logoUrl: '/api/placeholder/60/60'
  }

  const mockTargetContacts = [
    {
      id: 'contact-1',
      name: 'Sarah Johnson',
      title: 'VP of Media Strategy',
      email: 'sarah.johnson@disney.com',
      phone: '+1 555-0123',
      isDecisionMaker: true,
      department: 'Marketing',
      company: mockTargetCompany,
      linkedinUrl: 'https://linkedin.com/in/sarah-johnson',
      profileImageUrl: '/api/placeholder/50/50'
    }
  ]

  const mockMutualConnections = [
    {
      contact: mockTargetContacts[0],
      relationship: 'event_connection' as const,
      strength: 'strong' as const,
      lastInteraction: '2 weeks ago',
      mutualEvents: ['NAB 2024', 'Advertising Week'],
      canIntroduce: true
    }
  ]

  const mockSharedEvents = [
    {
      id: 'event-1',
      name: 'NAB 2024',
      date: '2024-04-15',
      type: 'Industry Conference',
      location: 'Las Vegas, NV',
      attendeeCount: 15000
    }
  ]

  const mockContactDetails = {
    id: 'contact-1',
    name: 'Sarah Johnson',
    title: 'VP of Media Strategy',
    email: 'sarah.johnson@disney.com',
    phone: '+1 555-0123',
    company: {
      id: 'company-1',
      name: 'Disney',
      industry: 'Media & Entertainment',
      size: 'Enterprise',
      revenue: 82000000000
    },
    department: 'Marketing',
    seniority: 'VP' as const,
    tenure: 18,
    isDecisionMaker: true,
    budget: 50000000,
    linkedinUrl: 'https://linkedin.com/in/sarah-johnson',
    profileImageUrl: '/api/placeholder/50/50',
    lastActivity: '3 days ago',
    engagement: {
      emailOpens: 12,
      emailClicks: 4,
      linkedinViews: 8,
      websiteVisits: 3
    },
    mediaSpend: {
      current: 25000000,
      potential: 40000000,
      channels: ['CTV', 'Digital', 'Social', 'Traditional'],
      trends: 'increasing' as const
    },
    connectionStrength: 'warm' as const,
    mutualConnections: 3,
    recentNews: [
      'Disney+ launches new ad-supported tier',
      'Company announces Q4 earnings beat',
      'New streaming content partnerships announced'
    ],
    competitorInteractions: 2
  }

  const intelligenceMetrics: IntelligenceMetric[] = [
    {
      label: 'Active Connections',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Market Opportunities',
      value: '34',
      change: '+8%',
      trend: 'up',
      icon: <Target className="w-5 h-5" />
    },
    {
      label: 'Hot Prospects',
      value: '12',
      change: '+5%',
      trend: 'up',
      icon: <Star className="w-5 h-5" />
    },
    {
      label: 'Pipeline Value',
      value: '$2.4M',
      change: '+18%',
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />
    }
  ]

  const quickActions: QuickAction[] = [
    {
      id: 'search-suggestions',
      title: 'Smart Search Suggestions',
      description: 'Get AI-powered search recommendations based on market trends',
      icon: <Search className="w-5 h-5" />,
      action: () => fetchSearchSuggestions(),
      priority: 'high'
    },
    {
      id: 'connection-analysis',
      title: 'Analyze Connections',
      description: 'Map your network for warm introduction opportunities',
      icon: <Network className="w-5 h-5" />,
      action: () => setActiveSection('connections'),
      priority: 'high'
    },
    {
      id: 'market-intel',
      title: 'Market Intelligence',
      description: 'View industry trends and competitive insights',
      icon: <BarChart3 className="w-5 h-5" />,
      action: () => setActiveSection('market'),
      priority: 'medium'
    },
    {
      id: 'contact-scoring',
      title: 'Contact Scoring',
      description: 'Analyze prospect quality and outreach potential',
      icon: <Target className="w-5 h-5" />,
      action: () => setActiveSection('contacts'),
      priority: 'high'
    }
  ]

  const fetchSearchSuggestions = async () => {
    // Only fetch if authenticated
    if (status !== 'authenticated') {
      // Use mock data for demo when not authenticated
      setSuggestions([
        {
          id: 'suggestion-1',
          query: 'companies with new CMOs',
          description: 'Companies that hired new CMOs in the last 90 days',
          category: 'Leadership Changes',
          relevanceScore: 90
        },
        {
          id: 'suggestion-2',
          query: 'streaming services expansion',
          description: 'Streaming platforms expanding to new markets',
          category: 'Industry Trends',
          relevanceScore: 85
        }
      ])
      return
    }

    try {
      const response = await fetch('/api/search/suggestions?limit=5')
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else if (response.status === 401) {
        console.log('Authentication required for search suggestions')
        // Use mock data as fallback
        setSuggestions([
          {
            id: 'suggestion-1',
            query: 'companies with new CMOs',
            description: 'Companies that hired new CMOs in the last 90 days',
            category: 'Leadership Changes',
            relevanceScore: 90
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      // Use mock data for demo
      setSuggestions([
        {
          id: 'suggestion-1',
          query: 'companies with new CMOs',
          description: 'Companies that hired new CMOs in the last 90 days',
          category: 'Leadership Changes',
          relevanceScore: 90
        },
        {
          id: 'suggestion-2',
          query: 'streaming services expansion',
          description: 'Streaming platforms expanding to new markets',
          category: 'Industry Trends',
          relevanceScore: 85
        }
      ])
    }
  }

  useEffect(() => {
    setIsLoading(false)
    fetchSearchSuggestions()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-700 rotate-180" />
      default: return <TrendingUp className="w-4 h-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading intelligence dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Sales Intelligence"
      description="AI-powered insights for media sales"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            AI Enhanced
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchSearchSuggestions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/search'}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      }
    >

      {/* Navigation */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'connections', label: 'Connections', icon: <Network className="w-4 h-4" /> },
          { id: 'market', label: 'Market Intel', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'contacts', label: 'Contact Scoring', icon: <Target className="w-4 h-4" /> }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {intelligenceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {metric.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-700'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                AI-powered tools to accelerate your sales process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {action.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                            <Badge className={`text-xs ${getPriorityColor(action.priority)}`}>
                              {action.priority} priority
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={action.action}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Smart Search Suggestions
                </CardTitle>
                <CardDescription>
                  AI-powered search recommendations based on market trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{suggestion.query}</h4>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {suggestion.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-blue-600">
                          {suggestion.relevanceScore}% match
                        </div>
                        <Button size="sm" variant="outline">
                          Search
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Connections Section */}
      {activeSection === 'connections' && (
        <div className="space-y-8">
          <ConnectionMap
            targetCompany={mockTargetCompany}
            targetContacts={mockTargetContacts}
            mutualConnections={mockMutualConnections}
            sharedEvents={mockSharedEvents}
            forumMentions={3}
            onContactIntroduction={(contact, connection) => {
              console.log('Request introduction:', contact, connection)
            }}
            onScheduleMeeting={(contact) => {
              console.log('Schedule meeting:', contact)
            }}
            onSaveConnection={(connectionId) => {
              console.log('Save connection:', connectionId)
            }}
          />
        </div>
      )}

      {/* Market Intelligence Section */}
      {activeSection === 'market' && (
        <div className="space-y-8">
          <MarketInsightsWidget
            industry="Media & Entertainment"
            region="North America"
            timeframe="30d"
            onTrendClick={(trend) => {
              console.log('Trend clicked:', trend)
            }}
            onInsightClick={(insight) => {
              console.log('Insight clicked:', insight)
            }}
            onCompetitorClick={(activity) => {
              console.log('Competitor activity clicked:', activity)
            }}
          />
        </div>
      )}

      {/* Contact Scoring Section */}
      {activeSection === 'contacts' && (
        <div className="space-y-8">
          <ContactScoring
            contact={mockContactDetails}
            onContactAction={(action, contact) => {
              console.log('Contact action:', action, contact)
            }}
            onScoreUpdate={(contactId, score) => {
              console.log('Score update:', contactId, score)
            }}
          />
        </div>
      )}
    </PageLayout>
  )
} 