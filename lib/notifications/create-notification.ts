import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

interface CreateNotificationParams {
  userId: string;
  type: 'COMPANY_MENTIONED' | 'CONTACT_MENTIONED' | 'COMPANY_FOLLOWED' | 'USER_FOLLOWED' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, actionUrl, metadata } = params;

  try {
    const notification = await prisma.notification.create({
      data: {
        id: nanoid(),
        userId,
        type,
        title,
        message,
        actionUrl,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Notify all followers of a company about a new activity
 */
export async function notifyCompanyFollowers(
  companyId: string,
  notification: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    // Get all followers of the company
    const followers = await prisma.companyFollow.findMany({
      where: { companyId },
      select: { userId: true }
    });

    // Create notifications for all followers
    const notifications = await Promise.all(
      followers.map(follower =>
        createNotification({
          ...notification,
          userId: follower.userId
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error notifying company followers:', error);
    throw error;
  }
}

/**
 * Notify about a new contact added to a company
 */
export async function notifyNewContact(contactId: string) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!contact || !contact.company) {
      return;
    }

    await notifyCompanyFollowers(contact.company.id, {
      type: 'CONTACT_MENTIONED',
      title: 'New Contact Added',
      message: `${contact.firstName} ${contact.lastName} joined ${contact.company.name}`,
      actionUrl: `/people/${contactId}`,
      metadata: {
        contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        companyId: contact.company.id,
        companyName: contact.company.name
      }
    });
  } catch (error) {
    console.error('Error notifying new contact:', error);
  }
}

/**
 * Notify about a new partnership
 */
export async function notifyNewPartnership(partnershipId: string) {
  try {
    const partnership = await prisma.companyPartnership.findUnique({
      where: { id: partnershipId },
      include: {
        agency: {
          select: {
            id: true,
            name: true
          }
        },
        advertiser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!partnership) {
      return;
    }

    // Notify followers of the agency
    await notifyCompanyFollowers(partnership.agencyId, {
      type: 'COMPANY_MENTIONED',
      title: 'New Partnership',
      message: `${partnership.agency.name} partnered with ${partnership.advertiser.name}`,
      actionUrl: `/companies/${partnership.agencyId}`,
      metadata: {
        partnershipId,
        agencyId: partnership.agencyId,
        advertiserId: partnership.advertiserId
      }
    });

    // Notify followers of the advertiser
    await notifyCompanyFollowers(partnership.advertiserId, {
      type: 'COMPANY_MENTIONED',
      title: 'New Partnership',
      message: `${partnership.advertiser.name} partnered with ${partnership.agency.name}`,
      actionUrl: `/companies/${partnership.advertiserId}`,
      metadata: {
        partnershipId,
        agencyId: partnership.agencyId,
        advertiserId: partnership.advertiserId
      }
    });
  } catch (error) {
    console.error('Error notifying new partnership:', error);
  }
}

/**
 * Notify user when someone follows them
 */
export async function notifyUserFollow(followedUserId: string, followerUserId: string) {
  try {
    const follower = await prisma.user.findUnique({
      where: { id: followerUserId },
      select: {
        name: true,
        email: true
      }
    });

    if (!follower) {
      return;
    }

    await createNotification({
      userId: followedUserId,
      type: 'USER_FOLLOWED',
      title: 'New Follower',
      message: `${follower.name || follower.email} started following you`,
      actionUrl: `/profile/${followerUserId}`,
      metadata: {
        followerUserId,
        followerName: follower.name
      }
    });
  } catch (error) {
    console.error('Error notifying user follow:', error);
  }
}

/**
 * Notify user when someone follows a company they're interested in
 */
export async function notifyCompanyFollow(companyId: string, followerUserId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });

    const follower = await prisma.user.findUnique({
      where: { id: followerUserId },
      select: {
        name: true,
        email: true
      }
    });

    if (!company || !follower) {
      return;
    }

    await createNotification({
      userId: followerUserId,
      type: 'COMPANY_FOLLOWED',
      title: 'Following Company',
      message: `You're now following ${company.name}`,
      actionUrl: `/companies/${companyId}`,
      metadata: {
        companyId,
        companyName: company.name
      }
    });
  } catch (error) {
    console.error('Error notifying company follow:', error);
  }
}
