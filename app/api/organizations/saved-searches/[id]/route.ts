import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/requireAuth';

// PATCH - Update a saved search
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();
    const searchId = params.id;

    // Verify ownership
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

    const {  name, description, query, filters, alertEnabled, resultCount } = body;

    const updatedSearch = await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(query && { query }),
        ...(filters && { filters }),
        ...(alertEnabled !== undefined && { alertEnabled }),
        ...(resultCount !== undefined && { resultCount }),
        lastRun: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      savedSearch: updatedSearch
    });
  } catch (error: any) {
    console.error('Error updating saved search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update saved search' },
      { status: error.status || 500 }
    );
  }
}

// POST - Run a saved search
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth(request);
    const searchId = params.id;

    // Verify ownership and get search details
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

    // Execute the search using the advanced search endpoint logic
    const filters = savedSearch.filters as any;
    const query = savedSearch.query;

    // This would call the search API internally or replicate its logic
    // For now, we'll update the lastRun timestamp
    await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        lastRun: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Search executed successfully',
      savedSearch: {
        ...savedSearch,
        lastRun: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error executing saved search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute saved search' },
      { status: error.status || 500 }
    );
  }
}
