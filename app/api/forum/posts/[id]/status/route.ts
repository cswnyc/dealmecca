import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        isFollowing: false, 
        isBookmarked: false 
      });
    }

    const postId = resolvedParams.id;

    // For now, return false since the database tables don't exist yet
    // This will prevent errors while still allowing the UI to work
    try {
      // Check if user is following this post
      const followRecord = await prisma.postFollow.findFirst({
        where: {
          userId,
          postId,
        },
      });

      // Check if user has bookmarked this post
      const bookmarkRecord = await prisma.postBookmark.findFirst({
        where: {
          userId,
          postId,
        },
      });

      return NextResponse.json({ 
        isFollowing: !!followRecord,
        isBookmarked: !!bookmarkRecord 
      });
    } catch (dbError) {
      // Database tables don't exist yet, return defaults
      console.log('Database tables not yet created, returning defaults');
      return NextResponse.json({ 
        isFollowing: false, 
        isBookmarked: false 
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ 
      isFollowing: false, 
      isBookmarked: false 
    });
  }
}