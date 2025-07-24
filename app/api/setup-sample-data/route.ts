import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Check if companies already exist
    const existingCompanies = await prisma.company.count()
    
    if (existingCompanies > 0) {
      return NextResponse.json({
        message: `${existingCompanies} companies already exist in database`,
        existingCount: existingCompanies
      })
    }
    
    // Sample company data with correct enum values
    const sampleCompanies = [
      {
        name: 'WPP Group',
        slug: 'wpp-group',
        companyType: 'HOLDING_COMPANY_AGENCY' as const,
        industry: 'ENTERTAINMENT_MEDIA' as const,
        city: 'New York',
        state: 'NY',
        country: 'US',
        verified: true,
        description: 'Global communications services company'
      },
      {
        name: 'Omnicom Group',
        slug: 'omnicom-group',
        companyType: 'HOLDING_COMPANY_AGENCY' as const, 
        industry: 'ENTERTAINMENT_MEDIA' as const,
        city: 'New York',
        state: 'NY',
        country: 'US',
        verified: true,
        description: 'Strategic marketing and communications company'
      },
      {
        name: 'Publicis Groupe',
        slug: 'publicis-groupe',
        companyType: 'HOLDING_COMPANY_AGENCY' as const,
        industry: 'ENTERTAINMENT_MEDIA' as const, 
        city: 'New York',
        state: 'NY',
        country: 'US',
        verified: true,
        description: 'Global marketing and communications company'
      },
      {
        name: 'GroupM',
        slug: 'groupm',
        companyType: 'INDEPENDENT_AGENCY' as const,
        industry: 'ENTERTAINMENT_MEDIA' as const,
        city: 'New York', 
        state: 'NY',
        country: 'US',
        verified: true,
        description: 'Media investment management company'
      },
      {
        name: 'Mindshare',
        slug: 'mindshare',
        companyType: 'INDEPENDENT_AGENCY' as const,
        industry: 'ENTERTAINMENT_MEDIA' as const,
        city: 'New York',
        state: 'NY', 
        country: 'US',
        verified: true,
        description: 'Global media agency network'
      },
      {
        name: 'Disney',
        slug: 'disney',
        companyType: 'ADVERTISER' as const,
        industry: 'ENTERTAINMENT_MEDIA' as const,
        city: 'Burbank',
        state: 'CA',
        country: 'US', 
        verified: true,
        description: 'Entertainment and media company'
      },
      {
        name: 'Netflix',
        slug: 'netflix',
        companyType: 'ADVERTISER' as const,
        industry: 'ENTERTAINMENT_MEDIA' as const,
        city: 'Los Gatos',
        state: 'CA',
        country: 'US',
        verified: true,
        description: 'Streaming entertainment company'
      },
      {
        name: 'Meta',
        slug: 'meta',
        companyType: 'ADTECH_VENDOR' as const,
        industry: 'TECHNOLOGY' as const,
        city: 'Menlo Park',
        state: 'CA', 
        country: 'US',
        verified: true,
        description: 'Social media and technology company'
      },
      {
        name: 'Google',
        slug: 'google',
        companyType: 'ADTECH_VENDOR' as const,
        industry: 'TECHNOLOGY' as const,
        city: 'Mountain View',
        state: 'CA',
        country: 'US',
        verified: true,
        description: 'Technology and advertising company'
      },
      {
        name: 'Amazon DSP',
        slug: 'amazon-dsp',
        companyType: 'ADTECH_VENDOR' as const, 
        industry: 'TECHNOLOGY' as const,
        city: 'Seattle',
        state: 'WA',
        country: 'US',
        verified: true,
        description: 'Demand-side advertising platform'
      }
    ]
    
    // Create companies
    const createdCompanies = await prisma.company.createMany({
      data: sampleCompanies
    })
    
    // Get the created companies count
    const totalCompanies = await prisma.company.count()
    
    return NextResponse.json({
      message: 'Sample companies created successfully',
      created: createdCompanies.count,
      total: totalCompanies,
      companies: sampleCompanies.map(c => c.name)
    })
  } catch (error) {
    console.error('Setup sample data error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup sample data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 