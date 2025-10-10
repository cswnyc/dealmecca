import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFirebaseAuth } from '@/lib/firebase-admin';

interface UserPreferences {
  darkMode?: boolean;
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
}

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAuth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // Find user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        // We'll store preferences in a JSON field if needed,
        // or return defaults for now
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, return default preferences
    // In the future, we can add a preferences JSON column to User model
    const preferences: UserPreferences = {
      darkMode: false,
      language: 'en',
      timezone: 'America/New_York',
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false
    };

    return NextResponse.json(preferences);

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT/PATCH user preferences
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAuth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    const body = await request.json();
    const { darkMode, language, timezone, emailNotifications, pushNotifications, marketingEmails } = body;

    // Find user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, we'll just acknowledge the save
    // In a production app, we'd store this in a JSON field on the User model
    // or create a separate UserPreferences table

    // TODO: Add preferences field to User model and save here
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     preferences: {
    //       darkMode,
    //       language,
    //       timezone,
    //       emailNotifications,
    //       pushNotifications,
    //       marketingEmails
    //     }
    //   }
    // });

    const savedPreferences: UserPreferences = {
      darkMode: darkMode ?? false,
      language: language ?? 'en',
      timezone: timezone ?? 'America/New_York',
      emailNotifications: emailNotifications ?? true,
      pushNotifications: pushNotifications ?? false,
      marketingEmails: marketingEmails ?? false
    };

    return NextResponse.json({
      success: true,
      preferences: savedPreferences,
      message: 'Preferences saved successfully'
    });

  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
