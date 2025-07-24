#!/usr/bin/env ts-node

/**
 * STEP 6: User Onboarding Flow Setup for DealMecca V1
 * 
 * Comprehensive new user onboarding and tutorial system
 */

import * as fs from 'fs'
import * as path from 'path'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  route: string
  order: number
  required: boolean
  estimatedTime: number // minutes
  prerequisites?: string[]
}

interface UserRole {
  id: string
  name: string
  description: string
  onboardingSteps: string[]
  features: string[]
}

class UserOnboardingSetup {
  private onboardingPath = './onboarding'

  constructor() {
    this.ensureOnboardingDirectory()
  }

  private ensureOnboardingDirectory(): void {
    if (!fs.existsSync(this.onboardingPath)) {
      fs.mkdirSync(this.onboardingPath, { recursive: true })
    }
  }

  createOnboardingSteps(): OnboardingStep[] {
    console.log('🎯 Creating onboarding steps...')

    const onboardingSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to DealMecca',
        description: 'Learn what DealMecca can do for your business',
        component: 'WelcomeStep',
        route: '/onboarding/welcome',
        order: 1,
        required: true,
        estimatedTime: 2
      },
      {
        id: 'profile-setup',
        title: 'Complete Your Profile',
        description: 'Set up your professional profile and preferences',
        component: 'ProfileSetupStep',
        route: '/onboarding/profile',
        order: 2,
        required: true,
        estimatedTime: 5,
        prerequisites: ['welcome']
      },
      {
        id: 'company-connection',
        title: 'Connect Your Company',
        description: 'Link your company profile and verify your role',
        component: 'CompanyConnectionStep',
        route: '/onboarding/company',
        order: 3,
        required: true,
        estimatedTime: 3,
        prerequisites: ['profile-setup']
      },
      {
        id: 'search-tutorial',
        title: 'Master the Search',
        description: 'Learn how to find companies and contacts effectively',
        component: 'SearchTutorialStep',
        route: '/onboarding/search-tutorial',
        order: 4,
        required: true,
        estimatedTime: 5,
        prerequisites: ['company-connection']
      },
      {
        id: 'org-chart-exploration',
        title: 'Explore Org Charts',
        description: 'Discover company structures and key contacts',
        component: 'OrgChartTutorialStep',
        route: '/onboarding/org-charts',
        order: 5,
        required: true,
        estimatedTime: 4,
        prerequisites: ['search-tutorial']
      },
      {
        id: 'events-introduction',
        title: 'Discover Events',
        description: 'Find networking events and industry conferences',
        component: 'EventsTutorialStep',
        route: '/onboarding/events',
        order: 6,
        required: false,
        estimatedTime: 3,
        prerequisites: ['org-chart-exploration']
      },
      {
        id: 'community-features',
        title: 'Join the Community',
        description: 'Participate in forums and discussions',
        component: 'CommunityTutorialStep',
        route: '/onboarding/community',
        order: 7,
        required: false,
        estimatedTime: 4,
        prerequisites: ['events-introduction']
      },
      {
        id: 'advanced-features',
        title: 'Advanced Features',
        description: 'Unlock power user capabilities',
        component: 'AdvancedFeaturesStep',
        route: '/onboarding/advanced',
        order: 8,
        required: false,
        estimatedTime: 6,
        prerequisites: ['community-features']
      },
      {
        id: 'completion',
        title: 'You\'re All Set!',
        description: 'Congratulations on completing your onboarding',
        component: 'CompletionStep',
        route: '/onboarding/complete',
        order: 9,
        required: true,
        estimatedTime: 2,
        prerequisites: ['advanced-features']
      }
    ]

    fs.writeFileSync(
      `${this.onboardingPath}/onboarding-steps.json`,
      JSON.stringify(onboardingSteps, null, 2)
    )

    console.log(`✅ Created ${onboardingSteps.length} onboarding steps`)
    return onboardingSteps
  }

  createUserRoles(): UserRole[] {
    console.log('👤 Creating user role onboarding paths...')

    const userRoles: UserRole[] = [
      {
        id: 'sales-manager',
        name: 'Sales Manager',
        description: 'Focused on lead generation and sales intelligence',
        onboardingSteps: [
          'welcome',
          'profile-setup',
          'company-connection',
          'search-tutorial',
          'org-chart-exploration',
          'advanced-features',
          'completion'
        ],
        features: [
          'advanced-search',
          'bulk-export',
          'analytics-dashboard',
          'lead-scoring',
          'contact-tracking'
        ]
      },
      {
        id: 'account-manager',
        name: 'Account Manager',
        description: 'Focused on relationship management and client intelligence',
        onboardingSteps: [
          'welcome',
          'profile-setup',
          'company-connection',
          'search-tutorial',
          'org-chart-exploration',
          'events-introduction',
          'completion'
        ],
        features: [
          'relationship-mapping',
          'account-insights',
          'event-tracking',
          'client-updates',
          'communication-history'
        ]
      },
      {
        id: 'business-development',
        name: 'Business Development',
        description: 'Focused on partnerships and strategic relationships',
        onboardingSteps: [
          'welcome',
          'profile-setup',
          'company-connection',
          'search-tutorial',
          'org-chart-exploration',
          'events-introduction',
          'community-features',
          'completion'
        ],
        features: [
          'partnership-discovery',
          'industry-insights',
          'networking-tools',
          'event-management',
          'community-engagement'
        ]
      },
      {
        id: 'marketing-professional',
        name: 'Marketing Professional',
        description: 'Focused on market research and campaign intelligence',
        onboardingSteps: [
          'welcome',
          'profile-setup',
          'company-connection',
          'search-tutorial',
          'events-introduction',
          'community-features',
          'completion'
        ],
        features: [
          'market-research',
          'competitor-analysis',
          'campaign-tracking',
          'industry-trends',
          'content-insights'
        ]
      },
      {
        id: 'executive',
        name: 'Executive',
        description: 'Strategic overview and high-level intelligence',
        onboardingSteps: [
          'welcome',
          'profile-setup',
          'company-connection',
          'search-tutorial',
          'org-chart-exploration',
          'advanced-features',
          'completion'
        ],
        features: [
          'executive-dashboard',
          'strategic-insights',
          'industry-overview',
          'competitive-intelligence',
          'market-analytics'
        ]
      }
    ]

    fs.writeFileSync(
      `${this.onboardingPath}/user-roles.json`,
      JSON.stringify(userRoles, null, 2)
    )

    console.log(`✅ Created ${userRoles.length} user role onboarding paths`)
    return userRoles
  }

  createOnboardingComponents(): void {
    console.log('🧩 Creating onboarding components...')

    // Main onboarding layout component
    const onboardingLayout = `
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  route: string
  order: number
  required: boolean
  estimatedTime: number
}

interface OnboardingLayoutProps {
  children: React.ReactNode
  currentStep: OnboardingStep
  allSteps: OnboardingStep[]
  onNext: () => void
  onPrevious: () => void
  onSkip?: () => void
}

export default function OnboardingLayout({
  children,
  currentStep,
  allSteps,
  onNext,
  onPrevious,
  onSkip
}: OnboardingLayoutProps) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    const completed = allSteps.filter(step => 
      completedSteps.includes(step.id)
    ).length
    setProgress((completed / allSteps.length) * 100)
  }, [completedSteps, allSteps])

  const totalTime = allSteps.reduce((sum, step) => sum + step.estimatedTime, 0)
  const completedTime = allSteps
    .filter(step => completedSteps.includes(step.id))
    .reduce((sum, step) => sum + step.estimatedTime, 0)

  const isFirstStep = currentStep.order === 1
  const isLastStep = currentStep.order === allSteps.length
  const canSkip = !currentStep.required

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to DealMecca
              </h1>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {completedTime}/{totalTime} min
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Skip Onboarding
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep.order} of {allSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Steps Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={\`flex items-center space-x-3 p-2 rounded-lg \${
                      step.id === currentStep.id
                        ? 'bg-blue-100 border border-blue-200'
                        : completedSteps.includes(step.id)
                        ? 'bg-green-50'
                        : 'bg-gray-50'
                    }\`}
                  >
                    <div className="flex-shrink-0">
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : step.id === currentStep.id ? (
                        <div className="w-5 h-5 bg-blue-500 rounded-full" />
                      ) : (
                        <div className="w-5 h-5 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={\`text-sm font-medium \${
                        step.id === currentStep.id ? 'text-blue-900' : 'text-gray-700'
                      }\`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.estimatedTime} min
                        {step.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
                <p className="text-gray-600">{currentStep.description}</p>
              </CardHeader>
              <CardContent>
                {children}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={isFirstStep}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-2">
                {canSkip && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={onNext}
                  className="flex items-center space-x-2"
                >
                  <span>{isLastStep ? 'Complete' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
`

    // Welcome step component
    const welcomeStep = `
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Users, Search, TrendingUp, Calendar } from 'lucide-react'

export default function WelcomeStep() {
  const [showVideo, setShowVideo] = useState(false)

  const features = [
    {
      icon: Search,
      title: 'Intelligent Search',
      description: 'Find companies and contacts with advanced filtering and AI-powered insights'
    },
    {
      icon: Users,
      title: 'Org Chart Mapping',
      description: 'Visualize company structures and identify key decision makers'
    },
    {
      icon: Calendar,
      title: 'Event Networking',
      description: 'Discover industry events and connect with attendees'
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence',
      description: 'Stay ahead with real-time industry insights and trends'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to the Future of B2B Networking
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          DealMecca is your intelligence hub for media sales teams. We help you find the right prospects, 
          understand company structures, and close deals faster.
        </p>
      </div>

      {/* Video Preview */}
      <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
        {showVideo ? (
          <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
            <p className="text-white">Product Demo Video Would Play Here</p>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={() => setShowVideo(true)}
            className="flex items-center space-x-2"
          >
            <Play className="w-6 h-6" />
            <span>Watch 2-Minute Demo</span>
          </Button>
        )}
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
        <p className="text-gray-600 mb-4">
          This onboarding will take about 15-20 minutes and will help you get the most out of DealMecca.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg">Let's Begin!</Button>
          <Button variant="outline" size="lg">Skip to Dashboard</Button>
        </div>
      </div>
    </div>
  )
}
`

    // Profile setup step component
    const profileSetupStep = `
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, User } from 'lucide-react'

export default function ProfileSetupStep() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    industry: '',
    experience: '',
    bio: '',
    goals: [],
    avatar: null
  })

  const industries = [
    'Advertising & Marketing',
    'Media & Entertainment',
    'Technology',
    'Publishing',
    'Broadcasting',
    'Digital Marketing',
    'Public Relations',
    'Consulting'
  ]

  const goals = [
    'Find new prospects',
    'Research competitors',
    'Track industry trends',
    'Build partnerships',
    'Network at events',
    'Manage existing accounts'
  ]

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-gray-600">
          Help us personalize your DealMecca experience by telling us about yourself.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Sales Manager"
              />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, industry: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Select value={formData.experience} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, experience: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="11-15">11-15 years</SelectItem>
                  <SelectItem value="15+">15+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about your professional background and expertise..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals and Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              What do you hope to achieve with DealMecca? Select all that apply.
            </p>
            
            <div className="space-y-2">
              {goals.map(goal => (
                <div key={goal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={goal}
                    checked={formData.goals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={goal} className="text-sm">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                Personalized Experience
              </h4>
              <p className="text-sm text-blue-700">
                Based on your goals, we'll customize your dashboard and recommend 
                features that will be most valuable for your workflow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button size="lg" className="px-8">
          Save Profile & Continue
        </Button>
      </div>
    </div>
  )
}
`

    // Search tutorial step component
    const searchTutorialStep = `
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, MapPin, Building, Users, Star } from 'lucide-react'

export default function SearchTutorialStep() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDemo, setActiveDemo] = useState('basic')

  const demoSearches = [
    {
      id: 'basic',
      title: 'Basic Search',
      query: 'advertising agencies in New York',
      description: 'Start with simple keywords to find companies'
    },
    {
      id: 'advanced',
      title: 'Advanced Filters',
      query: 'technology companies > 500 employees',
      description: 'Use filters to narrow down results'
    },
    {
      id: 'role-based',
      title: 'Role-Based Search',
      query: 'CMO at media companies',
      description: 'Find specific roles at target companies'
    }
  ]

  const mockResults = [
    {
      name: 'Creative Media Solutions',
      industry: 'Advertising & Marketing',
      location: 'New York, NY',
      employees: '250-500',
      contacts: 23,
      score: 95
    },
    {
      name: 'Digital Marketing Pro',
      industry: 'Digital Marketing',
      location: 'New York, NY',
      employees: '100-250',
      contacts: 18,
      score: 88
    },
    {
      name: 'Brand Strategy Group',
      industry: 'Marketing Consulting',
      location: 'New York, NY',
      employees: '50-100',
      contacts: 12,
      score: 82
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Master the Search</h2>
        <p className="text-gray-600">
          Learn how to find exactly what you're looking for with DealMecca's powerful search capabilities.
        </p>
      </div>

      {/* Demo Tabs */}
      <div className="flex justify-center space-x-4">
        {demoSearches.map(demo => (
          <Button
            key={demo.id}
            variant={activeDemo === demo.id ? 'default' : 'outline'}
            onClick={() => setActiveDemo(demo.id)}
          >
            {demo.title}
          </Button>
        ))}
      </div>

      {/* Interactive Search Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Try It Yourself</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder={demoSearches.find(d => d.id === activeDemo)?.query}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button size="lg">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            {demoSearches.find(d => d.id === activeDemo)?.description}
          </p>
        </CardContent>
      </Card>

      {/* Search Results Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span>{result.name}</span>
                  </h3>
                  <p className="text-gray-600">{result.industry}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{result.score}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{result.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{result.employees} employees</span>
                </div>
                <Badge variant="secondary">
                  {result.contacts} contacts
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Search Tips */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Pro Search Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Quick Filters</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use quotes for exact phrases</li>
                <li>• Add location: "in San Francisco"</li>
                <li>• Filter by size: "> 1000 employees"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Advanced Techniques</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Combine filters for precision</li>
                <li>• Save searches for regular use</li>
                <li>• Set up alerts for new matches</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
`

    // Save all onboarding components
    fs.writeFileSync(`${this.onboardingPath}/OnboardingLayout.tsx`, onboardingLayout)
    fs.writeFileSync(`${this.onboardingPath}/WelcomeStep.tsx`, welcomeStep)
    fs.writeFileSync(`${this.onboardingPath}/ProfileSetupStep.tsx`, profileSetupStep)
    fs.writeFileSync(`${this.onboardingPath}/SearchTutorialStep.tsx`, searchTutorialStep)

    console.log('✅ Created comprehensive onboarding components')
  }

  createOnboardingAPI(): void {
    console.log('🔌 Creating onboarding API endpoints...')

    // Onboarding progress API
    const onboardingAPI = `
// Onboarding Progress API - app/api/onboarding/progress/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's onboarding progress
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        onboardingProgress: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      progress: user.onboardingProgress || {
        completedSteps: [],
        currentStep: 'welcome',
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null
      }
    })
  } catch (error) {
    console.error('Onboarding progress error:', error)
    return NextResponse.json(
      { error: 'Failed to get onboarding progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { stepId, completed, currentStep } = await request.json()

    // Update user's onboarding progress
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboardingProgress: {
          upsert: {
            create: {
              completedSteps: completed ? [stepId] : [],
              currentStep: currentStep || stepId,
              isCompleted: false,
              startedAt: new Date()
            },
            update: {
              completedSteps: completed 
                ? { push: stepId }
                : undefined,
              currentStep: currentStep || stepId,
              updatedAt: new Date()
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      progress: user.onboardingProgress 
    })
  } catch (error) {
    console.error('Onboarding progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    )
  }
}
`

    // Onboarding completion API
    const completionAPI = `
// Onboarding Completion API - app/api/onboarding/complete/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { completedSteps, feedbackRating, feedbackComments } = await request.json()

    // Mark onboarding as completed
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboardingProgress: {
          upsert: {
            create: {
              completedSteps,
              currentStep: 'completed',
              isCompleted: true,
              startedAt: new Date(),
              completedAt: new Date(),
              feedbackRating,
              feedbackComments
            },
            update: {
              completedSteps,
              currentStep: 'completed',
              isCompleted: true,
              completedAt: new Date(),
              feedbackRating,
              feedbackComments,
              updatedAt: new Date()
            }
          }
        }
      }
    })

    // Send completion analytics
    await trackOnboardingCompletion(user.id, {
      completedSteps: completedSteps.length,
      totalSteps: 9, // Total onboarding steps
      timeToComplete: user.onboardingProgress?.startedAt ? 
        Date.now() - user.onboardingProgress.startedAt.getTime() : null,
      feedbackRating,
      userRole: user.role
    })

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully!',
      redirectUrl: '/dashboard'
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

async function trackOnboardingCompletion(userId: string, analytics: any) {
  // Track onboarding completion analytics
  console.log('Onboarding completion analytics:', { userId, ...analytics })
  
  // In production, this would send to analytics service
  // await analytics.track('onboarding_completed', {
  //   userId,
  //   ...analytics
  // })
}
`

    // Save API files
    fs.writeFileSync(`${this.onboardingPath}/onboarding-progress-api.ts`, onboardingAPI)
    fs.writeFileSync(`${this.onboardingPath}/onboarding-completion-api.ts`, completionAPI)

    console.log('✅ Created onboarding API endpoints')
  }

  createOnboardingAnalytics(): void {
    console.log('📊 Creating onboarding analytics system...')

    const analyticsConfig = `
// Onboarding Analytics Configuration

export interface OnboardingAnalytics {
  userId: string
  sessionId: string
  stepId: string
  action: 'started' | 'completed' | 'skipped' | 'abandoned'
  timestamp: Date
  timeSpent?: number // milliseconds
  userAgent?: string
  device?: string
  metadata?: Record<string, any>
}

export interface OnboardingMetrics {
  totalUsers: number
  completionRate: number
  averageTimeToComplete: number
  dropoffByStep: Record<string, number>
  userSatisfactionScore: number
  mostSkippedSteps: string[]
  topFeedback: string[]
}

export const trackOnboardingEvent = async (event: OnboardingAnalytics) => {
  try {
    // In production, send to analytics service
    await fetch('/api/analytics/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })
  } catch (error) {
    console.error('Failed to track onboarding event:', error)
  }
}

export const getOnboardingMetrics = async (): Promise<OnboardingMetrics> => {
  try {
    const response = await fetch('/api/analytics/onboarding/metrics')
    return await response.json()
  } catch (error) {
    console.error('Failed to get onboarding metrics:', error)
    return {
      totalUsers: 0,
      completionRate: 0,
      averageTimeToComplete: 0,
      dropoffByStep: {},
      userSatisfactionScore: 0,
      mostSkippedSteps: [],
      topFeedback: []
    }
  }
}

// Onboarding step timing utility
export class OnboardingTimer {
  private startTime: Date
  private stepId: string

  constructor(stepId: string) {
    this.stepId = stepId
    this.startTime = new Date()
  }

  complete() {
    const timeSpent = Date.now() - this.startTime.getTime()
    
    trackOnboardingEvent({
      userId: 'current-user-id', // Get from session
      sessionId: 'current-session-id',
      stepId: this.stepId,
      action: 'completed',
      timestamp: new Date(),
      timeSpent
    })
  }

  skip() {
    const timeSpent = Date.now() - this.startTime.getTime()
    
    trackOnboardingEvent({
      userId: 'current-user-id',
      sessionId: 'current-session-id', 
      stepId: this.stepId,
      action: 'skipped',
      timestamp: new Date(),
      timeSpent
    })
  }
}
`

    const onboardingHook = `
// Onboarding React Hook - hooks/useOnboarding.ts

import { useState, useEffect } from 'react'
import { OnboardingTimer, trackOnboardingEvent } from '@/lib/onboarding-analytics'

interface OnboardingProgress {
  completedSteps: string[]
  currentStep: string
  isCompleted: boolean
  startedAt?: Date
  completedAt?: Date
}

export const useOnboarding = () => {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [stepTimer, setStepTimer] = useState<OnboardingTimer | null>(null)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const response = await fetch('/api/onboarding/progress')
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const startStep = (stepId: string) => {
    const timer = new OnboardingTimer(stepId)
    setStepTimer(timer)
    
    trackOnboardingEvent({
      userId: 'current-user-id',
      sessionId: 'current-session-id',
      stepId,
      action: 'started',
      timestamp: new Date()
    })
  }

  const completeStep = async (stepId: string) => {
    try {
      stepTimer?.complete()
      
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          completed: true,
          currentStep: stepId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Failed to complete step:', error)
    }
  }

  const skipStep = async (stepId: string) => {
    try {
      stepTimer?.skip()
      
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          completed: false,
          currentStep: stepId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Failed to skip step:', error)
    }
  }

  const completeOnboarding = async (feedbackRating?: number, feedbackComments?: string) => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedSteps: progress?.completedSteps || [],
          feedbackRating,
          feedbackComments
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(prev => prev ? { ...prev, isCompleted: true } : null)
        return data.redirectUrl
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  return {
    progress,
    loading,
    startStep,
    completeStep,
    skipStep,
    completeOnboarding
  }
}
`

    fs.writeFileSync(`${this.onboardingPath}/onboarding-analytics.ts`, analyticsConfig)
    fs.writeFileSync(`${this.onboardingPath}/useOnboarding.ts`, onboardingHook)

    console.log('✅ Created onboarding analytics system')
  }

  createOnboardingDocumentation(): void {
    console.log('📚 Creating onboarding documentation...')

    const onboardingGuide = `# 🎯 DealMecca V1 User Onboarding System

## Overview

The DealMecca onboarding system provides a comprehensive introduction to the platform for new users, with personalized flows based on user roles and goals.

## Onboarding Flow Structure

### Step 1: Welcome (2 minutes)
- Platform introduction and value proposition
- Feature overview with interactive demos
- Product demo video
- Goal setting for personalized experience

### Step 2: Profile Setup (5 minutes)
- Personal and professional information
- Company and industry details
- Role and experience level
- Goals and use case selection

### Step 3: Company Connection (3 minutes)
- Link to existing company profile
- Verify role and department
- Set up company notifications
- Connect with team members

### Step 4: Search Tutorial (5 minutes)
- Interactive search demonstrations
- Basic and advanced search techniques
- Filter usage and best practices
- Search result interpretation

### Step 5: Org Chart Exploration (4 minutes)
- Navigate company hierarchies
- Identify key decision makers
- Understand relationship mapping
- Export and sharing features

### Step 6: Events Introduction (3 minutes)
- Discover relevant industry events
- RSVP and calendar integration
- Networking opportunities
- Event recommendations

### Step 7: Community Features (4 minutes)
- Forum participation guidelines
- Creating and responding to posts
- Professional networking etiquette
- Building reputation and connections

### Step 8: Advanced Features (6 minutes)
- Power user tools and shortcuts
- Analytics and reporting
- Integration capabilities
- Customization options

### Step 9: Completion (2 minutes)
- Progress summary and achievements
- Feedback collection
- Next steps and recommendations
- Resource links and support

## User Role Customization

### Sales Manager Path
- Focus: Lead generation and sales intelligence
- Key features: Advanced search, analytics, contact tracking
- Skip: Community features (optional)
- Emphasize: CRM integration, pipeline management

### Account Manager Path
- Focus: Relationship management and client intelligence
- Key features: Relationship mapping, account insights, event tracking
- Skip: Advanced analytics (optional)
- Emphasize: Client communication history, account updates

### Business Development Path
- Focus: Partnerships and strategic relationships
- Key features: Partnership discovery, networking tools, event management
- Include: All community features
- Emphasize: Industry insights, relationship building

### Marketing Professional Path
- Focus: Market research and campaign intelligence
- Key features: Market research, competitor analysis, industry trends
- Skip: Advanced org charts (optional)
- Emphasize: Content insights, campaign tracking

### Executive Path
- Focus: Strategic overview and high-level intelligence
- Key features: Executive dashboard, strategic insights, competitive intelligence
- Skip: Detailed tutorials (optional)
- Emphasize: High-level metrics, market analytics

## Technical Implementation

### Database Schema
\`\`\`sql
-- Onboarding Progress Tracking
CREATE TABLE onboarding_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  completed_steps TEXT[],
  current_step VARCHAR(50),
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  feedback_rating INTEGER,
  feedback_comments TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding Analytics
CREATE TABLE onboarding_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  step_id VARCHAR(50),
  action VARCHAR(20), -- started, completed, skipped, abandoned
  timestamp TIMESTAMP DEFAULT NOW(),
  time_spent INTEGER, -- milliseconds
  user_agent TEXT,
  device VARCHAR(50),
  metadata JSONB
);
\`\`\`

### API Endpoints
- \`GET /api/onboarding/progress\` - Get user's onboarding progress
- \`POST /api/onboarding/progress\` - Update step progress
- \`POST /api/onboarding/complete\` - Mark onboarding as completed
- \`POST /api/analytics/onboarding\` - Track onboarding events
- \`GET /api/analytics/onboarding/metrics\` - Get onboarding metrics

### React Components
- \`OnboardingLayout\` - Main layout with progress tracking
- \`WelcomeStep\` - Platform introduction and demo
- \`ProfileSetupStep\` - User profile configuration
- \`SearchTutorialStep\` - Interactive search training
- \`CompletionStep\` - Onboarding completion and feedback

### Hooks and Utilities
- \`useOnboarding\` - Onboarding state management
- \`OnboardingTimer\` - Step timing and analytics
- \`trackOnboardingEvent\` - Analytics event tracking

## Analytics and Optimization

### Key Metrics
- **Completion Rate**: Percentage of users who complete onboarding
- **Time to Complete**: Average time from start to finish
- **Step Drop-off Rate**: Where users abandon the flow
- **User Satisfaction**: Feedback ratings and comments
- **Feature Adoption**: Which features users engage with first

### A/B Testing Opportunities
- Welcome message and value proposition
- Step order and grouping
- Interactive elements vs. static content
- Personalization vs. generic flow
- Tutorial length and depth

### Optimization Strategies
- Progressive disclosure of complex features
- Just-in-time tutorial delivery
- Contextual help and tooltips
- Quick wins early in the flow
- Social proof and success stories

## Support and Resources

### Help Documentation
- Step-by-step guides for each onboarding stage
- Video tutorials for visual learners
- FAQ addressing common questions
- Troubleshooting guides for technical issues

### Support Channels
- In-app chat support during onboarding
- Email support for complex questions
- Knowledge base with searchable articles
- Community forum for peer assistance

### Success Metrics
- 80%+ onboarding completion rate
- 4.5+ average satisfaction rating
- <20% support ticket rate during onboarding
- 90%+ feature discovery rate

## Continuous Improvement

### Regular Reviews
- Monthly onboarding metrics analysis
- Quarterly user feedback review
- A/B testing of new approaches
- Feature usage correlation analysis

### Feedback Integration
- User feedback incorporation into flow updates
- Support ticket trend analysis
- Feature request tracking from onboarding
- Success story collection and sharing

---

**Note**: This onboarding system is designed to be adaptive and data-driven, allowing for continuous optimization based on user behavior and feedback.
`

    fs.writeFileSync(`${this.onboardingPath}/ONBOARDING_GUIDE.md`, onboardingGuide)
    console.log('✅ Created comprehensive onboarding documentation')
  }

  async run(): Promise<void> {
    console.log('🎯 Setting up DealMecca V1 User Onboarding System...')
    
    const onboardingSteps = this.createOnboardingSteps()
    const userRoles = this.createUserRoles()
    this.createOnboardingComponents()
    this.createOnboardingAPI()
    this.createOnboardingAnalytics()
    this.createOnboardingDocumentation()
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ USER ONBOARDING SETUP COMPLETE')
    console.log('='.repeat(80))
    console.log('📁 Files created in ./onboarding/ directory:')
    console.log('   • onboarding-steps.json - Step definitions and flow')
    console.log('   • user-roles.json - Role-based onboarding paths')
    console.log('   • OnboardingLayout.tsx - Main onboarding layout component')
    console.log('   • WelcomeStep.tsx - Welcome and introduction step')
    console.log('   • ProfileSetupStep.tsx - User profile setup step')
    console.log('   • SearchTutorialStep.tsx - Interactive search tutorial')
    console.log('   • onboarding-progress-api.ts - Progress tracking API')
    console.log('   • onboarding-completion-api.ts - Completion handling API')
    console.log('   • onboarding-analytics.ts - Analytics and tracking system')
    console.log('   • useOnboarding.ts - React hook for onboarding state')
    console.log('   • ONBOARDING_GUIDE.md - Complete documentation')
    
    console.log('\n📊 Onboarding System Summary:')
    console.log(`   • ${onboardingSteps.length} onboarding steps created`)
    console.log(`   • ${userRoles.length} role-based onboarding paths`)
    console.log('   • Interactive tutorial components')
    console.log('   • Progress tracking and analytics')
    console.log('   • Personalized user experience')
    console.log('   • Comprehensive documentation')
    
    console.log('\n🚀 Ready for user onboarding!')
    console.log('📋 Next steps:')
    console.log('   1. Integrate onboarding components into app')
    console.log('   2. Set up onboarding database schema')
    console.log('   3. Configure analytics tracking')
    console.log('   4. Test onboarding flows')
    console.log('   5. Launch with new user registration')
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const onboarding = new UserOnboardingSetup()
  onboarding.run()
    .then(() => {
      console.log('\n✅ User onboarding setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ User onboarding setup failed:', error)
      process.exit(1)
    })
}

export { UserOnboardingSetup } 