import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId query parameter required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isAnonymous: true,
        anonymousUsername: true
      }
    });

    if (!user) {
      return NextResponse.json({
        found: false,
        userId,
        message: 'User not found in database'
      });
    }

    return NextResponse.json({
      found: true,
      user
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Database query failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
