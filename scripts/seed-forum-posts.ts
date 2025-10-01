import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding forum posts...\n');

  // Check for categories
  const categories = await prisma.forumCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true }
  });

  if (categories.length === 0) {
    console.error('❌ No categories found! Please create categories first.');
    return;
  }

  console.log(`✅ Found ${categories.length} categories:`);
  categories.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`));

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
    console.error('\n❌ No users found! Please create a user first.');
    return;
  }

  console.log(`\n✅ Using author: ${author.name || author.email}\n`);

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

  console.log('Creating sample posts...\n');

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
        views: 0,
        upvotes: 0,
        downvotes: 0,
        bookmarks: 0
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Created post: "${post.title}"`);
    console.log(`   Category: ${post.category.name}`);
    console.log(`   Author: ${post.author.name || post.author.email}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Slug: ${post.slug}\n`);
  }

  console.log('🎉 Successfully seeded forum posts!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
