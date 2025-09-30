import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

async function verifyFirebaseToken(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    return { uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}

async function getUserByFirebaseUid(firebaseUid: string) {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid },
        { email: firebaseUid } // Fallback for email-based lookups
      ]
    }
  });
}

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    // Verify Firebase token
    const firebaseAuth = await verifyFirebaseToken(request);
    if (!firebaseAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await getUserByFirebaseUid(firebaseAuth.uid);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unread') === 'true';

    const whereClause: any = {
      userId: user.id
    };

    if (unreadOnly) {
      whereClause.read = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          read: false
        }
      })
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create a new notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, metadata, actionUrl } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
        actionUrl
      }
    });

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}