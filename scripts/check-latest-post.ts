import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLatestPost() {
  const post = await prisma.forumPost.findFirst({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      mediaType: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  console.log('Latest Forum Post:');
  console.log(JSON.stringify(post, null, 2));

  await prisma.$disconnect();
}

checkLatestPost().catch(console.error);
