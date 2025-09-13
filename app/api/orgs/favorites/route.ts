import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, targetType, action } = await request.json();

    if (!targetId || !targetType || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: targetId, targetType, action' },
        { status: 400 }
      );
    }

    if (!['company', 'contact'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid targetType. Must be "company" or "contact"' },
        { status: 400 }
      );
    }

    if (!['favorite', 'unfavorite'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "favorite" or "unfavorite"' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id');

    if (action === 'favorite') {
      // Create favorite relationship
      const favoriteData = {
        followerId: userId,
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      };

      // Check if already favorited to avoid duplicates
      const existingFavorite = await prisma.userConnection.findFirst({
        where: {
          ...favoriteData,
          connectionType: 'FAVORITE'
        }
      });

      if (existingFavorite) {
        return NextResponse.json(
          { message: 'Already favorited this ' + targetType },
          { status: 200 }
        );
      }

      await prisma.userConnection.create({
        data: {
          ...favoriteData,
          connectionType: 'FAVORITE',
          createdAt: new Date()
        }
      });

    } else {
      // Remove favorite relationship
      const whereClause = {
        followerId: userId,
        connectionType: 'FAVORITE',
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      };

      await prisma.userConnection.deleteMany({
        where: whereClause
      });
    }

    // Check if current user has favorited
    const isFavorite = await prisma.userConnection.findFirst({
      where: {
        followerId: userId,
        connectionType: 'FAVORITE',
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      }
    });

    return NextResponse.json({
      success: true,
      action,
      targetType,
      targetId,
      isFavorite: !!isFavorite
    });

  } catch (error) {
    console.error('Favorite action error:', error);
    return NextResponse.json(
      { error: 'Failed to process favorite action' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    const listFavorites = searchParams.get('list') === 'true';

    if (listFavorites) {
      // Return user's favorites list
      const favorites = await prisma.userConnection.findMany({
        where: {
          followerId: request.headers.get('x-user-id'),
          connectionType: 'FAVORITE'
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              location: true,
              city: true,
              state: true,
              industry: true,
              companyType: true,
              _count: {
                select: { contacts: true }
              }
            }
          },
          contact: {
            select: {
              id: true,
              fullName: true,
              title: true,
              email: true,
              phone: true,
              avatarUrl: true,
              department: true,
              seniority: true,
              company: {
                select: {
                  name: true,
                  logoUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        favorites: favorites.map(f => ({
          id: f.id,
          type: f.companyId ? 'company' : 'contact',
          target: f.companyId ? f.company : f.contact,
          createdAt: f.createdAt
        }))
      });
    }

    if (!targetId || !targetType) {
      return NextResponse.json(
        { error: 'Missing targetId or targetType' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id');

    // Get favorite status
    const isFavorite = await prisma.userConnection.findFirst({
      where: {
        followerId: userId,
        connectionType: 'FAVORITE',
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      }
    });

    return NextResponse.json({
      targetId,
      targetType,
      isFavorite: !!isFavorite
    });

  } catch (error) {
    console.error('Favorite status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}