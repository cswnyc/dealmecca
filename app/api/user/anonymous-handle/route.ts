import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';
import { ADDITIONAL_ANONYMOUS_HANDLES } from '@/scripts/create-forum-users';

// Get user's anonymous handle
export async function GET(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { anonymousHandle: true }
    });

    return NextResponse.json({ 
      anonymousHandle: user?.anonymousHandle || null 
    });

  } catch (error) {
    console.error('Error getting anonymous handle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Set or update user's anonymous handle
export async function POST(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { anonymousHandle } = await request.json();

    if (!anonymousHandle) {
      return NextResponse.json(
        { error: 'Anonymous handle is required' },
        { status: 400 }
      );
    }

    // Validate handle format
    const handleRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!handleRegex.test(anonymousHandle)) {
      return NextResponse.json(
        { error: 'Invalid handle format. Use 3-20 characters: letters, numbers, underscores, or hyphens only.' },
        { status: 400 }
      );
    }

    // Check if handle is already taken
    const existingUser = await prisma.user.findUnique({
      where: { anonymousHandle },
      select: { id: true }
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: 'This anonymous handle is already taken' },
        { status: 409 }
      );
    }

    // Update user's anonymous handle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { anonymousHandle },
      select: { anonymousHandle: true }
    });

    return NextResponse.json({ 
      anonymousHandle: updatedUser.anonymousHandle 
    });

  } catch (error) {
    console.error('Error setting anonymous handle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user's anonymous handle
export async function DELETE(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { anonymousHandle: null }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting anonymous handle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}