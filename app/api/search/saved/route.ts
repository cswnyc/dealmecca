import { NextRequest, NextResponse } from 'next/server';
import { savedSearchManager } from '@/lib/saved-search';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schemas
const CreateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  query: z.string().min(1).max(500),
  searchType: z.enum(['company', 'contact']),
  filters: z.record(z.any()),
  alertEnabled: z.boolean().optional(),
  alertFrequency: z.enum(['instant', 'daily', 'weekly', 'monthly']).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional()
});

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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') as 'name' | 'createdAt' | 'lastRunAt' | 'resultCount' || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const tags = searchParams.getAll('tags');

    const result = await savedSearchManager.getUserSavedSearches(userId, {
      includeInactive,
      limit: Math.min(limit, 100), // Cap at 100
      offset,
      sortBy,
      sortOrder,
      tags: tags.length > 0 ? tags : undefined
    });

    logger.info('search', 'User saved searches retrieved', {
      userId,
      count: result.searches.length,
      total: result.total,
      duration: Date.now() - startTime
    });

    return NextResponse.json(result);

  } catch (error) {
    logger.error('search', 'Failed to get user saved searches', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to retrieve saved searches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = CreateSavedSearchSchema.parse(body);

    // Create saved search
    const savedSearch = await savedSearchManager.createSavedSearch({
      userId,
      ...validatedData
    });

    logger.info('search', 'Saved search created', {
      userId,
      searchId: savedSearch.id,
      searchName: savedSearch.name,
      alertEnabled: savedSearch.alertEnabled,
      duration: Date.now() - startTime
    });

    return NextResponse.json(savedSearch, { status: 201 });

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

    logger.error('search', 'Failed to create saved search', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    );
  }
}