import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testForumData() {
  console.log('🚀 Testing Forum Data Setup...\n');

  try {
    // Check categories
    const categories = await prisma.forumCategory.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    console.log('📋 Forum Categories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat._count.posts} posts) - ${cat.slug}`);
    });

    // Check posts
    const posts = await prisma.forumPost.findMany({
      take: 5,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📝 Recent Posts (${posts.length} found):`);
    posts.forEach(post => {
      console.log(`  - "${post.title}" by ${post.author.name}`);
      console.log(`    Category: ${post.category.name} | ${post._count.comments} comments | ${post.views} views`);
    });

    // Check comments
    const comments = await prisma.forumComment.count();
    console.log(`\n💬 Total Comments: ${comments}`);

    // Test data suggestions
    if (categories.length === 0) {
      console.log('\n⚠️  No forum categories found! Run:');
      console.log('   npx prisma db seed');
    }

    if (posts.length === 0) {
      console.log('\n⚠️  No forum posts found! You may need to:');
      console.log('   1. Create test posts via the forum interface');
      console.log('   2. Run the enhanced seed script');
    }

    console.log('\n✅ Forum data check complete!');

  } catch (error) {
    console.error('❌ Error checking forum data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
testForumData();

export default testForumData;
