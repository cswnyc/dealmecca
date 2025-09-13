'use client'

import { useAuth } from "@/lib/auth/firebase-auth";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdvancedSearch from '@/components/search/AdvancedSearch'
import SearchResults from '@/components/search/SearchResults'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Brain, Zap, TrendingUp } from 'lucide-react'
import PageLayout from '@/components/navigation/PageLayout'

interface SearchFilters {
  companyType: string[]
  industry: string[]
  employeeCount: {
    min: number
    max: number
  }
  headquarters: string[]
  revenueRange: {
    min: number
    max: number
  }
  recentChanges: boolean
  hasOpenings: boolean
  mediaSpend: 'high' | 'medium' | 'low' | 'any'
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilters
  resultCount?: number
  lastRun: string
}

interface EnhancedSearchCompany {
  id: string
  name: string
  type?: string
  industry?: string
  description?: string
  website?: string
  employeeCount?: number
  headquarters?: string
  revenue?: string
  logoUrl?: string
  stockSymbol?: string
  foundedYear?: number
  
  // AI-powered insights
  aiSummary?: string
  insights?: any[]
  
  // Key contacts with enhanced data
  keyContacts?: any[]
  
  // Connection intelligence
  connectionPath?: any
  
  // Media intelligence
  mediaStrategy?: any
  
  // Competitive analysis
  competitorAnalysis?: any
  
  // Engagement metrics
  lastUpdated?: string
  totalContacts?: number
  recentActivity?: string
}

export default function EnhancedSearchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<EnhancedSearchCompany[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [currentQuery, setCurrentQuery] = useState('')
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>()
  const [error, setError] = useState<string>('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadSavedSearches()
      loadRecentSearches()
      loadFavorites()
    }
  }, [session])

  const loadSavedSearches = async () => {
    try {
      const response = await fetch('/api/saved-searches', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSavedSearches(data.savedSearches)
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error)
    }
  }

  const loadRecentSearches = async () => {
    try {
      const response = await fetch('/api/search/track?limit=5', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRecentSearches(data.searches.map((s: any) => s.query))
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }

  const loadFavorites = async () => {
    // TODO: Implement favorites API
    setFavorites([])
  }

  const handleSearch = async (query: string, filters: SearchFilters, page = 1) => {
    // Prevent search if still loading authentication
    if (loading) {
      setError('Please wait while we verify your authentication...')
      return
    }

    // Ensure user is authenticated before searching
    if (!loading && !user || !session) {
      setError('Please sign in to use search functionality')
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    setError('')
    setCurrentQuery(query)
    setCurrentFilters(filters)

    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: pagination.limit.toString()
      })

      // Add filters to params
      if (filters.companyType.length > 0) {
        filters.companyType.forEach(type => params.append('companyType', type))
      }
      if (filters.industry.length > 0) {
        filters.industry.forEach(industry => params.append('industry', industry))
      }
      if (filters.employeeCount.min > 0) {
        params.append('minEmployees', filters.employeeCount.min.toString())
      }
      if (filters.employeeCount.max < 100000) {
        params.append('maxEmployees', filters.employeeCount.max.toString())
      }
      if (filters.headquarters.length > 0) {
        filters.headquarters.forEach(hq => params.append('headquarters', hq))
      }
      if (filters.recentChanges) {
        params.append('recentChanges', 'true')
      }
      if (filters.hasOpenings) {
        params.append('hasOpenings', 'true')
      }
      if (filters.mediaSpend !== 'any') {
        params.append('mediaSpend', filters.mediaSpend)
      }

      const response = await fetch(`/api/companies?${params}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (response.ok) {
        // Transform companies to enhanced format with mock AI data
        const enhancedCompanies = data.companies.map((company: any) => ({
          ...company,
          aiSummary: generateMockAISummary(company),
          insights: generateMockInsights(company),
          keyContacts: company.contacts || [],
          connectionPath: {
            mutualConnections: [],
            eventAttendance: [],
            forumMentions: Math.floor(Math.random() * 5)
          },
          mediaStrategy: {
            primaryChannels: getPrimaryChannels(company.type),
            estimatedBudget: getEstimatedBudget(company.employeeCount),
            recentCampaigns: getRecentCampaigns(company.type),
            agencyPartners: getAgencyPartners(company.type)
          },
          competitorAnalysis: {
            mainCompetitors: getCompetitors(company.industry),
            marketPosition: getMarketPosition(company.employeeCount),
            differentiators: getDifferentiators(company.type)
          },
          lastUpdated: new Date().toISOString(),
          totalContacts: company._count?.contacts || 0,
          recentActivity: 'Updated insights 2 hours ago'
        }))

        setCompanies(enhancedCompanies)
        setPagination(data.pagination)
        
        // Update recent searches
        if (!recentSearches.includes(query)) {
          setRecentSearches(prev => [query, ...prev.slice(0, 4)])
        }
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setError('Your session has expired. Please sign in again.')
          router.push('/auth/signin')
          return
        } else if (response.status === 403) {
          setError(data.message || 'Search limit exceeded. Please upgrade your account.')
        } else {
          console.error('Search failed:', data.error || data.message || 'Unknown error')
          setError(data.error || data.message || 'Search failed')
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('An error occurred while searching. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSearch = async (name: string, query: string, filters: SearchFilters) => {
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          query,
          filters,
          alertEnabled: false
        })
      })

      if (response.ok) {
        const savedSearch = await response.json()
        setSavedSearches(prev => [savedSearch, ...prev])
      }
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }

  const handleLoadSavedSearch = (search: SavedSearch) => {
    handleSearch(search.query, search.filters)
  }

  const handlePageChange = (page: number) => {
    if (currentQuery && currentFilters) {
      handleSearch(currentQuery, currentFilters, page)
    }
  }

  const handleCompanyClick = (company: EnhancedSearchCompany) => {
    // TODO: Navigate to company details page
    console.log('Company clicked:', company.name)
  }

  const handleContactClick = (contact: any) => {
    // TODO: Navigate to contact details page
    console.log('Contact clicked:', contact.name)
  }

  const handleSaveCompany = (companyId: string) => {
    setFavorites(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  const handleViewInsight = (insight: any) => {
    // TODO: Show insight details modal
    console.log('Insight clicked:', insight.title)
  }

  // Helper function to safely format company type
  const formatCompanyType = (type: string | undefined): string => {
    if (!type) return 'company'
    return type.toLowerCase().replace('_', ' ')
  }

  // Mock data generation functions
  const generateMockAISummary = (company: any) => {
    const companyType = formatCompanyType(company.type)
    const summaries = [
      `${company.name} is a leading ${companyType} in the ${company.industry || 'business'} sector, well-positioned for media partnerships with an estimated annual budget of ${getEstimatedBudget(company.employeeCount || 0)}. Recent market analysis suggests they're actively expanding their digital presence.`,
      `This ${companyType} company shows strong growth potential with ${company.employeeCount || 'N/A'} employees and increasing market share in ${company.industry || 'their market'}. Their media strategy focuses on digital channels with significant investment in programmatic advertising.`,
      `${company.name} represents a prime opportunity for media sales with their recent expansion and focus on brand awareness. Industry analysis indicates they're in a growth phase with increased marketing spend expected.`
    ]
    return summaries[Math.floor(Math.random() * summaries.length)]
  }

  const generateMockInsights = (company: any) => {
    const insights = [
      {
        id: '1',
        type: 'NEWS',
        title: 'Recent Leadership Changes',
        content: 'New CMO hired with strong media background',
        relevanceScore: 85,
        createdAt: '2 days ago'
      },
      {
        id: '2',
        type: 'FUNDING',
        title: 'Series B Funding Completed',
        content: 'Raised $50M to expand marketing efforts',
        relevanceScore: 92,
        createdAt: '1 week ago'
      },
      {
        id: '3',
        type: 'MEDIA_SPEND_CHANGE',
        title: 'Increased Digital Spend',
        content: 'Shifted 30% of budget from traditional to digital',
        relevanceScore: 78,
        createdAt: '3 weeks ago'
      }
    ]
    return insights.slice(0, Math.floor(Math.random() * 3) + 1)
  }

  const getPrimaryChannels = (type: string) => {
    const channels = {
      'ADVERTISER': ['Digital Display', 'Social Media', 'Search', 'TV'],
      'AGENCY': ['Programmatic', 'Social Media', 'Search', 'Digital Video'],
      'MEDIA_COMPANY': ['Digital Video', 'Social Media', 'Display', 'Native'],
      'TECH_VENDOR': ['Digital Display', 'Search', 'Social Media', 'Content Marketing'],
      'PUBLISHER': ['Direct Sales', 'Programmatic', 'Social Media', 'Email']
    }
    return channels[type as keyof typeof channels] || ['Digital Display', 'Social Media']
  }

  const getEstimatedBudget = (employeeCount: number) => {
    if (employeeCount > 10000) return '$10M-$50M+'
    if (employeeCount > 1000) return '$1M-$10M'
    if (employeeCount > 500) return '$500K-$2M'
    if (employeeCount > 100) return '$100K-$500K'
    return '$50K-$200K'
  }

  const getRecentCampaigns = (type: string) => {
    const campaigns = {
      'ADVERTISER': ['Holiday Season Campaign', 'Product Launch Campaign'],
      'AGENCY': ['Client Portfolio Expansion', 'Award-Winning Creative'],
      'MEDIA_COMPANY': ['Original Content Promotion', 'Subscription Drive'],
      'TECH_VENDOR': ['Product Demo Series', 'Thought Leadership'],
      'PUBLISHER': ['Premium Content Series', 'Audience Development']
    }
    return campaigns[type as keyof typeof campaigns] || ['Brand Campaign', 'Product Marketing']
  }

  const getAgencyPartners = (type: string) => {
    const partners = {
      'ADVERTISER': ['GroupM', 'Omnicom', 'Publicis'],
      'TECH_VENDOR': ['Specialized tech agencies', 'Performance marketing firms'],
      'MEDIA_COMPANY': ['Premium ad agencies', 'Brand strategy firms']
    }
    return partners[type as keyof typeof partners] || ['Full-service agencies', 'Digital specialists']
  }

  const getCompetitors = (industry: string) => {
    const competitors = {
      'Digital Advertising': ['Google', 'Facebook', 'Amazon'],
      'TV Broadcasting': ['NBCUniversal', 'Disney', 'CBS'],
      'Streaming': ['Netflix', 'Disney+', 'HBO Max'],
      'AdTech': ['Google DV360', 'The Trade Desk', 'Adobe DSP']
    }
    return competitors[industry as keyof typeof competitors] || ['Industry leaders', 'Regional competitors']
  }

  const getMarketPosition = (employeeCount: number) => {
    if (employeeCount > 10000) return 'Enterprise leader'
    if (employeeCount > 1000) return 'Mid-market player'
    if (employeeCount > 100) return 'Growing company'
    return 'Small business'
  }

  const getDifferentiators = (type: string) => {
    const differentiators = {
      'ADVERTISER': ['Brand recognition', 'Market reach'],
      'AGENCY': ['Creative excellence', 'Media buying power'],
      'MEDIA_COMPANY': ['Audience quality', 'Content library'],
      'TECH_VENDOR': ['Technology innovation', 'Platform capabilities'],
      'PUBLISHER': ['Audience engagement', 'Content quality']
    }
    return differentiators[type as keyof typeof differentiators] || ['Market presence', 'Service quality']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="🧠 Enhanced Search"
      description="AI-powered company research with advanced insights"
      actions={
        <Button variant="outline" onClick={() => router.push('/search')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Basic Search
        </Button>
      }
    >
      {/* Features Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-4 mb-8 -mt-2">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2 text-blue-700">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Insights</span>
          </div>
          <div className="flex items-center gap-2 text-purple-700">
            <Zap className="w-4 h-4" />
            <span>Smart Suggestions</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="w-4 h-4" />
            <span>Market Intelligence</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Advanced Search */}
          <AdvancedSearch
            onSearch={handleSearch}
            recentSearches={recentSearches}
            savedSearches={savedSearches}
            onSaveSearch={handleSaveSearch}
            onLoadSavedSearch={handleLoadSavedSearch}
            loading={loading}
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {companies.length > 0 && (
            <SearchResults
              companies={companies as any}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onCompanyClick={handleCompanyClick}
              onContactClick={handleContactClick}
              onSaveCompany={handleSaveCompany}
              onViewInsight={handleViewInsight}
              favorites={favorites}
            />
          )}

          {/* Getting Started */}
          {companies.length === 0 && !loading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Welcome to Enhanced Search
                </CardTitle>
                <CardDescription>
                  Get started with AI-powered company research and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">AI Insights</h3>
                    <p className="text-sm text-gray-600">Get AI-generated summaries and market intelligence</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">Smart Filters</h3>
                    <p className="text-sm text-gray-600">Use advanced filters and saved searches</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">Market Data</h3>
                    <p className="text-sm text-gray-600">Access competitor analysis and media strategy insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  )
} 