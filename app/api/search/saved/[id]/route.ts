import { NextRequest, NextResponse } from 'next/server';
import { savedSearchManager } from '@/lib/saved-search';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const UpdateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  query: z.string().min(1).max(500).optional(),
  filters: z.record(z.any()).optional(),
  alertEnabled: z.boolean().optional(),
  alertFrequency: z.enum(['instant', 'daily', 'weekly', 'monthly']).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const searchId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's saved searches to check if they own this one
    const { searches } = await savedSearchManager.getUserSavedSearches(userId, {
      limit: 1000 // Get all to find the specific one
    });

    const savedSearch = searches.find(s => s.id === searchId);

    if (!savedSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(savedSearch);

  } catch (error) {
    logger.error('search', 'Failed to get saved search', {
      searchId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Failed to retrieve saved search' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    const searchId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = UpdateSavedSearchSchema.parse(body);

    // Update saved search
    const updatedSearch = await savedSearchManager.updateSavedSearch(
      searchId,
      userId,
      validatedData
    );

    logger.info('search', 'Saved search updated', {
      userId,
      searchId,
      updatedFields: Object.keys(validatedData),
      duration: Date.now() - startTime
    });

    return NextResponse.json(updatedSearch);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    logger.error('search', 'Failed to update saved search', {
      searchId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to update saved search' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    const searchId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await savedSearchManager.deleteSavedSearch(searchId, userId);

    logger.info('search', 'Saved search deleted', {
      userId,
      searchId,
      duration: Date.now() - startTime
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('search', 'Failed to delete saved search', {
      searchId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    );
  }
}