'use client'

import { useAuth } from '@/lib/auth/firebase-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Users, MapPin, Filter, Plus, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'

// Force dynamic rendering for user-specific content
export const dynamic = 'force-dynamic'

interface Company {
  id: string
  name: string
  industry: string
  city: string
  state: string
  country: string
  companyType: string
  agencyType?: string
  employeeCount?: number
  verified: boolean
  logoUrl?: string
  description?: string
  website?: string
  _count: {
    contacts: number
  }
}

export default function OrganizationsPage() {
  // Handle cases where Firebase provider might not be available (e.g., during build)
  let firebaseUser = null;
  let authLoading = false;
  
  try {
    const authContext = useAuth();
    firebaseUser = authContext.user;
    authLoading = authContext.loading;
  } catch (error) {
    // If useAuth fails (e.g., during build), just use defaults
    console.log('OrganizationsPage: Firebase context not available, using defaults');
  }

  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedCompanyType, setSelectedCompanyType] = useState('')

  // Fetch companies data
  useEffect(() => {
    fetchCompanies()
  }, [])

  // Filter companies based on search and filters
  useEffect(() => {
    let filtered = companies

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.city.toLowerCase().includes(query) ||
        company.state.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query)
      )
    }

    if (selectedIndustry) {
      filtered = filtered.filter(company => company.industry === selectedIndustry)
    }

    if (selectedCompanyType) {
      filtered = filtered.filter(company => company.companyType === selectedCompanyType)
    }

    setFilteredCompanies(filtered)
  }, [searchQuery, selectedIndustry, selectedCompanyType, companies])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orgs/companies')
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      
      const data = await response.json()
      setCompanies(data.companies || [])
      setError(null)
    } catch (error: any) {
      console.error('Error fetching companies:', error)
      setError('Failed to load companies. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getUniqueValues = (field: keyof Company) => {
    return [...new Set(companies.map(company => company[field]).filter(Boolean))]
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedIndustry('')
    setSelectedCompanyType('')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Building2 className="h-8 w-8 mr-3 text-sky-600" />
                    Organizations
                  </h1>
                  <p className="mt-1 text-gray-600">
                    Explore companies and their contact information
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-sm">
                    {filteredCompanies.length} companies
                  </Badge>
                  {firebaseUser && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search companies by name, industry, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">All Industries</option>
                  {getUniqueValues('industry').map((industry) => (
                    <option key={industry as string} value={industry as string}>
                      {industry as string}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Type
                </label>
                <select
                  value={selectedCompanyType}
                  onChange={(e) => setSelectedCompanyType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {getUniqueValues('companyType').map((type) => (
                    <option key={type as string} value={type as string}>
                      {type as string}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading companies...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchCompanies}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Companies Grid */}
        {!loading && !error && (
          <>
            {filteredCompanies.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No companies found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || selectedIndustry || selectedCompanyType
                      ? "Try adjusting your search criteria"
                      : "No companies are available at this time"}
                  </p>
                  {(searchQuery || selectedIndustry || selectedCompanyType) && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <Card key={company.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center">
                            {company.logoUrl ? (
                              <img
                                src={company.logoUrl}
                                alt={`${company.name} logo`}
                                className="w-6 h-6 mr-2 rounded"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 mr-2 text-gray-400" />
                            )}
                            {company.name}
                            {company.verified && (
                              <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {company.city}, {company.state}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Badge variant="secondary">{company.industry}</Badge>
                          <Badge variant="outline" className="ml-2">
                            {company.companyType}
                          </Badge>
                        </div>
                        
                        {company.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {company.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {company._count.contacts} contacts
                          </div>
                          {company.employeeCount && (
                            <div>
                              {company.employeeCount}+ employees
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/orgs/companies/${company.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </MainLayout>
  )
}