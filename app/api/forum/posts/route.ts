import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { authOptions } from '@/lib/auth';
import { notifyCompanyMention, notifyContactMention } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const companyId = searchParams.get('company');
    const eventId = searchParams.get('event');
    const authorId = searchParams.get('authorId');
    const categoryId = searchParams.get('categoryId');
    const searchQuery = searchParams.get('q');
    const sortBy = searchParams.get('sort') || 'latest';

    // Build where clause for filtering
    const where: any = {};
    
    if (companyId) {
      where.OR = [
        // Posts from company employees
        {
          author: {
            companyId: companyId
          }
        },
        // Posts mentioning the company
        {
          companyMentions: {
            some: {
              companyId: companyId
            }
          }
        }
      ];
    }
    
    if (eventId) {
      where.eventId = eventId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (searchQuery) {
      const searchConditions = [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        }
      ];

      if (where.OR) {
        // If there are existing OR conditions, combine them properly
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // Fetch forum posts with author company information
    const posts = await prisma.forumPost.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        { isPinned: 'desc' },
        ...(sortBy === 'popular' ? [{ upvotes: 'desc' as const }] :
           sortBy === 'comments' ? [{ _count: { comments: 'desc' as const } }] :
           sortBy === 'trending' ? [{ views: 'desc' as const }] :
           [{ createdAt: 'desc' as const }])
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true,
                companyType: true,
                industry: true,
                city: true,
                state: true
              }
            }
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
        companyMentions: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true,
                companyType: true
              }
            }
          }
        },
        contactMentions: {
          include: {
            contact: {
              select: {
                id: true,
                fullName: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true
                  }
                }
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

    // Get total count for pagination
    const total = await prisma.forumPost.count({ where });
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Failed to fetch forum posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      categoryId,
      tags,
      isAnonymous,
      urgency,
      dealSize,
      location,
      mediaType,
      eventId,
      mentions,
      postType,
      listItems,
      pollChoices,
      pollDuration,
      pollEndsAt
    } = body;

    // Validate required fields based on post type
    if (!title || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate content based on post type
    if (postType === 'post' && !content) {
      return NextResponse.json(
        { error: 'Content is required for posts' },
        { status: 400 }
      );
    }

    if (postType === 'list' && (!listItems || listItems.length === 0)) {
      return NextResponse.json(
        { error: 'At least one list item is required' },
        { status: 400 }
      );
    }

    if (postType === 'poll' && (!pollChoices || pollChoices.length < 2)) {
      return NextResponse.json(
        { error: 'At least two poll choices are required' },
        { status: 400 }
      );
    }

    // Create the forum post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content: content || '',
        categoryId,
        authorId: userId,
        tags: tags || '[]',
        isAnonymous: Boolean(isAnonymous),
        anonymousHandle: isAnonymous ? `User${Math.random().toString(36).substr(2, 6)}` : null,
        urgency: urgency || 'MEDIUM',
        dealSize: dealSize || null,
        location: location || null,
        mediaType: mediaType || '[]',
        eventId: eventId || null,
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        // Post type specific fields
        postType: postType || 'post',
        listItems: listItems || [],
        pollChoices: pollChoices || [],
        pollDuration: pollDuration || null,
        pollEndsAt: pollEndsAt ? new Date(pollEndsAt) : null
      }
    });

    // Save mentions if any
    if (mentions && (mentions.companies?.length > 0 || mentions.contacts?.length > 0)) {
      const mentionPromises = [];

      // Save company mentions
      if (mentions.companies?.length > 0) {
        for (const companyMention of mentions.companies) {
          mentionPromises.push(
            prisma.companyMention.create({
              data: {
                postId: post.id,
                companyId: companyMention.id,
                mentionedBy: userId
              }
            })
          );
        }
      }

      // Save contact mentions
      if (mentions.contacts?.length > 0) {
        for (const contactMention of mentions.contacts) {
          mentionPromises.push(
            prisma.contactMention.create({
              data: {
                postId: post.id,
                contactId: contactMention.id,
                mentionedBy: userId
              }
            })
          );
        }
      }

      // Execute all mention creations
      await Promise.all(mentionPromises);

      // Track networking activity for mentions
      const activityPromises = [];

      if (mentions.companies?.length > 0) {
        for (const companyMention of mentions.companies) {
          activityPromises.push(
            prisma.userNetworkingActivity.create({
              data: {
                userId,
                companyId: companyMention.id,
                interactionType: 'COMPANY_MENTIONED',
                metadata: JSON.stringify({
                  postId: post.id,
                  postTitle: title,
                  mentionedCompany: companyMention.name
                })
              }
            })
          );
        }
      }

      if (mentions.contacts?.length > 0) {
        for (const contactMention of mentions.contacts) {
          activityPromises.push(
            prisma.userNetworkingActivity.create({
              data: {
                userId,
                interactionType: 'CONTACT_MENTIONED',
                metadata: JSON.stringify({
                  postId: post.id,
                  postTitle: title,
                  mentionedContact: contactMention.name,
                  contactId: contactMention.id
                })
              }
            })
          );
        }
      }

      await Promise.all(activityPromises);
    }

    // Track post creation activity
    await prisma.userNetworkingActivity.create({
      data: {
        userId,
        interactionType: 'FORUM_POST_CREATED',
        metadata: JSON.stringify({
          postId: post.id,
          postTitle: title,
          categoryId,
          urgency
        })
      }
    });

    // Send notifications for mentions
    const notificationPromises = [];
    
    if (mentions?.companies?.length > 0) {
      const authorName = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });
      
      for (const companyMention of mentions.companies) {
        notificationPromises.push(
          notifyCompanyMention({
            mentionedEntityId: companyMention.id,
            mentionerUserId: userId,
            mentionerName: authorName?.name || 'Someone',
            postId: post.id,
            postTitle: title,
            entityType: 'company',
            entityName: companyMention.name
          })
        );
      }
    }
    
    if (mentions?.contacts?.length > 0) {
      const authorName = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });
      
      for (const contactMention of mentions.contacts) {
        notificationPromises.push(
          notifyContactMention({
            mentionedEntityId: contactMention.id,
            mentionerUserId: userId,
            mentionerName: authorName?.name || 'Someone',
            postId: post.id,
            postTitle: title,
            entityType: 'contact',
            entityName: contactMention.name
          })
        );
      }
    }
    
    // Send all notifications
    await Promise.all(notificationPromises);
    
    return NextResponse.json({ 
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title
      }
    });
  } catch (error) {
    console.error('Failed to create forum post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 