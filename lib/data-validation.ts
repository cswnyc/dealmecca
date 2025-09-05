import { z } from 'zod';
import { logger } from './logger';

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  cleanedData?: any;
  qualityScore: number;
};

export type ValidationError = {
  field: string;
  message: string;
  code: string;
  value?: any;
};

export type ValidationWarning = {
  field: string;
  message: string;
  suggestion?: string;
  value?: any;
};

export type DataQualityMetrics = {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  overall: number;
};

/**
 * Company validation schema with data quality rules
 */
export const CompanyValidationSchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must not exceed 200 characters')
    .refine(val => !val.match(/^\d+$/), 'Company name cannot be only numbers')
    .transform(val => val.trim()),
  
  website: z.string()
    .url('Must be a valid URL')
    .optional()
    .transform(val => val ? normalizeWebsite(val) : undefined),
  
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  companyType: z.enum([
    'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY',
    'NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADTECH_VENDOR', 'MARTECH_VENDOR',
    'MEDIA_OWNER', 'BROADCASTER', 'PUBLISHER', 'CONSULTANCY', 'PRODUCTION_COMPANY',
    'ADVERTISER', 'AGENCY', 'MEDIA_COMPANY', 'TECH_VENDOR'
  ], 'Invalid company type'),
  
  industry: z.enum([
    'AUTOMOTIVE', 'CPG_FOOD_BEVERAGE', 'CPG_PERSONAL_CARE', 'CPG_HOUSEHOLD',
    'FINANCIAL_SERVICES', 'HEALTHCARE_PHARMA', 'RETAIL_ECOMMERCE', 'TECHNOLOGY',
    'ENTERTAINMENT_MEDIA', 'TRAVEL_HOSPITALITY', 'TELECOM', 'FASHION_BEAUTY',
    'SPORTS_FITNESS', 'EDUCATION', 'REAL_ESTATE', 'ENERGY', 'GOVERNMENT_NONPROFIT',
    'GAMING', 'CRYPTOCURRENCY', 'INSURANCE', 'B2B_SERVICES', 'STARTUPS', 'NONPROFIT',
    'PROFESSIONAL_SERVICES', 'LOGISTICS'
  ]).optional(),
  
  city: z.string()
    .max(100, 'City name must not exceed 100 characters')
    .optional()
    .transform(val => val ? titleCase(val.trim()) : undefined),
  
  state: z.string()
    .max(50, 'State must not exceed 50 characters')
    .optional()
    .transform(val => val ? val.trim().toUpperCase() : undefined),
  
  country: z.string()
    .max(50, 'Country must not exceed 50 characters')
    .default('US')
    .transform(val => val.toUpperCase()),
  
  zipCode: z.string()
    .max(20, 'Zip code must not exceed 20 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  employeeCount: z.enum([
    'STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000',
    'ENTERPRISE_1001_5000', 'MEGA_5000_PLUS'
  ]).optional(),
  
  revenueRange: z.enum([
    'UNDER_1M', 'RANGE_1M_5M', 'RANGE_5M_25M', 'RANGE_25M_100M',
    'RANGE_100M_500M', 'RANGE_500M_1B', 'OVER_1B', 'UNDISCLOSED'
  ]).optional(),
  
  foundedYear: z.number()
    .min(1800, 'Founded year seems too early')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional(),
  
  linkedinUrl: z.string()
    .url('Must be a valid LinkedIn URL')
    .refine(val => val.includes('linkedin.com'), 'Must be a LinkedIn URL')
    .optional(),
  
  twitterHandle: z.string()
    .max(15, 'Twitter handle must not exceed 15 characters')
    .optional()
    .transform(val => val ? val.replace(/^@/, '') : undefined),
});

/**
 * Contact validation schema with data quality rules
 */
export const ContactValidationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must not exceed 100 characters')
    .refine(val => !val.match(/^\d+$/), 'First name cannot be only numbers')
    .transform(val => titleCase(val.trim())),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must not exceed 100 characters')
    .refine(val => !val.match(/^\d+$/), 'Last name cannot be only numbers')
    .transform(val => titleCase(val.trim())),
  
  email: z.string()
    .email('Must be a valid email address')
    .transform(val => val.toLowerCase().trim())
    .optional(),
  
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must not exceed 200 characters')
    .transform(val => val.trim()),
  
  phone: z.string()
    .optional()
    .transform(val => val ? normalizePhone(val) : undefined),
  
  department: z.enum([
    'MEDIA_PLANNING', 'MEDIA_BUYING', 'DIGITAL_MARKETING', 'PROGRAMMATIC',
    'SOCIAL_MEDIA', 'SEARCH_MARKETING', 'STRATEGY_PLANNING', 'ANALYTICS_INSIGHTS',
    'CREATIVE_SERVICES', 'ACCOUNT_MANAGEMENT', 'BUSINESS_DEVELOPMENT', 'OPERATIONS',
    'TECHNOLOGY', 'FINANCE', 'LEADERSHIP', 'HUMAN_RESOURCES', 'SALES', 'MARKETING',
    'PRODUCT', 'DATA_SCIENCE'
  ]).optional(),
  
  seniority: z.enum([
    'INTERN', 'COORDINATOR', 'SPECIALIST', 'SENIOR_SPECIALIST', 'MANAGER',
    'SENIOR_MANAGER', 'DIRECTOR', 'SENIOR_DIRECTOR', 'VP', 'SVP', 'EVP',
    'C_LEVEL', 'FOUNDER_OWNER'
  ]),
  
  linkedinUrl: z.string()
    .url('Must be a valid LinkedIn URL')
    .refine(val => val.includes('linkedin.com'), 'Must be a LinkedIn URL')
    .optional(),
  
  companyId: z.string().cuid('Invalid company ID'),
});

/**
 * Data validation and quality management class
 */
export class DataValidator {
  private static instance: DataValidator;

  static getInstance(): DataValidator {
    if (!DataValidator.instance) {
      DataValidator.instance = new DataValidator();
    }
    return DataValidator.instance;
  }

  /**
   * Validate company data with quality scoring
   */
  validateCompany(data: any): ValidationResult {
    const startTime = Date.now();
    const result = this.validateData(data, CompanyValidationSchema);
    
    // Additional business logic validations
    const warnings = this.checkCompanyQuality(data);
    result.warnings.push(...warnings);
    
    // Calculate quality score
    result.qualityScore = this.calculateCompanyQualityScore(data, result);
    
    logger.info('data', 'Company validation completed', {
      isValid: result.isValid,
      qualityScore: result.qualityScore,
      duration: Date.now() - startTime,
    });

    return result;
  }

  /**
   * Validate contact data with quality scoring
   */
  validateContact(data: any): ValidationResult {
    const startTime = Date.now();
    const result = this.validateData(data, ContactValidationSchema);
    
    // Additional business logic validations
    const warnings = this.checkContactQuality(data);
    result.warnings.push(...warnings);
    
    // Calculate quality score
    result.qualityScore = this.calculateContactQualityScore(data, result);
    
    logger.info('data', 'Contact validation completed', {
      isValid: result.isValid,
      qualityScore: result.qualityScore,
      duration: Date.now() - startTime,
    });

    return result;
  }

  /**
   * Validate bulk import data
   */
  validateBulkImport(
    data: any[],
    type: 'company' | 'contact'
  ): {
    valid: any[];
    invalid: Array<{ data: any; result: ValidationResult; index: number }>;
    summary: {
      total: number;
      valid: number;
      invalid: number;
      avgQualityScore: number;
    };
  } {
    const startTime = Date.now();
    const valid: any[] = [];
    const invalid: Array<{ data: any; result: ValidationResult; index: number }> = [];
    let totalQualityScore = 0;

    data.forEach((item, index) => {
      const result = type === 'company' 
        ? this.validateCompany(item)
        : this.validateContact(item);

      if (result.isValid) {
        valid.push(result.cleanedData || item);
        totalQualityScore += result.qualityScore;
      } else {
        invalid.push({ data: item, result, index });
      }
    });

    const avgQualityScore = valid.length > 0 ? totalQualityScore / valid.length : 0;

    logger.info('data', 'Bulk import validation completed', {
      type,
      total: data.length,
      valid: valid.length,
      invalid: invalid.length,
      avgQualityScore,
      duration: Date.now() - startTime,
    });

    return {
      valid,
      invalid,
      summary: {
        total: data.length,
        valid: valid.length,
        invalid: invalid.length,
        avgQualityScore,
      },
    };
  }

  /**
   * Core validation logic using Zod schemas
   */
  private validateData(data: any, schema: z.ZodSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      qualityScore: 0,
    };

    try {
      const validated = schema.parse(data);
      result.isValid = true;
      result.cleanedData = validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          value: err.path.reduce((obj, key) => obj?.[key], data),
        }));
      } else {
        result.errors = [{
          field: 'unknown',
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
        }];
      }
    }

    return result;
  }

  /**
   * Check company-specific data quality issues
   */
  private checkCompanyQuality(data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for suspicious patterns
    if (data.name && data.name.toLowerCase().includes('test')) {
      warnings.push({
        field: 'name',
        message: 'Company name contains "test" - may be test data',
        suggestion: 'Verify this is a real company',
        value: data.name,
      });
    }

    // Check website consistency
    if (data.website && data.name) {
      const domain = this.extractDomain(data.website);
      const companyWords = data.name.toLowerCase().split(/\s+/);
      const domainWords = domain.replace(/[-_.]/g, ' ').split(/\s+/);
      
      const hasMatch = companyWords.some(word => 
        word.length > 2 && domainWords.some(dWord => dWord.includes(word))
      );

      if (!hasMatch) {
        warnings.push({
          field: 'website',
          message: 'Website domain does not match company name',
          suggestion: 'Verify website URL is correct',
          value: data.website,
        });
      }
    }

    // Check for missing critical fields
    if (!data.companyType) {
      warnings.push({
        field: 'companyType',
        message: 'Company type not specified',
        suggestion: 'Add company type for better categorization',
      });
    }

    if (!data.industry) {
      warnings.push({
        field: 'industry',
        message: 'Industry not specified',
        suggestion: 'Add industry for better searchability',
      });
    }

    return warnings;
  }

  /**
   * Check contact-specific data quality issues
   */
  private checkContactQuality(data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for generic/placeholder names
    const genericNames = ['john', 'jane', 'test', 'user', 'admin', 'contact'];
    if (data.firstName && genericNames.includes(data.firstName.toLowerCase())) {
      warnings.push({
        field: 'firstName',
        message: 'First name appears to be generic/placeholder',
        suggestion: 'Verify this is a real person',
        value: data.firstName,
      });
    }

    // Check email domain consistency
    if (data.email && data.companyWebsite) {
      const emailDomain = data.email.split('@')[1];
      const companyDomain = this.extractDomain(data.companyWebsite);
      
      if (emailDomain !== companyDomain && !this.isCommonEmailProvider(emailDomain)) {
        warnings.push({
          field: 'email',
          message: 'Email domain does not match company website',
          suggestion: 'Verify email address or company association',
          value: data.email,
        });
      }
    }

    // Check title and seniority consistency
    if (data.title && data.seniority) {
      const titleKeywords = data.title.toLowerCase();
      const isExecutive = titleKeywords.includes('ceo') || titleKeywords.includes('president') || titleKeywords.includes('founder');
      
      if (isExecutive && !['C_LEVEL', 'FOUNDER_OWNER'].includes(data.seniority)) {
        warnings.push({
          field: 'seniority',
          message: 'Title suggests higher seniority level',
          suggestion: 'Review seniority level based on title',
          value: data.seniority,
        });
      }
    }

    return warnings;
  }

  /**
   * Calculate company data quality score (0-100)
   */
  private calculateCompanyQualityScore(data: any, result: ValidationResult): number {
    let score = 100;

    // Deduct for validation errors
    score -= result.errors.length * 20;

    // Deduct for warnings
    score -= result.warnings.length * 10;

    // Deduct for missing optional but important fields
    const importantFields = ['website', 'description', 'industry', 'city', 'state'];
    const missingFields = importantFields.filter(field => !data[field]);
    score -= missingFields.length * 5;

    // Bonus for additional quality indicators
    if (data.website && data.website.startsWith('https://')) score += 5;
    if (data.description && data.description.length > 100) score += 5;
    if (data.linkedinUrl) score += 5;
    if (data.foundedYear) score += 3;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate contact data quality score (0-100)
   */
  private calculateContactQualityScore(data: any, result: ValidationResult): number {
    let score = 100;

    // Deduct for validation errors
    score -= result.errors.length * 25;

    // Deduct for warnings
    score -= result.warnings.length * 10;

    // Deduct for missing optional but important fields
    const importantFields = ['email', 'phone', 'department'];
    const missingFields = importantFields.filter(field => !data[field]);
    score -= missingFields.length * 8;

    // Bonus for additional quality indicators
    if (data.email) score += 10;
    if (data.phone) score += 5;
    if (data.linkedinUrl) score += 10;
    if (data.department) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    }
  }

  /**
   * Check if email domain is a common provider
   */
  private isCommonEmailProvider(domain: string): boolean {
    const commonProviders = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
      'icloud.com', 'protonmail.com', 'mail.com'
    ];
    return commonProviders.includes(domain.toLowerCase());
  }
}

// Utility functions
function normalizeWebsite(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url.toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Export singleton instance
export const dataValidator = DataValidator.getInstance();

// Export utility functions
export const validateCompany = (data: any) => dataValidator.validateCompany(data);
export const validateContact = (data: any) => dataValidator.validateContact(data);
export const validateBulkImport = (data: any[], type: 'company' | 'contact') => 
  dataValidator.validateBulkImport(data, type);