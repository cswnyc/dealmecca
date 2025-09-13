'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useAuth } from '@/lib/auth/firebase-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Filter, X, Building2, Users, MapPin, Target, Star, 
  Crown, ChevronDown, ChevronUp, Zap, Mail, Phone, Globe, 
  TrendingUp, Award, Briefcase, Bot
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import PageLayout from '@/components/navigation/PageLayout'

// Types
interface Contact {
  id: string
  firstName: string
  lastName: string
  fullName?: string
  title: string
  email?: string
  phone?: string
  seniority?: string
  department?: string
  isDecisionMaker: boolean
  verified: boolean
  company: {
    id: string
    name: string
    companyType?: string
    industry?: string
    city?: string
    state?: string
    verified: boolean
  }
}

interface Company {
  id: string
  name: string
  companyType?: string
  industry?: string
  city?: string
  state?: string
  verified: boolean
  _count: {
    contacts: number
  }
}

interface SearchResults {
  contacts: Contact[]
  companies: Company[]
  totalContacts: number
  totalCompanies: number
  totalResults: number
}

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface AppliedFilter {
  type: string
  value: string
  label: string
}

interface QuickFilter {
  id: string
  label: string
  description: string
  icon: string
  filters: Record<string, any>
  count?: number
}

interface SearchStats {
  totalContacts: number
  totalCompanies: number
  cLevelContacts: number
  agencyContacts: number
  brandContacts: number
  decisionMakers: number
}

const QUICK_FILTER_ICONS: Record<string, string> = {
  '👑': 'Crown',
  '🎯': 'Target', 
  '🚀': 'TrendingUp',
  '🤖': 'Bot',
  '🏙️': 'MapPin',
  '💼': 'Briefcase'
}

function SearchIntelligenceContent() {
  const { user: firebaseUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [searchType, setSearchType] = useState<'both' | 'contacts' | 'companies'>(
    (searchParams.get('type') as any) || 'both'
  )
  
  // Results state
  const [results, setResults] = useState<SearchResults>({
    contacts: [],
    companies: [],
    totalContacts: 0,
    totalCompanies: 0,
    totalResults: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [showFilters, setShowFilters] = useState(true)
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([])
  const [availableFilters, setAvailableFilters] = useState<{
    departments: FilterOption[]
    seniorities: FilterOption[]
    companyTypes: FilterOption[]
    industries: FilterOption[]
    locations: FilterOption[]
  }>({
    departments: [],
    seniorities: [],
    companyTypes: [],
    industries: [],
    locations: []
  })
  
  // Quick filters and stats
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([])
  const [stats, setStats] = useState<SearchStats>({
    totalContacts: 0,
    totalCompanies: 0,
    cLevelContacts: 0,
    agencyContacts: 0,
    brandContacts: 0,
    decisionMakers: 0
  })
  
  // Selected filter values
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedSeniorities, setSelectedSeniorities] = useState<string[]>([])
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [showDecisionMakersOnly, setShowDecisionMakersOnly] = useState(false)

  // Load initial data
  useEffect(() => {
    loadFilterOptions()
    performSearch()
  }, [])

  // Perform search when filters or query change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [
    searchQuery, 
    searchType, 
    selectedDepartments, 
    selectedSeniorities, 
    selectedCompanyTypes, 
    selectedIndustries, 
    selectedLocations,
    showDecisionMakersOnly
  ])

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/search/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getFilterOptions' })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvailableFilters(data.filters)
        setQuickFilters(data.quickFilters)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  const performSearch = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (searchQuery) params.set('q', searchQuery)
      params.set('searchType', searchType)
      
      // Add filter parameters
      selectedDepartments.forEach(dept => params.append('department', dept))
      selectedSeniorities.forEach(sen => params.append('seniority', sen))
      selectedCompanyTypes.forEach(type => params.append('companyType', type))
      selectedIndustries.forEach(ind => params.append('industry', ind))
      selectedLocations.forEach(loc => params.append('city', loc))
      
      if (showDecisionMakersOnly) {
        params.set('isDecisionMaker', 'true')
      }
      
      const response = await fetch(`/api/search/enhanced?${params}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.results)
        setAppliedFilters(data.filters.applied)
      } else {
        throw new Error(data.error || 'Search failed')
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const applyQuickFilter = useCallback(async (quickFilter: QuickFilter) => {
    // Reset current filters
    setSelectedDepartments([])
    setSelectedSeniorities([])
    setSelectedCompanyTypes([])
    setSelectedIndustries([])
    setSelectedLocations([])
    setShowDecisionMakersOnly(false)
    
    // Apply quick filter parameters
    const filters = quickFilter.filters
    
    if (filters.department) {
      setSelectedDepartments(Array.isArray(filters.department) ? filters.department : [filters.department])
    }
    if (filters.seniority) {
      setSelectedSeniorities(Array.isArray(filters.seniority) ? filters.seniority : [filters.seniority])
    }
    if (filters.companyType) {
      setSelectedCompanyTypes(Array.isArray(filters.companyType) ? filters.companyType : [filters.companyType])
    }
    if (filters.industry) {
      setSelectedIndustries(Array.isArray(filters.industry) ? filters.industry : [filters.industry])
    }
    if (filters.city) {
      setSelectedLocations(Array.isArray(filters.city) ? filters.city : [filters.city])
    }
    if (filters.isDecisionMaker) {
      setShowDecisionMakersOnly(true)
    }
    
    // Focus on contacts for most quick filters
    setSearchType('contacts')
  }, [])

  const clearAllFilters = () => {
    setSelectedDepartments([])
    setSelectedSeniorities([])
    setSelectedCompanyTypes([])
    setSelectedIndustries([])
    setSelectedLocations([])
    setShowDecisionMakersOnly(false)
    setSearchQuery('')
  }

  const removeFilter = (filter: AppliedFilter) => {
    switch (filter.type) {
      case 'department':
        setSelectedDepartments(prev => prev.filter(d => d !== filter.value))
        break
      case 'seniority':
        setSelectedSeniorities(prev => prev.filter(s => s !== filter.value))
        break
      case 'companyType':
        setSelectedCompanyTypes(prev => prev.filter(t => t !== filter.value))
        break
      case 'industry':
        setSelectedIndustries(prev => prev.filter(i => i !== filter.value))
        break
      case 'location':
        setSelectedLocations(prev => prev.filter(l => l !== filter.value))
        break
      case 'isDecisionMaker':
        setShowDecisionMakersOnly(false)
        break
    }
  }

  const getIconComponent = (iconStr: string) => {
    switch (iconStr) {
      case '👑': return Crown
      case '🎯': return Target
      case '🚀': return TrendingUp
      case '🤖': return Bot
      case '🏙️': return MapPin
      case '💼': return Briefcase
      default: return Star
    }
  }

  const headerActions = (
    <div className="flex items-center space-x-3">
      <div className="flex gap-2">
        <Button
          variant={searchType === 'both' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('both')}
        >
          All Results
        </Button>
        <Button
          variant={searchType === 'contacts' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('contacts')}
        >
          <Users className="w-4 h-4 mr-1" />
          Contacts
        </Button>
        <Button
          variant={searchType === 'companies' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('companies')}
        >
          <Building2 className="w-4 h-4 mr-1" />
          Companies
        </Button>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search contacts, companies, roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-80"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="w-4 h-4 mr-1" />
        Filters
        {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
      </Button>
    </div>
  )

  return (
    <PageLayout
      title="Media Seller Intelligence"
      description="Find and target media decision makers with advanced filtering"
      actions={headerActions}
    >
      <div className="space-y-6">
        {/* Quick Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Filters
            </CardTitle>
            <CardDescription>
              Common searches for media sellers - click to apply instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickFilters.map((filter) => {
                const IconComponent = getIconComponent(filter.icon)
                return (
                  <Button
                    key={filter.id}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center space-y-2 hover:bg-sky-50 hover:border-sky-300"
                    onClick={() => applyQuickFilter(filter)}
                  >
                    <IconComponent className="h-5 w-5 text-sky-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{filter.label}</div>
                      <div className="text-xs text-gray-500">{filter.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalContacts}</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalCompanies}</div>
              <div className="text-sm text-gray-600">Companies</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.cLevelContacts}</div>
              <div className="text-sm text-gray-600">C-Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.agencyContacts}</div>
              <div className="text-sm text-gray-600">Agency Contacts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.brandContacts}</div>
              <div className="text-sm text-gray-600">Brand Contacts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.decisionMakers}</div>
              <div className="text-sm text-gray-600">Decision Makers</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </span>
                    {appliedFilters.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                      >
                        Clear All
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Applied Filters */}
                  {appliedFilters.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Active Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {appliedFilters.map((filter, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {filter.label}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 w-4 h-4"
                              onClick={() => removeFilter(filter)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decision Makers */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="decision-makers"
                        checked={showDecisionMakersOnly}
                        onCheckedChange={(checked) => setShowDecisionMakersOnly(checked as boolean)}
                      />
                      <label 
                        htmlFor="decision-makers" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Decision Makers Only
                      </label>
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <h4 className="font-medium mb-2">Department</h4>
                    <Select
                      value={selectedDepartments[0] || ''}
                      onValueChange={(value) => {
                        if (value && !selectedDepartments.includes(value)) {
                          setSelectedDepartments([...selectedDepartments, value])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFilters.departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seniority Filter */}
                  <div>
                    <h4 className="font-medium mb-2">Seniority Level</h4>
                    <Select
                      value={selectedSeniorities[0] || ''}
                      onValueChange={(value) => {
                        if (value && !selectedSeniorities.includes(value)) {
                          setSelectedSeniorities([...selectedSeniorities, value])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select seniority..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFilters.seniorities.map((seniority) => (
                          <SelectItem key={seniority.value} value={seniority.value}>
                            {seniority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Type Filter */}
                  <div>
                    <h4 className="font-medium mb-2">Company Type</h4>
                    <Select
                      value={selectedCompanyTypes[0] || ''}
                      onValueChange={(value) => {
                        if (value && !selectedCompanyTypes.includes(value)) {
                          setSelectedCompanyTypes([...selectedCompanyTypes, value])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFilters.companyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <h4 className="font-medium mb-2">Industry</h4>
                    <Select
                      value={selectedIndustries[0] || ''}
                      onValueChange={(value) => {
                        if (value && !selectedIndustries.includes(value)) {
                          setSelectedIndustries([...selectedIndustries, value])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFilters.industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <Select
                      value={selectedLocations[0] || ''}
                      onValueChange={(value) => {
                        if (value && !selectedLocations.includes(value)) {
                          setSelectedLocations([...selectedLocations, value])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFilters.locations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Search Results ({results.totalResults} found)
                </CardTitle>
                <CardDescription>
                  {searchType === 'contacts' && `${results.totalContacts} contacts`}
                  {searchType === 'companies' && `${results.totalCompanies} companies`}
                  {searchType === 'both' && `${results.totalContacts} contacts • ${results.totalCompanies} companies`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Searching...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error: {error}</p>
                    <Button
                      variant="outline"
                      onClick={performSearch}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Contact Results */}
                    {(searchType === 'both' || searchType === 'contacts') && results.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
                        onClick={() => router.push(`/orgs/contacts/${contact.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-teal-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 hover:text-teal-600">
                              {contact.fullName || `${contact.firstName} ${contact.lastName}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {contact.title} • {contact.company.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {contact.seniority && (
                                <Badge variant="outline" className="text-xs">
                                  {contact.seniority.replace(/_/g, ' ')}
                                </Badge>
                              )}
                              {contact.department && (
                                <Badge variant="outline" className="text-xs">
                                  {contact.department.replace(/_/g, ' ')}
                                </Badge>
                              )}
                              {contact.company.city && contact.company.state && (
                                <Badge variant="outline" className="text-xs">
                                  {contact.company.city}, {contact.company.state}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {contact.isDecisionMaker && (
                            <Badge variant="default">
                              <Award className="w-3 h-3 mr-1" />
                              Decision Maker
                            </Badge>
                          )}
                          {contact.verified && (
                            <Badge variant="secondary">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <div className="flex space-x-1">
                            {contact.email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <a href={`mailto:${contact.email}`}>
                                  <Mail className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            {contact.phone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <a href={`tel:${contact.phone}`}>
                                  <Phone className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Company Results */}
                    {(searchType === 'both' || searchType === 'companies') && results.companies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
                        onClick={() => router.push(`/orgs/companies/${company.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-sky-100 p-2 rounded-lg">
                            <Building2 className="h-5 w-5 text-sky-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 hover:text-sky-600">{company.name}</h3>
                            <p className="text-sm text-gray-600">
                              {company.industry?.replace(/_/g, ' ') || 'Unknown Industry'}
                              {company.city && company.state && ` • ${company.city}, ${company.state}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {company.verified && (
                            <Badge variant="default">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {company.companyType && (
                            <Badge variant="outline">
                              {company.companyType.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {company._count.contacts} contacts
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {results.totalResults === 0 && !loading && (
                      <div className="text-center py-8">
                        <p className="text-gray-600">
                          {appliedFilters.length > 0 || searchQuery
                            ? 'No results found matching your criteria'
                            : 'Start searching or apply filters to find contacts and companies'
                          }
                        </p>
                        {appliedFilters.length > 0 && (
                          <Button
                            variant="link"
                            onClick={clearAllFilters}
                            className="mt-2"
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default function SearchIntelligencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading search interface...</p>
        </div>
      </div>
    }>
      <SearchIntelligenceContent />
    </Suspense>
  )
}
