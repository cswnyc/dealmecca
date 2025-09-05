import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getPerformanceMonitor } from '@/lib/performance-monitor'
import { trackMemoryUsage } from '@/middleware/performance'
import { cachedSearch, generateCacheKey, invalidateByTag } from '@/lib/search-cache'
import { searchRankingEngine } from '@/lib/search-ranking'
import { searchAnalyticsEngine } from '@/lib/search-analytics'

const prisma = new PrismaClient()
const performanceMonitor = getPerformanceMonitor(prisma)

// Enhanced search interface for media seller intelligence
interface EnhancedSearchParams {
  // Text search
  q?: string
  
  // Contact filtering
  roles?: string[]           // CMO, Media Director, Brand Manager, etc.
  seniority?: string[]       // C_LEVEL, DIRECTOR, MANAGER, etc.
  department?: string[]      // MEDIA_PLANNING, MEDIA_BUYING, LEADERSHIP, etc.
  isDecisionMaker?: boolean  // Filter for decision makers
  
  // Company filtering
  companyType?: string[]     // AGENCY, BRAND, VENDOR, etc.
  industry?: string[]        // ADVERTISING, CPG_FOOD_BEVERAGE, etc.
  agencyType?: string[]      // MEDIA_HOLDING_COMPANY, INDEPENDENT_AGENCY, etc.
  employeeSize?: string[]    // Company size ranges
  
  // Geographic filtering
  city?: string[]           // New York, London, etc.
  state?: string[]          // NY, CA, etc.
  region?: string[]         // North America, Europe, etc.
  
  // Search options
  searchType?: 'contacts' | 'companies' | 'both'
  sortBy?: string
  limit?: number
  offset?: number
}

interface QuickFilter {
  id: string
  label: string
  description: string
  icon: string
  filters: Record<string, any>
  count?: number
}

// Predefined quick filters for media sellers
const MEDIA_SELLER_QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'agency_ceos',
    label: 'Agency CEOs',
    description: 'CEOs and founders at media agencies',
    icon: '👑',
    filters: {
      seniority: ['C_LEVEL'],
      companyType: ['INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY'],
      department: ['LEADERSHIP']
    }
  },
  {
    id: 'media_directors',
    label: 'Media Directors',
    description: 'Media planning and buying directors',
    icon: '🎯',
    filters: {
      department: ['MEDIA_PLANNING', 'MEDIA_BUYING'],
      seniority: ['DIRECTOR', 'SENIOR_DIRECTOR']
    }
  },
  {
    id: 'brand_cmos',
    label: 'Brand CMOs',
    description: 'Chief Marketing Officers at brand advertisers',
    icon: '🚀',
    filters: {
      department: ['LEADERSHIP'],
      seniority: ['C_LEVEL'],
      companyType: ['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER']
    }
  },
  {
    id: 'programmatic_buyers',
    label: 'Programmatic Buyers',
    description: 'Programmatic advertising specialists',
    icon: '🤖',
    filters: {
      department: ['PROGRAMMATIC', 'MEDIA_BUYING'],
      seniority: ['SPECIALIST', 'SENIOR_SPECIALIST', 'MANAGER', 'SENIOR_MANAGER']
    }
  },
  {
    id: 'nyc_media_pros',
    label: 'NYC Media Pros',
    description: 'Media professionals in New York City',
    icon: '🏙️',
    filters: {
      city: ['New York'],
      department: ['MEDIA_PLANNING', 'MEDIA_BUYING', 'PROGRAMMATIC', 'DIGITAL_MARKETING']
    }
  },
  {
    id: 'decision_makers',
    label: 'Decision Makers',
    description: 'Contacts marked as decision makers',
    icon: '💼',
    filters: {
      isDecisionMaker: true,
      seniority: ['DIRECTOR', 'SENIOR_DIRECTOR', 'VP', 'SVP', 'C_LEVEL']
    }
  }
]

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`🔍 [${requestId}] Enhanced search API - Request started`)
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Get user info for personalization
    const userId = request.headers.get('x-user-id')
    const sessionId = request.headers.get('x-session-id') || requestId
    const userLocation = request.headers.get('x-user-location')
    let parsedUserLocation: { city: string; state: string } | undefined;
    
    if (userLocation) {
      try {
        parsedUserLocation = JSON.parse(userLocation);
      } catch (e) {
        console.log(`⚠️  [${requestId}] Failed to parse user location: ${userLocation}`);
      }
    }
    
    // Parse enhanced search parameters
    const params: EnhancedSearchParams = {
      q: searchParams.get('q') || undefined,
      roles: searchParams.getAll('roles').filter(Boolean),
      seniority: searchParams.getAll('seniority').filter(Boolean),
      department: searchParams.getAll('department').filter(Boolean),
      isDecisionMaker: searchParams.get('isDecisionMaker') === 'true',
      companyType: searchParams.getAll('companyType').filter(Boolean),
      industry: searchParams.getAll('industry').filter(Boolean),
      agencyType: searchParams.getAll('agencyType').filter(Boolean),
      employeeSize: searchParams.getAll('employeeSize').filter(Boolean),
      city: searchParams.getAll('city').filter(Boolean),
      state: searchParams.getAll('state').filter(Boolean),
      region: searchParams.getAll('region').filter(Boolean),
      searchType: (searchParams.get('searchType') as 'contacts' | 'companies' | 'both') || 'both',
      sortBy: searchParams.get('sortBy') || 'relevance',
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100),
      offset: parseInt(searchParams.get('offset') || '0')
    }
    
    console.log(`📊 [${requestId}] Enhanced search parameters:`, params)
    
    // Handle quick filter application
    const quickFilterId = searchParams.get('quickFilter')
    if (quickFilterId) {
      const quickFilter = MEDIA_SELLER_QUICK_FILTERS.find(f => f.id === quickFilterId)
      if (quickFilter) {
        // Apply quick filter parameters
        Object.assign(params, quickFilter.filters)
        console.log(`⚡ [${requestId}] Applied quick filter: ${quickFilter.label}`)
      }
    }
    
    // Generate cache key for this search
    const cacheKey = generateCacheKey('enhanced_search', params, requestId)
    
    // Execute cached search
    const { result: searchResults, cached } = await cachedSearch(
      cacheKey,
      async () => {
        console.log(`🔍 [${requestId}] Executing fresh search (not cached)`)
        
        let contacts: any[] = []
        let companies: any[] = []
        let totalContacts = 0
        let totalCompanies = 0
        
        if (params.searchType === 'contacts' || params.searchType === 'both') {
          const contactResult = await searchContacts(params, requestId)
          contacts = contactResult.contacts
          totalContacts = contactResult.total
          
          // Apply intelligent ranking for contacts
          if (params.sortBy === 'relevance' && contacts.length > 0) {
            console.log(`🎯 [${requestId}] Applying intelligent ranking to ${contacts.length} contacts`)
            const rankedContacts = await searchRankingEngine.rankResults(
              contacts,
              params.q || '',
              'contact',
              {
                seniority: params.seniority,
                department: params.department,
                companyType: params.companyType,
                industry: params.industry,
                location: params.city,
                verified: undefined
              },
              userId || undefined,
              parsedUserLocation
            )
            contacts = rankedContacts.map(r => ({
              ...r.data,
              _ranking: {
                relevanceScore: r.relevanceScore,
                personalizedScore: r.personalizedScore,
                explanation: r.explanation,
                topSignals: r.rankingSignals.slice(0, 3).map(s => s.name)
              }
            }))
          }
        }
        
        if (params.searchType === 'companies' || params.searchType === 'both') {
          const companyResult = await searchCompanies(params, requestId)
          companies = companyResult.companies
          totalCompanies = companyResult.total
          
          // Apply intelligent ranking for companies
          if (params.sortBy === 'relevance' && companies.length > 0) {
            console.log(`🎯 [${requestId}] Applying intelligent ranking to ${companies.length} companies`)
            const rankedCompanies = await searchRankingEngine.rankResults(
              companies,
              params.q || '',
              'company',
              {
                companyType: params.companyType,
                industry: params.industry,
                location: params.city,
                employeeCount: params.employeeSize,
                verified: undefined
              },
              userId || undefined,
              parsedUserLocation
            )
            companies = rankedCompanies.map(r => ({
              ...r.data,
              _ranking: {
                relevanceScore: r.relevanceScore,
                personalizedScore: r.personalizedScore,
                explanation: r.explanation,
                topSignals: r.rankingSignals.slice(0, 3).map(s => s.name)
              }
            }))
          }
        }
        
        // Track search interaction for analytics
        if (params.q && params.q.length >= 2) {
          searchAnalyticsEngine.trackSearchInteraction({
            userId: userId || undefined,
            sessionId,
            query: params.q,
            searchType: params.searchType === 'both' ? 'company' : params.searchType,
            filters: {
              seniority: params.seniority,
              department: params.department,
              companyType: params.companyType,
              industry: params.industry,
              location: params.city
            },
            resultCount: totalContacts + totalCompanies,
            queryTime: Date.now() - startTime,
            clickedResults: 0, // Will be updated by frontend
            timeSpent: 0, // Will be updated by frontend
            successful: (totalContacts + totalCompanies) > 0
          }).catch(error => {
            console.warn(`⚠️  [${requestId}] Failed to track search interaction:`, error)
          })
        }
        
        return {
          contacts,
          companies,
          totalContacts,
          totalCompanies
        }
      },
      {
        ttl: 1000 * 60 * 15, // 15 minutes for search results
        tags: ['search', 'contacts', 'companies', params.searchType || 'both']
      }
    )
    
    const { contacts, companies, totalContacts, totalCompanies } = cached ? searchResults.data : searchResults
    
    // Generate available filters and stats
    const [availableFilters, stats, quickFiltersWithCounts] = await Promise.all([
      generateAvailableFilters(params),
      generateSearchStats(params),
      generateQuickFiltersWithCounts(params)
    ])
    
    const duration = Date.now() - startTime
    console.log(`✅ [${requestId}] Enhanced search completed in ${duration}ms (${cached ? 'CACHED' : 'FRESH'})`)
    
    return NextResponse.json({
      success: true,
      results: {
        contacts,
        companies,
        totalContacts,
        totalCompanies,
        totalResults: totalContacts + totalCompanies
      },
      cache: {
        cached,
        key: cacheKey.slice(0, 16) + '...'
      },
      filters: {
        applied: generateAppliedFilters(params),
        available: availableFilters
      },
      stats,
      quickFilters: quickFiltersWithCounts,
      pagination: {
        limit: params.limit,
        offset: params.offset,
        hasMore: (totalContacts + totalCompanies) > (params.offset! + params.limit!)
      },
      metadata: {
        requestId,
        duration,
        searchType: params.searchType,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ [${requestId}] Enhanced search failed after ${duration}ms:`, error)
    
    return NextResponse.json({
      success: false,
      error: 'Enhanced search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        requestId,
        duration,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

async function searchContacts(params: EnhancedSearchParams, requestId: string) {
  console.log(`👥 [${requestId}] Searching contacts with filters`)
  
  return await performanceMonitor.trackQuery(
    'searchContacts',
    async () => {
      trackMemoryUsage(`contactSearch_${requestId}`)
      
      // Build contact where clause
      const contactWhere: any = { AND: [] }
  
      // Text search across contact fields
      if (params.q && params.q.length >= 2) {
        const searchTerm = params.q.toLowerCase()
        contactWhere.AND.push({
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { fullName: { contains: searchTerm, mode: 'insensitive' } },
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        })
      }
  
      // Role/title filtering (search in title field)
      if (params.roles?.length) {
        contactWhere.AND.push({
          OR: params.roles.map(role => ({
            title: { contains: role, mode: 'insensitive' }
          }))
        })
      }
      
      // Seniority filtering
      if (params.seniority?.length) {
        contactWhere.AND.push({
          seniority: { in: params.seniority }
        })
      }
      
      // Department filtering
      if (params.department?.length) {
        contactWhere.AND.push({
          department: { in: params.department }
        })
      }
      
      // Decision maker filtering
      if (params.isDecisionMaker) {
        contactWhere.AND.push({
          isDecisionMaker: true
        })
      }
      
      // Company-based filters
      const companyWhere: any = { AND: [] }
      
      if (params.companyType?.length) {
        companyWhere.AND.push({
          companyType: { in: params.companyType }
        })
      }
      
      if (params.industry?.length) {
        companyWhere.AND.push({
          industry: { in: params.industry }
        })
      }
      
      if (params.agencyType?.length) {
        companyWhere.AND.push({
          agencyType: { in: params.agencyType }
        })
      }
      
      if (params.employeeSize?.length) {
        companyWhere.AND.push({
          employeeCount: { in: params.employeeSize }
        })
      }
      
      if (params.city?.length) {
        companyWhere.AND.push({
          city: { in: params.city }
        })
      }
      
      if (params.state?.length) {
        companyWhere.AND.push({
          state: { in: params.state }
        })
      }
      
      // Combine contact and company filters
      if (companyWhere.AND.length > 0) {
        contactWhere.AND.push({
          company: companyWhere
        })
      }
      
      // Execute contact search
      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where: contactWhere,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                companyType: true,
                industry: true,
                city: true,
                state: true,
                verified: true
              }
            }
          },
          orderBy: [
            { verified: 'desc' },
            { isDecisionMaker: 'desc' },
            { firstName: 'asc' }
          ],
          take: params.limit,
          skip: params.offset
        }),
        prisma.contact.count({ where: contactWhere })
      ])
      
      console.log(`👥 [${requestId}] Found ${total} contacts`)
      return { contacts, total }
    },
    { route: '/api/search/enhanced', userId: requestId }
  )
}

async function searchCompanies(params: EnhancedSearchParams, requestId: string) {
  console.log(`🏢 [${requestId}] Searching companies with filters`)
  
  return await performanceMonitor.trackQuery(
    'searchCompanies',
    async () => {
      trackMemoryUsage(`companySearch_${requestId}`)
      
      // Build company where clause
      const companyWhere: any = { AND: [] }
      
      // Text search across company fields
      if (params.q && params.q.length >= 2) {
        const searchTerm = params.q.toLowerCase()
        companyWhere.AND.push({
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } }
          ]
        })
      }
      
      // Company type filtering
      if (params.companyType?.length) {
        companyWhere.AND.push({
          companyType: { in: params.companyType }
        })
      }
      
      // Industry filtering
      if (params.industry?.length) {
        companyWhere.AND.push({
          industry: { in: params.industry }
        })
      }
      
      // Agency type filtering
      if (params.agencyType?.length) {
        companyWhere.AND.push({
          agencyType: { in: params.agencyType }
        })
      }
      
      // Employee size filtering
      if (params.employeeSize?.length) {
        companyWhere.AND.push({
          employeeCount: { in: params.employeeSize }
        })
      }
      
      // Location filtering
      if (params.city?.length) {
        companyWhere.AND.push({
          city: { in: params.city }
        })
      }
      
      if (params.state?.length) {
        companyWhere.AND.push({
          state: { in: params.state }
        })
      }
      
      // Execute company search
      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where: companyWhere,
          include: {
            _count: {
              select: {
                contacts: { where: { isActive: true } }
              }
            }
          },
          orderBy: [
            { verified: 'desc' },
            { name: 'asc' }
          ],
          take: params.limit,
          skip: params.offset
        }),
        prisma.company.count({ where: companyWhere })
      ])
  
      console.log(`🏢 [${requestId}] Found ${total} companies`)
      return { companies, total }
    },
    { route: '/api/search/enhanced', userId: requestId }
  )
}

async function generateAvailableFilters(params: EnhancedSearchParams) {
  // Get all unique values for each filter type
  const [departments, seniorities, companyTypes, industries, locations] = await Promise.all([
    prisma.contact.findMany({
      select: { department: true },
      distinct: ['department']
    }),
    prisma.contact.findMany({
      select: { seniority: true },
      distinct: ['seniority']
    }),
    prisma.company.findMany({
      select: { companyType: true },
      distinct: ['companyType']
    }),
    prisma.company.findMany({
      select: { industry: true },
      distinct: ['industry']
    }),
    prisma.company.findMany({
      select: { city: true, state: true },
      distinct: ['city', 'state'],
      take: 20
    })
  ])
  
  return {
    departments: departments
      .filter(d => d.department !== null)
      .map(d => ({
        value: d.department!,
        label: d.department!.replace(/_/g, ' '),
        count: 0
      })),
    seniorities: seniorities
      .filter(s => s.seniority !== null)
      .map(s => ({
        value: s.seniority!,
        label: s.seniority!.replace(/_/g, ' '),
        count: 0
      })),
    companyTypes: companyTypes
      .filter(ct => ct.companyType !== null)
      .map(ct => ({
        value: ct.companyType!,
        label: ct.companyType!.replace(/_/g, ' '),
        count: 0
      })),
    industries: industries
      .filter(i => i.industry !== null)
      .map(i => ({
        value: i.industry!,
        label: i.industry!.replace(/_/g, ' '),
        count: 0
      })),
    locations: locations
      .filter(l => l.city !== null && l.state !== null)
      .map(l => ({
        value: `${l.city}, ${l.state}`,
        label: `${l.city}, ${l.state}`,
        city: l.city!,
        state: l.state!,
        count: 0
      }))
  }
}

async function generateSearchStats(params: EnhancedSearchParams) {
  const [totalContacts, totalCompanies, cLevelContacts, agencyContacts, brandContacts] = await Promise.all([
    prisma.contact.count({ where: { isActive: true } }),
    prisma.company.count(),
    prisma.contact.count({ 
      where: { 
        seniority: 'C_LEVEL',
        isActive: true 
      } 
    }),
    prisma.contact.count({
      where: {
        company: {
          companyType: { in: ['INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY'] }
        },
        isActive: true
      }
    }),
    prisma.contact.count({
      where: {
        company: {
          companyType: { in: ['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER'] }
        },
        isActive: true
      }
    })
  ])
  
  return {
    totalContacts,
    totalCompanies,
    cLevelContacts,
    agencyContacts,
    brandContacts,
    decisionMakers: await prisma.contact.count({ 
      where: { 
        isDecisionMaker: true,
        isActive: true 
      } 
    })
  }
}

async function generateQuickFiltersWithCounts(params: EnhancedSearchParams) {
  // For now, return static quick filters
  // In production, you'd calculate actual counts for each filter
  return MEDIA_SELLER_QUICK_FILTERS.map(filter => ({
    ...filter,
    count: 0 // Placeholder - would calculate actual counts
  }))
}

function generateAppliedFilters(params: EnhancedSearchParams) {
  const applied: Array<{
    type: string
    value: string
    label: string
    count?: number
  }> = []
  
  if (params.roles?.length) {
    params.roles.forEach(role => {
      applied.push({
        type: 'role',
        value: role,
        label: role
      })
    })
  }
  
  if (params.seniority?.length) {
    params.seniority.forEach(seniority => {
      applied.push({
        type: 'seniority',
        value: seniority,
        label: seniority.replace(/_/g, ' ')
      })
    })
  }
  
  if (params.department?.length) {
    params.department.forEach(dept => {
      applied.push({
        type: 'department',
        value: dept,
        label: dept.replace(/_/g, ' ')
      })
    })
  }
  
  if (params.companyType?.length) {
    params.companyType.forEach(type => {
      applied.push({
        type: 'companyType',
        value: type,
        label: type.replace(/_/g, ' ')
      })
    })
  }
  
  if (params.industry?.length) {
    params.industry.forEach(industry => {
      applied.push({
        type: 'industry',
        value: industry,
        label: industry.replace(/_/g, ' ')
      })
    })
  }
  
  if (params.city?.length) {
    params.city.forEach(city => {
      applied.push({
        type: 'location',
        value: city,
        label: city
      })
    })
  }
  
  if (params.isDecisionMaker) {
    applied.push({
      type: 'isDecisionMaker',
      value: 'true',
      label: 'Decision Makers'
    })
  }
  
  return applied
}

// GET endpoint for filter options (used by frontend to populate dropdowns)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'getFilterOptions') {
      const availableFilters = await generateAvailableFilters({})
      const stats = await generateSearchStats({})
      
      return NextResponse.json({
        success: true,
        filters: availableFilters,
        stats,
        quickFilters: MEDIA_SELLER_QUICK_FILTERS
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
