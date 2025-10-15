import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
  try {
    // Check bookmarks
    const bookmarks = await prisma.forumBookmark.findMany({
      take: 5,
      include: {
        User: { select: { email: true, name: true } },
        ForumPost: { select: { title: true, id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('📚 ForumBookmarks in database:', bookmarks.length);
    if (bookmarks.length > 0) {
      console.log('Latest bookmark:', JSON.stringify(bookmarks[0], null, 2));
    }

    // Check notifications
    const notifications = await prisma.notification.findMany({
      where: { type: 'FORUM_POST_REPLY' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        User: { select: { email: true, name: true } }
      }
    });
    console.log('\n🔔 FORUM_POST_REPLY notifications:', notifications.length);
    if (notifications.length > 0) {
      console.log('Latest notification:', JSON.stringify(notifications[0], null, 2));
    }

    // Check all notifications
    const allNotifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        User: { select: { email: true } }
      }
    });
    console.log('\n📧 All notifications:', allNotifications.length);
    allNotifications.forEach(n => {
      console.log(`  - ${n.type} for ${n.User.email} at ${n.createdAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
