import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.tier !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, postIds } = await request.json();

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: 'No posts selected' }, { status: 400 });
    }

    let updateData: any = { updatedAt: new Date() };
    let result;

    switch (action) {
      case 'pin':
        updateData.isPinned = true;
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: updateData
        });
        break;

      case 'unpin':
        updateData.isPinned = false;
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: updateData
        });
        break;

      case 'feature':
        updateData.isFeatured = true;
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: updateData
        });
        break;

      case 'unfeature':
        updateData.isFeatured = false;
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: updateData
        });
        break;

      case 'lock':
        updateData.isLocked = true;
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: updateData
        });
        break;

      case 'unlock':
        updateData.isLocked = false;
        result = await prisma.forumPost.updateMany({
          where: { id: { in: postIds } },
          data: updateData
        });
        break;

      case 'delete':
        // Delete associated data first
        await prisma.forumComment.deleteMany({
          where: { postId: { in: postIds } }
        });
        await prisma.forumVote.deleteMany({
          where: { postId: { in: postIds } }
        });
        await prisma.forumBookmark.deleteMany({
          where: { postId: { in: postIds } }
        });
        await prisma.companyMention.deleteMany({
          where: { postId: { in: postIds } }
        });
        await prisma.contactMention.deleteMany({
          where: { postId: { in: postIds } }
        });
        
        // Delete the posts
        result = await prisma.forumPost.deleteMany({
          where: { id: { in: postIds } }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ${action}ed ${result.count} posts`,
      count: result.count 
    });

  } catch (error) {
    console.error('Bulk action failed:', error);
    return NextResponse.json(
      { error: 'Bulk action failed' },
      { status: 500 }
    );
  }
}