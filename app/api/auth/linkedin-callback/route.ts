import { NextRequest, NextResponse } from 'next/server'
import { exchangeLinkedInCode, getLinkedInProfile } from '@/lib/auth/linkedin-oauth'
import { auth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/db'
import { generateSecureUsername } from '@/lib/user-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

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
      const anonymousUsername = await generateSecureUsername()

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
    }

    // Create Firebase custom token for the user
    let firebaseToken: string

    if (user.firebaseUid) {
      // User already has Firebase account
      firebaseToken = await auth.createCustomToken(user.firebaseUid)
    } else {
      // Create new Firebase user
      const firebaseUser = await auth.createUser({
        email: user.email!,
        displayName: user.name || undefined,
        emailVerified: true // LinkedIn emails are verified
      })

      // Update our user record with Firebase UID
      await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: firebaseUser.uid }
      })

      firebaseToken = await auth.createCustomToken(firebaseUser.uid)
    }

    // Redirect to success page with token
    const successUrl = new URL('/auth/linkedin-success', request.nextUrl.origin)
    successUrl.searchParams.set('token', firebaseToken)
    successUrl.searchParams.set('user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.subscriptionTier
    }))

    return NextResponse.redirect(successUrl)

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
