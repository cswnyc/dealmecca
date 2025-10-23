import { NextRequest, NextResponse } from 'next/server'
import { getRateLimiter, BULK_IMPORT_RATE_LIMITS, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {

  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  if (!userId || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting check for enhanced import
  const rateLimiter = getRateLimiter();
  const rateLimitResult = rateLimiter.check(
    `enhanced-import:${userId}`,
    BULK_IMPORT_RATE_LIMITS.ENHANCED
  );

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { data } = await request.json()
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of import records.' },
        { status: 400 }
      )
    }

    // Validate required fields for each record
    const validationErrors: string[] = []
    data.forEach((record: any, index: number) => {
      if (!record.companyName?.trim()) {
        validationErrors.push(`Record ${index + 1}: Company name is required`)
      }
      if (!record.firstName?.trim()) {
        validationErrors.push(`Record ${index + 1}: First name is required`)
      }
      if (!record.lastName?.trim()) {
        validationErrors.push(`Record ${index + 1}: Last name is required`)
      }
      if (!record.title?.trim()) {
        validationErrors.push(`Record ${index + 1}: Title is required`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      )
    }

    // Transform flat data format into companies and contacts arrays
    const companies = new Map<string, any>();
    const contacts: any[] = [];

    // Group by company and extract contacts
    data.forEach((record: any) => {
      const companyKey = record.companyName.toLowerCase();

      // Store unique companies
      if (!companies.has(companyKey)) {
        companies.set(companyKey, {
          name: record.companyName,
          domain: record.domain,
          website: record.website,
          industry: record.industry,
          employeeCount: record.employeeCount,
          revenue: record.revenue,
          headquarters: record.headquarters,
          description: record.description,
          type: record.companyType
        });
      }

      // Store all contacts
      contacts.push({
        companyName: record.companyName,
        firstName: record.firstName,
        lastName: record.lastName,
        title: record.title,
        email: record.email,
        phone: record.phone,
        department: record.department,
        seniority: record.seniority,
        linkedinUrl: record.linkedinUrl,
        isDecisionMaker: record.isDecisionMaker
      });
    });

    // Redirect to the working import endpoint
    const importRequest = new Request(new URL('/api/admin/bulk-import/import', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId || '',
        'x-user-role': userRole || ''
      },
      body: JSON.stringify({
        companies: Array.from(companies.values()),
        contacts: contacts,
        uploadId: `enhanced_${Date.now()}`
      })
    });

    // Use dynamic import for the route handler
    const { POST: importHandler } = await import('@/app/api/admin/bulk-import/import/route');
    const response = await importHandler(importRequest as any);
    const importResults = await response.json();

    // Transform response to match enhanced format
    const results = {
      companiesCreated: importResults.results?.companiesCreated || 0,
      companiesUpdated: importResults.results?.companiesUpdated || 0,
      contactsCreated: importResults.results?.contactsCreated || 0,
      contactsUpdated: importResults.results?.contactsUpdated || 0,
      duplicatesFound: importResults.results?.companiesSkipped + importResults.results?.contactsSkipped || 0,
      merged: importResults.results?.companiesUpdated + importResults.results?.contactsUpdated || 0
    };

    return NextResponse.json({
      success: true,
      message: 'Enhanced bulk import completed successfully',
      results,
      summary: {
        totalRecords: data.length,
        successRate: importResults.results?.summary?.successRate || 0,
        duplicatesHandled: results.duplicatesFound,
        dataMerged: results.merged,
        executionTime: importResults.results?.executionTime || 0
      }
    })

  } catch (error) {
    console.error('Enhanced bulk import error:', error)
    return NextResponse.json(
      { 
        error: 'Enhanced bulk import failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to provide information about the enhanced import format
export async function GET(request: NextRequest) {
  
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  if (!userId || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    endpoint: '/api/admin/bulk-import/enhanced',
    description: 'Enhanced bulk import with intelligent duplicate detection and data merging',
    method: 'POST',
    features: [
      'Smart duplicate detection using normalized fields',
      'Intelligent data merging for existing records',
      'Company and contact processing in single request',
      'Detailed results with merge statistics',
      'Enhanced error handling and validation'
    ],
    requiredFields: [
      'companyName',
      'firstName', 
      'lastName',
      'title'
    ],
    optionalFields: [
      'domain',
      'website', 
      'industry',
      'employeeCount',
      'revenue',
      'headquarters',
      'description',
      'companyType',
      'email',
      'phone',
      'department',
      'seniority',
      'linkedinUrl',
      'isDecisionMaker'
    ],
    examplePayload: {
      data: [
        {
          companyName: "TechCorp Inc",
          domain: "techcorp.com",
          industry: "TECHNOLOGY",
          employeeCount: 500,
          firstName: "John",
          lastName: "Smith", 
          title: "Marketing Director",
          email: "john.smith@techcorp.com",
          department: "marketing",
          seniority: "director"
        }
      ]
    }
  })
}
