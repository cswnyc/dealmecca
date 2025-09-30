import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAvatarById, AVATAR_LIBRARY } from '@/lib/avatar-library';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');
    const email = searchParams.get('email');
    const linkedinId = searchParams.get('linkedinId');

    if (!firebaseUid && !email && !linkedinId) {
      return NextResponse.json(
        { error: 'User identifier is required (firebaseUid, email, or linkedinId)' },
        { status: 400 }
      );
    }

    // Get current user identity using multiple possible identifiers
    let user;
    if (firebaseUid) {
      user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: {
          id: true,
          anonymousUsername: true,
          avatarSeed: true,
          isAnonymous: true,
        },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          anonymousUsername: true,
          avatarSeed: true,
          isAnonymous: true,
        },
      });
    } else if (linkedinId) {
      user = await prisma.user.findFirst({
        where: { firebaseUid: `linkedin:${linkedinId}` },
        select: {
          id: true,
          anonymousUsername: true,
          avatarSeed: true,
          isAnonymous: true,
        },
      });
    }

    if (!user) {
      // Auto-create user if they don't exist
      const { generateAnonymousProfile } = await import('@/lib/user-generator');
      const seedValue = firebaseUid || email || linkedinId || 'anonymous';
      const profile = generateAnonymousProfile(seedValue);

      const userData: any = {
        email: email?.toLowerCase() || null,
        name: null,
        anonymousUsername: profile.username,
        avatarSeed: profile.avatarId,
        isAnonymous: true,
        role: 'FREE',
        subscriptionTier: 'FREE',
        subscriptionStatus: 'ACTIVE',
      };

      // Set appropriate identifier
      if (firebaseUid) {
        userData.firebaseUid = firebaseUid;
      } else if (linkedinId) {
        userData.firebaseUid = `linkedin:${linkedinId}`;
      }

      const newUser = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          anonymousUsername: true,
          avatarSeed: true,
          isAnonymous: true,
        },
      });

      return NextResponse.json({
        currentUsername: newUser.anonymousUsername,
        currentAvatarId: newUser.avatarSeed,
        availableAvatars: AVATAR_LIBRARY.map(avatar => ({
          id: avatar.id,
          name: avatar.name,
          description: avatar.description,
        })),
      });
    }

    return NextResponse.json({
      currentUsername: user.anonymousUsername,
      currentAvatarId: user.avatarSeed,
      availableAvatars: AVATAR_LIBRARY.map(avatar => ({
        id: avatar.id,
        name: avatar.name,
        description: avatar.description,
      })),
    });

  } catch (error) {
    console.error('Error fetching user identity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user identity' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, email, linkedinId, anonymousUsername, avatarId } = body;

    if (!firebaseUid && !email && !linkedinId) {
      return NextResponse.json(
        { error: 'User identifier is required (firebaseUid, email, or linkedinId)' },
        { status: 400 }
      );
    }

    // Validation
    if (anonymousUsername) {
      // Build exclusion criteria for current user
      const exclusionWhere: any = {
        anonymousUsername,
        NOT: []
      };

      if (firebaseUid) {
        exclusionWhere.NOT.push({ firebaseUid });
      }
      if (email) {
        exclusionWhere.NOT.push({ email: email.toLowerCase() });
      }
      if (linkedinId) {
        exclusionWhere.NOT.push({ firebaseUid: `linkedin:${linkedinId}` });
      }

      // Check if username is already taken (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: exclusionWhere,
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }

      // Username format is flexible - we allow both generated and custom usernames
      console.log(`Username selected: ${anonymousUsername}`);

      // Check length limits
      if (anonymousUsername.length > 50) {
        return NextResponse.json(
          { error: 'Username must be 50 characters or less' },
          { status: 400 }
        );
      }

      if (anonymousUsername.trim() === '') {
        return NextResponse.json(
          { error: 'Username cannot be empty' },
          { status: 400 }
        );
      }
    }

    if (avatarId) {
      // Validate avatar exists
      const avatar = getAvatarById(avatarId);
      if (!avatar) {
        return NextResponse.json(
          { error: 'Invalid avatar ID' },
          { status: 400 }
        );
      }
    }

    // Update user identity
    const updateData: any = {};
    if (anonymousUsername !== undefined) {
      updateData.anonymousUsername = anonymousUsername;
    }
    if (avatarId !== undefined) {
      updateData.avatarSeed = avatarId;
    }

    // Build where condition based on available identifier
    let whereCondition: any;
    if (firebaseUid) {
      whereCondition = { firebaseUid };
    } else if (email) {
      whereCondition = { email: email.toLowerCase() };
    } else if (linkedinId) {
      whereCondition = { firebaseUid: `linkedin:${linkedinId}` };
    }

    const updatedUser = await prisma.user.update({
      where: whereCondition,
      data: updateData,
      select: {
        id: true,
        anonymousUsername: true,
        avatarSeed: true,
        isAnonymous: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Identity updated successfully',
    });

  } catch (error) {
    console.error('Error updating user identity:', error);

    // Handle Prisma unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update identity' },
      { status: 500 }
    );
  }
}

// Generate new username options
export async function POST(request: NextRequest) {
  try {
    const { generateUsernameOptions } = await import('@/lib/friendly-username-generator');

    const body = await request.json();
    const { firebaseUid, email, linkedinId, count = 6 } = body;

    if (!firebaseUid && !email && !linkedinId) {
      return NextResponse.json(
        { error: 'User identifier is required (firebaseUid, email, or linkedinId)' },
        { status: 400 }
      );
    }

    // Generate new username options using any available identifier
    const seedValue = firebaseUid || email || linkedinId || 'anonymous';
    const usernameOptions = generateUsernameOptions(seedValue + Date.now(), count);

    return NextResponse.json({
      usernames: usernameOptions,
    });

  } catch (error) {
    console.error('Error generating username options:', error);
    return NextResponse.json(
      { error: 'Failed to generate username options' },
      { status: 500 }
    );
  }
}