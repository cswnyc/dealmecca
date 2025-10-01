import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🔍 Finding all PENDING posts...');

    const pendingPosts = await prisma.forumPost.findMany({
      where: {
        status: 'PENDING'
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${pendingPosts.length} PENDING posts`);

    if (pendingPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending posts to approve',
        count: 0
      });
    }

    console.log('✅ Approving all pending posts...');

    const result = await prisma.forumPost.updateMany({
      where: {
        status: 'PENDING'
      },
      data: {
        status: 'APPROVED'
      }
    });

    console.log(`🎉 Successfully approved ${result.count} posts!`);

    return NextResponse.json({
      success: true,
      message: `Successfully approved ${result.count} posts`,
      count: result.count,
      posts: pendingPosts
    });

  } catch (error) {
    console.error('❌ Error approving posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
