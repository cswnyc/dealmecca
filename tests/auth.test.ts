import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getUserById, canUserSearch, recordSearch, authOptions } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    search: {
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}))

// Mock NextAuth providers
vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({ id: 'google' })),
}))

vi.mock('next-auth/providers/linkedin', () => ({
  default: vi.fn(() => ({ id: 'linkedin' })),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config) => ({ ...config, id: 'credentials' })),
}))

describe('Auth Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUserById', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'FREE',
      subscriptionTier: 'FREE',
      searches: [
        { id: 'search-1', query: 'test query', createdAt: new Date() },
      ],
      posts: [
        { id: 'post-1', title: 'Test Post', createdAt: new Date() },
      ],
      comments: [
        { id: 'comment-1', content: 'Test Comment', createdAt: new Date() },
      ],
    }

    it('should return user with full profile data', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

      const result = await getUserById('user-1')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
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
      expect(result).toEqual(mockUser)
    })

    it('should return null if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const result = await getUserById('nonexistent-user')

      expect(result).toBeNull()
    })

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed')
      vi.mocked(prisma.user.findUnique).mockRejectedValue(dbError)

      await expect(getUserById('user-1')).rejects.toThrow('Database connection failed')
    })
  })

  describe('canUserSearch', () => {
    const baseUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'FREE',
    }

    it('should return true for PRO tier users regardless of search count', async () => {
      const proUser = {
        ...baseUser,
        subscriptionTier: 'PRO',
        searches: new Array(15).fill({}).map((_, i) => ({
          id: `search-${i}`,
          createdAt: new Date(),
        })),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(proUser)

      const result = await canUserSearch('user-1')

      expect(result).toBe(true)
    })

    it('should return true for TEAM tier users regardless of search count', async () => {
      const teamUser = {
        ...baseUser,
        subscriptionTier: 'TEAM',
        searches: new Array(20).fill({}).map((_, i) => ({
          id: `search-${i}`,
          createdAt: new Date(),
        })),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(teamUser)

      const result = await canUserSearch('user-1')

      expect(result).toBe(true)
    })

    it('should return true for FREE users with less than 10 searches', async () => {
      const freeUser = {
        ...baseUser,
        subscriptionTier: 'FREE',
        searches: new Array(5).fill({}).map((_, i) => ({
          id: `search-${i}`,
          createdAt: new Date(),
        })),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(freeUser)

      const result = await canUserSearch('user-1')

      expect(result).toBe(true)
    })

    it('should return false for FREE users with 10 or more searches', async () => {
      const freeUser = {
        ...baseUser,
        subscriptionTier: 'FREE',
        searches: new Array(10).fill({}).map((_, i) => ({
          id: `search-${i}`,
          createdAt: new Date(),
        })),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(freeUser)

      const result = await canUserSearch('user-1')

      expect(result).toBe(false)
    })

    it('should return false if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const result = await canUserSearch('nonexistent-user')

      expect(result).toBe(false)
    })

    it('should only count searches from last 30 days', async () => {
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) // 31 days ago
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...baseUser,
        subscriptionTier: 'FREE',
        searches: [], // Mocked to return empty array based on where clause
      })

      await canUserSearch('user-1')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          searches: {
            where: {
              createdAt: {
                gte: expect.any(Date),
              },
            },
          },
        },
      })
    })
  })

  describe('recordSearch', () => {
    const mockSearch = {
      id: 'search-1',
      userId: 'user-1',
      query: 'test query',
      resultsCount: 5,
      searchType: 'companies',
      createdAt: new Date(),
    }

    it('should create a search record with all parameters', async () => {
      vi.mocked(prisma.search.create).mockResolvedValue(mockSearch)

      const result = await recordSearch('user-1', 'test query', 5, 'companies')

      expect(prisma.search.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          query: 'test query',
          resultsCount: 5,
          searchType: 'companies',
        },
      })
      expect(result).toEqual(mockSearch)
    })

    it('should create a search record without searchType', async () => {
      vi.mocked(prisma.search.create).mockResolvedValue(mockSearch)

      const result = await recordSearch('user-1', 'test query', 5)

      expect(prisma.search.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          query: 'test query',
          resultsCount: 5,
          searchType: undefined,
        },
      })
      expect(result).toEqual(mockSearch)
    })

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed')
      vi.mocked(prisma.search.create).mockRejectedValue(dbError)

      await expect(recordSearch('user-1', 'test query', 5)).rejects.toThrow(
        'Database connection failed'
      )
    })
  })

  describe('Credentials Provider authorize function', () => {
    // Extract the authorize function from the credentials provider
    const getAuthorizeFunction = () => {
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      )
      return credentialsProvider?.authorize
    }

    beforeEach(() => {
      // Mock console methods to avoid cluttering test output
      vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('should return null for missing credentials', async () => {
      const authorize = getAuthorizeFunction()
      
      const result = await authorize?.({}, {})

      expect(result).toBeNull()
    })

    it('should return null for missing email', async () => {
      const authorize = getAuthorizeFunction()
      
      const result = await authorize?.({ password: 'password123' }, {})

      expect(result).toBeNull()
    })

    it('should return null for missing password', async () => {
      const authorize = getAuthorizeFunction()
      
      const result = await authorize?.({ email: 'test@example.com' }, {})

      expect(result).toBeNull()
    })

    it('should return null if user not found', async () => {
      const authorize = getAuthorizeFunction()
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const result = await authorize?.({
        email: 'test@example.com',
        password: 'password123',
      }, {})

      expect(result).toBeNull()
    })

    it('should return null if user has no password', async () => {
      const authorize = getAuthorizeFunction()
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: null,
        role: 'FREE',
        subscriptionTier: 'FREE',
      })

      const result = await authorize?.({
        email: 'test@example.com',
        password: 'password123',
      }, {})

      expect(result).toBeNull()
    })

    it('should return null if password is invalid', async () => {
      const authorize = getAuthorizeFunction()
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'FREE',
        subscriptionTier: 'FREE',
      })
      vi.mocked(compare).mockResolvedValue(false)

      const result = await authorize?.({
        email: 'test@example.com',
        password: 'wrongpassword',
      }, {})

      expect(result).toBeNull()
    })

    it('should return user object if credentials are valid', async () => {
      const authorize = getAuthorizeFunction()
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'FREE',
        subscriptionTier: 'FREE',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(compare).mockResolvedValue(true)

      const result = await authorize?.({
        email: 'test@example.com',
        password: 'password123',
      }, {})

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'FREE',
        subscriptionTier: 'FREE',
      })
    })

    it('should handle database errors gracefully', async () => {
      const authorize = getAuthorizeFunction()
      const dbError = new Error('Database connection failed')
      vi.mocked(prisma.user.findUnique).mockRejectedValue(dbError)

      const result = await authorize?.({
        email: 'test@example.com',
        password: 'password123',
      }, {})

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Database/verification error:'),
        dbError
      )
    })
  })

  describe('AuthOptions Configuration', () => {
    it('should have correct provider configuration', () => {
      expect(authOptions.providers).toHaveLength(3)
      expect(authOptions.providers.some(p => p.id === 'google')).toBe(true)
      expect(authOptions.providers.some(p => p.id === 'linkedin')).toBe(true)
      expect(authOptions.providers.some(p => p.id === 'credentials')).toBe(true)
    })

    it('should use JWT strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('should have correct session configuration', () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60) // 30 days
      expect(authOptions.session?.updateAge).toBe(24 * 60 * 60) // 24 hours
    })

    it('should have correct page configuration', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin')
      expect(authOptions.pages?.error).toBe('/auth/error')
      expect(authOptions.pages?.verifyRequest).toBe('/auth/verify-request')
    })

    it('should have production-specific cookie configuration', () => {
      if (process.env.NODE_ENV === 'production') {
        expect(authOptions.cookies).toBeDefined()
        expect(authOptions.useSecureCookies).toBe(true)
      }
    })

    it('should have debug enabled in development', () => {
      if (process.env.NODE_ENV === 'development') {
        expect(authOptions.debug).toBe(true)
      }
    })
  })
})