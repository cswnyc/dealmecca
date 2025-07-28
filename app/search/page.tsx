'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Users, 
  Building, 
  Filter,
  ArrowRight,
  Mail,
  Phone,
  Globe,
  MapPin,
  TrendingUp,
  AlertCircle,
  Target
} from 'lucide-react'
import PageLayout from '@/components/navigation/PageLayout'

interface Company {
  id: string
  name: string
  type?: string
  industry?: string
  description?: string
  website?: string
  employeeCount?: number
  headquarters?: string
  revenue?: string
  contacts?: Array<{
    id: string
    firstName: string
    lastName: string
    fullName?: string
    title?: string
    email?: string
    isDecisionMaker?: boolean
    department?: string
  }>
  _count?: {
    contacts: number
  }
}

interface Contact {
  id: string
  firstName?: string
  lastName?: string
  fullName?: string
  title?: string
  email?: string
  phone?: string
  isDecisionMaker?: boolean
  department?: string
  seniority?: string
  company?: {
    id: string
    name: string
    type?: string
    industry?: string
  }
}

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'companies' | 'contacts'>('companies')
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filters, setFilters] = useState({
    type: '',
    industry: '',
    minEmployees: '',
    maxEmployees: '',
    headquarters: '',
    isDecisionMaker: '',
    department: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [searchInfo, setSearchInfo] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return

    // Prevent search if still loading authentication
    if (status === 'loading') {
      setError('Please wait while we verify your authentication...')
      return
    }

    // Ensure user is authenticated before searching
    if (status === 'unauthenticated' || !session) {
      setError('Please sign in to use search functionality')
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const endpoint = searchType === 'companies' ? '/api/companies' : '/api/contacts'
      const response = await fetch(`${endpoint}?${params}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (response.ok) {
        if (searchType === 'companies') {
          setCompanies(data.companies || [])
        } else {
          setContacts(data.contacts || [])
        }
        setPagination({
          page: data.page || 1,
          limit: data.limit || 10,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        })
        setSearchInfo(data.searchInfo)
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setError('Your session has expired. Please sign in again.')
          router.push('/auth/signin')
          return
        } else if (response.status === 403 && data.upgradeUrl) {
          setError(data.message || 'Search limit exceeded')
          // Show upgrade prompt for search limit exceeded
          setTimeout(() => {
            if (confirm('Search limit exceeded. Upgrade to Pro for unlimited searches?')) {
              router.push(data.upgradeUrl)
            }
          }, 100)
        } else {
          setError(data.message || data.error || 'Search failed')
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('An error occurred while searching. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(1)
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      industry: '',
      minEmployees: '',
      maxEmployees: '',
      headquarters: '',
      isDecisionMaker: '',
      department: ''
    })
  }

  // Helper function to safely format text with underscores
  const formatText = (text: string | undefined | null): string => {
    if (!text) return 'N/A'
    return text.replace(/_/g, ' ')
  }

  // Helper function to get contact count safely
  const getContactCount = (company: Company): number => {
    return company._count?.contacts || company.contacts?.length || 0
  }

  // Helper function to get full name safely
  const getFullName = (contact: Contact): string => {
    if (contact.fullName) return contact.fullName
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
    }
    return 'Unknown Contact'
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Search Database"
      description="Find companies and contacts in our comprehensive database"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <Filter className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
          <Button size="sm">
            <Target className="w-4 h-4 mr-1" />
            Advanced Search
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Database
            </CardTitle>
            <CardDescription>
              Search our comprehensive database of companies and contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter company name, industry, or keywords..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={searchType === 'companies' ? 'default' : 'outline'}
                    onClick={() => setSearchType('companies')}
                  >
                    <Building className="w-4 h-4 mr-1" />
                    Companies
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === 'contacts' ? 'default' : 'outline'}
                    onClick={() => setSearchType('contacts')}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Contacts
                  </Button>
                </div>
                <Button type="submit" disabled={loading || !searchQuery.trim()}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">All Industries</option>
                <option value="ADVERTISING">Advertising</option>
                <option value="ENTERTAINMENT_MEDIA">Entertainment & Media</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="FINANCE">Finance</option>
              </select>

              {searchType === 'companies' && (
                <>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">All Company Types</option>
                    <option value="AGENCY">Agency</option>
                    <option value="BRAND">Brand</option>
                    <option value="PUBLISHER">Publisher</option>
                    <option value="TECHNOLOGY">Technology</option>
                  </select>

                  <input
                    type="text"
                    value={filters.headquarters}
                    onChange={(e) => setFilters({ ...filters, headquarters: e.target.value })}
                    placeholder="Location"
                    className="px-3 py-1 border border-gray-300 rounded text-sm w-32"
                  />
                </>
              )}

              {searchType === 'contacts' && (
                <>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">All Departments</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="SALES">Sales</option>
                    <option value="ADVERTISING">Advertising</option>
                    <option value="MEDIA">Media</option>
                  </select>

                  <select
                    value={filters.isDecisionMaker}
                    onChange={(e) => setFilters({ ...filters, isDecisionMaker: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">All Contacts</option>
                    <option value="true">Decision Makers Only</option>
                  </select>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Info */}
        {searchInfo && (
          <Card className="border-sky-200 bg-sky-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sky-700">
                <TrendingUp className="w-5 h-5" />
                <p>{searchInfo.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {!loading && (companies.length > 0 || contacts.length > 0) && (
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {searchType === 'companies' ? companies.length : contacts.length} of{' '}
              {pagination.total} results for "{searchQuery}"
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handleSearch(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handleSearch(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {searchType === 'companies' ? (
          <div className="space-y-4">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{company.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {company.type && (
                          <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs font-medium">
                            {formatText(company.type)}
                          </span>
                        )}
                        {company.industry && <span>{formatText(company.industry)}</span>}
                        {company.headquarters && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {company.headquarters}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  
                  {company.description && (
                    <p className="text-gray-700 mb-4 line-clamp-2">{company.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      {company.employeeCount && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {company.employeeCount.toLocaleString()} employees
                        </span>
                      )}
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center gap-1 text-sky-600 hover:text-sky-800">
                          <Globe className="w-3 h-3" />
                          Website
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {getContactCount(company)} contacts
                      </span>
                    </div>
                  </div>
                  
                  {/* Top Contacts */}
                  {company.contacts && company.contacts.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-2">Key Contacts:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {company.contacts.slice(0, 2).map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{getFullName(contact)}</p>
                              <p className="text-xs text-gray-600">{contact.title || 'N/A'}</p>
                            </div>
                            {contact.isDecisionMaker && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Decision Maker
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{getFullName(contact)}</h3>
                      <p className="text-gray-600 mb-2">{contact.title || 'N/A'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {contact.company && (
                          <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                            {contact.company.name}
                          </span>
                        )}
                        {contact.company?.industry && <span>{formatText(contact.company.industry)}</span>}
                        {contact.isDecisionMaker && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Decision Maker
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} 
                         className="flex items-center gap-1 text-sky-600 hover:text-sky-800">
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} 
                         className="flex items-center gap-1 text-sky-600 hover:text-sky-800">
                        <Phone className="w-3 h-3" />
                        Phone
                      </a>
                    )}
                    {contact.department && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatText(contact.department)}
                      </span>
                    )}
                    {contact.seniority && (
                      <span className="text-gray-600">{formatText(contact.seniority)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && searchQuery && companies.length === 0 && contacts.length === 0 && !error && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any {searchType} matching "{searchQuery}". Try adjusting your search terms or filters.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
} 