import { Contact, Company, SeniorityLevel, Department, CompanyType, EmployeeRange } from '@prisma/client'

export interface LeadScore {
  total: number           // 0-100 overall score
  roleScore: number       // Decision making authority (0-40)
  companyScore: number    // Company quality/size (0-30)
  contactScore: number    // Contact info completeness (0-20)
  engagementScore: number // User interaction history (0-10)
  breakdown: {
    seniority: number
    decisionMaker: number
    department: number
    companySize: number
    companyType: number
    verification: number
    contactInfo: number
    engagement: number
  }
}

export interface ContactWithCompany extends Contact {
  company: Company
  interactionCount?: number
  lastInteraction?: Date
}

/**
 * Calculate comprehensive lead score for a contact
 */
export function calculateLeadScore(contact: ContactWithCompany): LeadScore {
  const breakdown = {
    seniority: 0,
    decisionMaker: 0,
    department: 0,
    companySize: 0,
    companyType: 0,
    verification: 0,
    contactInfo: 0,
    engagement: 0
  }

  // Role scoring (0-40 points)
  let roleScore = 0

  // Seniority scoring (0-30 points)
  switch (contact.seniority) {
    case SeniorityLevel.C_LEVEL:
      breakdown.seniority = 30
      break
    case SeniorityLevel.SVP:
      breakdown.seniority = 25
      break
    case SeniorityLevel.VP:
      breakdown.seniority = 22
      break
    case SeniorityLevel.SENIOR_DIRECTOR:
      breakdown.seniority = 18
      break
    case SeniorityLevel.DIRECTOR:
      breakdown.seniority = 15
      break
    case SeniorityLevel.SENIOR_MANAGER:
      breakdown.seniority = 12
      break
    case SeniorityLevel.MANAGER:
      breakdown.seniority = 8
      break
    case SeniorityLevel.SENIOR_SPECIALIST:
      breakdown.seniority = 5
      break
    case SeniorityLevel.SPECIALIST:
      breakdown.seniority = 3
      break
    default:
      breakdown.seniority = 1
  }
  roleScore += breakdown.seniority

  // Decision maker bonus (0-5 points)
  if (contact.isDecisionMaker) {
    breakdown.decisionMaker = 5
    roleScore += breakdown.decisionMaker
  }

  // Department relevance (0-5 points)
  switch (contact.department) {
    case Department.MEDIA_PLANNING:
    case Department.MEDIA_BUYING:
    case Department.PROGRAMMATIC:
      breakdown.department = 5
      break
    case Department.DIGITAL_MARKETING:
    case Department.STRATEGY_PLANNING:
      breakdown.department = 4
      break
    case Department.MARKETING:
    case Department.ANALYTICS_INSIGHTS:
      breakdown.department = 3
      break
    case Department.LEADERSHIP:
      breakdown.department = 4
      break
    default:
      breakdown.department = 1
  }
  roleScore += breakdown.department

  // Company scoring (0-30 points)
  let companyScore = 0

  // Company size scoring (0-15 points)
  switch (contact.company.employeeCount) {
    case EmployeeRange.MEGA_5000_PLUS:
      breakdown.companySize = 15
      break
    case EmployeeRange.ENTERPRISE_1001_5000:
      breakdown.companySize = 12
      break
    case EmployeeRange.LARGE_201_1000:
      breakdown.companySize = 9
      break
    case EmployeeRange.MEDIUM_51_200:
      breakdown.companySize = 6
      break
    case EmployeeRange.SMALL_11_50:
      breakdown.companySize = 3
      break
    case EmployeeRange.STARTUP_1_10:
      breakdown.companySize = 1
      break
    default:
      breakdown.companySize = 0
  }
  companyScore += breakdown.companySize

  // Company type scoring (0-10 points)
  switch (contact.company.companyType) {
    case CompanyType.HOLDING_COMPANY_AGENCY:
    case CompanyType.MEDIA_HOLDING_COMPANY:
      breakdown.companyType = 10
      break
    case CompanyType.INDEPENDENT_AGENCY:
      breakdown.companyType = 8
      break
    case CompanyType.NATIONAL_ADVERTISER:
      breakdown.companyType = 7
      break
    case CompanyType.LOCAL_ADVERTISER:
      breakdown.companyType = 5
      break
    case CompanyType.ADTECH_VENDOR:
    case CompanyType.MARTECH_VENDOR:
      breakdown.companyType = 6
      break
    case CompanyType.MEDIA_OWNER:
    case CompanyType.PUBLISHER:
    case CompanyType.BROADCASTER:
      breakdown.companyType = 4
      break
    default:
      breakdown.companyType = 2
  }
  companyScore += breakdown.companyType

  // Verification bonus (0-5 points)
  if (contact.company.verified && contact.verified) {
    breakdown.verification = 5
  } else if (contact.company.verified || contact.verified) {
    breakdown.verification = 3
  } else {
    breakdown.verification = 0
  }
  companyScore += breakdown.verification

  // Contact completeness scoring (0-20 points)
  let contactScore = 0

  // Contact information completeness
  if (contact.email) {
    breakdown.contactInfo += 8
  }
  if (contact.phone) {
    breakdown.contactInfo += 4
  }
  if (contact.linkedinUrl) {
    breakdown.contactInfo += 4
  }
  if (contact.title && contact.title.trim().length > 0) {
    breakdown.contactInfo += 2
  }
  if (contact.personalEmail) {
    breakdown.contactInfo += 2
  }

  contactScore = breakdown.contactInfo

  // Engagement scoring (0-10 points)
  let engagementScore = 0

  if (contact.interactionCount) {
    // Base engagement points for having any interactions
    breakdown.engagement += Math.min(5, contact.interactionCount)
    
    // Recency bonus
    if (contact.lastInteraction) {
      const daysSinceInteraction = Math.floor(
        (Date.now() - contact.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceInteraction <= 7) {
        breakdown.engagement += 3
      } else if (daysSinceInteraction <= 30) {
        breakdown.engagement += 2
      } else if (daysSinceInteraction <= 90) {
        breakdown.engagement += 1
      }
    }
  }

  engagementScore = Math.min(10, breakdown.engagement)

  // Calculate total score
  const total = Math.min(100, roleScore + companyScore + contactScore + engagementScore)

  return {
    total,
    roleScore,
    companyScore,
    contactScore,
    engagementScore,
    breakdown
  }
}

/**
 * Get lead score tier based on total score
 */
export function getLeadTier(score: number): {
  tier: 'hot' | 'warm' | 'cold'
  label: string
  color: string
} {
  if (score >= 80) {
    return { tier: 'hot', label: 'Hot Lead', color: 'red' }
  } else if (score >= 60) {
    return { tier: 'warm', label: 'Warm Lead', color: 'orange' }
  } else {
    return { tier: 'cold', label: 'Cold Lead', color: 'blue' }
  }
}

/**
 * Get priority level based on score and other factors
 */
export function getContactPriority(contact: ContactWithCompany): {
  level: 'urgent' | 'high' | 'medium' | 'low'
  label: string
  color: string
} {
  const score = calculateLeadScore(contact)
  
  // Urgent: High score + decision maker + recent activity
  if (score.total >= 85 && contact.isDecisionMaker) {
    return { level: 'urgent', label: 'Urgent', color: 'red' }
  }
  
  // High: High score or C-level
  if (score.total >= 70 || contact.seniority === SeniorityLevel.C_LEVEL) {
    return { level: 'high', label: 'High Priority', color: 'orange' }
  }
  
  // Medium: Moderate score
  if (score.total >= 50) {
    return { level: 'medium', label: 'Medium Priority', color: 'yellow' }
  }
  
  // Low: Everything else
  return { level: 'low', label: 'Low Priority', color: 'gray' }
}

/**
 * Calculate average lead score for a list of contacts
 */
export function calculateAverageLeadScore(contacts: ContactWithCompany[]): number {
  if (contacts.length === 0) return 0
  
  const totalScore = contacts.reduce((sum, contact) => {
    return sum + calculateLeadScore(contact).total
  }, 0)
  
  return Math.round(totalScore / contacts.length)
}

/**
 * Get top leads from a list of contacts
 */
export function getTopLeads(
  contacts: ContactWithCompany[], 
  limit: number = 10
): Array<ContactWithCompany & { leadScore: LeadScore }> {
  return contacts
    .map(contact => ({
      ...contact,
      leadScore: calculateLeadScore(contact)
    }))
    .sort((a, b) => b.leadScore.total - a.leadScore.total)
    .slice(0, limit)
}

/**
 * Generate lead score insights and recommendations
 */
export function generateLeadInsights(contact: ContactWithCompany): {
  score: LeadScore
  tier: ReturnType<typeof getLeadTier>
  priority: ReturnType<typeof getContactPriority>
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
} {
  const score = calculateLeadScore(contact)
  const tier = getLeadTier(score.total)
  const priority = getContactPriority(contact)
  
  const recommendations: string[] = []
  const strengths: string[] = []
  const weaknesses: string[] = []
  
  // Analyze strengths
  if (score.breakdown.seniority >= 20) {
    strengths.push('Senior decision maker')
  }
  if (score.breakdown.decisionMaker > 0) {
    strengths.push('Confirmed decision maker')
  }
  if (score.breakdown.companySize >= 10) {
    strengths.push('Large company')
  }
  if (score.breakdown.contactInfo >= 15) {
    strengths.push('Complete contact information')
  }
  
  // Analyze weaknesses and generate recommendations
  if (score.breakdown.contactInfo < 10) {
    weaknesses.push('Incomplete contact information')
    recommendations.push('Research to find missing contact details')
  }
  if (score.breakdown.engagement === 0) {
    weaknesses.push('No engagement history')
    recommendations.push('Start with initial outreach via LinkedIn or email')
  }
  if (!contact.isDecisionMaker) {
    recommendations.push('Identify and connect with decision makers')
  }
  if (score.breakdown.verification === 0) {
    weaknesses.push('Unverified contact')
    recommendations.push('Verify contact information before outreach')
  }
  
  return {
    score,
    tier,
    priority,
    recommendations,
    strengths,
    weaknesses
  }
}
