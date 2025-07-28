'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Users, MapPin, Globe, Mail, Phone, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PageLayout from '@/components/navigation/PageLayout'

// Using the WORKING Company interface pattern from orgs page
interface Company {
  id: string
  name: string
  industry?: string | null
  type?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  description?: string | null
  website?: string | null
  employeeCount?: number | null
  headquarters?: string | null
  verified?: boolean
  contacts?: Array<{
    id: string
    firstName?: string
    lastName?: string
    fullName?: string
    title?: string
    email?: string
    isDecisionMaker?: boolean
  }>
  _count?: {
    contacts: number
  } | null
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
    industry?: string
  }
}

export default function FixedSearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'companies' | 'contacts'>('companies')

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Initial data load - copy the working pattern from orgs page
  useEffect(() => {
    if (status === 'authenticated') {
      fetchInitialData()
    }
  }, [status])

  // Search filtering - copy the working pattern from orgs page
  useEffect(() => {
    if (searchType === 'companies') {
      if (!searchQuery.trim()) {
        setFilteredCompanies(companies)
      } else {
        const filtered = companies.filter(company =>
          (company.name && company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (company.type && company.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (company.description && company.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setFilteredCompanies(filtered)
      }
    } else {
      if (!searchQuery.trim()) {
        setFilteredContacts(contacts)
      } else {
        const filtered = contacts.filter(contact =>
          (contact.fullName && contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (contact.title && contact.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (contact.company?.name && contact.company.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setFilteredContacts(filtered)
      }
    }
  }, [searchQuery, companies, contacts, searchType])

  // Copy the working fetchCompanies pattern from orgs page
  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (searchType === 'companies') {
        // Use the companies endpoint but with safe handling
        const response = await fetch('/api/companies?limit=50', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/signin')
            return
          }
          throw new Error('Failed to fetch companies')
        }
        
        const data = await response.json()
        const safeCompanies = (data.companies || []).map((company: any) => ({
          ...company,
          // Ensure safe field access
          industry: company.industry || null,
          type: company.type || null,
          city: company.city || null,
          state: company.state || null,
          description: company.description || null,
          website: company.website || null,
          verified: company.verified || false,
          _count: company._count || { contacts: 0 }
        }))
        
        setCompanies(safeCompanies)
        setFilteredCompanies(safeCompanies)
      } else {
        const response = await fetch('/api/contacts?limit=50', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/signin')
            return
          }
          throw new Error('Failed to fetch contacts')
        }
        
        const data = await response.json()
        setContacts(data.contacts || [])
        setFilteredContacts(data.contacts || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Safe helper functions - copying orgs page pattern
  const getContactCount = (company: Company) => {
    if (company._count && typeof company._count === 'object') {
      return company._count.contacts || 0
    }
    return company.contacts?.length || 0
  }

  const getFullName = (contact: Contact) => {
    if (contact.fullName) return contact.fullName
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
    }
    return 'Unknown Contact'
  }

  const handleSearchTypeChange = (type: 'companies' | 'contacts') => {
    setSearchType(type)
    setSearchQuery('')
    if (type !== searchType) {
      fetchInitialData()
    }
  }

  if (status === 'loading') {
    return (
      <PageLayout title="Search Database" description="Loading...">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const headerActions = (
    <div className="flex items-center space-x-2">
      <div className="flex gap-2">
        <Button
          variant={searchType === 'companies' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSearchTypeChange('companies')}
        >
          <Building2 className="w-4 h-4 mr-1" />
          Companies
        </Button>
        <Button
          variant={searchType === 'contacts' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSearchTypeChange('contacts')}
        >
          <Users className="w-4 h-4 mr-1" />
          Contacts
        </Button>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${searchType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-64"
        />
      </div>
      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSearchQuery('')}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear
        </Button>
      )}
    </div>
  )

  return (
    <PageLayout
      title="Search Database"
      description="Find companies and contacts in our database"
      actions={headerActions}
    >
      <div className="space-y-6">
        {/* Stats Cards - copying orgs page pattern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {searchType === 'companies' ? 'Total Companies' : 'Total Contacts'}
              </CardTitle>
              {searchType === 'companies' ? (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {searchType === 'companies' ? companies.length : contacts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? `Found ${searchType === 'companies' ? filteredCompanies.length : filteredContacts.length} matching "${searchQuery}"` : 'Total records'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Records</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {searchType === 'companies' 
                  ? companies.filter(c => c.verified).length
                  : contacts.filter(c => c.email).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {searchType === 'companies' ? 'Verified companies' : 'With email contact'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {searchType === 'companies' ? filteredCompanies.length : filteredContacts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Current results
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results List - copying orgs page safe pattern */}
        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery 
                ? `Search Results (${searchType === 'companies' ? filteredCompanies.length : filteredContacts.length})`
                : `Recent ${searchType === 'companies' ? 'Companies' : 'Contacts'}`
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading {searchType}...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={fetchInitialData}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : searchType === 'companies' ? (
              filteredCompanies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {searchQuery ? `No companies found matching "${searchQuery}"` : 'No companies found'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCompanies.slice(0, 20).map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="bg-sky-100 p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{company.name}</h3>
                          <p className="text-sm text-gray-600">
                            {company.industry || 'Unknown Industry'} 
                            {company.city && company.state && ` • ${company.city}, ${company.state}`}
                            {company.headquarters && !company.city && ` • ${company.headquarters}`}
                          </p>
                          {company.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{company.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {company.verified && (
                          <Badge variant="default">
                            <Star className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {company.type && (
                          <Badge variant="outline">
                            {company.type}
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {getContactCount(company)} contacts
                        </Badge>
                        {company.website && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={company.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Contacts view
              filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {searchQuery ? `No contacts found matching "${searchQuery}"` : 'No contacts found'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.slice(0, 20).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="bg-teal-100 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{getFullName(contact)}</h3>
                          <p className="text-sm text-gray-600">
                            {contact.title || 'No title'}
                            {contact.company?.name && ` • ${contact.company.name}`}
                          </p>
                          {contact.department && (
                            <p className="text-xs text-gray-500 mt-1">{contact.department}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {contact.isDecisionMaker && (
                          <Badge variant="default">
                            Decision Maker
                          </Badge>
                        )}
                        {contact.seniority && (
                          <Badge variant="outline">
                            {contact.seniority}
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          {contact.email && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`mailto:${contact.email}`}>
                                <Mail className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {contact.phone && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`tel:${contact.phone}`}>
                                <Phone className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
} 