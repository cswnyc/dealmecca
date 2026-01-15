import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/requireAdmin';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const { action, postIds } = body;

    if (!action || !postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and postIds are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'publish':
        updateData = { status: 'PUBLISHED' };
        break;
      case 'unpublish':
        updateData = { status: 'DRAFT' };
        break;
      case 'flag':
        updateData = { status: 'FLAGGED' };
        break;
      case 'feature':
        updateData = { isFeatured: true };
        break;
      case 'unfeature':
        updateData = { isFeatured: false };
        break;
      case 'pin':
        updateData = { isPinned: true };
        break;
      case 'unpin':
        updateData = { isPinned: false };
        break;
      case 'lock':
        updateData = { isLocked: true };
        break;
      case 'unlock':
        updateData = { isLocked: false };
        break;
      case 'delete':
        // Delete the posts
        await prisma.forumPost.deleteMany({
          where: {
            id: { in: postIds }
          }
        });
        return NextResponse.json({
          message: `${postIds.length} posts deleted successfully`
        });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update the posts
    const result = await prisma.forumPost.updateMany({
      where: {
        id: { in: postIds }
      },
      data: updateData
    });

    return NextResponse.json({
      message: `${result.count} posts updated with ${action} action`,
      count: result.count
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}