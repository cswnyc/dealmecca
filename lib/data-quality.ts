import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { dataValidator } from './data-validation';

const prisma = new PrismaClient();

export interface DataQualityReport {
  overview: {
    totalRecords: number;
    qualityScore: number;
    lastUpdated: Date;
    trends: {
      scoreChange: number;
      period: string;
    };
  };
  companies: DataQualityMetrics;
  contacts: DataQualityMetrics;
  issues: DataQualityIssue[];
  recommendations: string[];
}

export interface DataQualityMetrics {
  totalRecords: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  uniqueness: number;
  overall: number;
  distribution: {
    excellent: number; // 90-100
    good: number;      // 70-89
    fair: number;      // 50-69
    poor: number;      // 0-49
  };
}

export interface DataQualityIssue {
  id: string;
  type: 'duplicate' | 'incomplete' | 'inconsistent' | 'invalid';
  severity: 'high' | 'medium' | 'low';
  table: 'companies' | 'contacts';
  description: string;
  affectedRecords: number;
  suggestedAction: string;
  autoFixable: boolean;
}

export interface DuplicateMatch {
  id1: string;
  id2: string;
  confidence: number;
  matchReasons: string[];
  suggestedMasterRecord: string;
  fieldsToMerge: string[];
}

/**
 * Comprehensive data quality management system
 */
export class DataQualityManager {
  private static instance: DataQualityManager;

  static getInstance(): DataQualityManager {
    if (!DataQualityManager.instance) {
      DataQualityManager.instance = new DataQualityManager();
    }
    return DataQualityManager.instance;
  }

  /**
   * Generate comprehensive data quality report
   */
  async generateQualityReport(): Promise<DataQualityReport> {
    const startTime = Date.now();
    logger.info('data', 'Starting data quality analysis');

    try {
      const [companyMetrics, contactMetrics, issues] = await Promise.all([
        this.analyzeCompanyQuality(),
        this.analyzeContactQuality(),
        this.identifyDataQualityIssues(),
      ]);

      const totalRecords = companyMetrics.totalRecords + contactMetrics.totalRecords;
      const overallScore = totalRecords > 0 
        ? ((companyMetrics.overall * companyMetrics.totalRecords) + 
           (contactMetrics.overall * contactMetrics.totalRecords)) / totalRecords
        : 0;

      const report: DataQualityReport = {
        overview: {
          totalRecords,
          qualityScore: Math.round(overallScore * 100) / 100,
          lastUpdated: new Date(),
          trends: {
            scoreChange: 0, // Would calculate from historical data
            period: '30 days',
          },
        },
        companies: companyMetrics,
        contacts: contactMetrics,
        issues,
        recommendations: this.generateRecommendations(companyMetrics, contactMetrics, issues),
      };

      logger.info('data', 'Data quality analysis completed', {
        duration: Date.now() - startTime,
        overallScore: report.overview.qualityScore,
        totalIssues: issues.length,
      });

      return report;
    } catch (error) {
      logger.error('data', 'Data quality analysis failed', error);
      throw error;
    }
  }

  /**
   * Analyze company data quality
   */
  private async analyzeCompanyQuality(): Promise<DataQualityMetrics> {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        website: true,
        description: true,
        companyType: true,
        industry: true,
        city: true,
        state: true,
        verified: true,
        normalizedName: true,
        normalizedWebsite: true,
      },
    });

    const totalRecords = companies.length;
    if (totalRecords === 0) {
      return this.getEmptyMetrics();
    }

    // Calculate completeness
    const completenessFields = ['name', 'website', 'description', 'companyType', 'industry', 'city', 'state'];
    const completenessScores = companies.map(company => {
      const filledFields = completenessFields.filter(field => {
        const value = company[field as keyof typeof company];
        return value !== null && value !== undefined && value !== '';
      });
      return (filledFields.length / completenessFields.length) * 100;
    });
    const completeness = completenessScores.reduce((sum, score) => sum + score, 0) / totalRecords;

    // Calculate accuracy (based on verification status and data patterns)
    const accuracyScores = companies.map(company => {
      let score = 60; // Base score
      
      if (company.verified) score += 30;
      if (company.website && this.isValidWebsiteFormat(company.website)) score += 10;
      if (company.normalizedName) score += 5;
      if (company.normalizedWebsite) score += 5;
      
      return Math.min(100, score);
    });
    const accuracy = accuracyScores.reduce((sum, score) => sum + score, 0) / totalRecords;

    // Calculate consistency (normalized fields, standard formats)
    const consistencyScores = companies.map(company => {
      let score = 70; // Base score
      
      if (company.normalizedName && company.normalizedName !== company.name) score += 15;
      if (company.normalizedWebsite && company.normalizedWebsite !== company.website) score += 15;
      
      return Math.min(100, score);
    });
    const consistency = consistencyScores.reduce((sum, score) => sum + score, 0) / totalRecords;

    // Calculate uniqueness (duplicate detection)
    const duplicateCount = await this.countCompanyDuplicates();
    const uniqueness = Math.max(0, ((totalRecords - duplicateCount) / totalRecords) * 100);

    // Calculate overall score
    const overall = (completeness * 0.3 + accuracy * 0.3 + consistency * 0.2 + uniqueness * 0.2);

    // Calculate distribution
    const allScores = companies.map((_, index) => {
      return (
        completenessScores[index] * 0.3 +
        accuracyScores[index] * 0.3 +
        consistencyScores[index] * 0.2 +
        uniqueness * 0.2
      );
    });

    const distribution = this.calculateDistribution(allScores);

    return {
      totalRecords,
      completeness: Math.round(completeness * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      uniqueness: Math.round(uniqueness * 100) / 100,
      overall: Math.round(overall * 100) / 100,
      distribution,
    };
  }

  /**
   * Analyze contact data quality
   */
  private async analyzeContactQuality(): Promise<DataQualityMetrics> {
    const contacts = await prisma.contact.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        title: true,
        email: true,
        phone: true,
        department: true,
        seniority: true,
        verified: true,
        isDecisionMaker: true,
        company: {
          select: { name: true, website: true }
        }
      },
    });

    const totalRecords = contacts.length;
    if (totalRecords === 0) {
      return this.getEmptyMetrics();
    }

    // Calculate completeness
    const completenessFields = ['firstName', 'lastName', 'title', 'email', 'phone', 'department'];
    const completenessScores = contacts.map(contact => {
      const filledFields = completenessFields.filter(field => {
        const value = contact[field as keyof typeof contact];
        return value !== null && value !== undefined && value !== '';
      });
      return (filledFields.length / completenessFields.length) * 100;
    });
    const completeness = completenessScores.reduce((sum, score) => sum + score, 0) / totalRecords;

    // Calculate accuracy
    const accuracyScores = contacts.map(contact => {
      let score = 50; // Base score
      
      if (contact.verified) score += 30;
      if (contact.email && this.isValidEmailFormat(contact.email)) score += 20;
      if (contact.fullName && this.isConsistentFullName(contact.firstName, contact.lastName, contact.fullName)) score += 10;
      if (contact.seniority && contact.title && this.isSeniorityTitleConsistent(contact.seniority, contact.title)) score += 10;
      
      return Math.min(100, score);
    });
    const accuracy = accuracyScores.reduce((sum, score) => sum + score, 0) / totalRecords;

    // Calculate consistency
    const consistencyScores = contacts.map(contact => {
      let score = 70; // Base score
      
      if (contact.fullName) score += 15;
      if (contact.department && contact.seniority) score += 15;
      
      return Math.min(100, score);
    });
    const consistency = consistencyScores.reduce((sum, score) => sum + score, 0) / totalRecords;

    // Calculate uniqueness
    const duplicateCount = await this.countContactDuplicates();
    const uniqueness = Math.max(0, ((totalRecords - duplicateCount) / totalRecords) * 100);

    // Calculate overall score
    const overall = (completeness * 0.3 + accuracy * 0.3 + consistency * 0.2 + uniqueness * 0.2);

    // Calculate distribution
    const allScores = contacts.map((_, index) => {
      return (
        completenessScores[index] * 0.3 +
        accuracyScores[index] * 0.3 +
        consistencyScores[index] * 0.2 +
        uniqueness * 0.2
      );
    });

    const distribution = this.calculateDistribution(allScores);

    return {
      totalRecords,
      completeness: Math.round(completeness * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      uniqueness: Math.round(uniqueness * 100) / 100,
      overall: Math.round(overall * 100) / 100,
      distribution,
    };
  }

  /**
   * Identify data quality issues
   */
  private async identifyDataQualityIssues(): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];

    // Find companies without required fields
    const incompleteCompanies = await prisma.company.count({
      where: {
        OR: [
          { companyType: null },
          { name: { equals: '' } },
        ]
      }
    });

    if (incompleteCompanies > 0) {
      issues.push({
        id: 'incomplete_companies',
        type: 'incomplete',
        severity: 'high',
        table: 'companies',
        description: 'Companies missing required fields',
        affectedRecords: incompleteCompanies,
        suggestedAction: 'Review and update company records with missing data',
        autoFixable: false,
      });
    }

    // Find contacts without email or phone
    const incompleteContacts = await prisma.contact.count({
      where: {
        isActive: true,
        AND: [
          { email: null },
          { phone: null },
        ]
      }
    });

    if (incompleteContacts > 0) {
      issues.push({
        id: 'contacts_no_contact_info',
        type: 'incomplete',
        severity: 'high',
        table: 'contacts',
        description: 'Contacts without email or phone',
        affectedRecords: incompleteContacts,
        suggestedAction: 'Add contact information for these records',
        autoFixable: false,
      });
    }

    // Find potential duplicate companies
    const companyDuplicates = await this.findCompanyDuplicates();
    if (companyDuplicates.length > 0) {
      issues.push({
        id: 'duplicate_companies',
        type: 'duplicate',
        severity: 'medium',
        table: 'companies',
        description: 'Potential duplicate company records found',
        affectedRecords: companyDuplicates.length * 2,
        suggestedAction: 'Review and merge duplicate company records',
        autoFixable: true,
      });
    }

    // Find potential duplicate contacts
    const contactDuplicates = await this.findContactDuplicates();
    if (contactDuplicates.length > 0) {
      issues.push({
        id: 'duplicate_contacts',
        type: 'duplicate',
        severity: 'medium',
        table: 'contacts',
        description: 'Potential duplicate contact records found',
        affectedRecords: contactDuplicates.length * 2,
        suggestedAction: 'Review and merge duplicate contact records',
        autoFixable: true,
      });
    }

    // Find inconsistent data
    const inconsistentTitles = await prisma.contact.count({
      where: {
        isActive: true,
        title: { contains: 'CEO' },
        seniority: { not: 'C_LEVEL' }
      }
    });

    if (inconsistentTitles > 0) {
      issues.push({
        id: 'inconsistent_seniority',
        type: 'inconsistent',
        severity: 'low',
        table: 'contacts',
        description: 'Contacts with executive titles but non-executive seniority',
        affectedRecords: inconsistentTitles,
        suggestedAction: 'Update seniority levels to match titles',
        autoFixable: true,
      });
    }

    return issues;
  }

  /**
   * Find company duplicate candidates
   */
  async findCompanyDuplicates(limit: number = 50): Promise<DuplicateMatch[]> {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        website: true,
        normalizedName: true,
        normalizedWebsite: true,
      },
      take: 1000, // Limit for performance
    });

    const duplicates: DuplicateMatch[] = [];

    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        const company1 = companies[i];
        const company2 = companies[j];
        
        const match = this.calculateCompanyMatch(company1, company2);
        if (match.confidence > 0.7) {
          duplicates.push(match);
          if (duplicates.length >= limit) break;
        }
      }
      if (duplicates.length >= limit) break;
    }

    return duplicates.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find contact duplicate candidates
   */
  async findContactDuplicates(limit: number = 50): Promise<DuplicateMatch[]> {
    const contacts = await prisma.contact.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        email: true,
        phone: true,
        companyId: true,
      },
      take: 1000,
    });

    const duplicates: DuplicateMatch[] = [];

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const contact1 = contacts[i];
        const contact2 = contacts[j];
        
        const match = this.calculateContactMatch(contact1, contact2);
        if (match.confidence > 0.7) {
          duplicates.push(match);
          if (duplicates.length >= limit) break;
        }
      }
      if (duplicates.length >= limit) break;
    }

    return duplicates.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate match confidence for companies
   */
  private calculateCompanyMatch(company1: any, company2: any): DuplicateMatch {
    let confidence = 0;
    const matchReasons: string[] = [];
    const fieldsToMerge: string[] = [];

    // Exact name match
    if (company1.name === company2.name) {
      confidence += 0.8;
      matchReasons.push('Exact name match');
    } else if (company1.normalizedName === company2.normalizedName) {
      confidence += 0.7;
      matchReasons.push('Normalized name match');
    } else if (this.calculateStringSimilarity(company1.name, company2.name) > 0.8) {
      confidence += 0.5;
      matchReasons.push('Similar name');
    }

    // Website match
    if (company1.website && company2.website) {
      if (company1.normalizedWebsite === company2.normalizedWebsite) {
        confidence += 0.6;
        matchReasons.push('Website match');
      }
    }

    // Determine master record (more complete data)
    const company1Score = this.calculateCompanyCompleteness(company1);
    const company2Score = this.calculateCompanyCompleteness(company2);
    const suggestedMasterRecord = company1Score >= company2Score ? company1.id : company2.id;

    // Determine fields to merge
    if (!company1.website && company2.website) fieldsToMerge.push('website');
    if (!company2.website && company1.website) fieldsToMerge.push('website');

    return {
      id1: company1.id,
      id2: company2.id,
      confidence: Math.min(1, confidence),
      matchReasons,
      suggestedMasterRecord,
      fieldsToMerge,
    };
  }

  /**
   * Calculate match confidence for contacts
   */
  private calculateContactMatch(contact1: any, contact2: any): DuplicateMatch {
    let confidence = 0;
    const matchReasons: string[] = [];
    const fieldsToMerge: string[] = [];

    // Same company
    if (contact1.companyId === contact2.companyId) {
      confidence += 0.3;
      matchReasons.push('Same company');
    }

    // Name match
    if (contact1.firstName === contact2.firstName && contact1.lastName === contact2.lastName) {
      confidence += 0.6;
      matchReasons.push('Exact name match');
    } else if (this.calculateStringSimilarity(
      `${contact1.firstName} ${contact1.lastName}`,
      `${contact2.firstName} ${contact2.lastName}`
    ) > 0.8) {
      confidence += 0.4;
      matchReasons.push('Similar name');
    }

    // Email match
    if (contact1.email && contact2.email && contact1.email === contact2.email) {
      confidence += 0.7;
      matchReasons.push('Email match');
    }

    // Phone match
    if (contact1.phone && contact2.phone && contact1.phone === contact2.phone) {
      confidence += 0.5;
      matchReasons.push('Phone match');
    }

    // Determine master record
    const contact1Score = this.calculateContactCompleteness(contact1);
    const contact2Score = this.calculateContactCompleteness(contact2);
    const suggestedMasterRecord = contact1Score >= contact2Score ? contact1.id : contact2.id;

    // Determine fields to merge
    if (!contact1.email && contact2.email) fieldsToMerge.push('email');
    if (!contact2.email && contact1.email) fieldsToMerge.push('email');
    if (!contact1.phone && contact2.phone) fieldsToMerge.push('phone');
    if (!contact2.phone && contact1.phone) fieldsToMerge.push('phone');

    return {
      id1: contact1.id,
      id2: contact2.id,
      confidence: Math.min(1, confidence),
      matchReasons,
      suggestedMasterRecord,
      fieldsToMerge,
    };
  }

  // Helper methods
  private async countCompanyDuplicates(): Promise<number> {
    const duplicates = await this.findCompanyDuplicates(100);
    return duplicates.filter(d => d.confidence > 0.8).length;
  }

  private async countContactDuplicates(): Promise<number> {
    const duplicates = await this.findContactDuplicates(100);
    return duplicates.filter(d => d.confidence > 0.8).length;
  }

  private getEmptyMetrics(): DataQualityMetrics {
    return {
      totalRecords: 0,
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      uniqueness: 0,
      overall: 0,
      distribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
    };
  }

  private calculateDistribution(scores: number[]): DataQualityMetrics['distribution'] {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    
    scores.forEach(score => {
      if (score >= 90) distribution.excellent++;
      else if (score >= 70) distribution.good++;
      else if (score >= 50) distribution.fair++;
      else distribution.poor++;
    });

    return distribution;
  }

  private isValidWebsiteFormat(website: string): boolean {
    try {
      new URL(website);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isConsistentFullName(firstName: string, lastName: string, fullName: string): boolean {
    const expected = `${firstName} ${lastName}`.toLowerCase();
    return fullName.toLowerCase().includes(expected);
  }

  private isSeniorityTitleConsistent(seniority: string, title: string): boolean {
    const titleLower = title.toLowerCase();
    
    if (seniority === 'C_LEVEL') {
      return titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('cmo') || titleLower.includes('cfo');
    }
    
    if (seniority === 'VP' || seniority === 'SVP') {
      return titleLower.includes('vice president') || titleLower.includes('vp');
    }
    
    if (seniority === 'DIRECTOR' || seniority === 'SENIOR_DIRECTOR') {
      return titleLower.includes('director');
    }
    
    return true; // Default to consistent for other cases
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateCompanyCompleteness(company: any): number {
    const fields = ['name', 'website', 'normalizedName', 'normalizedWebsite'];
    const filledFields = fields.filter(field => company[field]);
    return (filledFields.length / fields.length) * 100;
  }

  private calculateContactCompleteness(contact: any): number {
    const fields = ['firstName', 'lastName', 'fullName', 'email', 'phone'];
    const filledFields = fields.filter(field => contact[field]);
    return (filledFields.length / fields.length) * 100;
  }

  private generateRecommendations(
    companies: DataQualityMetrics,
    contacts: DataQualityMetrics,
    issues: DataQualityIssue[]
  ): string[] {
    const recommendations: string[] = [];

    // Overall quality recommendations
    if (companies.overall < 70) {
      recommendations.push('Focus on improving company data quality - consider data cleanup initiative');
    }
    
    if (contacts.overall < 70) {
      recommendations.push('Focus on improving contact data quality - verify and complete contact information');
    }

    // Specific issue recommendations
    const duplicateIssues = issues.filter(i => i.type === 'duplicate');
    if (duplicateIssues.length > 0) {
      recommendations.push(`Address ${duplicateIssues.length} duplicate data issues to improve data uniqueness`);
    }

    const incompleteIssues = issues.filter(i => i.type === 'incomplete');
    if (incompleteIssues.length > 0) {
      recommendations.push(`Complete missing data for ${incompleteIssues.reduce((sum, i) => sum + i.affectedRecords, 0)} records`);
    }

    // Completeness recommendations
    if (companies.completeness < 80) {
      recommendations.push('Improve company data completeness by adding missing company types, industries, and locations');
    }
    
    if (contacts.completeness < 80) {
      recommendations.push('Improve contact data completeness by adding missing emails, phones, and departments');
    }

    // Accuracy recommendations
    if (companies.accuracy < 80) {
      recommendations.push('Implement data verification processes for company records');
    }
    
    if (contacts.accuracy < 80) {
      recommendations.push('Implement email verification and contact validation processes');
    }

    return recommendations;
  }
}

// Export singleton instance
export const dataQualityManager = DataQualityManager.getInstance();