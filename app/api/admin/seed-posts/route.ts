import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

export async function POST() {
  try {
    console.log('🌱 Seeding forum posts...');

    // Check for categories
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true }
    });

    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'No categories found! Please create categories first.' },
        { status: 400 }
      );
    }

    console.log(`✅ Found ${categories.length} categories`);

    // Find or create a system user for the posts
    let author = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@getmecca.com' },
          { role: 'ADMIN' }
        ]
      }
    });

    if (!author) {
      // Get any user
      author = await prisma.user.findFirst();
    }

    if (!author) {
      return NextResponse.json(
        { error: 'No users found! Please create a user first.' },
        { status: 400 }
      );
    }

    console.log(`✅ Using author: ${author.name || author.email}`);

    // Sample posts
    const samplePosts = [
      {
        title: 'Welcome to the Forum',
        content: `Welcome to our community forum! This is a space where we can discuss industry trends, share insights, and connect with professionals.

Feel free to:
- Ask questions about partnerships and deals
- Share your experiences
- Network with other professionals
- Stay updated on industry news

Looking forward to great discussions!`,
        categorySlug: categories[0].slug,
        urgency: 'LOW',
        isAnonymous: false
      },
      {
        title: 'Q1 2025 Industry Trends Discussion',
        content: `What trends are you seeing in Q1 2025? I've noticed:

1. Increased focus on programmatic guaranteed deals
2. More emphasis on first-party data strategies
3. Growing interest in retail media networks

What are your observations?`,
        categorySlug: categories[0].slug,
        urgency: 'MEDIUM',
        isAnonymous: false
      },
      {
        title: 'Looking for Partnership Opportunities',
        content: `Our agency is actively seeking new partnership opportunities with brands in the CPG space. We specialize in digital advertising and have strong capabilities in:

- Programmatic buying
- Social media advertising
- Performance marketing

DM me if interested in learning more!`,
        categorySlug: categories[0].slug,
        urgency: 'HIGH',
        dealSize: 'MEDIUM',
        isAnonymous: false
      }
    ];

    const createdPosts = [];

    for (const postData of samplePosts) {
      const category = categories.find(c => c.slug === postData.categorySlug);
      if (!category) continue;

      // Generate slug
      const baseSlug = postData.title
        .toLowerCase()
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

      const post = await prisma.forumPost.create({
        data: {
          id: generateId(),
          title: postData.title,
          content: postData.content,
          slug,
          categoryId: category.id,
          authorId: author.id,
          status: 'APPROVED', // Auto-approve seed posts
          isAnonymous: postData.isAnonymous,
          urgency: postData.urgency as any,
          dealSize: postData.dealSize as any,
          mediaType: 'text',
          tags: '',
          views: 0,
          upvotes: 0,
          downvotes: 0,
          bookmarks: 0,
          updatedAt: new Date()
        },
        include: {
          ForumCategory: true,
          User: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      createdPosts.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.ForumCategory.name,
        status: post.status
      });

      console.log(`✅ Created post: "${post.title}"`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdPosts.length} forum posts`,
      posts: createdPosts
    });

  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed forum posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
