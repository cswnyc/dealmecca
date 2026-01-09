import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAnonymousProfile } from '@/lib/user-generator';
import { subscribeUserToNewsletter } from '@/lib/convertkit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL, providerId, isNewUser } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    // Normalize email to prevent case-sensitivity duplicates
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('🔍 Firebase-sync POST:', {
      originalEmail: email,
      normalizedEmail,
      uid,
      isNewUser
    });

    // Check if user already exists in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    console.log('📊 User lookup result:', {
      found: !!user,
      userId: user?.id,
      userEmail: user?.email,
      accountStatus: user?.accountStatus
    });

    if (!user) {
      // Generate anonymous profile for new users
      let anonymousProfile = generateAnonymousProfile(uid);

      // Ensure unique anonymous username
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const existingUser = await prisma.user.findUnique({
          where: { anonymousUsername: anonymousProfile.username }
        });

        if (!existingUser) {
          isUnique = true;
        } else {
          // Generate new profile with different seed
          anonymousProfile = generateAnonymousProfile(`${uid}-${attempts}`);
          attempts++;
        }
      }

      // Create new user in database with PENDING status (requires admin approval)
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: normalizedEmail,
          name: displayName || null,
          role: 'FREE',
          subscriptionTier: 'FREE',
          subscriptionStatus: 'ACTIVE',
          isAnonymous: !displayName, // Anonymous if no display name
          anonymousUsername: anonymousProfile.username,
          avatarSeed: uid,
          accountStatus: 'PENDING', // New users require admin approval
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('🔥 Firebase user synced to database:', { uid, email: normalizedEmail, isNewUser: true });

      // Subscribe user to ConvertKit newsletter if they provided an email
      if (normalizedEmail && isNewUser) {
        try {
          await subscribeUserToNewsletter(
            normalizedEmail,
            displayName || undefined,
            'FREE'
          );
          console.log('✅ User subscribed to ConvertKit newsletter:', normalizedEmail);
        } catch (convertKitError) {
          console.warn('⚠️ ConvertKit subscription failed (non-critical):', convertKitError);
          // Don't fail the user registration if ConvertKit fails
        }
      }
    } else if (user.firebaseUid !== uid) {
      // Update firebaseUid if it doesn't match
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: uid,
          name: displayName || user.name,
          updatedAt: new Date()
        }
      });
      
      console.log('🔥 Firebase user updated in database:', { uid, email: normalizedEmail });
    }

    console.log('✅ Returning user data:', {
      userId: user.id,
      email: user.email,
      accountStatus: user.accountStatus,
      settingCookieForUID: uid
    });

    // Set session cookie
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        accountStatus: user.accountStatus
      }
    });

    // ALWAYS set/update session cookie for this user's UID
    // This overwrites any stale cookies from previous sessions
    response.cookies.set('dealmecca-session', uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log('🍪 Set dealmecca-session cookie for UID:', uid.substring(0, 20) + '...');

    return response;

  } catch (error) {
    console.error('Firebase sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Firebase user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const firebaseUid = request.cookies.get('dealmecca-session')?.value;
    
    // Log ALL cookies to debug stale session issues
    const allCookies = Array.from(request.cookies.getAll()).map(c => `${c.name}=${c.value.substring(0, 20)}...`);

    console.log('🔍 Firebase-sync GET:', {
      hasFirebaseUid: !!firebaseUid,
      firebaseUidFull: firebaseUid,
      allCookies: allCookies
    });

    if (!firebaseUid) {
      console.log('❌ No firebaseUid cookie found');
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('📊 GET User lookup result:', {
      searchedByFirebaseUid: firebaseUid,
      found: !!user,
      userId: user?.id,
      userEmail: user?.email,
      accountStatus: user?.accountStatus
    });

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Firebase session check error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;
    
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { firebaseUid: uid },
      data: {
        name: displayName || null,
        updatedAt: new Date()
      }
    });

    console.log('🔥 Firebase user profile updated:', { uid, email });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Firebase profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const firebaseUid = request.cookies.get('dealmecca-session')?.value;

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('dealmecca-session', '', {
      maxAge: 0,
      path: '/'
    });

    console.log('🔥 Firebase session cleared:', { firebaseUid });

    return response;

  } catch (error) {
    console.error('Firebase signout error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
