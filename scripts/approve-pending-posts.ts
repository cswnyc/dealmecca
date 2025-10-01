import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding all PENDING posts...');

  const pendingPosts = await prisma.forumPost.findMany({
    where: {
      status: 'PENDING'
    },
    select: {
      id: true,
      title: true,
      createdAt: true
    }
  });

  console.log(`📊 Found ${pendingPosts.length} PENDING posts`);

  if (pendingPosts.length === 0) {
    console.log('✅ No pending posts to approve');
    return;
  }

  console.log('\n📝 Posts to approve:');
  pendingPosts.forEach((post, index) => {
    console.log(`  ${index + 1}. ${post.title} (${post.createdAt.toISOString()})`);
  });

  console.log('\n✅ Approving all pending posts...');

  const result = await prisma.forumPost.updateMany({
    where: {
      status: 'PENDING'
    },
    data: {
      status: 'APPROVED'
    }
  });

  console.log(`\n🎉 Successfully approved ${result.count} posts!`);
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
