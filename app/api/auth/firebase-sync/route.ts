import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
}

// Helper function to create JWT session token
async function createSessionToken(user: any) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable not set');
  }
  
  const secret = new TextEncoder().encode(jwtSecret);
  
  const jwt = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    subscriptionTier: user.subscriptionTier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret);
  
  return jwt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUser, isNewUser }: { firebaseUser: FirebaseUser; isNewUser: boolean } = body;

    console.log('🔥 Firebase sync request:', { firebaseUser, isNewUser });

    if (!firebaseUser || !firebaseUser.email || !firebaseUser.uid) {
      return NextResponse.json(
        { error: 'Invalid Firebase user data' },
        { status: 400 }
      );
    }

    // Check if user already exists in our database
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: firebaseUser.email },
          // You might want to add a firebaseUid field to track Firebase users
          // { firebaseUid: firebaseUser.uid }
        ]
      }
    });

    if (existingUser) {
      console.log('👤 Found existing user:', existingUser.id);
      
      // Update existing user with Firebase info if needed
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: firebaseUser.displayName || existingUser.name,
          // Add any other fields you want to sync from Firebase
          lastDashboardVisit: new Date(),
          dashboardVisits: { increment: 1 }
        }
      });

      // Create session token
      const sessionToken = await createSessionToken(updatedUser);
      
      const response = NextResponse.json({
        success: true,
        user: updatedUser,
        isNewUser: false,
        message: 'User synced successfully'
      });

      // Set session cookie for middleware to recognize the user (Next.js latest pattern)
      response.cookies.set('dealmecca-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });

      console.log('🍪 Set session cookie for existing user');
      
      return response;
    }

    // Create new user if they don't exist
    console.log('🆕 Creating new user from Firebase data');
    
    const newUser = await prisma.user.create({
      data: {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email,
        role: 'FREE',
        subscriptionTier: 'FREE',
        searchesUsed: 0,
        searchesResetAt: new Date(),
        dashboardVisits: 1,
        searchesThisMonth: 0,
        searchResetDate: new Date(),
        annualEventGoal: 10,
        annualNetworkingGoal: 50,
        achievementPoints: 0,
        subscriptionStatus: 'ACTIVE',
        cancelAtPeriodEnd: false,
        lastSearchLimitCheck: new Date(),
        lastDashboardVisit: new Date()
      }
    });

    console.log('✅ Created new user:', newUser.id);

    // Create session token for new user
    const sessionToken = await createSessionToken(newUser);
    
    const response = NextResponse.json({
      success: true,
      user: newUser,
      isNewUser: true,
      message: 'New user created successfully'
    });

    // Set session cookie for middleware to recognize the new user (Next.js latest pattern)
    response.cookies.set('dealmecca-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    console.log('🍪 Set session cookie for new user');
    
    return response;

  } catch (error) {
    console.error('❌ Firebase sync error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during user sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}