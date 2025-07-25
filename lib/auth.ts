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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        const userToReturn = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
        }
        
        console.log('🔑 Credentials provider - returning user:', userToReturn)
        return userToReturn
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
      console.log('🔐 JWT callback - user:', user, 'account:', account?.provider)
      
      if (user) {
        // First time JWT is created (login)
        const newToken = {
          ...token,
          sub: user.id,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
        }
        console.log('🔐 JWT callback - created token:', newToken)
        
        // For credentials provider, manually create session record
        if (account?.provider === 'credentials') {
          try {
            const sessionToken = `cred_session_${Date.now()}_${user.id}_${Math.random().toString(36).substring(2)}`
            await prisma.session.create({
              data: {
                sessionToken,
                userId: user.id,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              },
            })
            console.log('✅ Manual session created for credentials user:', user.id, 'token:', sessionToken)
          } catch (error) {
            console.error('❌ Failed to create manual session:', error)
          }
        }
        
        return newToken
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('📱 Session callback - token data:', token)
      const newSession = {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          subscriptionTier: token.subscriptionTier,
        },
      }
      console.log('📱 Session callback - created session:', newSession)
      return newSession
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Create new user with default role and subscription
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                role: 'FREE',
                subscriptionTier: 'FREE',
              },
            })
            
            // Update the user object to include our custom fields
            user.id = newUser.id
            user.role = newUser.role
            user.subscriptionTier = newUser.subscriptionTier
          } else {
            // Update the user object with existing user data
            user.id = existingUser.id
            user.role = existingUser.role
            user.subscriptionTier = existingUser.subscriptionTier
          }
        } catch (error) {
          console.error('Error handling Google sign-in:', error)
          return false
        }
      }
      return true
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