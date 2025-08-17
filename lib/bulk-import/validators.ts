// 🚀 DealMecca Bulk Import Data Validation
// Comprehensive validation for companies and contacts with media seller focus

import { BulkImportCompany, BulkImportContact, ImportError } from '@/lib/types/bulk-import';
import { isValidMediaRole, getMediaRoleScore, VALID_MEDIA_ROLES } from './parsers';

export class DataValidator {
  // =============================================================================
  // COMPANY VALIDATION
  // =============================================================================
  
  static validateCompanies(companies: BulkImportCompany[]): ImportError[] {
    const errors: ImportError[] = [];
    const seenNames = new Set<string>();
    const seenDomains = new Set<string>();

    companies.forEach((company, index) => {
      // Required fields validation
      if (!company.name || company.name.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'companyName',
          value: company.name || '',
          message: 'Company name is required',
          severity: 'error'
        });
      }

      // Duplicate company name check
      const normalizedName = company.name?.toLowerCase().trim();
      if (normalizedName && seenNames.has(normalizedName)) {
        errors.push({
          row: index + 1,
          field: 'companyName',
          value: company.name,
          message: 'Duplicate company name found',
          severity: 'error'
        });
      } else if (normalizedName) {
        seenNames.add(normalizedName);
      }

      // Domain validation and duplicate check
      if (company.domain) {
        if (!this.isValidDomain(company.domain)) {
          errors.push({
            row: index + 1,
            field: 'domain',
            value: company.domain,
                      message: 'Invalid domain format (e.g., company.com)',
          severity: 'error'
        });
        } else {
          const normalizedDomain = company.domain.toLowerCase().trim();
          if (seenDomains.has(normalizedDomain)) {
            errors.push({
              row: index + 1,
              field: 'domain',
              value: company.domain,
                          message: 'Duplicate domain found',
            severity: 'error'
          });
          } else {
            seenDomains.add(normalizedDomain);
          }
        }
      }

      // Employee count validation
      if (company.employeeCount !== undefined) {
        if (company.employeeCount < 1 || company.employeeCount > 10000000) {
          errors.push({
            row: index + 1,
            field: 'employeeCount',
            value: company.employeeCount.toString(),
                      message: 'Employee count must be between 1 and 10,000,000',
          severity: 'error'
        });
        }
      }

      // Website URL validation
      if (company.website && !this.isValidUrl(company.website)) {
        errors.push({
          row: index + 1,
          field: 'website',
          value: company.website,
                  message: 'Invalid website URL format',
        severity: 'error'
      });
      }

      // Company type validation
      if (company.type && !['BRAND', 'AGENCY', 'VENDOR'].includes(company.type)) {
        errors.push({
          row: index + 1,
          field: 'type',
          value: company.type,
                  message: 'Company type must be BRAND, AGENCY, or VENDOR',
        severity: 'error'
      });
      }

      // Revenue format validation
      if (company.revenue && !this.isValidRevenue(company.revenue)) {
        errors.push({
          row: index + 1,
          field: 'revenue',
          value: company.revenue,
                  message: 'Invalid revenue format (use formats like $1M, $500K, $1.5B)',
        severity: 'error'
      });
      }
    });

    return errors;
  }

  // =============================================================================
  // CONTACT VALIDATION
  // =============================================================================
  
  static validateContacts(contacts: BulkImportContact[]): ImportError[] {
    const errors: ImportError[] = [];
    const seenEmails = new Set<string>();

    contacts.forEach((contact, index) => {
      // Required fields validation
      if (!contact.firstName && !contact.lastName) {
        errors.push({
          row: index + 1,
          field: 'name',
          value: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                  message: 'Either first name or last name is required',
        severity: 'error'
      });
      }

      if (!contact.companyName || contact.companyName.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'companyName',
          value: contact.companyName || '',
                  message: 'Company name is required for contacts',
        severity: 'error'
      });
      }

      if (!contact.title || contact.title.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'title',
          value: contact.title || '',
                  message: 'Job title is required for media seller targeting',
        severity: 'error'
      });
      }

      // Email validation and duplicate check
      if (contact.email) {
        if (!this.isValidEmail(contact.email)) {
          errors.push({
            row: index + 1,
            field: 'email',
            value: contact.email,
                      message: 'Invalid email format',
          severity: 'error'
        });
        } else {
          const normalizedEmail = contact.email.toLowerCase().trim();
          if (seenEmails.has(normalizedEmail)) {
            errors.push({
              row: index + 1,
              field: 'email',
              value: contact.email,
                          message: 'Duplicate email address found',
            severity: 'error'
          });
          } else {
            seenEmails.add(normalizedEmail);
          }
        }
      }

      // Phone validation
      if (contact.phone && !this.isValidPhone(contact.phone)) {
        errors.push({
          row: index + 1,
          field: 'phone',
          value: contact.phone,
                  message: 'Invalid phone format (use formats like +1-555-123-4567, (555) 123-4567)',
        severity: 'error'
      });
      }

      // LinkedIn URL validation
      if (contact.linkedinUrl && !this.isValidLinkedInUrl(contact.linkedinUrl)) {
        errors.push({
          row: index + 1,
          field: 'linkedinUrl',
          value: contact.linkedinUrl,
                  message: 'Invalid LinkedIn URL format (must be linkedin.com/in/profile)',
        severity: 'error'
      });
      }

      // Seniority validation
      if (contact.seniority && !['C_LEVEL', 'VP', 'DIRECTOR', 'MANAGER', 'ASSOCIATE', 'COORDINATOR'].includes(contact.seniority)) {
        errors.push({
          row: index + 1,
          field: 'seniority',
          value: contact.seniority,
                  message: 'Invalid seniority level',
        severity: 'error'
      });
      }

      // Budget authority validation
      if (contact.budgetAuthority && !['HIGH', 'MEDIUM', 'LOW', 'NONE'].includes(contact.budgetAuthority)) {
        errors.push({
          row: index + 1,
          field: 'budgetAuthority',
          value: contact.budgetAuthority,
                  message: 'Invalid budget authority level',
        severity: 'error'
      });
      }

      // Media role validation with detailed feedback
      if (contact.title && !isValidMediaRole(contact.title)) {
        const roleScore = getMediaRoleScore(contact.title);
        if (roleScore < 30) {
          // Warning for low-relevance roles
          errors.push({
            row: index + 1,
            field: 'title',
            value: contact.title,
                      message: `Title "${contact.title}" may not be a target media seller role (relevance: ${roleScore}%). Consider reviewing for targeting effectiveness.`,
          severity: 'warning'
        });
        }
      }
    });

    return errors;
  }

  // =============================================================================
  // CROSS-VALIDATION (RELATIONSHIPS BETWEEN DATA)
  // =============================================================================

  static validateDataRelationships(
    companies: BulkImportCompany[], 
    contacts: BulkImportContact[]
  ): ImportError[] {
    const errors: ImportError[] = [];
    const companyNames = new Set(companies.map(c => c.name.toLowerCase().trim()));

    // Check that all contacts have matching companies
    contacts.forEach((contact, index) => {
      const normalizedCompanyName = contact.companyName.toLowerCase().trim();
      if (!companyNames.has(normalizedCompanyName)) {
        errors.push({
          row: index + 1,
          field: 'companyName',
          value: contact.companyName,
                  message: `Company "${contact.companyName}" not found in companies list`,
        severity: 'warning'
      });
      }
    });

    return errors;
  }

  // =============================================================================
  // MEDIA SELLER QUALITY SCORING
  // =============================================================================

  static getContactQualityScore(contact: BulkImportContact): {
    score: number;
    factors: string[];
    recommendations: string[];
  } {
    let score = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Role relevance (40 points max)
    const roleScore = getMediaRoleScore(contact.title);
    score += (roleScore * 0.4);
    factors.push(`Role relevance: ${roleScore}%`);

    // Contact completeness (30 points max)
    let completeness = 0;
    if (contact.email) completeness += 10;
    if (contact.phone) completeness += 10;
    if (contact.linkedinUrl) completeness += 10;
    score += completeness;
    factors.push(`Contact completeness: ${completeness}/30`);

    // Seniority bonus (20 points max)
    const seniorityBonus = {
      'C_LEVEL': 20,
      'VP': 15,
      'DIRECTOR': 12,
      'MANAGER': 8,
      'ASSOCIATE': 5,
      'COORDINATOR': 2
    };
    const seniorityScore = seniorityBonus[contact.seniority || 'COORDINATOR'] || 0;
    score += seniorityScore;
    factors.push(`Seniority level: ${seniorityScore}/20`);

    // Decision making (10 points max)
    if (contact.decisionMaking) {
      score += 10;
      factors.push('Decision maker: +10');
    }

    // Recommendations based on score
    if (score < 50) {
      recommendations.push('Consider verifying role relevance for media buying');
      recommendations.push('Add missing contact information (email, phone, LinkedIn)');
    }
    if (!contact.email && !contact.phone) {
      recommendations.push('Critical: No contact method available');
    }
    if (roleScore < 50) {
      recommendations.push(`Role "${contact.title}" may not be optimal for media sales targeting`);
    }

    return {
      score: Math.round(score),
      factors,
      recommendations
    };
  }

  // =============================================================================
  // UTILITY VALIDATION METHODS
  // =============================================================================

  private static isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && domain.includes('.') && domain.length >= 4;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  private static isValidPhone(phone: string): boolean {
    // Remove all non-digit characters and check length
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }

  private static isValidLinkedInUrl(url: string): boolean {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|profile)\/[\w\-_À-ÿ%]+\/?$/i;
    return linkedinRegex.test(url);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidRevenue(revenue: string): boolean {
    // Match formats like $1M, $500K, $1.5B, $10,000,000
    const revenueRegex = /^\$(\d{1,3}(,\d{3})*|\d+(\.\d+)?[KMB])$/i;
    return revenueRegex.test(revenue);
  }
}

// =============================================================================
// MEDIA SELLER VALIDATION HELPERS
// =============================================================================

export function validateMediaSellerProfile(contact: BulkImportContact): {
  isTargetRole: boolean;
  confidence: number;
  reasons: string[];
  suggestions: string[];
} {
  const reasons: string[] = [];
  const suggestions: string[] = [];
  
  const roleScore = getMediaRoleScore(contact.title);
  const isTargetRole = roleScore >= 50;
  
  // Analyze role relevance
  if (isValidMediaRole(contact.title)) {
    reasons.push(`"${contact.title}" is a recognized media seller role`);
  } else {
    reasons.push(`"${contact.title}" is not in the standard media seller role list`);
    suggestions.push('Consider if this role has media buying authority');
  }

  // Analyze seniority
  if (contact.seniority === 'C_LEVEL' || contact.seniority === 'VP') {
    reasons.push('Senior-level contact with likely budget authority');
  } else if (contact.seniority === 'DIRECTOR') {
    reasons.push('Director-level contact with medium budget authority');
  }

  // Analyze decision making
  if (contact.decisionMaking) {
    reasons.push('Identified as decision maker');
  } else {
    suggestions.push('Verify if contact has decision-making authority');
  }

  // Analyze budget authority
  if (contact.budgetAuthority === 'HIGH') {
    reasons.push('High budget authority - prime target');
  } else if (contact.budgetAuthority === 'LOW' || contact.budgetAuthority === 'NONE') {
    suggestions.push('Limited budget authority - may not be primary target');
  }

  // Contact completeness
  const contactMethods = [contact.email, contact.phone, contact.linkedinUrl].filter(Boolean).length;
  if (contactMethods === 0) {
    suggestions.push('No contact methods available - add email, phone, or LinkedIn');
  } else if (contactMethods === 1) {
    suggestions.push('Add additional contact methods for better reach');
  }

  return {
    isTargetRole,
    confidence: roleScore,
    reasons,
    suggestions
  };
}

// Enhanced role detection for common variations
export function detectRoleVariations(title: string): {
  standardRole: string | null;
  confidence: number;
  variations: string[];
} {
  const titleLower = title.toLowerCase();
  
  const roleMap: { [key: string]: { standard: string; variations: string[]; confidence: number } } = {
    'cmo': {
      standard: 'Chief Marketing Officer',
      variations: ['chief marketing officer', 'marketing director', 'head of marketing'],
      confidence: 95
    },
    'media director': {
      standard: 'Media Director',
      variations: ['director of media', 'media planning director', 'digital media director'],
      confidence: 90
    },
    'brand manager': {
      standard: 'Brand Manager',
      variations: ['brand marketing manager', 'product marketing manager', 'marketing manager'],
      confidence: 85
    },
    'programmatic': {
      standard: 'Programmatic Manager',
      variations: ['programmatic trader', 'programmatic specialist', 'demand side platform manager'],
      confidence: 88
    }
  };

  for (const [key, value] of Object.entries(roleMap)) {
    if (titleLower.includes(key) || value.variations.some(v => titleLower.includes(v))) {
      return {
        standardRole: value.standard,
        confidence: value.confidence,
        variations: value.variations
      };
    }
  }

  return {
    standardRole: null,
    confidence: 0,
    variations: []
  };
}

// Data quality assessment for entire import
export function assessImportQuality(
  companies: BulkImportCompany[], 
  contacts: BulkImportContact[]
): {
  overall: number;
  companies: number;
  contacts: number;
  mediaRelevance: number;
  completeness: number;
  recommendations: string[];
} {
  // Company quality (basic completeness)
  const companyQuality = companies.reduce((sum, company) => {
    let score = 0;
    if (company.name) score += 25;
    if (company.domain) score += 25;
    if (company.industry) score += 25;
    if (company.employeeCount) score += 25;
    return sum + score;
  }, 0) / companies.length;

  // Contact quality and media relevance
  let totalContactScore = 0;
  let totalMediaRelevance = 0;
  
  contacts.forEach(contact => {
    const quality = DataValidator.getContactQualityScore(contact);
    totalContactScore += quality.score;
    totalMediaRelevance += getMediaRoleScore(contact.title);
  });

  const contactQuality = totalContactScore / contacts.length;
  const mediaRelevance = totalMediaRelevance / contacts.length;

  // Completeness assessment
  const completeness = (companyQuality + contactQuality) / 2;

  // Overall score
  const overall = (companyQuality * 0.3 + contactQuality * 0.4 + mediaRelevance * 0.3);

  const recommendations: string[] = [];
  if (overall < 60) recommendations.push('Consider data quality improvements before import');
  if (mediaRelevance < 50) recommendations.push('Review contact roles for media seller targeting relevance');
  if (completeness < 70) recommendations.push('Add missing contact information for better outreach');
  if (companyQuality < 60) recommendations.push('Enhance company data with industry and size information');

  return {
    overall: Math.round(overall),
    companies: Math.round(companyQuality),
    contacts: Math.round(contactQuality),
    mediaRelevance: Math.round(mediaRelevance),
    completeness: Math.round(completeness),
    recommendations
  };
}
