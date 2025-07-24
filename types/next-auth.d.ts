import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role?: string
    subscriptionTier?: string
  }

  interface Session {
    user: {
      id: string
      role?: string
      subscriptionTier?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    subscriptionTier?: string
  }
} 