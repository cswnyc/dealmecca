import { NextRequest, NextResponse } from 'next/server'
import { exchangeLinkedInCode, getLinkedInProfile } from '@/lib/auth/linkedin-oauth'
import { auth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'
import { generateUsername } from '@/lib/user-generator'
import { subscribeUserToNewsletter } from '@/lib/mailerlite'
import { randomBytes } from 'crypto'

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('LinkedIn callback received:', {
      url: request.url,
      code: code ? 'present' : 'missing',
      state,
      error,
      allParams: Object.fromEntries(searchParams.entries())
    })

    // Handle OAuth error (user denied access)
    if (error) {
      const errorUrl = new URL('/auth/signin', request.nextUrl.origin)
      errorUrl.searchParams.set('error', 'linkedin_access_denied')
      return NextResponse.redirect(errorUrl)
    }

    // Validate required parameters
    if (!code) {
      const errorUrl = new URL('/auth/signin', request.nextUrl.origin)
      errorUrl.searchParams.set('error', 'missing_code')
      return NextResponse.redirect(errorUrl)
    }

    // Exchange authorization code for access token
    const redirectUri = `${request.nextUrl.origin}/api/auth/linkedin-callback`
    const { accessToken } = await exchangeLinkedInCode(code, redirectUri)

    // Get user profile from LinkedIn
    const linkedInProfile = await getLinkedInProfile(accessToken)

    if (!linkedInProfile.email) {
      const errorUrl = new URL('/auth/signin', request.nextUrl.origin)
      errorUrl.searchParams.set('error', 'no_email')
      return NextResponse.redirect(errorUrl)
    }

    // Normalize email to prevent case-sensitivity duplicates
    const normalizedEmail = linkedInProfile.email.trim().toLowerCase();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true
      }
    })

    if (user) {
      // Update user with LinkedIn info if missing
      if (!user.name && linkedInProfile.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: linkedInProfile.name },
          select: {
            id: true,
            email: true,
            name: true,
            accountStatus: true
          }
        })
      }

      // Create or update account record
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'linkedin',
            providerAccountId: linkedInProfile.sub
          }
        },
        create: {
          userId: user.id,
          type: 'oauth',
          provider: 'linkedin',
          providerAccountId: linkedInProfile.sub,
          access_token: accessToken
        },
        update: {
          access_token: accessToken
        }
      })
    } else {
      // Create new user
      const anonymousUsername = generateUsername(linkedInProfile.sub)

      // Generate a unique ID
      const userId = generateId()

      console.log('🆕 Creating new user:', { userId, email: linkedInProfile.email, anonymousUsername });

      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: normalizedEmail,
            name: linkedInProfile.name || null,
            isAnonymous: false,
            anonymousUsername,
            role: 'FREE',
            subscriptionTier: 'FREE',
            subscriptionStatus: 'ACTIVE',
            accountStatus: 'PENDING' // New users require admin approval
          },
          select: {
            id: true,
            email: true,
            name: true,
            accountStatus: true
          }
        })

        console.log('✅ User created successfully:', user.id, 'with PENDING status');
      } catch (createError) {
        console.error('❌ Failed to create user:', createError);
        throw createError;
      }

      // Create account record
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'linkedin',
          providerAccountId: linkedInProfile.sub,
          access_token: accessToken
        }
      })

      // Subscribe new user to MailerLite newsletter
      try {
        await subscribeUserToNewsletter(normalizedEmail, 'FREE');
        console.log('✅ LinkedIn user subscribed to MailerLite newsletter:', normalizedEmail);
      } catch (mailerLiteError) {
        console.warn('⚠️ MailerLite subscription failed for LinkedIn user (non-critical):', mailerLiteError);
        // Don't fail the OAuth flow if MailerLite fails
      }
    }

    // Create a simple session token using the user's database ID
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    })).toString('base64')

    // Determine redirect URL based on account status
    // null/undefined status = legacy user, treated as approved
    // APPROVED status = explicitly approved
    // PENDING/REJECTED = needs approval
    const isApproved = user.accountStatus === 'APPROVED' || user.accountStatus === null || user.accountStatus === undefined;
    const redirectUrl = isApproved ? '/forum' : '/auth/pending-approval';

    console.log('LinkedIn auth successful, creating session:', {
      userId: user.id,
      email: user.email,
      accountStatus: user.accountStatus,
      redirectUrl,
      sessionTokenLength: sessionToken.length
    })

    // Set HTTP-only cookie server-side
    const response = NextResponse.redirect(new URL(redirectUrl, request.nextUrl.origin))

    // Set linkedin-auth cookie with user ID
    const cookieValue = `linkedin-${user.id}`
    const expiresIn7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    console.log('🍪 LinkedIn callback: Setting cookie for user:', user.id);
    console.log('🍪 Cookie value:', cookieValue);
    console.log('🍪 Cookie config:', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresIn7Days,
      path: '/'
    });

    response.cookies.set('linkedin-auth', cookieValue, {
      httpOnly: false, // Allow client-side access for compatibility
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Less strict than 'strict' for better compatibility
      expires: expiresIn7Days,
      path: '/'
    })

    console.log('🍪 Set linkedin-auth cookie successfully');
    console.log('🔄 Redirecting to /forum');

    return response

  } catch (error) {
    console.error('LinkedIn callback error:', error)

    const errorUrl = new URL('/auth/signin', request.nextUrl.origin)
    errorUrl.searchParams.set('error', 'linkedin_callback_failed')
    return NextResponse.redirect(errorUrl)
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Use GET method for LinkedIn OAuth callback'
  }, { status: 405 })
}
