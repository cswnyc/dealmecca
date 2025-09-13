import { NextRequest, NextResponse } from 'next/server';
import { exchangeLinkedInCode, getLinkedInProfile, getLinkedInEmail } from '@/lib/auth/linkedin-oauth';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    console.log('🔗 LinkedIn callback received:', { code: !!code, error, state });

    // Handle OAuth error
    if (error) {
      console.error('🔗 LinkedIn OAuth error:', error);
      const signInUrl = new URL('/auth/firebase-signin', request.url);
      signInUrl.searchParams.set('error', `LinkedIn authentication failed: ${error}`);
      return NextResponse.redirect(signInUrl);
    }

    // Validate authorization code
    if (!code) {
      console.error('🔗 No authorization code received');
      const signInUrl = new URL('/auth/firebase-signin', request.url);
      signInUrl.searchParams.set('error', 'LinkedIn authentication failed: No authorization code');
      return NextResponse.redirect(signInUrl);
    }

    // Exchange code for access token
    const redirectUri = new URL('/api/auth/linkedin-callback', request.url).toString();
    console.log('🔗 Exchanging code for access token...');
    
    const { accessToken } = await exchangeLinkedInCode(code, redirectUri);
    console.log('🔗 Access token obtained');

    // Get user profile (email included)
    console.log('🔗 Fetching LinkedIn profile...');
    const profile = await getLinkedInProfile(accessToken);
    const email = profile.email;
    
    if (!email) {
      console.error('🔗 No email found in LinkedIn profile');
      const signInUrl = new URL('/auth/firebase-signin', request.url);
      signInUrl.searchParams.set('error', 'LinkedIn authentication failed: No email found');
      return NextResponse.redirect(signInUrl);
    }

    console.log('🔗 LinkedIn profile fetched:', { 
      id: profile.sub, 
      email: email?.substring(0, 3) + '***'
    });

    // Extract user information from new userinfo format
    const displayName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || email;

    // Find or create user in database
    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    const isNewUser = !user;

    if (!user) {
      console.log('🔗 Creating new user from LinkedIn profile');
      user = await prisma.user.create({
        data: {
          email: email,
          name: displayName,
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
      console.log('✅ Created new LinkedIn user:', user.id);
    } else {
      console.log('🔗 Found existing LinkedIn user:', user.id);
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: displayName,
          lastDashboardVisit: new Date(),
          dashboardVisits: { increment: 1 }
        }
      });
    }

    // Create session token
    const sessionToken = await createSessionToken(user);
    
    // Redirect to success page with session cookie
    const dashboardUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(dashboardUrl);

    // Set session cookie
    response.cookies.set('dealmecca-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    console.log('🍪 Set session cookie for LinkedIn user');

    // Add success message
    dashboardUrl.searchParams.set('linkedin-success', isNewUser ? 'welcome' : 'welcome-back');
    
    return NextResponse.redirect(dashboardUrl);

  } catch (error) {
    console.error('🔗 LinkedIn callback error:', error);
    
    const signInUrl = new URL('/auth/firebase-signin', request.url);
    signInUrl.searchParams.set('error', `LinkedIn authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return NextResponse.redirect(signInUrl);
  }
}