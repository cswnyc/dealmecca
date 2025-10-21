import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/requireAuth';
import { nanoid } from 'nanoid';

// GET - Fetch all saved searches for the user
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);

    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: {
        lastRun: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      savedSearches
    });
  } catch (error: any) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved searches' },
      { status: error.status || 500 }
    );
  }
}

// POST - Create a new saved search
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();

    const { name, description, query, filters, alertEnabled = false } = body;

    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        id: nanoid(),
        userId: user.id,
        name,
        description,
        query,
        filters: filters || {},
        alertEnabled,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      savedSearch
    });
  } catch (error: any) {
    console.error('Error creating saved search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create saved search' },
      { status: error.status || 500 }
    );
  }
}

// DELETE - Remove a saved search
export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('id');

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id: searchId,
        userId: user.id
      }
    });

    if (!savedSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Saved search deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting saved search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete saved search' },
      { status: error.status || 500 }
    );
  }
}
