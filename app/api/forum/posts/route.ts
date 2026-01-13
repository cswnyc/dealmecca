export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { TopicParser } from '@/lib/forum/topic-parser';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

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
          company: {
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
            email: true,
            anonymousUsername: true,
            anonymousHandle: true,
            publicHandle: true
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
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
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
                categoryId: true,
                ForumCategory: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true
                  }
                },
                TopicCompany: {
                  include: {
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
                  },
                  orderBy: {
                    order: 'asc'
                  }
                },
                TopicContact: {
                  include: {
                    contact: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
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

    // Helper function to fetch primary topic entity
    const fetchPrimaryTopic = async (primaryTopicType: string | null, primaryTopicId: string | null) => {
      if (!primaryTopicType || !primaryTopicId) return null;

      try {
        // Company types are: company, agency, advertiser, publisher, dsp_ssp, adtech, industry
        const companyTypes = ['company', 'agency', 'advertiser', 'publisher', 'dsp_ssp', 'adtech', 'industry'];

        if (companyTypes.includes(primaryTopicType)) {
          const companyEntity = await prisma.company.findUnique({
            where: { id: primaryTopicId },
            select: { id: true, name: true, logoUrl: true, verified: true }
          });
          return companyEntity ? { ...companyEntity, type: primaryTopicType } : null;
        }

        if (primaryTopicType === 'contact') {
          const contact = await prisma.contact.findUnique({
            where: { id: primaryTopicId },
            select: { id: true, firstName: true, lastName: true, title: true }
          });
          return contact ? { id: contact.id, name: `${contact.firstName} ${contact.lastName}`, type: 'contact', description: contact.title } : null;
        }

        return null;
      } catch (error) {
        console.error('Error fetching primary topic:', error);
        return null;
      }
    };

    // Transform data to match frontend expectations with null checks
    const formattedPosts = await Promise.all(posts.map(async post => {
      // Skip posts with missing required relationships
      if (!post.User || !post.ForumCategory) {
        console.warn(`Skipping post ${post.id} due to missing User or Category`);
        return null;
      }

      // Fetch primary topic if available
      const primaryTopic = await fetchPrimaryTopic(post.primaryTopicType, post.primaryTopicId);

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
        primaryTopicType: post.primaryTopicType,
        primaryTopicId: post.primaryTopicId,
        primaryTopic: primaryTopic,
        postType: post.postType,
        listItems: post.listItems,
        pollChoices: post.pollChoices,
        pollDuration: post.pollDuration,
        pollEndsAt: post.pollEndsAt?.toISOString(),
        author: {
          id: post.User.id,
          name: post.User.name || 'Anonymous User',
          email: post.User.email,
          anonymousUsername: post.User.anonymousUsername,
          anonymousHandle: post.User.anonymousHandle,
          publicHandle: post.User.publicHandle
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
          .filter(mention => mention.company)
          .map(mention => ({
            company: {
              id: mention.company.id,
              name: mention.company.name,
              logoUrl: mention.company.logoUrl,
              verified: mention.company.verified,
              companyType: mention.company.companyType,
              industry: mention.company.industry,
              city: mention.company.city,
              state: mention.company.state
            }
          })),
        contactMentions: post.ContactMention
          .filter(mention => mention.contact)
          .map(mention => ({
            contact: {
              id: mention.contact.id,
              fullName: `${mention.contact.firstName} ${mention.contact.lastName}`,
              title: mention.contact.title,
              company: mention.contact.company ? {
                id: mention.contact.company.id,
                name: mention.contact.company.name,
                logoUrl: mention.contact.company.logoUrl
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
              categoryId: mention.Topic.categoryId,
              category: mention.Topic.ForumCategory,
              companies: mention.Topic.TopicCompany
                .filter(tc => tc.company)
                .map(tc => ({
                  id: tc.id,
                  company: {
                    id: tc.company.id,
                    name: tc.company.name,
                    logoUrl: tc.company.logoUrl,
                    verified: tc.company.verified,
                    companyType: tc.company.companyType,
                    industry: tc.company.industry,
                    city: tc.company.city,
                    state: tc.company.state
                  },
                  context: tc.context,
                  role: tc.role,
                  order: tc.order
                })),
              contacts: mention.Topic.TopicContact
                .filter(tc => tc.contact)
                .map(tc => ({
                  id: tc.id,
                  contact: {
                    id: tc.contact.id,
                    fullName: `${tc.contact.firstName} ${tc.contact.lastName}`,
                    title: tc.contact.title,
                    company: tc.contact.company ? {
                      id: tc.contact.company.id,
                      name: tc.contact.company.name,
                      logoUrl: tc.contact.company.logoUrl
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
    })).then(posts => posts.filter(post => post !== null));

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
  categoryId: z.string().min(1).optional(),
  tags: z.string().optional().default(''),
  isAnonymous: z.boolean().optional().default(false),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  dealSize: z.string().optional(),
  location: z.string().optional(),
  mediaType: z.enum(['text', 'image', 'video', 'link', 'TV', 'RADIO', 'DIGITAL', 'PRINT', 'OOH', 'STREAMING', 'PODCAST', 'SOCIAL', 'PROGRAMMATIC']).optional().default('text'),
  postType: z.enum(['post', 'list', 'poll', 'code']).optional().default('post'),
  listItems: z.array(z.string()).optional(),
  pollChoices: z.array(z.string()).optional(),
  pollDuration: z.number().optional(),
  codeLanguage: z.string().optional(),
  codeFramework: z.string().optional(),
  codeType: z.string().optional(),
  codeComplexity: z.string().optional(),
  generatedCode: z.string().optional(),
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
    mediaType,
    postType,
    listItems,
    pollChoices,
    pollDuration,
    codeLanguage,
    codeFramework,
    codeType,
    codeComplexity,
    generatedCode
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

    // Create the post - requires admin approval
    const now = new Date();

    // Calculate poll end date if applicable
    let pollEndsAt = null;
    if (postType === 'poll' && pollDuration) {
      pollEndsAt = new Date(now.getTime() + pollDuration * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    }
    const post = await prisma.forumPost.create({
      data: {
        id: generateId(),
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
        postType: postType || 'post',
        listItems: listItems ? JSON.stringify(listItems) : '',
        pollChoices: pollChoices ? JSON.stringify(pollChoices) : '',
        pollDuration: pollDuration || null,
        pollEndsAt,
        codeLanguage: codeLanguage || null,
        codeFramework: codeFramework || null,
        codeType: codeType || null,
        codeComplexity: codeComplexity || null,
        generatedCode: generatedCode || null,
        status: 'PENDING',  // User posts require admin approval
        updatedAt: now
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            anonymousUsername: true,
            anonymousHandle: true,
            publicHandle: true
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