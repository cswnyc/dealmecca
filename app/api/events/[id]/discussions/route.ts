import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch forum discussions linked to this event
    const discussions = await prisma.forumPost.findMany({
      where: {
        eventId: eventId
      },
      take: limit,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                name: true,
                logoUrl: true
              }
            }
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return NextResponse.json({
      discussions,
      total: discussions.length
    });
  } catch (error) {
    console.error('Failed to fetch event discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
} 