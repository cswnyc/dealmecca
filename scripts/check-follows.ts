import { prisma } from '@/server/prisma';

async function checkFollows() {
  const follows = await prisma.postFollow.findMany({
    include: {
      User: {
        select: {
          email: true,
          id: true,
          name: true
        }
      },
      ForumPost: {
        select: {
          title: true,
          id: true
        }
      }
    },
    take: 10,
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('📌 PostFollows in database:');
  console.log(JSON.stringify(follows, null, 2));

  const notifications = await prisma.notification.findMany({
    where: {
      type: 'FORUM_COMMENT'
    },
    include: {
      User: {
        select: {
          email: true,
          name: true
        }
      }
    },
    take: 10,
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('\n🔔 Recent FORUM_COMMENT notifications:');
  console.log(JSON.stringify(notifications, null, 2));

  await prisma.$disconnect();
}

checkFollows().catch(console.error);
