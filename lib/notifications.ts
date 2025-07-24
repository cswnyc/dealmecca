import { prisma } from '@/lib/prisma';
import { pusherServer, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/pusher';

export type NotificationType = 
  | 'COMPANY_MENTIONED'
  | 'CONTACT_MENTIONED'
  | 'FORUM_POST_REPLY'
  | 'EVENT_REMINDER'
  | 'CONNECTION_REQUEST'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'SYSTEM_ANNOUNCEMENT';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface MentionNotificationData {
  mentionedEntityId: string;
  mentionerUserId: string;
  mentionerName: string;
  postId: string;
  postTitle: string;
  entityType: 'company' | 'contact';
  entityName: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });

    // Send real-time notification via Pusher
    if (pusherServer) {
      await pusherServer.trigger(
        PUSHER_CHANNELS.USER_NOTIFICATIONS(data.userId),
        PUSHER_EVENTS.NEW_NOTIFICATION,
        {
          notification: {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            actionUrl: notification.actionUrl,
            createdAt: notification.createdAt
          }
        }
      );
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Send notifications to company employees when their company is mentioned
 */
export async function notifyCompanyMention(data: MentionNotificationData) {
  try {
    // Get employees of the mentioned company
    const companyEmployees = await prisma.user.findMany({
      where: {
        companyId: data.mentionedEntityId,
        // Don't notify the person who made the mention
        NOT: {
          id: data.mentionerUserId
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Create notifications for each employee
    const notificationPromises = companyEmployees.map((employee: { id: string; name: string | null; email: string }) =>
      createNotification({
        userId: employee.id,
        type: 'COMPANY_MENTIONED',
        title: `Your company was mentioned in a forum post`,
        message: `${data.mentionerName} mentioned ${data.entityName} in "${data.postTitle}"`,
        actionUrl: `/forum/posts/${data.postId}`,
        metadata: {
          postId: data.postId,
          postTitle: data.postTitle,
          mentionerUserId: data.mentionerUserId,
          mentionerName: data.mentionerName,
          companyId: data.mentionedEntityId,
          companyName: data.entityName
        }
      })
    );

    await Promise.all(notificationPromises);
    console.log(`Sent ${notificationPromises.length} company mention notifications`);

    return true;
  } catch (error) {
    console.error('Failed to send company mention notifications:', error);
    return false;
  }
}

/**
 * Send notification to a contact when they are mentioned
 * Note: Currently contacts in the org chart system are not directly linked to users,
 * so this function will log the mention but won't send notifications until user-contact
 * associations are implemented.
 */
export async function notifyContactMention(data: MentionNotificationData) {
  try {
    // For now, we'll just log the mention since contacts aren't directly linked to users
    // In the future, when we implement user-contact associations, we can enable notifications
    console.log(`Contact mentioned: ${data.entityName} (${data.mentionedEntityId}) by ${data.mentionerName} in post "${data.postTitle}"`);
    
    // TODO: When user-contact relationships are implemented, find the user account
    // associated with this contact and send them a notification
    
    return true;
  } catch (error) {
    console.error('Failed to process contact mention:', error);
    return false;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId // Ensure user can only mark their own notifications as read
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return notification;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return null;
  }
}

/**
 * Get unread notifications count for a user
 */
export async function getUnreadNotificationsCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        read: false
      }
    });

    return count;
  } catch (error) {
    console.error('Failed to get unread notifications count:', error);
    return 0;
  }
}

/**
 * Get notifications for a user with pagination
 */
export async function getUserNotifications(userId: string, page = 1, limit = 20) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.notification.count({
      where: {
        userId: userId
      }
    });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Failed to get user notifications:', error);
    return {
      notifications: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    };
  }
} 