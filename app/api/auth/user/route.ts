/**
 * User Management API
 * Handles anonymous user creation, updates, and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create or get user profile
export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, isAnonymous } = await request.json();

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Firebase UID is required' },
        { status: 400 }
      );
    }

    // Check if user already exists by firebaseUid
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (user) {
      return NextResponse.json(user);
    }

    // If email is provided, also check if user exists by email
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        // User exists with this email, update with new firebaseUid
        user = await prisma.user.update({
          where: { email },
          data: { firebaseUid },
        });
        return NextResponse.json(user);
      }
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        firebaseUid,
        email: email || null,
        isAnonymous: isAnonymous ?? true,
        // Don't generate username/avatar here - let the hook handle it
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/fetching user:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { firebaseUid, ...updateData } = await request.json();

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Firebase UID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { firebaseUid },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user profile by Firebase UID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Firebase UID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        name: true,
        isAnonymous: true,
        anonymousUsername: true,
        avatarSeed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}