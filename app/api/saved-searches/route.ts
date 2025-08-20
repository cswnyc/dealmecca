import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List all saved searches for user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      orderBy: [
        { lastRun: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      savedSearches
    })

  } catch (error) {
    console.error('Failed to fetch saved searches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    )
  }
}

// POST - Create new saved search
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, query, filters, alertEnabled } = body

    // Validate required fields
    if (!name || !filters) {
      return NextResponse.json(
        { error: 'Name and filters are required' },
        { status: 400 }
      )
    }

    // Check if name already exists for this user
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        userId: session.user.id,
        name,
        isActive: true
      }
    })

    if (existingSearch) {
      return NextResponse.json(
        { error: 'A saved search with this name already exists' },
        { status: 409 }
      )
    }

    // Execute the search to get result count
    let resultCount = null
    try {
      // Here you would run the actual search with the filters
      // For now, we'll set it to null and update it later
      resultCount = 0
    } catch (searchError) {
      console.warn('Failed to get initial result count:', searchError)
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        description,
        query: query || '',
        filters: filters,
        alertEnabled: alertEnabled || false,
        resultCount,
        lastRun: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      savedSearch,
      message: 'Saved search created successfully'
    })

  } catch (error) {
    console.error('Failed to create saved search:', error)
    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    )
  }
}

// PUT - Update saved search
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, description, query, filters, alertEnabled, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      )
    }

    // Check for name conflicts if name is being changed
    if (name && name !== existingSearch.name) {
      const nameConflict = await prisma.savedSearch.findFirst({
        where: {
          userId: session.user.id,
          name,
          isActive: true,
          id: { not: id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A saved search with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(query !== undefined && { query }),
        ...(filters && { filters }),
        ...(alertEnabled !== undefined && { alertEnabled }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      savedSearch: updatedSearch,
      message: 'Saved search updated successfully'
    })

  } catch (error) {
    console.error('Failed to update saved search:', error)
    return NextResponse.json(
      { error: 'Failed to update saved search' },
      { status: 500 }
    )
  }
}

// DELETE - Delete saved search
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.savedSearch.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Saved search deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete saved search:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    )
  }
}