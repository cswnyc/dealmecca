import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ForumCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            icon: true
          }
        },
        CompanyMention: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                companyType: true
              }
            }
          }
        },
        ContactMention: {
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
        TopicMention: {
          include: {
            Topic: {
              select: {
                id: true,
                name: true,
                description: true,
                context: true,
                categoryId: true,
                ForumCategory: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            ForumComment: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Fetch primary topic entity if exists
    let primaryTopic = null;
    if (post.primaryTopicId && post.primaryTopicType) {
      try {
        if (post.primaryTopicType === 'contact') {
          const contact = await prisma.contact.findUnique({
            where: { id: post.primaryTopicId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true
            }
          });
          if (contact) {
            primaryTopic = {
              id: contact.id,
              name: `${contact.firstName} ${contact.lastName}`,
              type: post.primaryTopicType,
              description: contact.title
            };
          }
        } else {
          // For companies (agency, advertiser, industry, publisher, dsp_ssp, adtech, company)
          const company = await prisma.company.findUnique({
            where: { id: post.primaryTopicId },
            select: {
              id: true,
              name: true,
              description: true
            }
          });
          if (company) {
            primaryTopic = {
              id: company.id,
              name: company.name,
              type: post.primaryTopicType,
              description: company.description
            };
          }
        }
      } catch (error) {
        console.error('Error fetching primary topic:', error);
      }
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
      tags: post.tags ? post.tags.split(', ') : [],
      urgency: post.urgency,
      dealSize: post.dealSize,
      location: post.location,
      mediaType: post.mediaType,
      bookmarks: post.bookmarks || 0,
      primaryTopicType: post.primaryTopicType,
      primaryTopicId: post.primaryTopicId,
      primaryTopic: primaryTopic,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      lastActivityAt: post.lastActivityAt?.toISOString(),
      author: post.User,
      category: post.ForumCategory,
      companyMentions: post.CompanyMention,
      contactMentions: post.ContactMention,
      topicMentions: post.TopicMention,
      _count: {
        comments: post._count.ForumComment
      }
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
      status,
      isFeatured,
      isPinned,
      isLocked,
      isAnonymous,
      anonymousHandle,
      location,
      topicIds,
      primaryTopicType,
      primaryTopicId
    } = body;

    // Process topicIds to separate companies, contacts, categories, manual topics, and regular topics
    const companyIds: string[] = [];
    const contactIds: string[] = [];
    const categoryIds: string[] = [];
    const manualTopics: string[] = [];
    const regularTopicIds: string[] = [];

    // Company-type entity prefixes (all stored in Company table)
    const companyTypePrefixes = [
      'entity-company-',
      'entity-agency-',
      'entity-advertiser-',
      'entity-industry-',
      'entity-publisher-',
      'entity-dsp_ssp-',
      'entity-adtech-'
    ];

    if (topicIds && Array.isArray(topicIds)) {
      topicIds.forEach((topicId: string) => {
        // Check if it's a company-type entity
        const companyPrefix = companyTypePrefixes.find(prefix => topicId.startsWith(prefix));
        if (companyPrefix) {
          companyIds.push(topicId.replace(companyPrefix, ''));
        } else if (topicId.startsWith('entity-contact-')) {
          contactIds.push(topicId.replace('entity-contact-', ''));
        } else if (topicId.startsWith('entity-category-')) {
          categoryIds.push(topicId.replace('entity-category-', ''));
        } else if (topicId.startsWith('manual-')) {
          manualTopics.push(topicId);
        } else if (!topicId.startsWith('entity-')) {
          // Regular topic IDs (actual Topic table records)
          regularTopicIds.push(topicId);
        }
      });
    }

    // Update the post
    const post = await prisma.forumPost.update({
      where: { id },
      data: {
        content,
        categoryId,
        status,
        isFeatured,
        isPinned,
        isLocked,
        isAnonymous,
        anonymousHandle,
        location,
        primaryTopicType: primaryTopicType || null,
        primaryTopicId: primaryTopicId || null,
        updatedAt: new Date()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ForumCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        _count: {
          select: {
            ForumComment: true
          }
        }
      }
    });

    // Delete existing mentions
    await prisma.companyMention.deleteMany({ where: { postId: id } });
    await prisma.contactMention.deleteMany({ where: { postId: id } });
    await prisma.topicMention.deleteMany({ where: { postId: id } });

    // Create new company mentions
    if (companyIds.length > 0) {
      await prisma.companyMention.createMany({
        data: companyIds.map(companyId => ({
          id: `cmg${Date.now()}${Math.random().toString(36).substring(2, 11)}`,
          postId: id,
          companyId,
          mentionedBy: post.authorId
        }))
      });
    }

    // Create new contact mentions
    if (contactIds.length > 0) {
      await prisma.contactMention.createMany({
        data: contactIds.map(contactId => ({
          id: `cmg${Date.now()}${Math.random().toString(36).substring(2, 11)}`,
          postId: id,
          contactId,
          mentionedBy: post.authorId
        }))
      });
    }

    // Handle category topics - create/reuse Topic records for categories
    const categoryTopicIds: string[] = [];
    for (const categoryId of categoryIds) {
      const category = await prisma.forumCategory.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true, slug: true }
      });
      
      if (category) {
        const topicId = `cat_${categoryId}`;
        // Upsert topic for this category
        await prisma.topic.upsert({
          where: { id: topicId },
          create: {
            id: topicId,
            name: category.name,
            description: `Category: ${category.name}`,
            context: 'category',
            categoryId: categoryId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          update: {
            name: category.name,
            description: `Category: ${category.name}`,
            updatedAt: new Date()
          }
        });
        categoryTopicIds.push(topicId);
      }
    }

    // Handle manual topics - create/reuse Topic records
    const manualTopicIds: string[] = [];
    for (const manualTopicId of manualTopics) {
      // Extract the name from manual-{slug} format
      const slug = manualTopicId.replace('manual-', '');
      const name = slug.replace(/-/g, ' ');
      const topicId = `manual_${slug}`;
      
      // Upsert topic for this manual entry
      await prisma.topic.upsert({
        where: { id: topicId },
        create: {
          id: topicId,
          name: name,
          description: 'Custom topic',
          context: 'manual',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        update: {
          updatedAt: new Date()
        }
      });
      manualTopicIds.push(topicId);
    }

    // Create TopicMention records for all topics (regular + category + manual)
    const allTopicIds = [...regularTopicIds, ...categoryTopicIds, ...manualTopicIds];
    if (allTopicIds.length > 0) {
      await prisma.topicMention.createMany({
        data: allTopicIds.map((topicId, index) => ({
          id: `tmg${Date.now()}${Math.random().toString(36).substring(2, 11)}`,
          postId: id,
          topicId,
          order: index,
          createdAt: new Date()
        }))
      });
    }

    // Fetch the updated post with all mentions
    const updatedPost = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ForumCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            icon: true
          }
        },
        CompanyMention: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                companyType: true
              }
            }
          }
        },
        ContactMention: {
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
        TopicMention: {
          include: {
            Topic: {
              select: {
                id: true,
                name: true,
                description: true,
                context: true,
                categoryId: true,
                ForumCategory: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            ForumComment: true
          }
        }
      }
    });

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error('Error updating forum post:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to update forum post', details: error instanceof Error ? error.message : String(error) },
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

    await prisma.forumPost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json(
      { error: 'Failed to delete forum post' },
      { status: 500 }
    );
  }
}
