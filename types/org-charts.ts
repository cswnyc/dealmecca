// Enhanced Org Charts Types for Production-Ready System

export interface TabConfig {
  key: 'agencies' | 'advertisers' | 'contacts' | 'industries'
  label: string
  icon: string
  count: number
  defaultSort: string
  availableSorts: SortOption[]
  description: string
  premium?: boolean
}

export interface SortOption {
  key: string
  label: string
  direction: 'asc' | 'desc'
  description?: string
}

export interface SearchFilters {
  // Text search
  q?: string
  
  // Company filters
  companyType?: string[]
  agencyType?: string[]
  industry?: string[]
  city?: string[]
  state?: string[]
  region?: string[]
  employeeCount?: string[]
  revenueRange?: string[]
  verified?: boolean
  hasContacts?: boolean
  
  // Contact filters
  department?: string[]
  seniority?: string[]
  roles?: string[]
  budgetRange?: string[]
  territories?: string[]
  isDecisionMaker?: boolean
  
  // Relationship filters
  hasClients?: boolean
  hasAgencies?: boolean
  parentCompany?: string
  
  // Data quality
  dataQuality?: string[]
  lastVerified?: string
}

export interface SearchState {
  query: string
  filters: SearchFilters
  activeTab: TabConfig['key']
  sortBy: string
  sortDirection: 'asc' | 'desc'
  results: SearchResults
  loading: boolean
  error?: string | null
  facets: SearchFacets
  pagination: PaginationState
  searchTime?: number // Search execution time in milliseconds
  activeFiltersCount?: number // Number of active filters
}

export interface SearchResults {
  agencies?: Company[]
  advertisers?: Company[]
  contacts?: Contact[]
  industries?: Industry[]
  totalCount: number
}

export interface SearchFacets {
  companyTypes?: FacetOption[]
  agencyTypes?: FacetOption[]
  industries?: FacetOption[]
  locations?: FacetOption[]
  departments?: FacetOption[]
  seniority?: FacetOption[]
  roles?: FacetOption[]
}

export interface FacetOption {
  value: string
  label: string
  count: number
  selected?: boolean
}

export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}

export interface Company {
  id: string
  name: string
  slug: string
  website?: string
  logoUrl?: string
  description?: string
  companyType: string
  agencyType?: string
  industry?: string
  city?: string
  state?: string
  region?: string
  employeeCount?: string
  revenueRange?: string
  verified: boolean
  dataQuality: string
  _count?: {
    contacts: number
    subsidiaries: number
    clients?: number
    agencies?: number
  }
  contacts?: Contact[]
  parentCompany?: Company
  subsidiaries?: Company[]
  clients?: Company[]
  agencies?: Company[]
  lastActivity?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  fullName: string
  title: string
  email?: string
  phone?: string
  linkedinUrl?: string
  department?: string
  seniority: string
  primaryRole?: string
  companyId: string
  company: {
    id: string
    name: string
    companyType: string
    agencyType?: string
    city?: string
    state?: string
    logoUrl?: string
    verified: boolean
  }
  territories?: string[]
  accounts?: string[]
  budgetRange?: string
  isDecisionMaker: boolean
  verified: boolean
  dataQuality: string
  isActive: boolean
  lastActivity?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Industry {
  id: string
  name: string
  slug: string
  description?: string
  companyCount: number
  contactCount: number
  majorCompanies: Company[]
  averageEmployeeCount?: number
  totalRevenue?: string
}

export interface OrgAnalytics {
  overview: {
    totalAgencies: number
    totalAdvertisers: number
    totalContacts: number
    totalIndustries: number
    verificationRate: {
      companies: number
      contacts: number
    }
    growthRate: {
      monthly: number
      weekly: number
    }
  }
  topCategories: {
    agencyTypes: FacetOption[]
    industries: FacetOption[]
    locations: FacetOption[]
    companyTypes: FacetOption[]
  }
  recentActivity: {
    newCompanies: number
    newContacts: number
    verifications: number
    updates: number
  }
}

export interface RelationshipData {
  agencyClients: Array<{
    agency: Company
    client: Company
    relationshipType: string
    startDate?: Date
    isActive: boolean
  }>
  advertiserAgencies: Array<{
    advertiser: Company
    agency: Company
    relationshipType: string
    startDate?: Date
    isActive: boolean
  }>
}

// API Response Types
export interface CompanySearchResponse {
  companies: Company[]
  totalCount: number
  facets: SearchFacets
  pagination: {
    total: number
    page: number
    limit: number
    offset: number
    totalPages: number
    hasMore: boolean
  }
  searchParams: any
}

export interface ContactSearchResponse {
  contacts: Contact[]
  totalCount: number
  facets: SearchFacets
  pagination: {
    total: number
    page: number
    limit: number
    offset: number
    totalPages: number
    hasMore: boolean
  }
  searchParams: any
}

export interface AnalyticsResponse {
  success: boolean
  data: OrgAnalytics
  timestamp: Date
}

// Enhanced Company Profile Types
export interface CompanyProfile extends Company {
  teams?: Team[]
  recentActivity?: Activity[]
  relationships?: RelationshipData
  insights?: CompanyInsight[]
  contactHierarchy?: ContactHierarchy
}

export interface Team {
  id: string
  name: string
  department: string
  company_id: string
  contacts: Contact[]
  handles: string[]
  accountsManaged: string[]
  lastActivity: Date
  teamLead?: Contact
}

export interface ContactHierarchy {
  cLevel: Contact[]
  vpLevel: Contact[]
  directorLevel: Contact[]
  managerLevel: Contact[]
  specialists: Contact[]
  reportingStructure: Array<{
    manager: Contact
    reports: Contact[]
  }>
}

export interface Activity {
  id: string
  type: 'contact_added' | 'company_updated' | 'verification' | 'new_relationship'
  title: string
  description: string
  timestamp: Date
  actorType: 'system' | 'admin' | 'user'
  metadata?: any
}

export interface CompanyInsight {
  id: string
  type: string
  title: string
  content: string
  sourceUrl?: string
  relevanceScore: number
  isAiGenerated: boolean
  createdAt: Date
  expiresAt?: Date
} 