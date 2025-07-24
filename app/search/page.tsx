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
  type: string
  industry: string
  description: string
  website: string
  employeeCount: number
  headquarters: string
  revenue: string
  contacts: Array<{
    id: string
    name: string
    title: string
    email: string
    isDecisionMaker: boolean
    department: string
  }>
  _count: {
    contacts: number
  }
}

interface Contact {
  id: string
  name: string
  title: string
  email: string
  phone: string
  isDecisionMaker: boolean
  department: string
  seniority: string
  company: {
    id: string
    name: string
    type: string
    industry: string
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
      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (searchType === 'companies') {
          setCompanies(data.companies)
        } else {
          setContacts(data.contacts)
        }
        setPagination(data.pagination)
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
          <Button 
            variant="default"
            onClick={() => router.push('/search/enhanced')}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            ✨ Enhanced Search
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/intelligence')}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Intelligence
          </Button>
        </div>
      }
    >
      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </CardTitle>
          <CardDescription>
            Search our database of companies and contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${searchType}...`}
                className="flex-1 px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <Button type="submit" disabled={!searchQuery.trim() || loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={searchType === 'companies' ? 'default' : 'outline'}
                onClick={() => setSearchType('companies')}
                className="flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Companies
              </Button>
              <Button
                type="button"
                variant={searchType === 'contacts' ? 'default' : 'outline'}
                onClick={() => setSearchType('contacts')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Contacts
              </Button>
            </div>

            {/* Filters */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {searchType === 'companies' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Types</option>
                    <option value="ADVERTISER">Advertiser</option>
                    <option value="AGENCY">Agency</option>
                    <option value="MEDIA_COMPANY">Media Company</option>
                    <option value="TECH_VENDOR">Tech Vendor</option>
                    <option value="PUBLISHER">Publisher</option>
                  </select>
                  
                  <input
                    type="text"
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    placeholder="Industry"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  
                  <input
                    type="text"
                    value={filters.headquarters}
                    onChange={(e) => setFilters({...filters, headquarters: e.target.value})}
                    placeholder="Headquarters"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  
                  <input
                    type="number"
                    value={filters.minEmployees}
                    onChange={(e) => setFilters({...filters, minEmployees: e.target.value})}
                    placeholder="Min Employees"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  
                  <input
                    type="number"
                    value={filters.maxEmployees}
                    onChange={(e) => setFilters({...filters, maxEmployees: e.target.value})}
                    placeholder="Max Employees"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                    placeholder="Department"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  
                  <select
                    value={filters.isDecisionMaker}
                    onChange={(e) => setFilters({...filters, isDecisionMaker: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Contacts</option>
                    <option value="true">Decision Makers Only</option>
                    <option value="false">Non-Decision Makers</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-700" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Info */}
      {searchInfo && (
        <div className="mb-6 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing results for "{searchQuery}" • User tier: {searchInfo.userTier}
          </div>
          {searchInfo.userTier === 'FREE' && (
            <div>
              Search tracked • <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/upgrade')}>
                Upgrade for unlimited searches
              </Button>
            </div>
          )}
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
                      <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs font-medium">
                        {company.type.replace('_', ' ')}
                      </span>
                      {company.industry && <span>{company.industry}</span>}
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
                      {company._count.contacts} contacts
                    </span>
                  </div>
                </div>
                
                {/* Top Contacts */}
                {company.contacts.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-900 mb-2">Key Contacts:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {company.contacts.slice(0, 2).map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-gray-600">{contact.title}</p>
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{contact.name}</h3>
                    <p className="text-gray-600 mb-2">{contact.title}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                        {contact.company.name}
                      </span>
                      <span>{contact.company.industry}</span>
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
                      <Building className="w-3 h-3" />
                      {contact.department}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSearch(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handleSearch(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && searchQuery && (searchType === 'companies' ? companies.length === 0 : contacts.length === 0) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
} 