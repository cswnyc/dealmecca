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
  // Fixed cookie configuration for custom domain
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // Always secure for production custom domain
        domain: '.getmecca.com' // Include subdomain for custom domain
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: '.getmecca.com'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: '.getmecca.com'
      }
    },
  },
  useSecureCookies: true, // Always true for custom domain
  // Add debug logging for development
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/signin',
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
        
        // For JWT strategy, just store user data in the token
        // No need for manual database sessions
        const newToken = {
          ...token,
          sub: user.id,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          email: user.email,
          name: user.name,
        }
        
        console.log('✅ JWT: Created JWT-only token:', {
          sub: newToken.sub,
          role: newToken.role,
          email: newToken.email,
          strategy: 'jwt-only'
        })
        
        return newToken
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
        sessionUserEmail: session?.user?.email,
        tokenRole: (token as any)?.role
      })
      
      if (token?.sub) {
        // Create session from JWT token data
        const newSession = {
          ...session,
          user: {
            id: token.sub,
            email: (token as any).email || session.user?.email,
            name: (token as any).name || session.user?.name,
            role: (token as any).role || 'FREE',
            subscriptionTier: (token as any).subscriptionTier || 'FREE',
          },
          expires: session.expires,
        }
        
        console.log('✅ SESSION: Created JWT-based session:', {
          userId: newSession.user.id,
          userEmail: newSession.user.email,
          userRole: newSession.user.role,
          strategy: 'jwt-only'
        })
        
        return newSession
      }
      
      console.log('⚠️ SESSION: No token sub found, returning original session')
      return session
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
      
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('Relative URL redirect:', fullUrl);
        return fullUrl;
      }
      
      // If it's an absolute URL from the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        console.log('Same origin redirect:', url);
        return url;
      }
      
      // Default redirect to dashboard for successful logins
      const dashboardUrl = `${baseUrl}/dashboard`;
      console.log('Default redirect to dashboard:', dashboardUrl);
      return dashboardUrl;
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