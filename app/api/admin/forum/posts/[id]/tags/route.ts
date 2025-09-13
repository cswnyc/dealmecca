import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: request.headers.get('x-user-id') },
    });

    if (user?.tier !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { tags } = await request.json();
    const postId = params.id;

    // Validate tags format
    let validatedTags: string;
    try {
      if (typeof tags === 'string') {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(tags);
          if (Array.isArray(parsed)) {
            validatedTags = JSON.stringify(parsed);
          } else {
            // Treat as comma-separated string
            validatedTags = JSON.stringify(
              tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
            );
          }
        } catch {
          // Treat as comma-separated string
          validatedTags = JSON.stringify(
            tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
          );
        }
      } else if (Array.isArray(tags)) {
        validatedTags = JSON.stringify(tags);
      } else {
        validatedTags = '[]';
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid tags format' }, { status: 400 });
    }

    // Update the post tags
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: { 
        tags: validatedTags,
        updatedAt: new Date()
      },
      include: {
        author: {
          include: {
            company: true
          }
        },
        category: true,
        companyMentions: {
          include: {
            company: true
          }
        },
        contactMentions: {
          include: {
            contact: {
              include: {
                company: true
              }
            }
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
      success: true, 
      post: updatedPost 
    });

  } catch (error) {
    console.error('Failed to update post tags:', error);
    return NextResponse.json(
      { error: 'Failed to update post tags' },
      { status: 500 }
    );
  }
}