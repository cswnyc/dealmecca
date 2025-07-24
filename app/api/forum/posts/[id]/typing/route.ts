import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: postId } = await params;
    const { isTyping } = await request.json();

    // Only trigger if pusher is configured
    if (pusherServer) {
      // Trigger typing indicator event
      await pusherServer.trigger(
        PUSHER_CHANNELS.FORUM_POST(postId),
        PUSHER_EVENTS.USER_TYPING,
        {
          user: {
            id: session.user.id,
            name: session.user.name,
            isAnonymous: false
          },
          isTyping: Boolean(isTyping)
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process typing indicator:', error);
    return NextResponse.json(
      { error: 'Failed to process typing indicator' },
      { status: 500 }
    );
  }
} 