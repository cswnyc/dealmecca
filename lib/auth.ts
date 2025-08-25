import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  // Remove adapter to fix OAuth account linking issues with JWT
  // adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
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
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Custom decode function to handle our JWT tokens
    encode: async ({ token, secret }) => {
      // Use our custom JWT encoding to match what we create in auth-login
      const { SignJWT } = await import('jose')
      const secretKey = new TextEncoder().encode(typeof secret === 'string' ? secret : secret?.toString() || 'fallback-secret')
      
      const jwt = await new SignJWT(token || {})
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secretKey)
      
      return jwt
    },
    decode: async ({ token, secret }) => {
      try {
        const { jwtVerify } = await import('jose')
        const secretKey = new TextEncoder().encode(typeof secret === 'string' ? secret : secret?.toString() || 'fallback-secret')
        const { payload } = await jwtVerify(token || '', secretKey)
        return payload
      } catch (error) {
        console.log('JWT decode error:', error)
        return null
      }
    }
  },
  // Environment-aware cookie configuration
  cookies: process.env.NODE_ENV === 'production' ? {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: '.getmecca.com'
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
  } : undefined, // Use defaults for development
  useSecureCookies: process.env.NODE_ENV === 'production',
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
        console.log('🆕 JWT: First time login detected')
        
        // For OAuth users, fetch complete user data from database
        if (account?.provider === 'google' || account?.provider === 'linkedin') {
          console.log(`🔍 JWT: Fetching ${account.provider} user from database`)
          
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! },
            })
            
            if (dbUser) {
              console.log('📊 JWT: Found user in database:', dbUser.id)
              const newToken = {
                ...token,
                sub: dbUser.id,
                role: dbUser.role,
                subscriptionTier: dbUser.subscriptionTier,
                email: dbUser.email,
                name: dbUser.name,
              }
              
              console.log('✅ JWT: Created OAuth token:', {
                sub: newToken.sub,
                role: newToken.role,
                email: newToken.email,
                provider: account.provider
              })
              
              return newToken
            }
          } catch (error) {
            console.error('❌ JWT: Error fetching OAuth user:', error)
          }
        }
        
        // For credentials or fallback, use user object directly
        const newToken = {
          ...token,
          sub: user.id,
          role: user.role || 'FREE',
          subscriptionTier: user.subscriptionTier || 'FREE',
          email: user.email,
          name: user.name,
        }
        
        console.log('✅ JWT: Created fallback token:', {
          sub: newToken.sub,
          role: newToken.role,
          email: newToken.email,
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
        if (account?.provider === 'google' || account?.provider === 'linkedin') {
          console.log(`🔗 SIGNIN: ${account.provider} OAuth provider detected`)
          
          if (!user.email) {
            console.log('❌ SIGNIN: No email provided by OAuth provider')
            return false
          }
          
          // Check if user exists, create if not
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!existingUser) {
            console.log(`🆕 SIGNIN: Creating new ${account.provider} user`)
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email,
                role: 'FREE',
                subscriptionTier: 'FREE',
                searchesUsed: 0,
                searchesResetAt: new Date(),
                dashboardVisits: 0,
                searchesThisMonth: 0,
                searchResetDate: new Date(),
                annualEventGoal: 10,
                annualNetworkingGoal: 50,
                achievementPoints: 0,
                subscriptionStatus: 'ACTIVE',
                cancelAtPeriodEnd: false,
                lastSearchLimitCheck: new Date(),
              },
            })
            console.log(`✅ SIGNIN: New ${account.provider} user created:`, existingUser.id)
          } else {
            console.log(`👤 SIGNIN: Existing ${account.provider} user found:`, existingUser.id)
          }
          
          // Update user object with database info for JWT
          user.id = existingUser.id
          user.role = existingUser.role
          user.subscriptionTier = existingUser.subscriptionTier
          
          return true
        }
        
        // For credentials provider, the user is already validated in authorize()
        if (account?.provider === 'credentials') {
          console.log('🔑 SIGNIN: Credentials provider, allowing sign in')
          return true
        }
        
        console.log('⚠️ SIGNIN: Unknown provider, denying sign in')
        return false
      } catch (error) {
        console.error('❌ SIGNIN: Error in signIn callback:', error)
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