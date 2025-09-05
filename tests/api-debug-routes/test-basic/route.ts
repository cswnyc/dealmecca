import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {} as any
  }

  // Test 1: Environment Variables
  try {
    results.tests.envVars = {
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
      status: 'success'
    }
  } catch (error) {
    results.tests.envVars = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 2: Database Connection
  try {
    await prisma.$queryRaw`SELECT 1 as test`
    results.tests.database = {
      connected: true,
      status: 'success'
    }
  } catch (error) {
    results.tests.database = {
      connected: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 3: Database Tables
  try {
    const userCount = await prisma.user.count()
    const companyCount = await prisma.company.count()
    
    results.tests.databaseData = {
      userCount,
      companyCount,
      status: 'success'
    }
  } catch (error) {
    results.tests.databaseData = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 4: Sample Companies (No Auth Required)
  try {
    const companies = await prisma.company.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        industry: true,
        verified: true
      }
    })
    
    results.tests.sampleCompanies = {
      count: companies.length,
      companies: companies,
      status: 'success'
    }
  } catch (error) {
    results.tests.sampleCompanies = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 5: Test User Exists
  try {
    const testUser = await prisma.user.findUnique({
      where: { email: 'pro@dealmecca.pro' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true
      }
    })
    
    results.tests.testUser = {
      exists: !!testUser,
      user: testUser,
      status: 'success'
    }
  } catch (error) {
    results.tests.testUser = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  return NextResponse.json(results)
} 