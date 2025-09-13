import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { PrismaClient } from '@prisma/client';
import { 
  getCacheStats, 
  clearCache, 
  invalidateByTag, 
  invalidateByPattern,
  getCacheHealth,
  warmCache
} from '@/lib/search-cache';

const prisma = new PrismaClient();

// GET /api/admin/cache - Get cache statistics and health
export async function GET(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    // Authentication handled by middleware
    if (false) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: request.headers.get('x-user-email') || undefined },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats':
        const stats = getCacheStats();
        const health = getCacheHealth();
        
        return NextResponse.json({
          success: true,
          data: {
            stats,
            health
          },
          timestamp: new Date().toISOString(),
        });

      case 'health':
        return NextResponse.json({
          success: true,
          data: getCacheHealth(),
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache data' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cache - Manage cache operations
export async function POST(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    // Authentication handled by middleware
    if (false) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: request.headers.get('x-user-email') || undefined },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'clear':
        const clearedCount = clearCache();
        return NextResponse.json({
          success: true,
          message: `Cleared ${clearedCount} cache entries`,
          clearedCount,
          timestamp: new Date().toISOString(),
        });

      case 'invalidate_tag':
        const { tag } = params;
        if (!tag) {
          return NextResponse.json({ error: 'Tag is required' }, { status: 400 });
        }
        
        const invalidatedByTag = invalidateByTag(tag);
        return NextResponse.json({
          success: true,
          message: `Invalidated ${invalidatedByTag} cache entries for tag: ${tag}`,
          invalidatedCount: invalidatedByTag,
          tag,
          timestamp: new Date().toISOString(),
        });

      case 'invalidate_pattern':
        const { pattern } = params;
        if (!pattern) {
          return NextResponse.json({ error: 'Pattern is required' }, { status: 400 });
        }
        
        try {
          const regex = new RegExp(pattern);
          const invalidatedByPattern = invalidateByPattern(regex);
          return NextResponse.json({
            success: true,
            message: `Invalidated ${invalidatedByPattern} cache entries matching pattern: ${pattern}`,
            invalidatedCount: invalidatedByPattern,
            pattern,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return NextResponse.json({ error: 'Invalid regex pattern' }, { status: 400 });
        }

      case 'warm':
        // Define common searches to warm the cache
        const commonSearches = [
          {
            key: 'warm_ceos',
            searchFn: async () => {
              const contacts = await prisma.contact.findMany({
                where: { seniority: 'C_LEVEL' },
                include: { company: true },
                take: 50
              });
              return { contacts, total: contacts.length };
            },
            tags: ['search', 'contacts', 'ceos']
          },
          {
            key: 'warm_agencies',
            searchFn: async () => {
              const companies = await prisma.company.findMany({
                where: {
                  companyType: { in: ['INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY'] }
                },
                include: { _count: { select: { contacts: true } } },
                take: 50
              });
              return { companies, total: companies.length };
            },
            tags: ['search', 'companies', 'agencies']
          },
          {
            key: 'warm_nyc_contacts',
            searchFn: async () => {
              const contacts = await prisma.contact.findMany({
                where: {
                  company: { city: 'New York' }
                },
                include: { company: true },
                take: 50
              });
              return { contacts, total: contacts.length };
            },
            tags: ['search', 'contacts', 'location']
          }
        ];

        const warmedCount = await warmCache(commonSearches);
        return NextResponse.json({
          success: true,
          message: `Warmed cache with ${warmedCount} entries`,
          warmedCount,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cache management error:', error);
    return NextResponse.json(
      { error: 'Failed to manage cache' },
      { status: 500 }
    );
  }
}