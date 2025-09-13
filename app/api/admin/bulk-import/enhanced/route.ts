import { NextRequest, NextResponse } from 'next/server'
import { processBulkImport, ImportData } from '@/lib/bulk-import/enhanced-processor'

export async function POST(request: NextRequest) {
  
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  if (!userId || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Process the bulk import with enhanced duplicate handling
    const results = await processBulkImport(data as ImportData[])

    return NextResponse.json({
      success: true,
      message: 'Enhanced bulk import completed successfully',
      results,
      summary: {
        totalRecords: data.length,
        successRate: Math.round(((results.companiesCreated + results.companiesUpdated + results.contactsCreated + results.contactsUpdated) / (data.length * 2)) * 100),
        duplicatesHandled: results.duplicatesFound,
        dataMerged: results.merged
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
