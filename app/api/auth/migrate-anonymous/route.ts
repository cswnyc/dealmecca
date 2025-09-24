/**
 * Migration API for Anonymous User Profiles
 * Assigns anonymous usernames and avatars to existing users who don't have them
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateAnonymousProfile } from '@/lib/user-generator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get all users without anonymous usernames
    const usersWithoutAnonymous = await prisma.user.findMany({
      where: {
        OR: [
          { anonymousUsername: null },
          { anonymousUsername: '' },
          { avatarSeed: null },
          { avatarSeed: '' }
        ]
      },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        name: true,
        anonymousUsername: true,
        avatarSeed: true,
        isAnonymous: true
      }
    });

    console.log(`Found ${usersWithoutAnonymous.length} users to migrate`);

    const migrations = [];

    for (const user of usersWithoutAnonymous) {
      const userId = user.firebaseUid || user.id;
      const anonymousProfile = generateAnonymousProfile(userId);

      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            anonymousUsername: user.anonymousUsername || anonymousProfile.username,
            avatarSeed: user.avatarSeed || userId,
            // Only set isAnonymous if it's not already set
            ...(user.isAnonymous === null && { isAnonymous: !user.name })
          }
        });

        migrations.push({
          userId: user.id,
          email: user.email,
          oldUsername: user.anonymousUsername,
          newUsername: updatedUser.anonymousUsername,
          success: true
        });

        console.log(`✅ Migrated user ${user.email}: ${updatedUser.anonymousUsername}`);
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.email}:`, error);
        migrations.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed for ${migrations.length} users`,
      migrations,
      stats: {
        total: migrations.length,
        successful: migrations.filter(m => m.success).length,
        failed: migrations.filter(m => !m.success).length
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET(request: NextRequest) {
  try {
    const stats = await prisma.user.aggregate({
      _count: {
        id: true,
      }
    });

    const usersWithAnonymous = await prisma.user.count({
      where: {
        anonymousUsername: {
          not: null,
          not: ''
        }
      }
    });

    const usersWithAvatars = await prisma.user.count({
      where: {
        avatarSeed: {
          not: null,
          not: ''
        }
      }
    });

    return NextResponse.json({
      totalUsers: stats._count.id,
      usersWithAnonymousUsernames: usersWithAnonymous,
      usersWithAvatars: usersWithAvatars,
      migrationNeeded: stats._count.id - Math.min(usersWithAnonymous, usersWithAvatars)
    });

  } catch (error) {
    console.error('Migration status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}