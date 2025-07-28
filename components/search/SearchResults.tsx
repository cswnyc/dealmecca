'use client'

import React, { useState } from 'react'
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  TrendingUp, 
  Brain, 
  Star, 
  ArrowRight,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  Award,
  Briefcase,
  Clock,
  UserPlus,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Contact {
  id: string
  name: string
  title: string
  email: string
  phone?: string
  isDecisionMaker: boolean
  department: string
  seniority?: string
  linkedinUrl?: string
  recentActivity?: string
  bestContactMethod?: string
  influence?: 'high' | 'medium' | 'low'
}

interface CompanyInsight {
  id: string
  type: 'NEWS' | 'LEADERSHIP_CHANGE' | 'FUNDING' | 'ACQUISITION' | 'PRODUCT_LAUNCH' | 'MEDIA_SPEND_CHANGE' | 'AI_SUMMARY'
  title: string
  content: string
  sourceUrl?: string
  relevanceScore: number
  createdAt: string
  expiresAt?: string
}

interface ConnectionPath {
  mutualConnections: {
    contact: Contact
    relationship: string
    strength: 'strong' | 'medium' | 'weak'
    lastInteraction: string
  }[]
  eventAttendance: {
    id: string
    name: string
    date: string
    type: string
  }[]
  forumMentions: number
}

interface MediaStrategy {
  primaryChannels: string[]
  estimatedBudget: string
  recentCampaigns: string[]
  agencyPartners: string[]
}

interface CompetitorAnalysis {
  mainCompetitors: string[]
  marketPosition: string
  differentiators: string[]
}

interface EnhancedCompany {
  id: string
  name: string
  type?: string
  industry?: string
  description?: string
  website?: string
  employeeCount?: number
  headquarters?: string
  revenue?: string
  logoUrl?: string
  stockSymbol?: string
  foundedYear?: number
  
  // AI-powered insights
  aiSummary: string
  insights: CompanyInsight[]
  
  // Key contacts with enhanced data
  keyContacts: Contact[]
  
  // Connection intelligence
  connectionPath: ConnectionPath
  
  // Media intelligence
  mediaStrategy: MediaStrategy
  
  // Competitive analysis
  competitorAnalysis: CompetitorAnalysis
  
  // Engagement metrics
  lastUpdated: string
  totalContacts: number
  recentActivity: string
}

interface SearchResultsProps {
  companies: EnhancedCompany[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onCompanyClick: (company: EnhancedCompany) => void
  onContactClick: (contact: Contact) => void
  onSaveCompany: (companyId: string) => void
  onViewInsight: (insight: CompanyInsight) => void
  favorites: string[]
}

export default function SearchResults({
  companies,
  loading,
  pagination,
  onPageChange,
  onCompanyClick,
  onContactClick,
  onSaveCompany,
  onViewInsight,
  favorites
}: SearchResultsProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())

  const toggleExpanded = (companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(companyId)) {
        newSet.delete(companyId)
      } else {
        newSet.add(companyId)
      }
      return newSet
    })
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'NEWS': return <TrendingUp className="w-4 h-4" />
      case 'LEADERSHIP_CHANGE': return <Users className="w-4 h-4" />
      case 'FUNDING': return <DollarSign className="w-4 h-4" />
      case 'ACQUISITION': return <Briefcase className="w-4 h-4" />
      case 'PRODUCT_LAUNCH': return <Star className="w-4 h-4" />
      case 'MEDIA_SPEND_CHANGE': return <Target className="w-4 h-4" />
      case 'AI_SUMMARY': return <Brain className="w-4 h-4" />
      default: return <TrendingUp className="w-4 h-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'NEWS': return 'bg-blue-100 text-blue-800'
      case 'LEADERSHIP_CHANGE': return 'bg-purple-100 text-purple-800'
      case 'FUNDING': return 'bg-green-100 text-green-800'
      case 'ACQUISITION': return 'bg-orange-100 text-orange-800'
      case 'PRODUCT_LAUNCH': return 'bg-pink-600 text-white'
      case 'MEDIA_SPEND_CHANGE': return 'bg-yellow-100 text-yellow-800'
      case 'AI_SUMMARY': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatEmployeeCount = (count: number | undefined) => {
    if (!count) return 'N/A'
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const formatRevenue = (revenue: string | undefined) => {
    if (!revenue) return 'N/A'
    return revenue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Brain className="w-4 h-4" />
          <span>AI-powered insights included</span>
        </div>
      </div>

      {/* Company results */}
      <div className="space-y-4">
        {companies.map((company) => {
          const isExpanded = expandedCompanies.has(company.id)
          const isFavorite = favorites.includes(company.id)
          
          return (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {company.logoUrl ? (
                      <img 
                        src={company.logoUrl} 
                        alt={company.name} 
                        className="w-12 h-12 object-contain rounded"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Company info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {company.name}
                          {company.stockSymbol && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({company.stockSymbol})
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {company.type && <Badge variant="secondary">{company.type.replace('_', ' ')}</Badge>}
                          {company.industry && <span>{company.industry}</span>}
                          {company.headquarters && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {company.headquarters}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSaveCompany(company.id)}
                          className={`p-2 ${isFavorite ? 'text-red-700 bg-red-50 hover:bg-red-100' : 'text-gray-400'}`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(company.id)}
                          className="flex items-center gap-2"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {isExpanded ? 'Less' : 'More'}
                        </Button>
                      </div>
                    </div>

                    {/* Company metrics */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{formatEmployeeCount(company.employeeCount)} employees</span>
                      </div>
                      {company.revenue && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${formatRevenue(company.revenue)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{company.totalContacts} contacts</span>
                      </div>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* AI Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">AI Summary</span>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {company.aiSummary}
                      </p>
                    </div>

                    {/* Key insights */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.insights.slice(0, 3).map((insight) => (
                        <button
                          key={insight.id}
                          onClick={() => onViewInsight(insight)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${getInsightColor(insight.type)}`}
                        >
                          {getInsightIcon(insight.type)}
                          <span>{insight.title}</span>
                        </button>
                      ))}
                      {company.insights.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{company.insights.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Connection paths */}
                    {company.connectionPath.mutualConnections.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <UserPlus className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Connection Opportunities</span>
                        </div>
                        <div className="space-y-1">
                          {company.connectionPath.mutualConnections.slice(0, 2).map((conn, index) => (
                            <div key={index} className="text-sm text-green-800">
                              <span className="font-medium">{conn.contact.name}</span>
                              <span className="text-green-600"> ({conn.relationship})</span>
                            </div>
                          ))}
                          {company.connectionPath.mutualConnections.length > 2 && (
                            <div className="text-xs text-green-600">
                              +{company.connectionPath.mutualConnections.length - 2} more connections
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key contacts preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {company.keyContacts.slice(0, 4).map((contact) => (
                        <div
                          key={contact.id}
                          className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => onContactClick(contact)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{contact.name}</span>
                                {contact.isDecisionMaker && (
                                  <Badge variant="destructive" className="text-xs">
                                    Decision Maker
                                  </Badge>
                                )}
                                {contact.influence && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      contact.influence === 'high' ? 'border-red-200 text-red-700' :
                                      contact.influence === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                      'border-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {contact.influence} influence
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 truncate">{contact.title}</div>
                              <div className="text-xs text-gray-500">{contact.department}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              {contact.email && (
                                <Mail className="w-3 h-3 text-gray-400" />
                              )}
                              {contact.phone && (
                                <Phone className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                          {contact.recentActivity && (
                            <div className="text-xs text-blue-600 mt-1">
                              {contact.recentActivity}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t pt-4 space-y-4">
                        {/* Media Strategy */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Media Strategy</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Primary Channels</div>
                                <div className="flex flex-wrap gap-1">
                                  {company.mediaStrategy.primaryChannels.map((channel) => (
                                    <Badge key={channel} variant="outline" className="text-xs">
                                      {channel}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Estimated Budget</div>
                                <div className="text-sm text-gray-600">{company.mediaStrategy.estimatedBudget}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Competitive Analysis */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Competitive Analysis</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Main Competitors</div>
                                <div className="text-sm text-gray-600">
                                  {company.competitorAnalysis.mainCompetitors.join(', ')}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Market Position</div>
                                <div className="text-sm text-gray-600">{company.competitorAnalysis.marketPosition}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* All insights */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">All Insights</h4>
                          <div className="space-y-2">
                            {company.insights.map((insight) => (
                              <div key={insight.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <div className={`p-1 rounded ${getInsightColor(insight.type)}`}>
                                    {getInsightIcon(insight.type)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{insight.title}</div>
                                    <div className="text-sm text-gray-600 mt-1">{insight.content}</div>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      <span>{insight.createdAt}</span>
                                      {insight.sourceUrl && (
                                        <a
                                          href={insight.sourceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          Source
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        onClick={() => onCompanyClick(company)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onContactClick(company.keyContacts[0])}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 