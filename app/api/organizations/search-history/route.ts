import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/requireAuth';
import { nanoid } from 'nanoid';

// GET - Fetch search history for the user
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const searchHistory = await prisma.search.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      searchHistory
    });
  } catch (error: any) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch search history' },
      { status: error.status || 500 }
    );
  }
}

// POST - Log a new search
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();

    const { query, resultsCount, searchType, companyId } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const search = await prisma.search.create({
      data: {
        id: nanoid(),
        userId: user.id,
        query,
        resultsCount: resultsCount || 0,
        searchType,
        companyId
      }
    });

    return NextResponse.json({
      success: true,
      search
    });
  } catch (error: any) {
    console.error('Error logging search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log search' },
      { status: error.status || 500 }
    );
  }
}

// DELETE - Clear search history
export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);

    await prisma.search.deleteMany({
      where: {
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Search history cleared successfully'
    });
  } catch (error: any) {
    console.error('Error clearing search history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear search history' },
      { status: error.status || 500 }
    );
  }
}
