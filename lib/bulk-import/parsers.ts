// 🚀 DealMecca Bulk Import File Parsers
// Smart parsing for CSV, Excel, and JSON files with media seller role focus

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedData, BulkImportCompany, BulkImportContact, ImportError } from '@/lib/types/bulk-import';

export class FileParser {
  static async parseFile(file: File): Promise<ParsedData> {
    const extension = file.name.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'csv':
        return this.parseCSV(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      case 'json':
        return this.parseJSON(file);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  private static async parseCSV(file: File): Promise<ParsedData> {
    return new Promise(async (resolve, reject) => {
      try {
        // For server-side parsing, convert File to text first
        const text = await file.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            const parsed = this.processRawData(results.data);
            resolve(parsed);
          },
          error: (error) => {
            console.error('Papa parse error:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('CSV parsing error:', error);
        reject(error);
      }
    });
  }

  private static async parseExcel(file: File): Promise<ParsedData> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return this.processRawData(data);
  }

  private static async parseJSON(file: File): Promise<ParsedData> {
    const text = await file.text();
    const data = JSON.parse(text);
    const arrayData = Array.isArray(data) ? data : [data];
    
    return this.processRawData(arrayData);
  }

  private static processRawData(rawData: any[]): ParsedData {
    const companies: BulkImportCompany[] = [];
    const contacts: BulkImportContact[] = [];
    const errors: ImportError[] = [];
    const companyMap = new Map<string, BulkImportCompany>();

    rawData.forEach((row, index) => {
      try {
        // Smart field mapping - handle various column name variations
        const mappedRow = this.mapFields(row);
        
        // Extract company data
        if (mappedRow.companyName) {
          const companyKey = mappedRow.companyName.toLowerCase();
          
          if (!companyMap.has(companyKey)) {
            const company: BulkImportCompany = {
              name: mappedRow.companyName,
              domain: mappedRow.domain || this.inferDomain(mappedRow.companyName),
              industry: mappedRow.industry,
              employeeCount: mappedRow.employeeCount,
              revenue: mappedRow.revenue,
              headquarters: mappedRow.headquarters,
              description: mappedRow.description,
              website: mappedRow.website,
              type: this.inferCompanyType(mappedRow.companyName, mappedRow.industry)
            };
            companyMap.set(companyKey, company);
          }
        }

        // Extract contact data
        if (mappedRow.firstName || mappedRow.lastName) {
          const contact: BulkImportContact = {
            firstName: mappedRow.firstName || '',
            lastName: mappedRow.lastName || '',
            email: mappedRow.email,
            phone: mappedRow.phone,
            title: mappedRow.title || mappedRow.role || '',
            department: mappedRow.department,
            linkedinUrl: mappedRow.linkedinUrl || mappedRow.linkedin,
            companyName: mappedRow.companyName,
            verified: false,
            // Enhanced media-specific fields
            seniority: this.inferSeniority(mappedRow.title || mappedRow.role || ''),
            specializations: this.extractSpecializations(mappedRow.title || mappedRow.role || ''),
            budgetAuthority: this.inferBudgetAuthority(mappedRow.title || mappedRow.role || ''),
            decisionMaking: this.inferDecisionMaking(mappedRow.title || mappedRow.role || ''),
            territories: mappedRow.territories ? [mappedRow.territories] : undefined
          };
          contacts.push(contact);
        }

      } catch (error) {
        errors.push({
          row: index + 1,
          field: 'general',
          value: JSON.stringify(row),
          message: error instanceof Error ? error.message : 'Unknown parsing error'
        });
      }
    });

    companies.push(...Array.from(companyMap.values()));

    return {
      companies,
      contacts,
      errors,
      preview: rawData.slice(0, 5) // First 5 rows for preview
    };
  }

  private static mapFields(row: any): any {
    const fieldMap: { [key: string]: string[] } = {
      firstName: ['first_name', 'firstname', 'first', 'fname'],
      lastName: ['last_name', 'lastname', 'last', 'lname', 'surname'],
      email: ['email_address', 'email', 'e_mail'],
      phone: ['phone_number', 'phone', 'mobile', 'tel', 'telephone'],
      title: ['job_title', 'title', 'position', 'role'],
      companyName: ['company_name', 'company', 'organization', 'org'],
      domain: ['domain', 'company_domain', 'website_domain'],
      industry: ['industry', 'sector', 'vertical'],
      employeeCount: ['employee_count', 'employees', 'size', 'headcount'],
      revenue: ['revenue', 'annual_revenue', 'sales'],
      headquarters: ['headquarters', 'hq', 'location', 'city'],
      linkedinUrl: ['linkedin_url', 'linkedin', 'li_url'],
      department: ['department', 'dept', 'division'],
      territories: ['territories', 'regions', 'markets', 'geography']
    };

    const mapped: any = {};
    const lowerKeys = Object.keys(row).map(k => k.toLowerCase().replace(/[\s_-]/g, ''));

    for (const [targetField, variations] of Object.entries(fieldMap)) {
      for (const variation of variations) {
        const normalizedVariation = variation.toLowerCase().replace(/[\s_-]/g, '');
        const matchIndex = lowerKeys.findIndex(k => k === normalizedVariation);
        
        if (matchIndex !== -1) {
          const originalKey = Object.keys(row)[matchIndex];
          mapped[targetField] = row[originalKey];
          break;
        }
      }
    }

    return mapped;
  }

  private static inferDomain(companyName: string): string {
    // Simple domain inference - can be enhanced
    return companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '') + '.com';
  }

  private static inferCompanyType(companyName: string, industry?: string): 'BRAND' | 'AGENCY' | 'VENDOR' {
    const name = companyName.toLowerCase();
    const ind = industry?.toLowerCase() || '';

    // Agency keywords
    if (name.includes('agency') || name.includes('media') || name.includes('advertising') ||
        ind.includes('advertising') || ind.includes('marketing')) {
      return 'AGENCY';
    }

    // Tech/vendor keywords  
    if (name.includes('tech') || name.includes('software') || name.includes('platform') ||
        ind.includes('technology') || ind.includes('software')) {
      return 'VENDOR';
    }

    return 'BRAND'; // Default
  }

  // =============================================================================
  // MEDIA SELLER ROLE INTELLIGENCE
  // =============================================================================

  private static inferSeniority(title: string): 'C_LEVEL' | 'VP' | 'DIRECTOR' | 'MANAGER' | 'ASSOCIATE' | 'COORDINATOR' {
    const t = title.toLowerCase();
    
    if (t.includes('cmo') || t.includes('chief') || t.includes('ceo') || t.includes('president')) {
      return 'C_LEVEL';
    }
    if (t.includes('vp') || t.includes('vice president')) {
      return 'VP';
    }
    if (t.includes('director') || t.includes('head of')) {
      return 'DIRECTOR';
    }
    if (t.includes('manager') || t.includes('lead')) {
      return 'MANAGER';
    }
    if (t.includes('associate') || t.includes('specialist')) {
      return 'ASSOCIATE';
    }
    return 'COORDINATOR';
  }

  private static extractSpecializations(title: string): string[] {
    const specializations: string[] = [];
    const t = title.toLowerCase();
    
    const specMap = {
      'Programmatic': ['programmatic', 'dsp', 'rtb', 'demand side'],
      'Social Media': ['social', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'],
      'Search': ['search', 'sem', 'ppc', 'google ads', 'paid search'],
      'Display': ['display', 'banner', 'rich media'],
      'Video': ['video', 'youtube', 'connected tv', 'ctv', 'ott'],
      'Mobile': ['mobile', 'app', 'in-app'],
      'Brand': ['brand', 'branding', 'awareness'],
      'Performance': ['performance', 'conversion', 'direct response'],
      'E-commerce': ['ecommerce', 'retail', 'shopping'],
      'B2B': ['b2b', 'business', 'enterprise']
    };

    for (const [spec, keywords] of Object.entries(specMap)) {
      if (keywords.some(keyword => t.includes(keyword))) {
        specializations.push(spec);
      }
    }

    return specializations;
  }

  private static inferBudgetAuthority(title: string): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
    const t = title.toLowerCase();
    
    if (t.includes('cmo') || t.includes('chief') || t.includes('vp') || t.includes('director')) {
      return 'HIGH';
    }
    if (t.includes('manager') || t.includes('lead')) {
      return 'MEDIUM';
    }
    if (t.includes('associate') || t.includes('specialist')) {
      return 'LOW';
    }
    return 'NONE';
  }

  private static inferDecisionMaking(title: string): boolean {
    const t = title.toLowerCase();
    const decisionKeywords = ['director', 'manager', 'head', 'lead', 'chief', 'vp', 'president'];
    return decisionKeywords.some(keyword => t.includes(keyword));
  }
}

// =============================================================================
// MEDIA SELLER ROLE VALIDATION
// =============================================================================

// Target contact roles for media sellers
export const VALID_MEDIA_ROLES = [
  'CMO', 'Chief Marketing Officer',
  'Media Director', 'Director of Media',
  'Brand Manager', 'Brand Marketing Manager',
  'Programmatic Trader', 'Programmatic Manager',
  'Media Associate', 'Associate Media Manager',
  'Group Agency Director', 'Agency Director',
  'Marketing Manager', 'Digital Marketing Manager',
  'Performance Marketing Manager',
  'Growth Marketing Manager',
  'Paid Media Manager',
  'SEM Manager', 'PPC Manager',
  'Social Media Manager',
  'Advertising Manager'
];

export function isValidMediaRole(title: string): boolean {
  const normalizedTitle = title.toLowerCase();
  return VALID_MEDIA_ROLES.some(role => 
    normalizedTitle.includes(role.toLowerCase()) ||
    role.toLowerCase().includes(normalizedTitle)
  );
}

// Enhanced role scoring for prioritization
export function getMediaRoleScore(title: string): number {
  const t = title.toLowerCase();
  let score = 0;

  // Base role relevance
  if (isValidMediaRole(title)) score += 50;

  // Seniority bonus
  if (t.includes('cmo') || t.includes('chief')) score += 40;
  else if (t.includes('director') || t.includes('vp')) score += 30;
  else if (t.includes('manager')) score += 20;
  else if (t.includes('associate')) score += 10;

  // Media specialization bonus
  const mediaKeywords = ['media', 'advertising', 'marketing', 'programmatic', 'digital'];
  mediaKeywords.forEach(keyword => {
    if (t.includes(keyword)) score += 5;
  });

  return Math.min(score, 100); // Cap at 100
}

// Company type inference for media ecosystem
export function inferMediaEcosystemRole(companyName: string, industry?: string): {
  type: 'BRAND' | 'AGENCY' | 'VENDOR';
  confidence: number;
  reasoning: string;
} {
  const name = companyName.toLowerCase();
  const ind = industry?.toLowerCase() || '';
  
  // Agency detection
  const agencyKeywords = ['agency', 'media', 'advertising', 'marketing', 'creative', 'digital'];
  const agencyScore = agencyKeywords.reduce((score, keyword) => 
    score + (name.includes(keyword) ? 20 : 0) + (ind.includes(keyword) ? 10 : 0), 0);
  
  // Vendor detection
  const vendorKeywords = ['tech', 'software', 'platform', 'solution', 'data', 'analytics'];
  const vendorScore = vendorKeywords.reduce((score, keyword) => 
    score + (name.includes(keyword) ? 20 : 0) + (ind.includes(keyword) ? 10 : 0), 0);
  
  // Brand is default with lower confidence if no clear indicators
  const brandScore = Math.max(0, 50 - agencyScore - vendorScore);
  
  const scores = [
    { type: 'AGENCY' as const, score: agencyScore, reasoning: 'Agency keywords detected' },
    { type: 'VENDOR' as const, score: vendorScore, reasoning: 'Technology/vendor keywords detected' },
    { type: 'BRAND' as const, score: brandScore, reasoning: 'Default classification as brand' }
  ];
  
  const winner = scores.reduce((prev, current) => 
    prev.score > current.score ? prev : current);
  
  return {
    type: winner.type,
    confidence: Math.min(winner.score, 100),
    reasoning: winner.reasoning
  };
}
