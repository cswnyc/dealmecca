// Global TypeScript types for DealMecca

export type Role = 'FREE' | 'PRO' | 'ADMIN' | 'TEAM'
export type SubscriptionTier = 'FREE' | 'PRO' | 'TEAM'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'PAST_DUE'

// User types
export interface User {
  id: string
  email: string
  name?: string
  role: Role
  subscriptionTier: SubscriptionTier
  searchesUsed: number
  searchesResetAt: Date
  createdAt: Date
  updatedAt: Date
}

// Company types
export interface Company {
  id: string
  name: string
  website?: string
  description?: string
  industry?: string
  size?: string
  location?: string
  verificationLevel: number
  verificationScore: number
  createdAt: Date
  updatedAt: Date
}

// Contact types
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  title?: string
  department?: string
  seniority?: string
  linkedinUrl?: string
  companyId?: string
  company?: Company
  leadScore: number
  verificationLevel: number
  createdAt: Date
  updatedAt: Date
}

// Forum types
export interface ForumPost {
  id: string
  title: string
  content: string
  categoryId: string
  authorId: string
  author?: User
  tags: string[]
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  postType: 'post' | 'question' | 'discussion'
  slug: string
  views: number
  upvotes: number
  downvotes: number
  createdAt: Date
  updatedAt: Date
}

export interface ForumCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  postCount: number
  order: number
}

// Event types
export interface Event {
  id: string
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate: Date
  maxAttendees?: number
  eventType: string
  creatorId: string
  creator?: User
  attendeeCount: number
  createdAt: Date
  updatedAt: Date
}

// Search types
export interface SearchFilters {
  industry?: string[]
  location?: string[]
  seniority?: string[]
  department?: string[]
  companySize?: string[]
  verificationLevel?: number
}

export interface SearchResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}