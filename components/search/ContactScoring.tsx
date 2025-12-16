'use client'

import React, { useState } from 'react'
import { 
  User, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Clock, 
  Phone, 
  Mail,
  MessageCircle,
  Calendar,
  Star,
  Award,
  Zap,
  Shield,
  Users,
  Building2,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Info,
  Eye,
  ArrowRight,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ContactScore {
  overall: number
  influence: number
  accessibility: number
  budgetPotential: number
  urgency: number
  responseRate: number
}

interface ContactDetails {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  company: {
    id: string
    name: string
    industry: string
    size: string
    revenue: number
  }
  department: string
  seniority: 'C-Suite' | 'VP' | 'Director' | 'Manager' | 'Individual Contributor'
  tenure: number
  isDecisionMaker: boolean
  budget: number
  linkedinUrl?: string
  profileImageUrl?: string
  lastActivity: string
  engagement: {
    emailOpens: number
    emailClicks: number
    linkedinViews: number
    websiteVisits: number
  }
  mediaSpend: {
    current: number
    potential: number
    channels: string[]
    trends: 'increasing' | 'stable' | 'decreasing'
  }
  connectionStrength: 'direct' | 'warm' | 'cold'
  mutualConnections: number
  recentNews: string[]
  competitorInteractions: number
}

interface ScoringFactor {
  name: string
  value: number
  weight: number
  impact: 'positive' | 'negative' | 'neutral'
  explanation: string
}

interface ContactScoringProps {
  contact: ContactDetails
  onContactAction?: (action: string, contact: ContactDetails) => void
  onScoreUpdate?: (contactId: string, score: ContactScore) => void
  className?: string
}

export default function ContactScoring({
  contact,
  onContactAction,
  onScoreUpdate,
  className = ''
}: ContactScoringProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<'score' | 'factors' | 'history'>('score')

  // Calculate contact score using multiple factors
  const calculateScore = (contact: ContactDetails): ContactScore => {
    // Influence scoring (0-100)
    const seniorityScore = {
      'C-Suite': 100,
      'VP': 80,
      'Director': 60,
      'Manager': 40,
      'Individual Contributor': 20
    }[contact.seniority]

    const companySize = contact.company.size === 'Enterprise' ? 30 : 
                       contact.company.size === 'Mid-Market' ? 20 : 10
    const budgetInfluence = Math.min(contact.budget / 1000000 * 20, 30)
    const influence = Math.min(seniorityScore + companySize + budgetInfluence, 100)

    // Accessibility scoring (0-100)
    const connectionScore = {
      'direct': 40,
      'warm': 25,
      'cold': 10
    }[contact.connectionStrength]

    const mutualScore = Math.min(contact.mutualConnections * 5, 30)
    const activityScore = contact.engagement.emailOpens > 5 ? 20 : 
                         contact.engagement.emailOpens > 0 ? 10 : 0
    const recentActivityScore = new Date(contact.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 10 : 0
    const accessibility = Math.min(connectionScore + mutualScore + activityScore + recentActivityScore, 100)

    // Budget potential scoring (0-100)
    const currentSpendScore = Math.min(contact.mediaSpend.current / 100000 * 10, 30)
    const potentialSpendScore = Math.min(contact.mediaSpend.potential / 100000 * 10, 40)
    const trendScore = contact.mediaSpend.trends === 'increasing' ? 20 : 
                      contact.mediaSpend.trends === 'stable' ? 10 : 0
    const channelDiversityScore = Math.min(contact.mediaSpend.channels.length * 3, 15)
    const budgetPotential = Math.min(currentSpendScore + potentialSpendScore + trendScore + channelDiversityScore, 100)

    // Urgency scoring (0-100)
    const newsScore = contact.recentNews.length > 0 ? 30 : 0
    const competitorScore = contact.competitorInteractions > 0 ? 25 : 0
    const tenureScore = contact.tenure < 6 ? 20 : contact.tenure < 12 ? 10 : 0
    const decisionMakerScore = contact.isDecisionMaker ? 25 : 0
    const urgency = Math.min(newsScore + competitorScore + tenureScore + decisionMakerScore, 100)

    // Response rate prediction (0-100)
    const emailPerformance = contact.engagement.emailOpens > 0 ? 
      Math.min((contact.engagement.emailClicks / contact.engagement.emailOpens) * 100, 40) : 0
    const linkedinEngagement = contact.engagement.linkedinViews > 10 ? 20 : 
                              contact.engagement.linkedinViews > 0 ? 10 : 0
    const websiteEngagement = contact.engagement.websiteVisits > 5 ? 20 : 
                             contact.engagement.websiteVisits > 0 ? 10 : 0
    const connectionBonus = contact.connectionStrength === 'direct' ? 20 : 
                           contact.connectionStrength === 'warm' ? 15 : 0
    const responseRate = Math.min(emailPerformance + linkedinEngagement + websiteEngagement + connectionBonus, 100)

    // Overall score (weighted average)
    const overall = Math.round(
      (influence * 0.25) + 
      (accessibility * 0.20) + 
      (budgetPotential * 0.25) + 
      (urgency * 0.15) + 
      (responseRate * 0.15)
    )

    return {
      overall,
      influence: Math.round(influence),
      accessibility: Math.round(accessibility),
      budgetPotential: Math.round(budgetPotential),
      urgency: Math.round(urgency),
      responseRate: Math.round(responseRate)
    }
  }

  const score = calculateScore(contact)

  const getScoringFactors = (): ScoringFactor[] => {
    return [
      {
        name: 'Seniority Level',
        value: contact.seniority === 'C-Suite' ? 100 : contact.seniority === 'VP' ? 80 : 60,
        weight: 25,
        impact: 'positive',
        explanation: `${contact.seniority} position indicates high decision-making authority`
      },
      {
        name: 'Budget Authority',
        value: Math.min(contact.budget / 1000000 * 20, 100),
        weight: 20,
        impact: 'positive',
        explanation: `Controls $${(contact.budget / 1000000).toFixed(1)}M budget`
      },
      {
        name: 'Connection Strength',
        value: contact.connectionStrength === 'direct' ? 100 : contact.connectionStrength === 'warm' ? 60 : 30,
        weight: 15,
        impact: contact.connectionStrength === 'cold' ? 'negative' : 'positive',
        explanation: `${contact.connectionStrength} connection with ${contact.mutualConnections} mutual connections`
      },
      {
        name: 'Media Spend Trend',
        value: contact.mediaSpend.trends === 'increasing' ? 80 : contact.mediaSpend.trends === 'stable' ? 50 : 20,
        weight: 20,
        impact: contact.mediaSpend.trends === 'decreasing' ? 'negative' : 'positive',
        explanation: `Media spend is ${contact.mediaSpend.trends} (${contact.mediaSpend.channels.length} channels)`
      },
      {
        name: 'Recent Activity',
        value: new Date(contact.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 80 : 40,
        weight: 10,
        impact: 'positive',
        explanation: `Last activity: ${contact.lastActivity}`
      },
      {
        name: 'Competitor Interaction',
        value: contact.competitorInteractions > 0 ? 90 : 30,
        weight: 10,
        impact: contact.competitorInteractions > 0 ? 'positive' : 'neutral',
        explanation: contact.competitorInteractions > 0 ? 'Currently evaluating competitors' : 'No competitor activity'
      }
    ]
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-700 bg-red-50 border border-red-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />
    if (score >= 40) return <AlertCircle className="w-5 h-5 text-orange-600" />
    return <XCircle className="w-5 h-5 text-red-700" />
  }

  const getRecommendation = (score: ContactScore) => {
    if (score.overall >= 80) {
      return {
        action: 'High Priority',
        message: 'Immediate outreach recommended. High conversion potential.',
        urgency: 'high'
      }
    } else if (score.overall >= 60) {
      return {
        action: 'Medium Priority',
        message: 'Schedule follow-up within 3-5 days. Good potential.',
        urgency: 'medium'
      }
    } else if (score.overall >= 40) {
      return {
        action: 'Low Priority',
        message: 'Consider nurturing campaign. Limited immediate potential.',
        urgency: 'low'
      }
    } else {
      return {
        action: 'Deprioritize',
        message: 'Focus on higher-scoring contacts first.',
        urgency: 'low'
      }
    }
  }

  const recommendation = getRecommendation(score)
  const scoringFactors = getScoringFactors()

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Contact Intelligence Score
        </CardTitle>
        <CardDescription>
          AI-powered analysis of contact value and outreach potential
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Contact Summary */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            {contact.profileImageUrl ? (
              <img
                src={contact.profileImageUrl}
                alt={contact.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
              {contact.isDecisionMaker && (
                <Badge variant="destructive" className="text-xs">
                  Decision Maker
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-2">{contact.title}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{contact.company.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{(contact.company.revenue / 1000000).toFixed(0)}M revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{contact.tenure} months tenure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getScoreIcon(score.overall)}
              <div>
                <h4 className="font-semibold text-foreground">Overall Score</h4>
                <p className="text-sm text-muted-foreground">{recommendation.action}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{score.overall}</div>
              <div className="text-sm text-muted-foreground">/100</div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${score.overall}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{recommendation.message}</p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className={`p-3 rounded-lg ${getScoreColor(score.influence)}`}>
              <Award className="w-5 h-5 mx-auto mb-1" />
              <div className="font-semibold">{score.influence}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Influence</div>
          </div>
          <div className="text-center">
            <div className={`p-3 rounded-lg ${getScoreColor(score.accessibility)}`}>
              <Users className="w-5 h-5 mx-auto mb-1" />
              <div className="font-semibold">{score.accessibility}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Accessibility</div>
          </div>
          <div className="text-center">
            <div className={`p-3 rounded-lg ${getScoreColor(score.budgetPotential)}`}>
              <DollarSign className="w-5 h-5 mx-auto mb-1" />
              <div className="font-semibold">{score.budgetPotential}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Budget Potential</div>
          </div>
          <div className="text-center">
            <div className={`p-3 rounded-lg ${getScoreColor(score.urgency)}`}>
              <Zap className="w-5 h-5 mx-auto mb-1" />
              <div className="font-semibold">{score.urgency}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Urgency</div>
          </div>
          <div className="text-center">
            <div className={`p-3 rounded-lg ${getScoreColor(score.responseRate)}`}>
              <Activity className="w-5 h-5 mx-auto mb-1" />
              <div className="font-semibold">{score.responseRate}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Response Rate</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('score')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'score'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Score Analysis
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'factors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Scoring Factors
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Engagement History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'score' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-foreground mb-3">Media Spend Analysis</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Annual Spend</span>
                    <span className="font-medium">${(contact.mediaSpend.current / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Potential Annual Spend</span>
                    <span className="font-medium">${(contact.mediaSpend.potential / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spending Trend</span>
                    <Badge className={`text-xs ${
                      contact.mediaSpend.trends === 'increasing' ? 'bg-green-100 text-green-800' :
                      contact.mediaSpend.trends === 'stable' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-600 text-white'
                    }`}>
                      {contact.mediaSpend.trends}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Channels</span>
                    <span className="font-medium">{contact.mediaSpend.channels.length}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-foreground mb-3">Contact Intelligence</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Connection Type</span>
                    <Badge className={`text-xs ${
                      contact.connectionStrength === 'direct' ? 'bg-green-100 text-green-800' :
                      contact.connectionStrength === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.connectionStrength}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mutual Connections</span>
                    <span className="font-medium">{contact.mutualConnections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Recent News Items</span>
                    <span className="font-medium">{contact.recentNews.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Competitor Activity</span>
                    <span className="font-medium">{contact.competitorInteractions}</span>
                  </div>
                </div>
              </div>
            </div>

            {contact.recentNews.length > 0 && (
              <div>
                <h5 className="font-medium text-foreground mb-3">Recent News & Updates</h5>
                <div className="space-y-2">
                  {contact.recentNews.slice(0, 3).map((news, index) => (
                    <div key={index} className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-foreground">{news}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="space-y-4">
            {scoringFactors.map((factor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-foreground">{factor.name}</h5>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${
                      factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                      factor.impact === 'negative' ? 'bg-red-600 text-white' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {factor.impact}
                    </Badge>
                    <span className="text-sm font-medium">{factor.value}/100</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      factor.impact === 'positive' ? 'bg-green-500' :
                      factor.impact === 'negative' ? 'bg-red-600 text-white' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{factor.explanation}</p>
                <div className="text-xs text-muted-foreground mt-1">Weight: {factor.weight}%</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-foreground mb-3">Email Engagement</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email Opens</span>
                    <span className="font-medium">{contact.engagement.emailOpens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email Clicks</span>
                    <span className="font-medium">{contact.engagement.emailClicks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Click-through Rate</span>
                    <span className="font-medium">
                      {contact.engagement.emailOpens > 0 ? 
                        `${((contact.engagement.emailClicks / contact.engagement.emailOpens) * 100).toFixed(1)}%` : 
                        '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-foreground mb-3">Digital Engagement</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">LinkedIn Profile Views</span>
                    <span className="font-medium">{contact.engagement.linkedinViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Website Visits</span>
                    <span className="font-medium">{contact.engagement.websiteVisits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Activity</span>
                    <span className="font-medium">{contact.lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => onContactAction?.('call', contact)}
              className="flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Contact
            </Button>
            <Button
              variant="outline"
              onClick={() => onContactAction?.('email', contact)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              variant="outline"
              onClick={() => onContactAction?.('linkedin', contact)}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn Message
            </Button>
            <Button
              variant="outline"
              onClick={() => onContactAction?.('schedule', contact)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 