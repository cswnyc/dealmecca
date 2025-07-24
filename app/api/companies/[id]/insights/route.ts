import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CompanyInsights {
  aiSummary: string
  recentNews: {
    title: string
    source: string
    date: Date
    relevanceScore: number
    summary: string
  }[]
  keyContacts: {
    contact: any
    influence: 'high' | 'medium' | 'low'
    recentActivity: string
    bestContactMethod: string
  }[]
  competitorAnalysis: {
    mainCompetitors: string[]
    marketPosition: string
    differentiators: string[]
  }
  mediaStrategy: {
    primaryChannels: string[]
    estimatedBudget: string
    recentCampaigns: string[]
    agencyPartners: string[]
  }
  connectionPaths: {
    mutualConnections: any[]
    eventAttendance: any[]
    forumMentions: number
  }
}

// Mock AI insight generation - replace with actual AI service
const generateCompanyInsights = async (company: any): Promise<CompanyInsights> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 100))

  const insights: CompanyInsights = {
    aiSummary: `${company.name} is a company in the ${company.industry} industry with ${company.employeeCount} employees. Based on recent market data and industry trends, they are positioned as a ${getMarketPosition(company)} player with strong focus on ${getPrimaryFocus(company)}. Their estimated annual media budget ranges from ${getEstimatedBudget(company.employeeCount, company.revenue)} making them a ${getBudgetTier(company.employeeCount)} prospect for media sales.`,
    
    recentNews: generateRecentNews(company),
    
    keyContacts: await generateKeyContacts(company.id),
    
    competitorAnalysis: {
      mainCompetitors: getCompetitors(company.industry || '', company.type),
      marketPosition: getMarketPosition(company),
      differentiators: getDifferentiators(company.type, company.industry || '')
    },
    
    mediaStrategy: {
      primaryChannels: getPrimaryChannels(company.type, company.industry),
      estimatedBudget: getEstimatedBudget(company.employeeCount, company.revenue),
      recentCampaigns: getRecentCampaigns(company.type),
      agencyPartners: getAgencyPartners(company.type)
    },
    
    connectionPaths: await generateConnectionPaths(company.id)
  }

  return insights
}

const generateRecentNews = (company: any) => {
  const newsTemplates = [
    {
      title: `${company.name} Expands Marketing Team`,
      source: 'AdAge',
      relevanceScore: 85,
      summary: `${company.name} has recently expanded their marketing team with new hires in digital and media planning, indicating increased media spend.`
    },
    {
      title: `${company.name} Launches New Product Line`,
      source: 'Marketing Land',
      relevanceScore: 78,
      summary: `The company announced a new product launch requiring significant media investment across digital and traditional channels.`
    },
    {
      title: `${company.name} Reports Strong Q4 Results`,
      source: 'Business Wire',
      relevanceScore: 72,
      summary: `Strong quarterly performance suggests increased marketing budgets for the upcoming fiscal year.`
    }
  ]

  return newsTemplates.slice(0, 2).map(template => ({
    ...template,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
  }))
}

const generateKeyContacts = async (companyId: string) => {
  const contacts = await prisma.contact.findMany({
    where: { companyId },
    orderBy: { isDecisionMaker: 'desc' },
    take: 10
  })

  return contacts.map(contact => ({
    contact,
    influence: getInfluenceLevel(contact.title || '', contact.isDecisionMaker),
    recentActivity: getRecentActivity(contact.title || ''),
    bestContactMethod: getBestContactMethod(contact.title || '', contact.email, contact.phone)
  }))
}

const generateConnectionPaths = async (companyId: string) => {
  // Mock connection data - in real implementation, this would analyze user's network
  return {
    mutualConnections: [],
    eventAttendance: [],
    forumMentions: Math.floor(Math.random() * 5)
  }
}

const getInfluenceLevel = (title: string, isDecisionMaker: boolean): 'high' | 'medium' | 'low' => {
  if (isDecisionMaker) return 'high'
  
  const highInfluenceTitles = ['cmo', 'chief marketing', 'vp marketing', 'director marketing', 'head of marketing']
  const mediumInfluenceTitles = ['marketing manager', 'brand manager', 'media manager', 'digital marketing']
  
  const lowerTitle = title.toLowerCase()
  
  if (highInfluenceTitles.some(t => lowerTitle.includes(t))) return 'high'
  if (mediumInfluenceTitles.some(t => lowerTitle.includes(t))) return 'medium'
  return 'low'
}

const getRecentActivity = (title: string): string => {
  const activities = [
    'Recently posted about digital transformation initiatives',
    'Attended marketing conference last month',
    'Active on LinkedIn discussing industry trends',
    'Recently hired for this role (last 90 days)',
    'Frequently shares content about marketing automation'
  ]
  return activities[Math.floor(Math.random() * activities.length)]
}

const getBestContactMethod = (title: string, email: string | null, phone: string | null): string => {
  if (!email && !phone) return 'LinkedIn outreach'
  if (email && phone) return 'Email preferred, phone as backup'
  if (email) return 'Email contact'
  if (phone) return 'Phone contact'
  return 'LinkedIn outreach'
}

const getMarketPosition = (company: any): string => {
  if (company.employeeCount > 10000) return 'enterprise-level'
  if (company.employeeCount > 1000) return 'mid-market'
  if (company.employeeCount > 100) return 'growing mid-market'
  return 'small-to-medium business'
}

const getPrimaryFocus = (company: any): string => {
  const focusMap: Record<string, string> = {
    'ADVERTISER': 'brand awareness and customer acquisition',
    'AGENCY': 'client services and campaign delivery',
    'MEDIA_COMPANY': 'audience engagement and content distribution',
    'TECH_VENDOR': 'product marketing and lead generation',
    'PUBLISHER': 'audience monetization and content marketing',
    'PRODUCTION_COMPANY': 'project marketing and industry networking'
  }
  return focusMap[company.type] || 'business growth and market expansion'
}

const getEstimatedBudget = (employeeCount: number, revenue: string): string => {
  if (employeeCount > 10000) return '$10M-$50M+'
  if (employeeCount > 1000) return '$1M-$10M'
  if (employeeCount > 500) return '$500K-$2M'
  if (employeeCount > 100) return '$100K-$500K'
  return '$50K-$200K'
}

const getBudgetTier = (employeeCount: number): string => {
  if (employeeCount > 10000) return 'tier-1'
  if (employeeCount > 1000) return 'tier-2'
  if (employeeCount > 500) return 'tier-3'
  return 'tier-4'
}

const getCompetitors = (industry: string, type: string): string[] => {
  const competitorMap: Record<string, string[]> = {
    'Digital Advertising': ['Google', 'Facebook', 'Amazon', 'The Trade Desk', 'Adobe'],
    'TV Broadcasting': ['NBCUniversal', 'Disney', 'CBS', 'Fox', 'Warner Bros Discovery'],
    'Streaming': ['Netflix', 'Disney+', 'HBO Max', 'Hulu', 'Amazon Prime'],
    'AdTech': ['Google DV360', 'The Trade Desk', 'Adobe DSP', 'Amazon DSP', 'Samsung DSP'],
    'Social Media': ['Meta', 'TikTok', 'Snapchat', 'Twitter', 'Pinterest']
  }
  return competitorMap[industry] || ['Industry leaders', 'Regional competitors', 'Emerging players']
}

const getDifferentiators = (type: string, industry: string): string[] => {
  const differentiatorMap: Record<string, string[]> = {
    'ADVERTISER': ['Brand recognition', 'Market reach', 'Customer loyalty'],
    'AGENCY': ['Creative excellence', 'Media buying power', 'Technology platform'],
    'MEDIA_COMPANY': ['Audience quality', 'Content library', 'Distribution network'],
    'TECH_VENDOR': ['Technology innovation', 'Platform capabilities', 'Data insights'],
    'PUBLISHER': ['Audience engagement', 'Content quality', 'Monetization strategy']
  }
  return differentiatorMap[type] || ['Market presence', 'Service quality', 'Innovation']
}

const getPrimaryChannels = (type: string, industry: string): string[] => {
  const channelMap: Record<string, string[]> = {
    'ADVERTISER': ['Digital Display', 'Social Media', 'Search', 'TV', 'Connected TV'],
    'AGENCY': ['Programmatic', 'Social Media', 'Search', 'Digital Video', 'Audio'],
    'MEDIA_COMPANY': ['Digital Video', 'Social Media', 'Display', 'Native', 'Podcast'],
    'TECH_VENDOR': ['Digital Display', 'Search', 'Social Media', 'Content Marketing', 'Events'],
    'PUBLISHER': ['Direct Sales', 'Programmatic', 'Social Media', 'Email', 'Native']
  }
  return channelMap[type] || ['Digital Display', 'Social Media', 'Search']
}

const getRecentCampaigns = (type: string): string[] => {
  const campaignMap: Record<string, string[]> = {
    'ADVERTISER': ['Holiday Season Campaign', 'Product Launch Campaign', 'Brand Awareness Initiative'],
    'AGENCY': ['Client Portfolio Expansion', 'Award-Winning Creative', 'New Service Launch'],
    'MEDIA_COMPANY': ['Original Content Promotion', 'Subscription Drive', 'Advertiser Package'],
    'TECH_VENDOR': ['Product Demo Series', 'Thought Leadership', 'Industry Conference'],
    'PUBLISHER': ['Premium Content Series', 'Audience Development', 'Advertiser Showcase']
  }
  return campaignMap[type] || ['Brand Campaign', 'Product Marketing', 'Awareness Drive']
}

const getAgencyPartners = (type: string): string[] => {
  const partnerMap: Record<string, string[]> = {
    'ADVERTISER': ['GroupM', 'Omnicom', 'Publicis', 'IPG', 'Havas'],
    'TECH_VENDOR': ['Specialized tech agencies', 'Performance marketing firms', 'Digital consultancies'],
    'MEDIA_COMPANY': ['Premium ad agencies', 'Brand strategy firms', 'Creative agencies']
  }
  return partnerMap[type] || ['Full-service agencies', 'Digital specialists', 'Creative boutiques']
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company with existing insights
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: {
          where: { isDecisionMaker: true },
          orderBy: { name: 'asc' },
          take: 5
        }
      }
    })
    
    // TODO: Get existing insights when schema is updated
    // const existingInsights = await prisma.companyInsight.findMany({
    //   where: { companyId: params.id },
    //   orderBy: { createdAt: 'desc' }
    // })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // For now, always generate fresh insights (will be optimized later)
    const insights = await generateCompanyInsights(company)
    
    // TODO: Store insights in database once schema is fully updated
    // For now, just generate and return fresh insights

    // Return insights with additional metadata
    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        // type: company.companyType, // TODO: Fix type inference issue
        industry: company.industry,
        employeeCount: company.employeeCount,
        revenue: company.revenue,
        headquarters: company.headquarters,
        website: company.website,
        // TODO: Add these fields once schema is updated
        // logoUrl: company.logoUrl,
        // stockSymbol: company.stockSymbol,
        // foundedYear: company.foundedYear
      },
      insights,
      // TODO: Add lastUpdated once schema is updated
      // lastUpdated: company.lastInsightUpdate,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Company insights API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params
    
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, content, sourceUrl, relevanceScore } = body

    // TODO: Enable when schema is updated
    // const insight = await prisma.companyInsight.create({
    //   data: {
    //     companyId: id,
    //     type,
    //     title,
    //     content,
    //     sourceUrl,
    //     relevanceScore: relevanceScore || 50,
    //     isAiGenerated: false
    //   }
    // })
    
    const insight = { message: 'Insight creation will be enabled once schema is updated' }

    return NextResponse.json(insight, { status: 201 })
  } catch (error) {
    console.error('Create insight error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 