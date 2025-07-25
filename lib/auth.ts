import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  // Use adapter for OAuth providers only, not for credentials
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'john@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        console.log('🔄 AUTHORIZE CALLBACK STARTED')
        console.log('📧 Credentials received:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password,
          passwordLength: credentials?.password?.length || 0
        })

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ AUTHORIZE: Missing credentials')
          return null
        }

        try {
          console.log('🔍 AUTHORIZE: Looking up user in database...')
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })
          
          console.log('👤 AUTHORIZE: User lookup result:', {
            found: !!user,
            userId: user?.id,
            userEmail: user?.email,
            hasPassword: !!user?.password,
            userRole: user?.role
          })

          if (!user || !user.password) {
            console.log('❌ AUTHORIZE: User not found or no password')
            return null
          }

          console.log('🔐 AUTHORIZE: Verifying password...')
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          )
          
          console.log('🔐 AUTHORIZE: Password verification result:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ AUTHORIZE: Invalid password')
            return null
          }

          const userToReturn = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
          }
          
          console.log('✅ AUTHORIZE: Authentication successful, returning user:', userToReturn)
          return userToReturn
        } catch (error) {
          console.error('❌ AUTHORIZE: Database/verification error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Required for credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  pages: {
    signIn: '/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔐 JWT CALLBACK STARTED')
      console.log('🔐 JWT: Inputs -', { 
        hasUser: !!user, 
        hasToken: !!token,
        accountProvider: account?.provider,
        tokenSub: token?.sub
      })
      
      if (user) {
        console.log('🆕 JWT: First time login detected, user:', user)
        
        try {
          // First time JWT is created (login)
          const newToken = {
            ...token,
            sub: user.id,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
          }
          console.log('🔐 JWT: Created new token:', newToken)
          
          // For credentials provider, manually create session record
          if (account?.provider === 'credentials') {
            console.log('🔑 JWT: Credentials provider detected, creating manual session...')
            
            try {
              const sessionToken = `cred_session_${Date.now()}_${user.id}_${Math.random().toString(36).substring(2)}`
              
              console.log('💾 JWT: Attempting to create session in database...')
              const sessionRecord = await prisma.session.create({
                data: {
                  sessionToken,
                  userId: user.id,
                  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                },
              })
              
              console.log('✅ JWT: Manual session created successfully:', {
                sessionId: sessionRecord.id,
                sessionToken: sessionToken.substring(0, 20) + '...',
                userId: user.id,
                expires: sessionRecord.expires
              })
            } catch (sessionError: any) {
              console.error('❌ JWT: Failed to create manual session:', sessionError)
              console.error('❌ JWT: Session error details:', {
                message: sessionError?.message || 'Unknown error',
                code: sessionError?.code || 'Unknown code',
                userId: user.id
              })
            }
          } else {
            console.log('🔗 JWT: OAuth provider, skipping manual session creation')
          }
          
          console.log('✅ JWT: Returning new token')
          return newToken
        } catch (error) {
          console.error('❌ JWT: Error in token creation:', error)
          return token
        }
      }
      
      console.log('🔁 JWT: Existing token, no changes needed')
      return token
    },
    async session({ session, token }) {
      console.log('📱 SESSION CALLBACK STARTED')
      console.log('📱 SESSION: Inputs -', { 
        hasSession: !!session,
        hasToken: !!token,
        tokenSub: token?.sub,
        sessionUserEmail: session?.user?.email
      })
      
      try {
        const newSession = {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            role: token.role,
            subscriptionTier: token.subscriptionTier,
          },
        }
        console.log('✅ SESSION: Created session object:', newSession)
        return newSession
      } catch (error) {
        console.error('❌ SESSION: Error in session creation:', error)
        return session
      }
    },
    async signIn({ user, account, profile }) {
      console.log('🔐 SIGNIN CALLBACK STARTED')
      console.log('🔐 SIGNIN: Inputs -', { 
        hasUser: !!user,
        userEmail: user?.email,
        accountProvider: account?.provider,
        hasProfile: !!profile
      })
      
      try {
        if (account?.provider === 'google') {
          console.log('🔗 SIGNIN: Google OAuth provider detected')
          
          try {
            // Check if user exists in our database
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email! },
            })

            if (!existingUser) {
              console.log('🆕 SIGNIN: Creating new Google user')
              
              // Create new user with default role and subscription
              const newUser = await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name,
                  role: 'FREE',
                  subscriptionTier: 'FREE',
                },
              })
              
              console.log('✅ SIGNIN: New Google user created:', newUser.id)
              
              // Update the user object to include our custom fields
              user.id = newUser.id
              user.role = newUser.role
              user.subscriptionTier = newUser.subscriptionTier
            } else {
              console.log('👤 SIGNIN: Existing Google user found:', existingUser.id)
              
              // Update the user object with existing user data
              user.id = existingUser.id
              user.role = existingUser.role
              user.subscriptionTier = existingUser.subscriptionTier
            }
          } catch (error) {
            console.error('❌ SIGNIN: Error handling Google sign-in:', error)
            return false
          }
        } else if (account?.provider === 'credentials') {
          console.log('🔑 SIGNIN: Credentials provider - user already verified in authorize()')
        } else {
          console.log('❓ SIGNIN: Unknown provider or no account:', account?.provider)
        }
        
        console.log('✅ SIGNIN: Callback successful, allowing sign in')
        return true
      } catch (error) {
        console.error('❌ SIGNIN: Callback error:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 Redirect callback - url:', url, 'baseUrl:', baseUrl)
      
      // If it's a relative URL, prepend the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Default to dashboard
      return `${baseUrl}/dashboard`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to get user with full profile
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      searches: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
}

// Helper function to check if user can perform search
export async function canUserSearch(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      searches: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      },
    },
  })

  if (!user) return false

  // Pro and Team users have unlimited searches
  if (user.subscriptionTier === 'PRO' || user.subscriptionTier === 'TEAM') {
    return true
  }

  // Free users are limited to 10 searches per month
  return user.searches.length < 10
}

// Helper function to record a search
export async function recordSearch(userId: string, query: string, resultsCount: number, searchType?: string) {
  return await prisma.search.create({
    data: {
      userId,
      query,
      resultsCount,
      searchType,
    },
  })
} 