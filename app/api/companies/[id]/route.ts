import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            title: true,
            email: true,
            phone: true,
            isDecisionMaker: true,
            department: true,
            seniority: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Company detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      industry,
      description,
      website,
      employeeCount,
      headquarters,
      revenue,
      parentCompany,
    } = body

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        companyType: type,
        industry,
        description,
        website,
        employeeCount,
        headquarters,
        revenue,
        parentCompany,
      },
      include: {
        contacts: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            title: true,
            isDecisionMaker: true,
            department: true,
          },
        },
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Update company error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete company and cascade delete related contacts
    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Delete company error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 