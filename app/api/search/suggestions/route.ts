import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createAuthError, createInternalError } from '@/lib/api-responses'

const prisma = new PrismaClient()

interface SearchSuggestion {
  id: string
  query: string
  type: 'company' | 'industry' | 'person' | 'trend'
  description: string
  popularity: number
  category?: string
  relevanceScore: number
  reasoning?: string
}

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get user's search history for personalization
    const userSearchHistory = await prisma.search.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Generate suggestions based on query and user history
    const suggestions = await generateSuggestions(query, type, userSearchHistory, userTier || 'FREE', limit)

    return NextResponse.json({
      suggestions,
      metadata: {
        query,
        type,
        personalized: userSearchHistory.length > 0,
        userTier
      }
    })
  } catch (error) {
    console.error('Search suggestions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateSuggestions(
  query: string,
  type: string,
  userHistory: any[],
  userTier: string,
  limit: number
): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = []

  // Base trending suggestions for media industry
  const trendingSuggestions = [
    {
      id: 'trend-1',
      query: 'companies with new CMOs',
      type: 'trend' as const,
      description: 'Companies that hired new CMOs in the last 90 days',
      popularity: 95,
      category: 'Leadership Changes',
      relevanceScore: 90,
      reasoning: 'New CMOs often review media strategies and budgets'
    },
    {
      id: 'trend-2',
      query: 'recent IPO companies',
      type: 'trend' as const,
      description: 'Companies that went public in the last 12 months',
      popularity: 88,
      category: 'Market Activity',
      relevanceScore: 85,
      reasoning: 'IPO companies typically increase marketing spend post-public'
    },
    {
      id: 'trend-3',
      query: 'companies increasing ad spend',
      type: 'trend' as const,
      description: 'Companies showing 20%+ increase in advertising budget',
      popularity: 92,
      category: 'Budget Changes',
      relevanceScore: 95,
      reasoning: 'Direct indicator of media buying opportunities'
    },
    {
      id: 'trend-4',
      query: 'streaming services expansion',
      type: 'industry' as const,
      description: 'Streaming platforms expanding to new markets',
      popularity: 83,
      category: 'Industry Trends',
      relevanceScore: 80,
      reasoning: 'Expanding streaming services need local market advertising'
    },
    {
      id: 'trend-5',
      query: 'companies hiring marketing roles',
      type: 'trend' as const,
      description: 'Companies with active marketing job postings',
      popularity: 78,
      category: 'Hiring Activity',
      relevanceScore: 75,
      reasoning: 'Marketing team expansion indicates budget growth'
    }
  ]

  // Industry-specific suggestions
  const industrySuggestions = [
    {
      id: 'industry-1',
      query: 'retail brands holiday campaigns',
      type: 'company' as const,
      description: 'Retail companies preparing for holiday marketing',
      popularity: 89,
      category: 'Seasonal Opportunities',
      relevanceScore: 88,
      reasoning: 'Holiday season drives highest advertising spend for retail'
    },
    {
      id: 'industry-2',
      query: 'fintech companies Series B funding',
      type: 'company' as const,
      description: 'Fintech startups with recent Series B rounds',
      popularity: 76,
      category: 'Funding Activity',
      relevanceScore: 82,
      reasoning: 'Series B companies invest heavily in customer acquisition'
    },
    {
      id: 'industry-3',
      query: 'automotive brands electric vehicle',
      type: 'company' as const,
      description: 'Auto companies launching electric vehicle lines',
      popularity: 84,
      category: 'Product Launches',
      relevanceScore: 87,
      reasoning: 'EV launches require significant marketing investment'
    },
    {
      id: 'industry-4',
      query: 'food delivery apps expansion',
      type: 'company' as const,
      description: 'Food delivery services expanding to new cities',
      popularity: 71,
      category: 'Market Expansion',
      relevanceScore: 79,
      reasoning: 'Geographic expansion needs local advertising campaigns'
    }
  ]

  // Personalized suggestions based on user history
  const personalizedSuggestions = generatePersonalizedSuggestions(userHistory)

  // Query-specific suggestions
  const querySpecificSuggestions = generateQuerySpecificSuggestions(query)

  // Competitor intelligence suggestions
  const competitorSuggestions = [
    {
      id: 'competitor-1',
      query: 'Nike competitors apparel',
      type: 'company' as const,
      description: 'Companies competing with Nike in athletic apparel',
      popularity: 87,
      category: 'Competitive Analysis',
      relevanceScore: 85,
      reasoning: 'Competitor analysis helps identify market opportunities'
    },
    {
      id: 'competitor-2',
      query: 'Netflix streaming competitors',
      type: 'company' as const,
      description: 'Streaming services competing with Netflix',
      popularity: 82,
      category: 'Competitive Analysis',
      relevanceScore: 83,
      reasoning: 'Competitive landscape analysis for streaming market'
    }
  ]

  // Combine all suggestions
  let allSuggestions = [
    ...trendingSuggestions,
    ...industrySuggestions,
    ...personalizedSuggestions,
    ...querySpecificSuggestions,
    ...competitorSuggestions
  ]

  // Filter by type if specified
  if (type !== 'all') {
    allSuggestions = allSuggestions.filter(s => s.type === type)
  }

  // Filter by query if provided
  if (query.length > 0) {
    const queryLower = query.toLowerCase()
    allSuggestions = allSuggestions.filter(s =>
      s.query.toLowerCase().includes(queryLower) ||
      s.description.toLowerCase().includes(queryLower) ||
      s.category?.toLowerCase().includes(queryLower)
    )
  }

  // Sort by relevance score and popularity
  allSuggestions.sort((a, b) => {
    const scoreA = (a.relevanceScore * 0.7) + (a.popularity * 0.3)
    const scoreB = (b.relevanceScore * 0.7) + (b.popularity * 0.3)
    return scoreB - scoreA
  })

  // Apply tier-based limits
  const maxSuggestions = userTier === 'FREE' ? 5 : userTier === 'PRO' ? 15 : 25
  const finalLimit = Math.min(limit, maxSuggestions)

  return allSuggestions.slice(0, finalLimit)
}

function generatePersonalizedSuggestions(userHistory: any[]): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = []
  
  if (userHistory.length === 0) return suggestions

  // Analyze user search patterns
  const searchQueries = userHistory.map(h => h.query.toLowerCase())
  const searchTypes = userHistory.map(h => h.searchType || 'general')

  // Find common themes in user searches
  const themes = {
    agencies: searchQueries.some(q => q.includes('agency') || q.includes('agencies')),
    tech: searchQueries.some(q => q.includes('tech') || q.includes('technology')),
    advertising: searchQueries.some(q => q.includes('advertising') || q.includes('marketing')),
    media: searchQueries.some(q => q.includes('media') || q.includes('broadcast')),
    streaming: searchQueries.some(q => q.includes('streaming') || q.includes('netflix')),
    automotive: searchQueries.some(q => q.includes('automotive') || q.includes('car')),
    retail: searchQueries.some(q => q.includes('retail') || q.includes('store'))
  }

  // Generate personalized suggestions based on themes
  if (themes.agencies) {
    suggestions.push({
      id: 'personal-1',
      query: 'digital agencies with programmatic expertise',
      type: 'company',
      description: 'Based on your agency searches - agencies specializing in programmatic',
      popularity: 85,
      category: 'Personalized',
      relevanceScore: 95,
      reasoning: 'You frequently search for agencies'
    })
  }

  if (themes.tech) {
    suggestions.push({
      id: 'personal-2',
      query: 'SaaS companies $100M+ revenue',
      type: 'company',
      description: 'Based on your interests - high-growth SaaS companies',
      popularity: 82,
      category: 'Personalized',
      relevanceScore: 93,
      reasoning: 'Matches your technology focus'
    })
  }

  if (themes.streaming) {
    suggestions.push({
      id: 'personal-3',
      query: 'OTT platforms launching this year',
      type: 'company',
      description: 'Based on your streaming searches - new OTT platforms',
      popularity: 79,
      category: 'Personalized',
      relevanceScore: 91,
      reasoning: 'Aligns with your streaming industry interest'
    })
  }

  return suggestions
}

function generateQuerySpecificSuggestions(query: string): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = []
  const queryLower = query.toLowerCase()

  if (queryLower.includes('nike')) {
    suggestions.push({
      id: 'query-1',
      query: 'Nike media strategy 2024',
      type: 'company',
      description: 'Nike\'s current media strategy and advertising approach',
      popularity: 88,
      category: 'Company Deep Dive',
      relevanceScore: 95,
      reasoning: 'Deep dive into Nike\'s media approach'
    })
  }

  if (queryLower.includes('agency') || queryLower.includes('agencies')) {
    suggestions.push({
      id: 'query-2',
      query: 'top creative agencies New York',
      type: 'company',
      description: 'Leading creative agencies in New York market',
      popularity: 86,
      category: 'Geographic Focus',
      relevanceScore: 90,
      reasoning: 'Geographic expansion of agency search'
    })
  }

  if (queryLower.includes('tech')) {
    suggestions.push({
      id: 'query-3',
      query: 'adtech companies IPO ready',
      type: 'company',
      description: 'AdTech companies preparing for public offering',
      popularity: 83,
      category: 'Market Timing',
      relevanceScore: 88,
      reasoning: 'IPO timing creates media opportunities'
    })
  }

  return suggestions
}

export async function POST(request: NextRequest) {
  try {
    // Track suggestion clicks for improving recommendations
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return createAuthError()
    }

    const body = await request.json()
    const { suggestionId, query, action } = body

    // Log suggestion interaction for ML improvement
    console.log('Suggestion interaction:', {
      userId,
      suggestionId,
      query,
      action,
      timestamp: new Date().toISOString()
    })

    // TODO: Store in analytics table for improving suggestions
    // await prisma.suggestionInteraction.create({
    //   data: {
    //     userId,
    //     suggestionId,
    //     query,
    //     action,
    //   }
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Suggestion tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 