import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approvePost(postId: string) {
  const post = await prisma.forumPost.update({
    where: { id: postId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: 'admin@dealmecca.pro', // Admin user ID
    }
  });

  console.log('Post approved:', JSON.stringify(post, null, 2));

  await prisma.$disconnect();
}

// Get post ID from command line or use the latest pending post
const postId = process.argv[2];

if (postId) {
  approvePost(postId).catch(console.error);
} else {
  // Approve the latest pending post
  prisma.forumPost.findFirst({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  }).then(post => {
    if (post) {
      console.log(`Approving latest pending post: ${post.id} - "${post.title}"`);
      approvePost(post.id).catch(console.error);
    } else {
      console.log('No pending posts found');
      prisma.$disconnect();
    }
  });
}
