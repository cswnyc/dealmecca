import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TopicParser } from '@/lib/forum/topic-parser';

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

export async function GET(req: NextRequest) {
  try {
    // For development - skip auth check for now
    // In production, you would implement proper Firebase Admin auth here

    // Get pending posts for moderation
    const pendingPosts = await prisma.forumPost.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        author: {
          select: {
            id: true,
            anonymousUsername: true,
            email: true,
            isAnonymous: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
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
            comments: true,
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ posts: pendingPosts });
  } catch (error) {
    console.error('Error fetching pending posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // For development - skip auth check for now
    // In production, you would implement proper Firebase Admin auth here

    const {
      postId,
      action,
      tags,
      title,
      content,
      categoryId,
      topicIds = [],
      location,
      urgency,
      dealSize,
      mediaType
    } = await req.json();

    if (!postId || !action) {
      return NextResponse.json({ error: 'Post ID and action required' }, { status: 400 });
    }

    if (!['approve', 'reject', 'edit'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get existing post
    const existingPost = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { title: true, content: true, slug: true }
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let updateData: any = {};
    let shouldParseContent = false;

    // Handle different actions
    if (action === 'edit') {
      // Update post content and metadata
      if (title && title !== existingPost.title) {
        updateData.title = title;
        // Generate new slug if title changed
        const baseSlug = title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        let slug = baseSlug;
        let counter = 1;

        // Ensure slug uniqueness
        while (true) {
          const existingSlug = await prisma.forumPost.findFirst({
            where: {
              slug: slug,
              id: { not: postId }
            }
          });

          if (!existingSlug) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        updateData.slug = slug;
      }

      if (content && content !== existingPost.content) {
        updateData.content = content;
        shouldParseContent = true;
      }

      if (categoryId) updateData.categoryId = categoryId;
      if (location) updateData.location = location;
      if (urgency) updateData.urgency = urgency;
      if (dealSize) updateData.dealSize = dealSize;
      if (mediaType) updateData.mediaType = Array.isArray(mediaType) ? mediaType.join(',') : mediaType;

      updateData.updatedAt = new Date();
    } else {
      // Approve or reject action
      updateData.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      updateData.approvedAt = action === 'approve' ? new Date() : null;
      updateData.approvedBy = 'admin'; // For development - use static admin ID
    }

    // Add admin tags if provided
    if (tags && Array.isArray(tags)) {
      updateData.tags = tags.join(', ');
    }

    // Update the post
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            anonymousUsername: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        topicMentions: {
          include: {
            topic: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    // Handle topic assignments
    if (topicIds.length > 0) {
      // Clear existing topic mentions
      await prisma.topicMention.deleteMany({
        where: { postId: postId }
      });

      // Create or find topics and create mentions
      for (let i = 0; i < topicIds.length; i++) {
        const topicIdOrName = topicIds[i];
        let topicId = topicIdOrName;

        // If it's a new topic (starts with 'new-'), create it
        if (typeof topicIdOrName === 'string' && topicIdOrName.startsWith('new-')) {
          const topicName = topicIdOrName.replace(/^new-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          const newTopic = await prisma.topic.create({
            data: {
              name: topicName,
              categoryId: categoryId || updatedPost.categoryId,
              isActive: true
            }
          });

          topicId = newTopic.id;
        }

        // Create topic mention
        await prisma.topicMention.create({
          data: {
            postId: postId,
            topicId: topicId,
            order: i
          }
        });
      }
    }

    // Handle mention parsing if content was updated
    if (shouldParseContent || content) {
      const contentToProcess = content || existingPost.content;
      const titleToProcess = title || existingPost.title;
      const allMentions = extractMentions(`${titleToProcess} ${contentToProcess}`);

      if (allMentions.length > 0) {
        // Clear existing mentions
        await Promise.all([
          prisma.forumPostCompanyMention.deleteMany({ where: { postId } }),
          prisma.forumPostContactMention.deleteMany({ where: { postId } })
        ]);

        // Create new mentions
        const companyMentions = allMentions.filter(m => m.type === 'company');
        const contactMentions = allMentions.filter(m => m.type === 'contact');

        if (companyMentions.length > 0) {
          await prisma.forumPostCompanyMention.createMany({
            data: companyMentions.map(mention => ({
              postId: postId,
              companyId: mention.id
            })),
            skipDuplicates: true
          });
        }

        if (contactMentions.length > 0) {
          await prisma.forumPostContactMention.createMany({
            data: contactMentions.map(mention => ({
              postId: postId,
              contactId: mention.id
            })),
            skipDuplicates: true
          });
        }
      }

      // Auto-parse content for additional topics if none were manually assigned
      if (topicIds.length === 0) {
        try {
          const parsedContent = TopicParser.parseContentIntoTopics(contentToProcess);

          // Create topic mentions from parsed content
          for (let groupIndex = 0; groupIndex < parsedContent.topics.length; groupIndex++) {
            const topicGroup = parsedContent.topics[groupIndex];

            for (let topicIndex = 0; topicIndex < topicGroup.topics.length && topicIndex < 3; topicIndex++) {
              const topicName = topicGroup.topics[topicIndex];

              // Try to find existing topic
              let topic = await prisma.topic.findFirst({
                where: {
                  name: { contains: topicName, mode: 'insensitive' },
                  isActive: true
                }
              });

              // Create new topic if not found
              if (!topic) {
                topic = await prisma.topic.create({
                  data: {
                    name: topicName,
                    categoryId: categoryId || updatedPost.categoryId,
                    isActive: true
                  }
                });
              }

              // Create topic mention
              await prisma.topicMention.create({
                data: {
                  postId: postId,
                  topicId: topic.id,
                  order: (groupIndex * 10) + topicIndex
                }
              });
            }
          }
        } catch (parseError) {
          console.warn('Failed to auto-parse topics:', parseError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: action === 'edit'
        ? 'Post updated successfully'
        : `Post ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error moderating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}