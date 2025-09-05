// Global constants for DealMecca

// Brand constants
export const BRAND = {
  NAME: 'DealMecca',
  TAGLINE: 'The mecca for media deals',
  DESCRIPTION: 'B2B media seller intelligence platform for advertising and marketing professionals',
  DOMAIN: 'dealmecca.com',
  URL: 'https://dealmecca.com',
} as const

// Subscription tiers and limits
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    SEARCHES_PER_MONTH: 10,
    EXPORTS_PER_MONTH: 1,
    SAVED_SEARCHES: 3,
  },
  PRO: {
    SEARCHES_PER_MONTH: 1000,
    EXPORTS_PER_MONTH: 50,
    SAVED_SEARCHES: 25,
  },
  TEAM: {
    SEARCHES_PER_MONTH: 5000,
    EXPORTS_PER_MONTH: 200,
    SAVED_SEARCHES: 100,
  },
} as const

// Data quality levels
export const VERIFICATION_LEVELS = {
  BASIC: { level: 1, label: 'Basic', score: 20 },
  VERIFIED: { level: 2, label: 'Verified', score: 40 },
  PREMIUM: { level: 3, label: 'Premium Verified', score: 60 },
  EXPERT: { level: 4, label: 'Expert Verified', score: 80 },
  PLATFORM: { level: 5, label: 'Platform Verified', score: 100 },
} as const

// Industry categories
export const INDUSTRIES = [
  'Advertising Agency',
  'Creative Agency', 
  'Digital Agency',
  'Media Agency',
  'PR Agency',
  'Brand/Advertiser',
  'Ad Tech',
  'Mar Tech',
  'Consulting',
  'Holding Company',
  'Other',
] as const

// Company sizes
export const COMPANY_SIZES = [
  '1-10',
  '11-50', 
  '51-200',
  '201-1000',
  '1000+',
] as const

// Seniority levels
export const SENIORITY_LEVELS = [
  'C-Level',
  'VP/SVP',
  'Director',
  'Manager',
  'Senior',
  'Associate',
  'Junior',
  'Intern',
] as const

// Departments
export const DEPARTMENTS = [
  'Marketing',
  'Media',
  'Creative',
  'Strategy',
  'Business Development',
  'Sales',
  'Account Management',
  'Operations',
  'Technology',
  'Finance',
  'HR',
  'Other',
] as const

// Forum constants
export const FORUM = {
  POST_URGENCY: {
    LOW: { value: 'LOW', label: 'Low', color: 'gray' },
    MEDIUM: { value: 'MEDIUM', label: 'Medium', color: 'blue' },
    HIGH: { value: 'HIGH', label: 'High', color: 'orange' },
    URGENT: { value: 'URGENT', label: 'Urgent', color: 'red' },
  },
  POST_TYPES: {
    POST: { value: 'post', label: 'Post' },
    QUESTION: { value: 'question', label: 'Question' },
    DISCUSSION: { value: 'discussion', label: 'Discussion' },
  },
} as const

// Event types
export const EVENT_TYPES = [
  'Conference',
  'Workshop',
  'Networking',
  'Webinar',
  'Training',
  'Awards',
  'Other',
] as const

// API constants
export const API = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 30000,
} as const

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ALLOWED_EXTENSIONS: ['.csv', '.xls', '.xlsx'],
} as const

// Cache durations (in seconds)
export const CACHE_DURATION = {
  STATIC_DATA: 3600, // 1 hour
  USER_DATA: 300, // 5 minutes
  SEARCH_RESULTS: 180, // 3 minutes
  COMPANY_DATA: 1800, // 30 minutes
} as const