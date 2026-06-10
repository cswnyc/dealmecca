// lib/labels.ts
// Single source of truth for all user-facing display labels.
// Database fields, Prisma models, enums, and API keys are NOT renamed.
// Only the presentation layer uses this dictionary.

// ---------------------------------------------------------------------------
// Model / concept labels (internal name -> display name)
// ---------------------------------------------------------------------------

export const MODEL_LABELS: Record<string, string> = {
  Team: 'Account',
  CompanyPartnership: 'Account',
  Duty: 'Discipline',
  DutyCategory: 'Discipline Category',
  Contact: 'Person',
  PartnershipContact: 'Handling Contact',
};

// ---------------------------------------------------------------------------
// Enum label maps
// ---------------------------------------------------------------------------

export const COMPANY_TYPE_LABELS: Record<string, string> = {
  AGENCY: 'Agency',
  INDEPENDENT_AGENCY: 'Independent Agency',
  HOLDING_COMPANY_AGENCY: 'Holding Company Agency',
  NETWORK_AGENCY: 'Network Agency',
  MEDIA_HOLDING_COMPANY: 'Media Holding Company',
  NATIONAL_ADVERTISER: 'National Advertiser',
  LOCAL_ADVERTISER: 'Local Advertiser',
  ADVERTISER: 'Advertiser',
  BRAND: 'Brand',
  VENDOR: 'Vendor',
  PUBLISHER: 'Publisher',
  DSP: 'Demand Side Platform',
  SSP: 'Supply Side Platform',
  ADTECH: 'AdTech',
};

export const AGENCY_TYPE_LABELS: Record<string, string> = {
  FULL_SERVICE: 'Full Service',
  MEDIA_SPECIALIST: 'Media Specialist',
  CREATIVE_SPECIALIST: 'Creative Specialist',
  DIGITAL_SPECIALIST: 'Digital Specialist',
  HOLDING_COMPANY: 'Holding Company',
  MEDIA_HOLDING_COMPANY: 'Media Holding Company',
  HOLDING_COMPANY_AGENCY: 'Agency',
  INDEPENDENT_AGENCY: 'Independent Agency',
  NETWORK_AGENCY: 'Network Agency',
};

export const PARTNERSHIP_TYPE_LABELS: Record<string, string> = {
  AGENCY_CLIENT: 'Agency Client',
  MEDIA_PARTNERSHIP: 'Media Partnership',
  STRATEGIC_ALLIANCE: 'Strategic Alliance',
  PREFERRED_VENDOR: 'Preferred Vendor',
  HOLDING_COMPANY_SUBSIDIARY: 'Holding Company Subsidiary',
  SISTER_AGENCY: 'Sister Agency',
  JOINT_VENTURE: 'Joint Venture',
  SUBCONTRACTOR: 'Subcontractor',
};

export const SENIORITY_LABELS: Record<string, string> = {
  C_LEVEL: 'C-Level',
  FOUNDER_OWNER: 'Founder / Owner',
  EVP: 'Executive Vice President',
  SVP: 'Senior Vice President',
  VP: 'Vice President',
  SENIOR_DIRECTOR: 'Senior Director',
  DIRECTOR: 'Director',
  SENIOR_MANAGER: 'Senior Manager',
  MANAGER: 'Manager',
  SENIOR: 'Senior Level',
  ASSOCIATE: 'Associate',
  COORDINATOR: 'Coordinator',
  ANALYST: 'Analyst',
  SPECIALIST: 'Specialist',
  INTERN: 'Intern',
  MID: 'Mid-Level',
  ENTRY: 'Entry Level',
  UNKNOWN: 'Unknown',
};

export const DEPARTMENT_LABELS: Record<string, string> = {
  MEDIA_PLANNING: 'Media Planning',
  MEDIA_BUYING: 'Media Buying',
  DIGITAL_MARKETING: 'Digital Marketing',
  PROGRAMMATIC: 'Programmatic',
  SOCIAL_MEDIA: 'Social Media',
  SEARCH_MARKETING: 'Search Marketing',
  STRATEGY_PLANNING: 'Strategy & Planning',
  ANALYTICS_INSIGHTS: 'Analytics & Insights',
  CREATIVE_SERVICES: 'Creative Services',
  ACCOUNT_MANAGEMENT: 'Account Management',
  BUSINESS_DEVELOPMENT: 'Business Development',
  OPERATIONS: 'Operations',
  TECHNOLOGY: 'Technology',
  FINANCE: 'Finance',
  HR: 'Human Resources',
  LEADERSHIP: 'Leadership',
  MARKETING: 'Marketing',
  SALES: 'Sales',
  PRODUCT: 'Product',
  DISPLAY: 'Display',
  DOOH: 'DOOH',
  OOH: 'OOH',
  PR: 'PR',
  INFLUENCER: 'Influencer',
};

export const CONTACT_ROLE_LABELS: Record<string, string> = {
  MEDIA_BUYER: 'Media Buyer',
  MEDIA_PLANNER: 'Media Planner',
  STRATEGIST: 'Strategist',
  ANALYST: 'Analyst',
  CREATIVE: 'Creative',
  ACCOUNT_MANAGER: 'Account Manager',
  PROJECT_MANAGER: 'Project Manager',
  BUSINESS_DEVELOPER: 'Business Developer',
  DECISION_MAKER: 'Decision Maker',
  INFLUENCER: 'Influencer',
  GATEKEEPER: 'Gatekeeper',
  IMPLEMENTER: 'Implementer',
  ADVISOR: 'Advisor',
  BUDGET_HOLDER: 'Budget Holder',
  PROCUREMENT: 'Procurement',
};

export const DUTY_CATEGORY_LABELS: Record<string, string> = {
  ROLE: 'Role',
  MEDIA_TYPE: 'Media Type',
  BRAND: 'Brand',
  BUSINESS_LINE: 'Business Line',
  GOAL: 'Goal',
  AUDIENCE: 'Audience',
  GEOGRAPHY: 'Geography',
};

export const TEAM_TYPE_LABELS: Record<string, string> = {
  AGENCY_TEAM: 'Agency Team',
  ADVERTISER_TEAM: 'Advertiser Team',
  INTERNAL_TEAM: 'Internal Team',
  PROJECT_TEAM: 'Project Team',
};

export const INTERACTION_TYPE_LABELS: Record<string, string> = {
  EMAIL: 'Email',
  PHONE_CALL: 'Phone Call',
  LINKEDIN_MESSAGE: 'LinkedIn Message',
  LINKEDIN_CONNECTION: 'LinkedIn Connection',
  MEETING: 'Meeting',
  CONFERENCE_CALL: 'Conference Call',
  TEXT_MESSAGE: 'Text Message',
  IN_PERSON: 'In Person',
  SOCIAL_MEDIA: 'Social Media',
  OTHER: 'Other',
};

export const INDUSTRY_LABELS: Record<string, string> = {
  AUTOMOTIVE: 'Automotive',
  CPG_FOOD_BEVERAGE: 'CPG - Food & Beverage',
  CPG_PERSONAL_CARE: 'CPG - Personal Care',
  CPG_HOUSEHOLD: 'CPG - Household',
  FINANCIAL_SERVICES: 'Financial Services',
  HEALTHCARE_PHARMA: 'Healthcare & Pharma',
  RETAIL_ECOMMERCE: 'Retail & E-commerce',
  TECHNOLOGY: 'Technology',
  ENTERTAINMENT_MEDIA: 'Entertainment & Media',
  TRAVEL_HOSPITALITY: 'Travel & Hospitality',
  TELECOM: 'Telecommunications',
  FASHION_BEAUTY: 'Fashion & Beauty',
  SPORTS_FITNESS: 'Sports & Fitness',
  EDUCATION: 'Education',
  REAL_ESTATE: 'Real Estate',
  ENERGY: 'Energy',
  GOVERNMENT_NONPROFIT: 'Government & Nonprofit',
  GAMING: 'Gaming',
  CRYPTOCURRENCY: 'Cryptocurrency',
  INSURANCE: 'Insurance',
  B2B_SERVICES: 'B2B Services',
  PROFESSIONAL_SERVICES: 'Professional Services',
};

export const ADVERTISING_MODEL_LABELS: Record<string, string> = {
  AGENCY_MANAGED: 'Works with Agencies',
  IN_HOUSE: 'In-House Marketing Team',
  HYBRID: 'Hybrid Approach',
};

export const AGENCY_SERVICE_LABELS: Record<string, string> = {
  CREATIVE: 'Creative',
  MEDIA_PLANNING: 'Media Planning',
  MEDIA_BUYING: 'Media Buying',
  DIGITAL_MARKETING: 'Digital Marketing',
  SOCIAL_MEDIA: 'Social Media',
  STRATEGY: 'Strategy',
  ANALYTICS: 'Analytics',
  PRODUCTION: 'Production',
  PR_COMMUNICATIONS: 'PR & Communications',
  INFLUENCER: 'Influencer',
  PERFORMANCE_MARKETING: 'Performance Marketing',
  SEO_SEM: 'SEO / SEM',
};

export const DATA_QUALITY_LABELS: Record<string, string> = {
  VERIFIED: 'Verified',
  STANDARD: 'Standard',
  UNVERIFIED: 'Unverified',
};

export const PARTNERSHIP_ROLE_LABELS: Record<string, string> = {
  agency: 'Agency Partner',
  advertiser: 'Client',
};

// ---------------------------------------------------------------------------
// Master lookup by enum name
// ---------------------------------------------------------------------------

const ENUM_MAPS: Record<string, Record<string, string>> = {
  CompanyType: COMPANY_TYPE_LABELS,
  AgencyType: AGENCY_TYPE_LABELS,
  PartnershipType: PARTNERSHIP_TYPE_LABELS,
  SeniorityLevel: SENIORITY_LABELS,
  Department: DEPARTMENT_LABELS,
  ContactRole: CONTACT_ROLE_LABELS,
  DutyCategory: DUTY_CATEGORY_LABELS,
  TeamType: TEAM_TYPE_LABELS,
  InteractionType: INTERACTION_TYPE_LABELS,
  Industry: INDUSTRY_LABELS,
  AdvertisingModel: ADVERTISING_MODEL_LABELS,
  AgencyServiceType: AGENCY_SERVICE_LABELS,
  DataQuality: DATA_QUALITY_LABELS,
  PartnershipRole: PARTNERSHIP_ROLE_LABELS,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a raw SNAKE_CASE enum value to a human-readable label.
 * Handles common patterns like underscores, acronyms, and ampersands.
 */
export function formatEnumLabel(value: string): string {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bCpg\b/g, 'CPG')
    .replace(/\bDooh\b/g, 'DOOH')
    .replace(/\bOoh\b/g, 'OOH')
    .replace(/\bPr\b/g, 'PR')
    .replace(/\bHr\b/g, 'HR')
    .replace(/\bSeo\b/g, 'SEO')
    .replace(/\bSem\b/g, 'SEM')
    .replace(/\bDsp\b/g, 'DSP')
    .replace(/\bSsp\b/g, 'SSP')
    .replace(/\bEvp\b/g, 'EVP')
    .replace(/\bSvp\b/g, 'SVP')
    .replace(/\bVp\b/g, 'VP')
    .replace(/\bAdtech\b/g, 'AdTech')
    .replace(/\bEcommerce\b/g, 'E-commerce');
}

/**
 * Look up the display label for an enum value.
 * Falls back to formatEnumLabel if no explicit mapping exists.
 */
export function getEnumLabel(enumName: string, value: string): string {
  const map = ENUM_MAPS[enumName];
  if (map && map[value]) return map[value];
  return formatEnumLabel(value);
}

/**
 * Get the display label for a model/concept name.
 */
export function getModelLabel(modelName: string): string {
  return MODEL_LABELS[modelName] || modelName;
}

/**
 * Shorthand: get a company type label.
 */
export function getCompanyTypeLabel(type: string): string {
  return COMPANY_TYPE_LABELS[type] || formatEnumLabel(type);
}

/**
 * Shorthand: get a partnership type label.
 */
export function getPartnershipTypeLabel(type: string): string {
  return PARTNERSHIP_TYPE_LABELS[type] || formatEnumLabel(type);
}

/**
 * Shorthand: get a seniority label.
 */
export function getSeniorityLabel(seniority: string): string {
  return SENIORITY_LABELS[seniority] || formatEnumLabel(seniority);
}

/**
 * Shorthand: get a department label.
 */
export function getDepartmentLabel(department: string): string {
  return DEPARTMENT_LABELS[department] || formatEnumLabel(department);
}

/**
 * Shorthand: get an industry label.
 */
export function getIndustryLabel(industry: string): string {
  return INDUSTRY_LABELS[industry] || formatEnumLabel(industry);
}

/**
 * Shorthand: get a duty category label.
 */
export function getDutyCategoryLabel(category: string): string {
  return DUTY_CATEGORY_LABELS[category] || formatEnumLabel(category);
}
