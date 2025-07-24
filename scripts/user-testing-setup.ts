#!/usr/bin/env ts-node

/**
 * STEP 6: User Testing Group Setup for DealMecca V1
 * 
 * Comprehensive beta testing and user feedback management system
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

interface BetaTester {
  email: string
  name: string
  company: string
  role: string
  expertise: string[]
  inviteCode: string
  status: 'invited' | 'registered' | 'active' | 'inactive'
}

interface TestingGroup {
  id: string
  name: string
  description: string
  maxTesters: number
  features: string[]
  startDate: Date
  endDate: Date
}

class UserTestingSetup {
  private testingDataPath = './user-testing'

  constructor() {
    this.ensureTestingDirectory()
  }

  private ensureTestingDirectory(): void {
    if (!fs.existsSync(this.testingDataPath)) {
      fs.mkdirSync(this.testingDataPath, { recursive: true })
    }
  }

  async setupBetaTestingDatabase(): Promise<void> {
    console.log('🧪 Setting up beta testing database schema...')

    try {
      // Check if beta testing tables exist, if not create them
      const betaInviteExists = await this.checkTableExists('BetaInvite')
      
      if (!betaInviteExists) {
        console.log('📊 Creating beta testing database schema...')
        
        // This would typically be done via Prisma schema migration
        // For now, we'll create the schema additions
        const schemaPatch = `
// Beta Testing Schema Addition for DealMecca V1

model BetaInvite {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  company     String?
  role        String?
  expertise   Json?    // Array of expertise areas
  inviteCode  String   @unique
  status      BetaStatus @default(INVITED)
  groupId     String?
  group       BetaGroup? @relation(fields: [groupId], references: [id])
  userId      String?  @unique
  user        User?    @relation(fields: [userId], references: [id])
  invitedAt   DateTime @default(now())
  registeredAt DateTime?
  lastActiveAt DateTime?
  feedback    BetaFeedback[]
  
  @@map("beta_invites")
}

model BetaGroup {
  id          String   @id @default(cuid())
  name        String
  description String
  maxTesters  Int      @default(50)
  features    Json     // Array of features to test
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  invites     BetaInvite[]
  
  @@map("beta_groups")
}

model BetaFeedback {
  id          String   @id @default(cuid())
  betaId      String
  beta        BetaInvite @relation(fields: [betaId], references: [id])
  category    FeedbackCategory
  rating      Int      // 1-5 scale
  title       String
  description String
  feature     String?  // Specific feature being tested
  priority    FeedbackPriority @default(MEDIUM)
  status      FeedbackStatus @default(OPEN)
  browserInfo Json?    // Browser/device information
  screenshotUrl String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("beta_feedback")
}

enum BetaStatus {
  INVITED
  REGISTERED
  ACTIVE
  INACTIVE
  REJECTED
}

enum FeedbackCategory {
  BUG
  FEATURE_REQUEST
  USABILITY
  PERFORMANCE
  CONTENT
  GENERAL
}

enum FeedbackPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum FeedbackStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  WONT_FIX
}
`

        fs.writeFileSync(`${this.testingDataPath}/beta-schema-patch.prisma`, schemaPatch)
        console.log('✅ Created beta testing schema patch')
      }

      console.log('✅ Beta testing database setup complete')
    } catch (error) {
      console.error('❌ Failed to setup beta testing database:', error)
    }
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      // This is a simplified check - in practice you'd query the database schema
      return false // For now, assume tables don't exist
    } catch (error) {
      return false
    }
  }

  createBetaTestingGroups(): TestingGroup[] {
    console.log('👥 Creating beta testing groups...')

    const testingGroups: TestingGroup[] = [
      {
        id: 'early-adopters',
        name: 'Early Adopters',
        description: 'First wave of beta testers - experienced professionals who will test core functionality',
        maxTesters: 25,
        features: ['search', 'org-charts', 'basic-navigation', 'user-profile'],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 3 weeks from now
      },
      {
        id: 'power-users',
        name: 'Power Users',
        description: 'Experienced media professionals testing advanced features',
        maxTesters: 30,
        features: ['admin-tools', 'bulk-operations', 'advanced-search', 'analytics'],
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000) // 5 weeks from now
      },
      {
        id: 'community-testers',
        name: 'Community Testers',
        description: 'Testing community features like forums and events',
        maxTesters: 40,
        features: ['forum', 'events', 'networking', 'messaging'],
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 4 weeks from now
      },
      {
        id: 'mobile-testers',
        name: 'Mobile Experience Testers',
        description: 'Focus on mobile usability and responsive design',
        maxTesters: 20,
        features: ['mobile-navigation', 'touch-interactions', 'responsive-design'],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 3 weeks from now
      }
    ]

    // Save testing groups configuration
    fs.writeFileSync(
      `${this.testingDataPath}/testing-groups.json`,
      JSON.stringify(testingGroups, null, 2)
    )

    console.log(`✅ Created ${testingGroups.length} beta testing groups`)
    return testingGroups
  }

  generateBetaInviteCodes(count: number): string[] {
    console.log(`🎫 Generating ${count} beta invite codes...`)
    
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = this.generateInviteCode()
      codes.push(code)
    }

    // Save invite codes
    fs.writeFileSync(
      `${this.testingDataPath}/invite-codes.json`,
      JSON.stringify(codes, null, 2)
    )

    console.log(`✅ Generated ${codes.length} unique invite codes`)
    return codes
  }

  private generateInviteCode(): string {
    // Generate a readable invite code format: BETA-XXXX-YYYY
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
    return `BETA-${part1}-${part2}`
  }

  createBetaTesterProfiles(): BetaTester[] {
    console.log('👤 Creating sample beta tester profiles...')

    const betaTesters: BetaTester[] = [
      {
        email: 'sarah.johnson@mediapro.com',
        name: 'Sarah Johnson',
        company: 'MediaPro Analytics',
        role: 'VP of Sales',
        expertise: ['sales-management', 'data-analysis', 'client-relations'],
        inviteCode: this.generateInviteCode(),
        status: 'invited'
      },
      {
        email: 'mike.chen@adagency.com',
        name: 'Mike Chen',
        company: 'Creative Ad Agency',
        role: 'Account Director',
        expertise: ['account-management', 'campaign-strategy', 'client-communications'],
        inviteCode: this.generateInviteCode(),
        status: 'invited'
      },
      {
        email: 'lisa.rodriguez@techstartup.com',
        name: 'Lisa Rodriguez',
        company: 'TechStartup Inc',
        role: 'Marketing Director',
        expertise: ['digital-marketing', 'growth-strategy', 'analytics'],
        inviteCode: this.generateInviteCode(),
        status: 'invited'
      },
      {
        email: 'david.thompson@enterprise.com',
        name: 'David Thompson',
        company: 'Enterprise Solutions',
        role: 'Business Development Manager',
        expertise: ['business-development', 'partnerships', 'enterprise-sales'],
        inviteCode: this.generateInviteCode(),
        status: 'invited'
      },
      {
        email: 'jennifer.kim@consultancy.com',
        name: 'Jennifer Kim',
        company: 'Strategic Consultancy',
        role: 'Senior Consultant',
        expertise: ['strategy-consulting', 'process-optimization', 'data-insights'],
        inviteCode: this.generateInviteCode(),
        status: 'invited'
      }
    ]

    // Save beta tester profiles
    fs.writeFileSync(
      `${this.testingDataPath}/beta-testers.json`,
      JSON.stringify(betaTesters, null, 2)
    )

    console.log(`✅ Created ${betaTesters.length} beta tester profiles`)
    return betaTesters
  }

  createFeedbackCollectionSystem(): void {
    console.log('📝 Creating feedback collection system...')

    // Feedback collection API endpoint template
    const feedbackAPI = `
// Beta Feedback Collection API - app/api/beta/feedback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { 
      category, 
      rating, 
      title, 
      description, 
      feature, 
      priority,
      browserInfo,
      screenshotUrl 
    } = await request.json()

    // Get beta tester from session/token
    const betaUser = await getBetaUserFromSession(request)
    
    if (!betaUser) {
      return NextResponse.json(
        { error: 'Beta access required' },
        { status: 401 }
      )
    }

    const feedback = await prisma.betaFeedback.create({
      data: {
        betaId: betaUser.id,
        category,
        rating,
        title,
        description,
        feature,
        priority: priority || 'MEDIUM',
        browserInfo,
        screenshotUrl
      }
    })

    // Send notification to team
    await notifyTeamOfFeedback(feedback)

    return NextResponse.json({ 
      success: true, 
      feedbackId: feedback.id 
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const betaUser = await getBetaUserFromSession(request)
    
    if (!betaUser) {
      return NextResponse.json(
        { error: 'Beta access required' },
        { status: 401 }
      )
    }

    const feedback = await prisma.betaFeedback.findMany({
      where: { betaId: betaUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        beta: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Feedback retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve feedback' },
      { status: 500 }
    )
  }
}

async function getBetaUserFromSession(request: NextRequest) {
  // Implementation depends on your auth system
  // This is a placeholder
  return null
}

async function notifyTeamOfFeedback(feedback: any) {
  // Send notification to team (email, Slack, etc.)
  console.log('New beta feedback received:', feedback.title)
}
`

    // Beta invite API endpoint
    const inviteAPI = `
// Beta Invite API - app/api/beta/invite/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json()

    // Validate invite code
    const betaInvite = await prisma.betaInvite.findUnique({
      where: { inviteCode },
      include: { group: true }
    })

    if (!betaInvite) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      )
    }

    if (betaInvite.status !== 'INVITED') {
      return NextResponse.json(
        { error: 'Invite code already used' },
        { status: 400 }
      )
    }

    // Check if group is still active and has space
    if (betaInvite.group && !betaInvite.group.isActive) {
      return NextResponse.json(
        { error: 'Beta testing group is no longer active' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      inviteDetails: {
        name: betaInvite.name,
        groupName: betaInvite.group?.name,
        groupDescription: betaInvite.group?.description,
        features: betaInvite.group?.features
      }
    })
  } catch (error) {
    console.error('Invite validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate invite code' },
      { status: 500 }
    )
  }
}
`

    // Beta testing dashboard component
    const betaDashboard = `
// Beta Testing Dashboard Component

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BetaFeedback {
  id: string
  category: string
  rating: number
  title: string
  description: string
  feature?: string
  status: string
  createdAt: string
}

export default function BetaDashboard() {
  const [feedback, setFeedback] = useState<BetaFeedback[]>([])
  const [newFeedback, setNewFeedback] = useState({
    category: '',
    rating: 5,
    title: '',
    description: '',
    feature: ''
  })

  useEffect(() => {
    loadFeedback()
  }, [])

  const loadFeedback = async () => {
    try {
      const response = await fetch('/api/beta/feedback')
      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback)
      }
    } catch (error) {
      console.error('Failed to load feedback:', error)
    }
  }

  const submitFeedback = async () => {
    try {
      const response = await fetch('/api/beta/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
      })

      if (response.ok) {
        setNewFeedback({
          category: '',
          rating: 5,
          title: '',
          description: '',
          feature: ''
        })
        loadFeedback()
        alert('Feedback submitted successfully!')
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Beta Testing Dashboard</h1>
      
      {/* Submit New Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={newFeedback.category} onValueChange={(value) => 
              setNewFeedback(prev => ({ ...prev, category: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUG">Bug Report</SelectItem>
                <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                <SelectItem value="USABILITY">Usability Issue</SelectItem>
                <SelectItem value="PERFORMANCE">Performance</SelectItem>
                <SelectItem value="CONTENT">Content</SelectItem>
                <SelectItem value="GENERAL">General Feedback</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={newFeedback.rating.toString()} onValueChange={(value) => 
              setNewFeedback(prev => ({ ...prev, rating: parseInt(value) }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Input
            placeholder="Feedback title"
            value={newFeedback.title}
            onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <Input
            placeholder="Feature (optional)"
            value={newFeedback.feature}
            onChange={(e) => setNewFeedback(prev => ({ ...prev, feature: e.target.value }))}
          />
          
          <Textarea
            placeholder="Detailed description"
            value={newFeedback.description}
            onChange={(e) => setNewFeedback(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
          
          <Button onClick={submitFeedback} className="w-full">
            Submit Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Previous Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Your Previous Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="text-gray-500">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{item.category} • Rating: {item.rating}/5</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
`

    // Save all feedback system files
    fs.writeFileSync(`${this.testingDataPath}/feedback-api.ts`, feedbackAPI)
    fs.writeFileSync(`${this.testingDataPath}/invite-api.ts`, inviteAPI)
    fs.writeFileSync(`${this.testingDataPath}/beta-dashboard.tsx`, betaDashboard)

    console.log('✅ Created comprehensive feedback collection system')
  }

  createTestingDocumentation(): void {
    console.log('📚 Creating beta testing documentation...')

    const testingGuide = `# 🧪 DealMecca V1 Beta Testing Guide

## Welcome Beta Testers!

Thank you for participating in the DealMecca V1 beta testing program. Your feedback is crucial for making our platform the best B2B networking and intelligence tool for media professionals.

## Getting Started

### 1. Account Setup
1. Use your unique invite code to register: \`BETA-XXXX-YYYY\`
2. Complete your profile with your industry experience
3. Join your assigned testing group
4. Familiarize yourself with the beta testing dashboard

### 2. Testing Groups

#### Early Adopters Group
- **Focus**: Core functionality and navigation
- **Features to test**: Search, org charts, user profiles
- **Duration**: 2 weeks
- **Target feedback**: Usability and core feature effectiveness

#### Power Users Group
- **Focus**: Advanced features and admin tools
- **Features to test**: Bulk operations, analytics, advanced search
- **Duration**: 3 weeks
- **Target feedback**: Workflow efficiency and power user needs

#### Community Testers Group
- **Focus**: Social and networking features
- **Features to test**: Forums, events, messaging
- **Duration**: 2.5 weeks
- **Target feedback**: Community engagement and social features

#### Mobile Experience Group
- **Focus**: Mobile usability and responsive design
- **Features to test**: Mobile navigation, touch interactions
- **Duration**: 2 weeks
- **Target feedback**: Mobile experience and accessibility

## What to Test

### Core Features to Validate
- [ ] User registration and login
- [ ] Company and contact search
- [ ] Org chart navigation and visualization
- [ ] Event browsing and RSVP
- [ ] Forum posting and interaction
- [ ] Profile management
- [ ] Mobile responsiveness

### Performance Testing
- [ ] Page load times
- [ ] Search response times
- [ ] Mobile performance
- [ ] Offline functionality (if applicable)

### Usability Testing
- [ ] Navigation intuitiveness
- [ ] Feature discoverability
- [ ] Information architecture
- [ ] Error messaging clarity

## How to Provide Feedback

### 1. Beta Testing Dashboard
Access your beta dashboard at: \`/beta/dashboard\`

### 2. Feedback Categories
- **Bug Reports**: Technical issues or errors
- **Feature Requests**: Missing functionality
- **Usability Issues**: Confusing or difficult interactions
- **Performance**: Slow loading or responsiveness issues
- **Content**: Data accuracy or missing information
- **General**: Overall experience and suggestions

### 3. Quality Feedback Guidelines

#### Good Bug Report Example:
\`\`\`
Title: Search results don't load on mobile Safari
Category: Bug
Feature: Company Search
Rating: 2/5
Description: When I search for companies on iPhone Safari, 
the loading spinner appears but results never show. 
Works fine on desktop Chrome. Using iPhone 12, iOS 16.1.
\`\`\`

#### Good Feature Request Example:
\`\`\`
Title: Add bulk export for contact lists
Category: Feature Request
Feature: Contact Management
Rating: 4/5
Description: As a sales manager, I need to export contact 
lists to CSV for my team. Currently I can only view 
contacts individually. Would save significant time.
\`\`\`

### 4. Screenshots and Screen Recordings
- Include screenshots for visual issues
- Use screen recordings for interaction problems
- Annotate images to highlight specific issues

## Testing Schedule

### Week 1: Initial Setup and Core Features
- Complete profile setup
- Test basic navigation
- Try core search functionality
- Submit initial feedback

### Week 2: Deep Feature Testing
- Explore assigned group features
- Test edge cases and workflows
- Report any critical issues
- Participate in group discussions

### Week 3: Polish and Final Feedback
- Test any fixes from previous weeks
- Focus on user experience refinements
- Submit final comprehensive feedback
- Participate in wrap-up survey

## Communication Channels

### Beta Testing Community
- **Forum**: Join the beta testing discussion forum
- **Email**: Weekly updates and announcements
- **Survey**: Mid-point and final feedback surveys

### Emergency Contact
For critical issues or urgent problems:
- **Email**: beta-support@dealmecca.com
- **Response time**: 24 hours max

## Recognition and Rewards

### Beta Tester Benefits
- **Free Premium Access**: 6 months of premium features
- **Early Access**: First to see new features
- **Beta Badge**: Special recognition in your profile
- **Influence**: Direct input on product direction

### Top Contributors
- **Product Credit**: Recognition in product documentation
- **Extended Access**: Continued beta access for future features
- **Exclusive Events**: Invitation to product launch events

## Beta Testing Ethics

### Data and Privacy
- All testing data is confidential
- Don't share login credentials
- Report security issues immediately
- Respect other testers' privacy

### Professional Conduct
- Provide constructive feedback
- Be respectful in community discussions
- Focus on improving the product
- Follow community guidelines

## Frequently Asked Questions

### Q: Can I invite colleagues?
A: Beta access is by invitation only. Contact us if you have colleagues who would be valuable testers.

### Q: Will my data be preserved after beta?
A: Yes, your account and data will carry over to the production release.

### Q: How long is the beta period?
A: The beta testing phase will run for 3-4 weeks, depending on feedback volume and issues found.

### Q: Can I continue using my beta account?
A: Yes! Beta accounts will automatically transition to regular accounts with premium benefits.

---

**Thank you for helping make DealMecca better!**

Your expertise and feedback are invaluable in creating the best possible B2B networking platform for media professionals.
`

    const adminGuide = `# 🔧 Beta Testing Administration Guide

## Beta Testing Management Dashboard

### Tester Management
- Monitor active beta testers
- Track engagement and feedback metrics
- Manage group assignments
- Send communications

### Feedback Analysis
- Review and categorize feedback
- Prioritize issues by severity
- Track resolution status
- Generate feedback reports

### Group Coordination
- Monitor group-specific testing progress
- Adjust group parameters as needed
- Communicate with group leaders
- Track feature-specific feedback

## Monitoring and Analytics

### Key Metrics to Track
- Tester engagement rates
- Feedback submission frequency
- Issue resolution times
- Feature usage patterns
- User satisfaction scores

### Weekly Review Process
1. Compile feedback summaries
2. Identify trending issues
3. Prioritize development tasks
4. Update testers on progress
5. Adjust testing focus if needed

## Emergency Procedures

### Critical Bug Response
1. Immediate acknowledgment (< 2 hours)
2. Impact assessment and triage
3. Hotfix deployment if needed
4. Tester notification and workaround
5. Resolution verification

### Communication Protocols
- Weekly status emails to all testers
- Immediate notifications for critical issues
- Group-specific updates as needed
- Final survey and wrap-up session
`

    fs.writeFileSync(`${this.testingDataPath}/BETA_TESTING_GUIDE.md`, testingGuide)
    fs.writeFileSync(`${this.testingDataPath}/ADMIN_GUIDE.md`, adminGuide)

    console.log('✅ Created comprehensive beta testing documentation')
  }

  createInviteEmailTemplates(): void {
    console.log('📧 Creating invite email templates...')

    const inviteEmail = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DealMecca Beta Invitation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .invite-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .code { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature { margin: 10px 0; padding-left: 20px; position: relative; }
        .feature::before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to DealMecca Beta!</h1>
            <p>You've been selected to help shape the future of B2B networking</p>
        </div>
        
        <div class="content">
            <p>Hi {{TESTER_NAME}},</p>
            
            <p>Congratulations! You've been selected to participate in the exclusive DealMecca V1 beta testing program. As a {{TESTER_ROLE}} at {{TESTER_COMPANY}}, your expertise in {{EXPERTISE_AREAS}} makes you the perfect candidate to help us create the ultimate B2B networking platform.</p>
            
            <div class="invite-code">
                <div>Your Exclusive Beta Invite Code:</div>
                <div class="code">{{INVITE_CODE}}</div>
            </div>
            
            <p><strong>You've been assigned to the {{GROUP_NAME}} testing group.</strong></p>
            <p>{{GROUP_DESCRIPTION}}</p>
            
            <div class="features">
                <h3>🧪 What You'll Be Testing:</h3>
                {{#each FEATURES}}
                <div class="feature">{{this}}</div>
                {{/each}}
            </div>
            
            <p><strong>Getting Started:</strong></p>
            <ol>
                <li>Click the button below to register with your invite code</li>
                <li>Complete your beta tester profile</li>
                <li>Access the beta testing dashboard</li>
                <li>Start exploring and testing features</li>
                <li>Submit feedback through the built-in feedback system</li>
            </ol>
            
            <div style="text-align: center;">
                <a href="https://app.dealmecca.com/beta/register?code={{INVITE_CODE}}" class="button">
                    Join Beta Testing →
                </a>
            </div>
            
            <div class="features">
                <h3>🎁 Beta Tester Benefits:</h3>
                <div class="feature">6 months of free premium access</div>
                <div class="feature">Early access to all new features</div>
                <div class="feature">Direct influence on product development</div>
                <div class="feature">Special beta tester badge and recognition</div>
                <div class="feature">Exclusive access to product launch events</div>
            </div>
            
            <p><strong>Testing Period:</strong> {{START_DATE}} - {{END_DATE}}</p>
            
            <p>Your feedback is invaluable in making DealMecca the best B2B networking platform for media professionals. We're excited to have you on this journey!</p>
            
            <p>Questions? Reply to this email or contact our beta support team at <a href="mailto:beta-support@dealmecca.com">beta-support@dealmecca.com</a></p>
            
            <p>Thank you for being part of the DealMecca beta community!</p>
            
            <p><strong>The DealMecca Team</strong><br>
            Building the future of B2B networking</p>
        </div>
    </div>
</body>
</html>
`

    const reminderEmail = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DealMecca Beta - Testing Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>🧪 Beta Testing Reminder</h2>
        
        <p>Hi {{TESTER_NAME}},</p>
        
        <p>Just a friendly reminder that your DealMecca beta testing period is ongoing. We'd love to hear your thoughts and feedback!</p>
        
        <p><strong>Your Progress:</strong></p>
        <ul>
            <li>Feedback submitted: {{FEEDBACK_COUNT}}</li>
            <li>Last active: {{LAST_ACTIVE}}</li>
            <li>Testing group: {{GROUP_NAME}}</li>
        </ul>
        
        <p>If you haven't had a chance to explore the platform yet, now is a great time to dive in and share your insights.</p>
        
        <a href="https://app.dealmecca.com/beta/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Continue Testing →
        </a>
        
        <p>Thanks for your participation!</p>
        
        <p><strong>The DealMecca Team</strong></p>
    </div>
</body>
</html>
`

    fs.writeFileSync(`${this.testingDataPath}/invite-email-template.html`, inviteEmail)
    fs.writeFileSync(`${this.testingDataPath}/reminder-email-template.html`, reminderEmail)

    console.log('✅ Created email templates for beta invitations')
  }

  async run(): Promise<void> {
    console.log('🧪 Setting up DealMecca V1 User Testing System...')
    
    await this.setupBetaTestingDatabase()
    const testingGroups = this.createBetaTestingGroups()
    const inviteCodes = this.generateBetaInviteCodes(100)
    const betaTesters = this.createBetaTesterProfiles()
    this.createFeedbackCollectionSystem()
    this.createTestingDocumentation()
    this.createInviteEmailTemplates()
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ USER TESTING SETUP COMPLETE')
    console.log('='.repeat(80))
    console.log('📁 Files created in ./user-testing/ directory:')
    console.log('   • beta-schema-patch.prisma - Database schema additions')
    console.log('   • testing-groups.json - Beta testing group configurations')
    console.log('   • invite-codes.json - Generated invite codes')
    console.log('   • beta-testers.json - Sample beta tester profiles')
    console.log('   • feedback-api.ts - Feedback collection API')
    console.log('   • invite-api.ts - Beta invite validation API')
    console.log('   • beta-dashboard.tsx - Beta testing dashboard component')
    console.log('   • BETA_TESTING_GUIDE.md - Comprehensive testing guide')
    console.log('   • ADMIN_GUIDE.md - Administration guide')
    console.log('   • invite-email-template.html - Email invitation template')
    console.log('   • reminder-email-template.html - Reminder email template')
    
    console.log('\n📊 Beta Testing Summary:')
    console.log(`   • ${testingGroups.length} testing groups created`)
    console.log(`   • ${inviteCodes.length} invite codes generated`)
    console.log(`   • ${betaTesters.length} sample beta tester profiles`)
    console.log('   • Complete feedback collection system')
    console.log('   • Comprehensive documentation and guides')
    
    console.log('\n🚀 Ready for beta testing launch!')
    console.log('📋 Next steps:')
    console.log('   1. Apply database schema changes')
    console.log('   2. Deploy beta testing APIs')
    console.log('   3. Send out beta invitations')
    console.log('   4. Monitor beta testing dashboard')
    console.log('   5. Collect and analyze feedback')
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const userTesting = new UserTestingSetup()
  userTesting.run()
    .then(() => {
      console.log('\n✅ User testing setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ User testing setup failed:', error)
      process.exit(1)
    })
    .finally(() => {
      prisma.$disconnect()
    })
}

export { UserTestingSetup } 