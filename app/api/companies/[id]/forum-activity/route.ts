import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get posts where this company was mentioned
    const mentionedPosts = await prisma.forumPost.findMany({
      where: {
        companyMentions: {
          some: {
            companyId: companyId
          }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get posts from employees of this company
    const employeePosts = await prisma.forumPost.findMany({
      where: {
        author: {
          companyId: companyId
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Combine and deduplicate posts, determining relationship type
    const postMap = new Map();
    
    // Add mentioned posts
    mentionedPosts.forEach((post: any) => {
      postMap.set(post.id, {
        ...post,
        relationshipType: 'MENTIONED'
      });
    });

    // Add employee posts (and update relationship type if already mentioned)
    employeePosts.forEach((post: any) => {
      if (postMap.has(post.id)) {
        // Post exists (was mentioned), update to BOTH
        postMap.set(post.id, {
          ...postMap.get(post.id),
          relationshipType: 'BOTH'
        });
      } else {
        // New employee post
        postMap.set(post.id, {
          ...post,
          relationshipType: 'EMPLOYEE_POST'
        });
      }
    });

    // Convert to array and sort by creation date
    const allActivities = Array.from(postMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return NextResponse.json({
      activities: allActivities,
      total: postMap.size
    });
  } catch (error) {
    console.error('Failed to fetch company forum activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum activity' },
      { status: 500 }
    );
  }
} 