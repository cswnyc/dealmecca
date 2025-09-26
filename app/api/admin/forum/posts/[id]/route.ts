import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Mention {
  type: 'company' | 'contact' | 'category' | 'user';
  id: string;
  name: string;
}

function extractMentions(text: string): Mention[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g;
  const mentions: Mention[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const [, name, type, id] = match;
    mentions.push({
      type: type as Mention['type'],
      id,
      name
    });
  }

  return mentions;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.ForumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            icon: true
          }
        },
        topicMentions: {
          include: {
            topic: {
              select: {
                id: true,
                name: true,
                description: true,
                context: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        companyMentions: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        contactMentions: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true
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

    if (!post) {
      return NextResponse.json(
        { error: 'Forum post not found' },
        { status: 404 }
      );
    }

    // Transform data to match frontend expectations
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
      authorId: post.authorId,
      categoryId: post.categoryId,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      views: post.views || 0,
      isFeatured: post.isFeatured || false,
      isLocked: post.isLocked || false,
      isPinned: post.isPinned || false,
      isAnonymous: post.isAnonymous || false,
      anonymousHandle: post.anonymousHandle,
      urgency: post.urgency,
      dealSize: post.dealSize,
      location: post.location,
      mediaType: post.mediaType,
      bookmarks: post.bookmarks || 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      lastActivityAt: post.lastActivityAt?.toISOString(),
      author: post.author,
      category: post.category,
      topicMentions: post.topicMentions,
      companyMentions: post.companyMentions,
      contactMentions: post.contactMentions,
      _count: post._count
    };

    return NextResponse.json(formattedPost);

  } catch (error) {
    console.error('Error fetching forum post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      content,
      categoryId,
      isFeatured = false,
      isPinned = false,
      isLocked = false,
      isAnonymous = false,
      anonymousHandle,
      location,
      status,
      approvedBy,
      topicIds = []
    } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get existing post
    const existingPost = await prisma.ForumPost.findUnique({
      where: { id },
      select: { title: true, slug: true }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Forum post not found' },
        { status: 404 }
      );
    }

    // Parse mentions from content only (title is not being updated)
    const contentMentions = extractMentions(content);
    const allMentions = [...contentMentions];

    // Update the post (keeping existing title and slug)
    const updatedPost = await prisma.ForumPost.update({
      where: { id },
      data: {
        content,
        categoryId,
        isFeatured,
        isPinned,
        isLocked,
        isAnonymous,
        anonymousHandle,
        location,
        updatedAt: new Date(),
        ...(status && { status }),
        ...(status === 'APPROVED' && approvedBy && {
          approvedAt: new Date(),
          approvedBy
        })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    // Handle topic assignments
    if (topicIds.length > 0) {
      // Clear existing topic mentions
      await prisma.TopicMention.deleteMany({
        where: { postId: id }
      });

      // Create or find topics and create mentions
      for (let i = 0; i < topicIds.length; i++) {
        const topicIdOrName = topicIds[i];
        let topicId = topicIdOrName;

        // If it's a new topic (starts with 'new-', 'manual-', or 'entity-'), create it
        if (typeof topicIdOrName === 'string' && (topicIdOrName.startsWith('new-') || topicIdOrName.startsWith('manual-') || topicIdOrName.startsWith('entity-'))) {
          let topicName: string;

          if (topicIdOrName.startsWith('entity-')) {
            // For entity-based topics, extract the name from database entity
            const parts = topicIdOrName.split('-');
            const entityType = parts[1]; // company, contact, etc.
            const entityId = parts[2];

            try {
              if (entityType === 'company') {
                const company = await prisma.Company.findUnique({ where: { id: entityId }, select: { name: true } });
                topicName = company?.name || 'Unknown Company';
              } else if (entityType === 'contact') {
                const contact = await prisma.Contact.findUnique({
                  where: { id: entityId },
                  select: { firstName: true, lastName: true }
                });
                topicName = contact ? `${contact.firstName} ${contact.lastName}`.trim() : 'Unknown Contact';
              } else if (entityType === 'topic') {
                // Use existing topic - skip creation
                topicId = entityId;
                continue;
              } else {
                // For categories and other types, try to find the name
                topicName = topicIdOrName.replace(/^entity-[^-]+-/, '').replace(/-/g, ' ');
              }
            } catch (error) {
              console.error(`Failed to fetch entity ${entityType}:${entityId}:`, error);
              topicName = topicIdOrName.replace(/^entity-[^-]+-/, '').replace(/-/g, ' ');
            }
          } else {
            // Handle new- and manual- prefixes
            topicName = topicIdOrName
              .replace(/^(new-|manual-)/, '')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
          }

          try {
            const newTopic = await prisma.Topic.create({
              data: {
                name: topicName,
                categoryId: categoryId || updatedPost.categoryId,
                isActive: true
              }
            });

            topicId = newTopic.id;
          } catch (error) {
            console.error(`Failed to create topic "${topicName}":`, error);
            continue;
          }
        }

        // Create topic mention
        try {
          await prisma.TopicMention.create({
            data: {
              postId: id,
              topicId: topicId,
              order: i
            }
          });
        } catch (error) {
          console.error(`Failed to create topic mention for "${topicId}":`, error);
        }
      }
    }

    // TODO: Handle mention relationships - currently disabled due to model complexity
    // The mention system requires mentionedBy (user ID) which we don't have in admin context
    // This should be implemented when user authentication is added to admin routes
    if (allMentions.length > 0) {
      console.log(`Found ${allMentions.length} mentions but skipping creation - requires user context`);
    }

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error('Error updating forum post:', error);
    return NextResponse.json(
      { error: 'Failed to update forum post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.ForumPost.findUnique({
      where: { id }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Forum post not found' },
        { status: 404 }
      );
    }

    await prisma.ForumPost.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Forum post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json(
      { error: 'Failed to delete forum post' },
      { status: 500 }
    );
  }
}