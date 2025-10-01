import { NextRequest, NextResponse } from 'next/server'
import { exchangeLinkedInCode, getLinkedInProfile } from '@/lib/auth/linkedin-oauth'
import { auth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/db'
import { generateUsername } from '@/lib/user-generator'
import { subscribeUserToNewsletter } from '@/lib/convertkit'

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

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: linkedInProfile.email }
    })

    if (user) {
      // Update user with LinkedIn info if missing
      if (!user.name && linkedInProfile.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: linkedInProfile.name }
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

      user = await prisma.user.create({
        data: {
          email: linkedInProfile.email,
          name: linkedInProfile.name || null,
          isAnonymous: false,
          anonymousUsername,
          role: 'FREE',
          subscriptionTier: 'FREE',
          subscriptionStatus: 'ACTIVE'
        }
      })

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

      // Subscribe new user to ConvertKit newsletter
      try {
        await subscribeUserToNewsletter(
          linkedInProfile.email,
          linkedInProfile.given_name || linkedInProfile.name || undefined,
          'FREE'
        );
        console.log('✅ LinkedIn user subscribed to ConvertKit newsletter:', linkedInProfile.email);
      } catch (convertKitError) {
        console.warn('⚠️ ConvertKit subscription failed for LinkedIn user (non-critical):', convertKitError);
        // Don't fail the OAuth flow if ConvertKit fails
      }
    }

    // Create a simple session token using the user's database ID
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    })).toString('base64')

    console.log('LinkedIn auth successful, creating session and redirecting to forum:', {
      userId: user.id,
      email: user.email,
      sessionTokenLength: sessionToken.length
    })

    // Set HTTP-only cookie server-side
    const response = NextResponse.redirect(new URL('/forum', request.nextUrl.origin))

    // Set linkedin-auth cookie with user ID
    const cookieValue = `linkedin-${user.id}`
    const expiresIn7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    response.cookies.set('linkedin-auth', cookieValue, {
      httpOnly: false, // Allow client-side access for compatibility
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Less strict than 'strict' for better compatibility
      expires: expiresIn7Days,
      path: '/'
    })

    console.log('🍪 Set linkedin-auth cookie for user:', user.id)

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
