export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { TopicParser } from '@/lib/forum/topic-parser';
import { z } from 'zod';

interface Mention {
  type: 'company' | 'contact' | 'topic';
  id: string;
  name: string;
}

function extractMentions(text: string): Mention[] {
  const mentionRegex = /@(company|contact|topic)\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: Mention[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const [, type, name, id] = match;
    mentions.push({
      type: type as Mention['type'],
      id,
      name
    });
  }

  return mentions;
}

export const GET = safeHandler(async (request: NextRequest, ctx: any, { requestId }) => {
  const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const authorId = searchParams.get('authorId');
    const company = searchParams.get('company');
    const event = searchParams.get('event');
    const topic = searchParams.get('topic');
    const sortBy = searchParams.get('sortBy') || 'latest';
    
    const skip = (page - 1) * limit;
    
    // Build where clause - only show approved posts
    const where: any = {
      status: 'APPROVED'
    };
    
    if (category) {
      where.ForumCategory = {
        slug: category
      };
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    if (company) {
      where.CompanyMention = {
        some: {
          companies: {
            id: company
          }
        }
      };
    }
    
    if (event) {
      where.eventId = event;
    }

    if (topic) {
      // Filter by topic name - can be exact match or partial match
      where.TopicMention = {
        some: {
          Topic: {
            name: {
              contains: topic,
              mode: 'insensitive'
            }
          }
        }
      };
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default to latest
    
    switch (sortBy) {
      case 'popular':
        orderBy = { upvotes: 'desc' };
        break;
      case 'trending':
        orderBy = { views: 'desc' };
        break;
      case 'activity':
        orderBy = { lastActivityAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get posts with all relationships
    const posts = await prisma.forumPost.findMany({
      where,
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
            companies: {
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
        ContactMention: {
          include: {
            contacts: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true,
                companies: {
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
        TopicMention: {
          include: {
            Topic: {
              select: {
                id: true,
                name: true,
                description: true,
                context: true,
                color: true,
                icon: true,
                TopicCompany: {
                  include: {
                    companies: {
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
                  },
                  orderBy: {
                    order: 'asc'
                  }
                },
                TopicContact: {
                  include: {
                    contacts: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        title: true,
                        companies: {
                          select: {
                            id: true,
                            name: true,
                            logoUrl: true
                          }
                        }
                      }
                    }
                  },
                  orderBy: {
                    order: 'asc'
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
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.forumPost.count({ where });
    const pages = Math.ceil(total / limit);

    // Transform data to match frontend expectations with null checks
    const formattedPosts = posts.map(post => {
      // Skip posts with missing required relationships
      if (!post.User || !post.ForumCategory) {
        console.warn(`Skipping post ${post.id} due to missing User or Category`);
        return null;
      }

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        isAnonymous: post.isAnonymous,
        anonymousHandle: post.anonymousHandle,
        tags: post.tags,
        urgency: post.urgency,
        dealSize: post.dealSize,
        location: post.location,
        mediaType: post.mediaType,
        views: post.views,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        bookmarks: post.bookmarks,
        isPinned: post.isPinned,
        isLocked: post.isLocked,
        isFeatured: post.isFeatured,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        lastActivityAt: post.lastActivityAt.toISOString(),
        author: {
          id: post.User.id,
          name: post.User.name || 'Anonymous User',
          email: post.User.email
        },
        category: {
          id: post.ForumCategory.id,
          name: post.ForumCategory.name,
          slug: post.ForumCategory.slug,
          description: post.ForumCategory.description,
          color: post.ForumCategory.color,
          icon: post.ForumCategory.icon
        },
        companyMentions: post.CompanyMention
          .filter(mention => mention.companies)
          .map(mention => ({
            company: {
              id: mention.companies.id,
              name: mention.companies.name,
              logoUrl: mention.companies.logoUrl,
              verified: mention.companies.verified,
              companyType: mention.companies.companyType,
              industry: mention.companies.industry,
              city: mention.companies.city,
              state: mention.companies.state
            }
          })),
        contactMentions: post.ContactMention
          .filter(mention => mention.contacts)
          .map(mention => ({
            contact: {
              id: mention.contacts.id,
              fullName: `${mention.contacts.firstName} ${mention.contacts.lastName}`,
              title: mention.contacts.title,
              company: mention.contacts.companies ? {
                id: mention.contacts.companies.id,
                name: mention.contacts.companies.name,
                logoUrl: mention.contacts.companies.logoUrl
              } : null
            }
          })),
        topicMentions: post.TopicMention
          .filter(mention => mention.Topic)
          .map(mention => ({
            id: mention.id,
            topic: {
              id: mention.Topic.id,
              name: mention.Topic.name,
              description: mention.Topic.description,
              context: mention.Topic.context,
              color: mention.Topic.color,
              icon: mention.Topic.icon,
              companies: mention.Topic.TopicCompany
                .filter(tc => tc.companies)
                .map(tc => ({
                  id: tc.id,
                  company: {
                    id: tc.companies.id,
                    name: tc.companies.name,
                    logoUrl: tc.companies.logoUrl,
                    verified: tc.companies.verified,
                    companyType: tc.companies.companyType,
                    industry: tc.companies.industry,
                    city: tc.companies.city,
                    state: tc.companies.state
                  },
                  context: tc.context,
                  role: tc.role,
                  order: tc.order
                })),
              contacts: mention.Topic.TopicContact
                .filter(tc => tc.contacts)
                .map(tc => ({
                  id: tc.id,
                  contact: {
                    id: tc.contacts.id,
                    fullName: `${tc.contacts.firstName} ${tc.contacts.lastName}`,
                    title: tc.contacts.title,
                    company: tc.contacts.companies ? {
                      id: tc.contacts.companies.id,
                      name: tc.contacts.companies.name,
                      logoUrl: tc.contacts.companies.logoUrl
                    } : null
                  },
                  context: tc.context,
                  role: tc.role,
                  order: tc.order
                }))
            }
          })),
        _count: {
          comments: post._count.ForumComment
        }
      };
    }).filter(post => post !== null);

    return NextResponse.json(
      {
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          total,
          pages
        },
        requestId,
      },
      {
        headers: { 'x-request-id': requestId },
      }
    );
});

const CreatePostSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(50000, 'Content too long'),
  categoryId: z.string().cuid().optional(),
  tags: z.string().optional().default(''),
  isAnonymous: z.boolean().optional().default(false),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  dealSize: z.string().optional(),
  location: z.string().optional(),
  mediaType: z.enum(['text', 'image', 'video', 'link']).optional().default('text'),
});

export const POST = safeHandler(async (request: NextRequest, ctx: any, { requestId }) => {
  // Authenticate user
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  // Parse and validate input
  let body;
  try {
    body = CreatePostSchema.parse(await request.json());
  } catch (e: any) {
    return bad(400, requestId, 'invalid_input', { issues: e?.issues });
  }

  const {
    content,
    categoryId,
    tags,
    isAnonymous,
    urgency,
    dealSize,
    location,
    mediaType
  } = body;

    // Parse content and generate smart title using TopicParser
    const parsedContent = TopicParser.parseContentIntoTopics(content);
    const title = TopicParser.generateAutoTitle(content);

    // Generate unique slug from title
    const baseSlug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await prisma.forumPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Extract all original mentions for backward compatibility
    const allMentions = parsedContent.originalMentions;

    // Create the post with auto-approval
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        slug,
        categoryId: categoryId || null,
        authorId: auth.dbUserId,
        tags,
        isAnonymous,
        anonymousHandle: isAnonymous ? auth.dbUserHandle : null,
        urgency,
        dealSize,
        location,
        mediaType,
        status: 'APPROVED'  // Auto-approve posts
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ForumCategory: true
      }
    });

    // Create topics from parsed content
    console.log('Creating topics from parsed content:', parsedContent);

    for (const topicGroup of parsedContent.topics) {
      try {
        // Create or find existing topic
        let topic = await prisma.topic.findFirst({
          where: {
            name: topicGroup.name,
            context: topicGroup.context
          }
        });

        if (!topic) {
          topic = await prisma.topic.create({
            data: {
              name: topicGroup.name,
              description: topicGroup.description,
              context: topicGroup.context,
              categoryId: categoryId,
              location: topicGroup.location
            }
          });

          // Add companies to topic
          if (topicGroup.companies.length > 0) {
            const validCompanies = [];
            for (const company of topicGroup.companies) {
              const exists = await prisma.company.findUnique({ where: { id: company.id } });
              if (exists) {
                validCompanies.push(company);
              } else {
                console.warn(`Company ID ${company.id} not found, skipping`);
              }
            }

            if (validCompanies.length > 0) {
              await prisma.topicCompany.createMany({
                data: validCompanies.map((company, index) => ({
                  topicId: topic!.id,
                  companyId: company.id,
                  context: company.context,
                  role: company.role,
                  order: index
                })),
                skipDuplicates: true
              });
            }
          }

          // Add contacts to topic
          if (topicGroup.contacts.length > 0) {
            const validContacts = [];
            for (const contact of topicGroup.contacts) {
              const exists = await prisma.contact.findUnique({ where: { id: contact.id } });
              if (exists) {
                validContacts.push(contact);
              } else {
                console.warn(`Contact ID ${contact.id} not found, skipping`);
              }
            }

            if (validContacts.length > 0) {
              await prisma.topicContact.createMany({
                data: validContacts.map((contact, index) => ({
                  topicId: topic!.id,
                  contactId: contact.id,
                  context: contact.context,
                  role: contact.role,
                  order: index
                })),
                skipDuplicates: true
              });
            }
          }
        }

        // Link topic to post
        await prisma.topicMention.create({
          data: {
            postId: post.id,
            topicId: topic.id,
            order: 0
          }
        });

        console.log(`✅ Created/linked topic: ${topic.name}`);
      } catch (topicError) {
        console.error(`❌ Error creating topic "${topicGroup.name}":`, topicError);
        // Continue with other topics instead of failing entire post
      }
    }

    // Handle legacy mention relationships with validation
    if (allMentions.length > 0) {
      const companyMentions = allMentions.filter(m => m.type === 'company');
      const contactMentions = allMentions.filter(m => m.type === 'contact');

      if (companyMentions.length > 0) {
        // Validate company IDs before creating mentions
        const validCompanyMentions = [];
        for (const mention of companyMentions) {
          const exists = await prisma.company.findUnique({ where: { id: mention.id } });
          if (exists) {
            validCompanyMentions.push(mention);
          } else {
            console.warn(`Company ID ${mention.id} not found for mention, skipping`);
          }
        }

        if (validCompanyMentions.length > 0) {
          await prisma.companyMention.createMany({
            data: validCompanyMentions.map(mention => ({
              postId: post.id,
              companyId: mention.id,
              mentionedBy: auth.dbUserId
            })),
            skipDuplicates: true
          });
        }
      }

      if (contactMentions.length > 0) {
        // Validate contact IDs before creating mentions
        const validContactMentions = [];
        for (const mention of contactMentions) {
          const exists = await prisma.contact.findUnique({ where: { id: mention.id } });
          if (exists) {
            validContactMentions.push(mention);
          } else {
            console.warn(`Contact ID ${mention.id} not found for mention, skipping`);
          }
        }

        if (validContactMentions.length > 0) {
          await prisma.contactMention.createMany({
            data: validContactMentions.map(mention => ({
              postId: post.id,
              contactId: mention.id,
              mentionedBy: auth.dbUserId
            })),
            skipDuplicates: true
          });
        }
      }
    }

    return NextResponse.json(
      { success: true, requestId, post },
      {
        status: 201,
        headers: { 'x-request-id': requestId },
      }
    );
});