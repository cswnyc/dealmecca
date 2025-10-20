// Utility functions for determining company capabilities from existing data

interface Contact {
  department?: string;
  primaryRole?: string;
  title?: string;
}

interface Company {
  companyType: string;
  agencyType?: string;
  industry?: string;
  advertisingModel?: string;
}

// Map departments to agency role badges
const DEPARTMENT_TO_ROLE_MAP: Record<string, string[]> = {
  MEDIA_BUYING: ['Buying'],
  MEDIA_PLANNING: ['Planning'],
  STRATEGY_PLANNING: ['Strategy'],
  CREATIVE_SERVICES: ['Creative'],
  ANALYTICS_INSIGHTS: ['Analytics', 'Data'],
  ACCOUNT_MANAGEMENT: ['AOR', 'Account Management'],
  BUSINESS_DEVELOPMENT: ['Business Development'],
  DIGITAL_MARKETING: ['Digital'],
  PROGRAMMATIC: ['Programmatic'],
  SOCIAL_MEDIA: ['Social Media'],
  SEARCH_MARKETING: ['Search', 'SEM'],
  OPERATIONS: ['Operations'],
  TECHNOLOGY: ['Technology', 'Innovation'],
};

// Map agency types to media specialties
const AGENCY_TYPE_TO_MEDIA_MAP: Record<string, string[]> = {
  FULL_SERVICE: ['Digital', 'TV', 'Print', 'Social Media', 'OOH', 'Video', 'Mobile'],
  MEDIA_SPECIALIST: ['TV', 'Print', 'OOH', 'Video'],
  CREATIVE_SPECIALIST: ['Creative', 'Video', 'Print'],
  DIGITAL_SPECIALIST: ['Digital', 'Social Media', 'Mobile', 'Display'],
  PROGRAMMATIC_SPECIALIST: ['Programmatic', 'Digital', 'Data'],
  SOCIAL_MEDIA_SPECIALIST: ['Social Media', 'Influencer', 'Video'],
  SEARCH_SPECIALIST: ['Search', 'SEM', 'SEO'],
  INFLUENCER_SPECIALIST: ['Influencer', 'Social Media'],
  PERFORMANCE_MARKETING: ['Digital', 'Search', 'Social Media', 'Display'],
  BRAND_STRATEGY: ['Strategy', 'Creative', 'PR'],
  MEDIA_PLANNING: ['TV', 'Print', 'Digital', 'OOH', 'Video'],
  MEDIA_BUYING: ['TV', 'Print', 'Digital', 'OOH', 'Programmatic'],
  DATA_ANALYTICS: ['Data', 'Analytics'],
  CONTENT_MARKETING: ['Content', 'Social Media', 'Video'],
};

// Generic focus areas based on agency type
const AGENCY_TYPE_TO_GOALS_MAP: Record<string, string[]> = {
  PERFORMANCE_MARKETING: ['Direct Response', 'Lead Gen', 'Lower-Funnel', 'Demand Gen'],
  BRAND_STRATEGY: ['Branding', 'Upper-Funnel', 'Partnerships'],
  DIGITAL_SPECIALIST: ['Lead Gen', 'E-commerce', 'Direct Response'],
  CREATIVE_SPECIALIST: ['Branding', 'Brand Awareness', 'Storytelling'],
  MEDIA_PLANNING: ['Media Strategy', 'Audience Targeting', 'Cross-Channel'],
  MEDIA_BUYING: ['Media Efficiency', 'ROI Optimization'],
  FULL_SERVICE: ['Integrated Campaigns', 'Brand Building', 'Performance'],
};

/**
 * Extract unique agency roles from contact departments
 */
export function getAgencyRoles(contacts: Contact[]): string[] {
  const roles = new Set<string>();

  contacts.forEach(contact => {
    if (contact.department && DEPARTMENT_TO_ROLE_MAP[contact.department]) {
      DEPARTMENT_TO_ROLE_MAP[contact.department].forEach(role => roles.add(role));
    }

    // Also check titles for key roles
    if (contact.title) {
      const titleLower = contact.title.toLowerCase();
      if (titleLower.includes('buyer') || titleLower.includes('buying')) roles.add('Buying');
      if (titleLower.includes('planner') || titleLower.includes('planning')) roles.add('Planning');
      if (titleLower.includes('strateg')) roles.add('Strategy');
      if (titleLower.includes('creative')) roles.add('Creative');
      if (titleLower.includes('analytics') || titleLower.includes('analyst')) roles.add('Analytics');
      if (titleLower.includes('account')) roles.add('Account Management');
    }
  });

  return Array.from(roles).sort();
}

/**
 * Get media types agency specializes in
 */
export function getAgencyMediaTypes(agencyType?: string, contacts?: Contact[]): string[] {
  const mediaTypes = new Set<string>();

  // Add media types based on agency type
  if (agencyType && AGENCY_TYPE_TO_MEDIA_MAP[agencyType]) {
    AGENCY_TYPE_TO_MEDIA_MAP[agencyType].forEach(media => mediaTypes.add(media));
  }

  // Add media types from contact departments
  if (contacts) {
    contacts.forEach(contact => {
      if (contact.department) {
        if (contact.department === 'DIGITAL_MARKETING') {
          mediaTypes.add('Digital');
        } else if (contact.department === 'SOCIAL_MEDIA') {
          mediaTypes.add('Social Media');
        } else if (contact.department === 'PROGRAMMATIC') {
          mediaTypes.add('Programmatic');
        } else if (contact.department === 'SEARCH_MARKETING') {
          mediaTypes.add('Search');
        }
      }
    });
  }

  return Array.from(mediaTypes).sort();
}

/**
 * Get focus areas/goals for an agency
 */
export function getAgencyGoals(agencyType?: string): string[] {
  if (agencyType && AGENCY_TYPE_TO_GOALS_MAP[agencyType]) {
    return AGENCY_TYPE_TO_GOALS_MAP[agencyType];
  }

  // Default goals for agencies
  return ['Full-Service Campaigns', 'Brand Building', 'Performance Marketing'];
}

/**
 * Get advertiser capabilities (what they focus on)
 */
export function getAdvertiserCapabilities(company: Company, contacts?: Contact[]): {
  industry?: string;
  advertisingModel?: string;
  teamStructure: string[];
} {
  const teamStructure = new Set<string>();

  // Extract unique departments from contacts
  if (contacts) {
    contacts.forEach(contact => {
      if (contact.department) {
        const deptLabel = formatDepartmentLabel(contact.department);
        if (deptLabel) teamStructure.add(deptLabel);
      }
    });
  }

  return {
    industry: company.industry ? formatIndustryLabel(company.industry) : undefined,
    advertisingModel: company.advertisingModel ? formatAdvertisingModelLabel(company.advertisingModel) : undefined,
    teamStructure: Array.from(teamStructure).sort(),
  };
}

/**
 * Format department enum to readable label
 */
function formatDepartmentLabel(department: string): string {
  const labels: Record<string, string> = {
    MEDIA_PLANNING: 'Media Planning',
    MEDIA_BUYING: 'Media Buying',
    DIGITAL_MARKETING: 'Digital Marketing',
    PROGRAMMATIC: 'Programmatic',
    SOCIAL_MEDIA: 'Social Media',
    SEARCH_MARKETING: 'Search Marketing',
    STRATEGY_PLANNING: 'Strategy',
    ANALYTICS_INSIGHTS: 'Analytics & Insights',
    CREATIVE_SERVICES: 'Creative',
    ACCOUNT_MANAGEMENT: 'Account Management',
    BUSINESS_DEVELOPMENT: 'Business Development',
    OPERATIONS: 'Operations',
    TECHNOLOGY: 'Technology',
    FINANCE: 'Finance',
    LEADERSHIP: 'Leadership',
    MARKETING: 'Marketing',
    SALES: 'Sales',
    PRODUCT: 'Product',
  };

  return labels[department] || department.replace(/_/g, ' ');
}

/**
 * Format industry enum to readable label
 */
function formatIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
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

  return labels[industry] || industry.replace(/_/g, ' ');
}

/**
 * Format advertising model to readable label
 */
function formatAdvertisingModelLabel(model: string): string {
  const labels: Record<string, string> = {
    AGENCY_MANAGED: 'Works with Agencies',
    IN_HOUSE: 'In-House Marketing Team',
    HYBRID: 'Hybrid Approach',
  };

  return labels[model] || model;
}

/**
 * Determine if company is an agency
 */
export function isAgency(companyType: string): boolean {
  return companyType === 'AGENCY' ||
         companyType === 'INDEPENDENT_AGENCY' ||
         companyType === 'HOLDING_COMPANY_AGENCY' ||
         companyType === 'MEDIA_HOLDING_COMPANY';
}

/**
 * Determine if company is an advertiser
 */
export function isAdvertiser(companyType: string): boolean {
  return companyType === 'ADVERTISER' ||
         companyType === 'NATIONAL_ADVERTISER' ||
         companyType === 'LOCAL_ADVERTISER';
}
