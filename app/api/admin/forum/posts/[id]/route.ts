import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';
import { parseMentions } from '@/lib/mention-utils';

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

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const postId = params.id;
    const {
      content,
      categoryId,
      tags,
      companyMentions,
      contactMentions,
      isPinned,
      isFeatured,
      isLocked
    } = await request.json();

    // Validate that post exists
    const existingPost = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (content !== undefined) {
      updateData.content = content;
      // Parse mentions from content if provided
      const mentions = parseMentions(content);
      // We'll handle mentions separately below
    }

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }

    if (tags !== undefined) {
      // Validate and format tags
      let validatedTags: string;
      try {
        if (typeof tags === 'string') {
          // Handle comma-separated string
          const tagArray = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
          validatedTags = JSON.stringify(tagArray);
        } else if (Array.isArray(tags)) {
          validatedTags = JSON.stringify(tags);
        } else {
          validatedTags = '[]';
        }
        updateData.tags = validatedTags;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid tags format' }, { status: 400 });
      }
    }

    if (isPinned !== undefined) {
      updateData.isPinned = Boolean(isPinned);
    }

    if (isFeatured !== undefined) {
      updateData.isFeatured = Boolean(isFeatured);
    }

    if (isLocked !== undefined) {
      updateData.isLocked = Boolean(isLocked);
    }

    // Update the post
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: updateData,
    });

    // Handle company mentions if provided
    if (companyMentions !== undefined) {
      // Delete existing company mentions
      await prisma.companyMention.deleteMany({
        where: { postId: postId }
      });

      // Add new company mentions
      if (Array.isArray(companyMentions) && companyMentions.length > 0) {
        const mentionData = companyMentions.map((mention: any) => ({
          postId: postId,
          companyId: mention.id,
          mentionedBy: request.headers.get('x-user-id')
        }));

        await prisma.companyMention.createMany({
          data: mentionData
        });
      }
    }

    // Handle contact mentions if provided
    if (contactMentions !== undefined) {
      // Delete existing contact mentions
      await prisma.contactMention.deleteMany({
        where: { postId: postId }
      });

      // Add new contact mentions
      if (Array.isArray(contactMentions) && contactMentions.length > 0) {
        const mentionData = contactMentions.map((mention: any) => ({
          postId: postId,
          contactId: mention.id,
          mentionedBy: request.headers.get('x-user-id')
        }));

        await prisma.contactMention.createMany({
          data: mentionData
        });
      }
    }

    // Fetch the updated post with all relations
    const completePost = await prisma.forumPost.findUnique({
      where: { id: postId },
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
      post: completePost 
    });

  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const postId = params.id;

    // Validate that post exists
    const existingPost = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete associated data first
    await Promise.all([
      prisma.forumComment.deleteMany({ where: { postId: postId } }),
      prisma.forumVote.deleteMany({ where: { postId: postId } }),
      prisma.forumBookmark.deleteMany({ where: { postId: postId } }),
      prisma.companyMention.deleteMany({ where: { postId: postId } }),
      prisma.contactMention.deleteMany({ where: { postId: postId } })
    ]);
    
    // Delete the post
    await prisma.forumPost.delete({
      where: { id: postId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted successfully' 
    });

  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}