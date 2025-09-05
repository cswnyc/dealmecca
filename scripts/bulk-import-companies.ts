#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas based on Prisma models
const CompanyImportSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  companyType: z.enum([
    'INDEPENDENT_AGENCY',
    'HOLDING_COMPANY_AGENCY', 
    'MEDIA_HOLDING_COMPANY',
    'NATIONAL_ADVERTISER',
    'LOCAL_ADVERTISER',
    'ADTECH_VENDOR',
    'MARTECH_VENDOR',
    'MEDIA_OWNER',
    'BROADCASTER',
    'PUBLISHER',
    'CONSULTANCY',
    'PRODUCTION_COMPANY',
    'ADVERTISER',
    'AGENCY',
    'MEDIA_COMPANY'
  ]),
  industry: z.enum([
    'AUTOMOTIVE',
    'CPG_FOOD_BEVERAGE',
    'CPG_PERSONAL_CARE',
    'CPG_HOUSEHOLD',
    'FINANCIAL_SERVICES',
    'HEALTHCARE_PHARMA',
    'RETAIL_ECOMMERCE',
    'TECHNOLOGY',
    'ENTERTAINMENT_MEDIA',
    'TRAVEL_HOSPITALITY',
    'TELECOM',
    'FASHION_BEAUTY',
    'SPORTS_FITNESS',
    'EDUCATION',
    'REAL_ESTATE'
  ]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('US'),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  employeeCount: z.enum([
    'STARTUP_1_10',
    'SMALL_11_50',
    'MEDIUM_51_200',
    'LARGE_201_1000',
    'ENTERPRISE_1001_5000',
    'MEGA_5000_PLUS'
  ]).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterHandle: z.string().optional(),
  verified: z.boolean().default(false),
  dataQuality: z.enum(['BASIC', 'VERIFIED', 'PREMIUM', 'EXPERT_VERIFIED']).default('BASIC')
});

const ContactImportSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().min(1, 'Title is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  department: z.enum([
    'MEDIA_PLANNING',
    'MEDIA_BUYING',
    'DIGITAL_MARKETING',
    'PROGRAMMATIC',
    'SOCIAL_MEDIA',
    'SEARCH_MARKETING',
    'STRATEGY_PLANNING',
    'ANALYTICS_INSIGHTS',
    'CREATIVE_SERVICES',
    'ACCOUNT_MANAGEMENT',
    'BUSINESS_DEVELOPMENT',
    'OPERATIONS',
    'TECHNOLOGY',
    'FINANCE',
    'LEADERSHIP',
    'HUMAN_RESOURCES',
    'SALES',
    'MARKETING',
    'PRODUCT',
    'DATA_SCIENCE'
  ]).optional(),
  seniority: z.enum([
    'INTERN',
    'COORDINATOR',
    'SPECIALIST',
    'SENIOR_SPECIALIST',
    'MANAGER',
    'SENIOR_MANAGER',
    'DIRECTOR',
    'SENIOR_DIRECTOR',
    'VP',
    'SVP',
    'EVP',
    'C_LEVEL',
    'FOUNDER_OWNER'
  ]).default('SPECIALIST'),
  companyName: z.string().min(1, 'Company name is required'),
  isDecisionMaker: z.boolean().default(false),
  verified: z.boolean().default(false),
  dataQuality: z.enum(['BASIC', 'VERIFIED', 'PREMIUM', 'EXPERT_VERIFIED']).default('BASIC')
});

// Type definitions
type CompanyImport = z.infer<typeof CompanyImportSchema>;
type ContactImport = z.infer<typeof ContactImportSchema>;

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}

interface ImportProgress {
  total: number;
  processed: number;
  imported: number;
  skipped: number;
  errors: number;
  currentBatch: number;
  totalBatches: number;
}

class BulkImportManager {
  private readonly BATCH_SIZE = 50; // Process in batches to avoid memory issues
  private logFile: string;
  
  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', `import-${Date.now()}.log`);
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
    
    console.log(logMessage.trim());
    fs.appendFileSync(this.logFile, logMessage);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private normalizeWebsite(website: string | undefined): string | undefined {
    if (!website) return undefined;
    
    let normalized = website.toLowerCase().trim();
    if (!normalized.startsWith('http')) {
      normalized = 'https://' + normalized;
    }
    
    // Remove trailing slashes and common suffixes
    normalized = normalized.replace(/\/$/, '');
    normalized = normalized.replace(/\/+$/, '');
    
    return normalized;
  }

  private async checkDuplicateCompany(company: CompanyImport): Promise<boolean> {
    const normalizedWebsite = this.normalizeWebsite(company.website);
    
    // Check for duplicates by name or website
    const existing = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: company.name, mode: 'insensitive' } },
          { normalizedName: company.name.toLowerCase() },
          ...(normalizedWebsite ? [{ 
            OR: [
              { website: normalizedWebsite },
              { normalizedWebsite: normalizedWebsite }
            ]
          }] : [])
        ]
      }
    });

    return !!existing;
  }

  private async checkDuplicateContact(contact: ContactImport, companyId: string): Promise<boolean> {
    if (!contact.email) return false;
    
    const existing = await prisma.contact.findFirst({
      where: {
        email: contact.email,
        companyId: companyId
      }
    });

    return !!existing;
  }

  async importCompaniesFromCSV(filePath: string): Promise<ImportResult> {
    this.log(`Starting company import from: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      this.log(`CSV parsing errors: ${JSON.stringify(parseResult.errors)}`, 'error');
    }

    const data = parseResult.data as Record<string, any>[];
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: []
    };

    this.log(`Found ${data.length} companies to process`);

    // Process in batches
    const totalBatches = Math.ceil(data.length / this.BATCH_SIZE);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * this.BATCH_SIZE;
      const endIndex = Math.min(startIndex + this.BATCH_SIZE, data.length);
      const batch = data.slice(startIndex, endIndex);

      this.log(`Processing batch ${batchIndex + 1}/${totalBatches} (rows ${startIndex + 1}-${endIndex})`);

      for (let i = 0; i < batch.length; i++) {
        const rowIndex = startIndex + i + 1;
        const row = batch[i];

        try {
          // Validate data
          const validatedCompany = CompanyImportSchema.parse({
            ...row,
            foundedYear: row.foundedYear ? parseInt(row.foundedYear) : undefined,
            verified: row.verified === 'true' || row.verified === '1',
          });

          // Check for duplicates
          if (await this.checkDuplicateCompany(validatedCompany)) {
            this.log(`Row ${rowIndex}: Skipping duplicate company: ${validatedCompany.name}`, 'warn');
            result.skipped++;
            continue;
          }

          // Create company
          await prisma.company.create({
            data: {
              name: validatedCompany.name,
              slug: this.generateSlug(validatedCompany.name),
              website: this.normalizeWebsite(validatedCompany.website),
              normalizedWebsite: this.normalizeWebsite(validatedCompany.website),
              normalizedName: validatedCompany.name.toLowerCase(),
              logoUrl: validatedCompany.logoUrl || undefined,
              description: validatedCompany.description || undefined,
              companyType: validatedCompany.companyType,
              industry: validatedCompany.industry,
              city: validatedCompany.city || undefined,
              state: validatedCompany.state || undefined,
              country: validatedCompany.country,
              address: validatedCompany.address || undefined,
              zipCode: validatedCompany.zipCode || undefined,
              employeeCount: validatedCompany.employeeCount,
              foundedYear: validatedCompany.foundedYear || undefined,
              linkedinUrl: validatedCompany.linkedinUrl || undefined,
              twitterHandle: validatedCompany.twitterHandle || undefined,
              verified: validatedCompany.verified,
              dataQuality: validatedCompany.dataQuality,
            }
          });

          result.imported++;
          this.log(`Row ${rowIndex}: Successfully imported company: ${validatedCompany.name}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.log(`Row ${rowIndex}: Error importing company: ${errorMessage}`, 'error');
          
          result.errors.push({
            row: rowIndex,
            data: row,
            error: errorMessage
          });
        }
      }

      // Small delay between batches to avoid overwhelming the database
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    result.success = result.errors.length === 0;
    this.log(`Import completed. Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);
    
    return result;
  }

  async importContactsFromCSV(filePath: string): Promise<ImportResult> {
    this.log(`Starting contact import from: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      this.log(`CSV parsing errors: ${JSON.stringify(parseResult.errors)}`, 'error');
    }

    const data = parseResult.data as Record<string, any>[];
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: []
    };

    this.log(`Found ${data.length} contacts to process`);

    // Process in batches
    const totalBatches = Math.ceil(data.length / this.BATCH_SIZE);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * this.BATCH_SIZE;
      const endIndex = Math.min(startIndex + this.BATCH_SIZE, data.length);
      const batch = data.slice(startIndex, endIndex);

      this.log(`Processing batch ${batchIndex + 1}/${totalBatches} (rows ${startIndex + 1}-${endIndex})`);

      for (let i = 0; i < batch.length; i++) {
        const rowIndex = startIndex + i + 1;
        const row = batch[i];

        try {
          // Validate data
          const validatedContact = ContactImportSchema.parse({
            ...row,
            isDecisionMaker: row.isDecisionMaker === 'true' || row.isDecisionMaker === '1',
            verified: row.verified === 'true' || row.verified === '1',
          });

          // Find company
          const company = await prisma.company.findFirst({
            where: {
              OR: [
                { name: { equals: validatedContact.companyName, mode: 'insensitive' } },
                { normalizedName: validatedContact.companyName.toLowerCase() }
              ]
            }
          });

          if (!company) {
            result.errors.push({
              row: rowIndex,
              data: row,
              error: `Company not found: ${validatedContact.companyName}`
            });
            continue;
          }

          // Check for duplicates
          if (await this.checkDuplicateContact(validatedContact, company.id)) {
            this.log(`Row ${rowIndex}: Skipping duplicate contact: ${validatedContact.firstName} ${validatedContact.lastName}`, 'warn');
            result.skipped++;
            continue;
          }

          // Create contact
          await prisma.contact.create({
            data: {
              firstName: validatedContact.firstName,
              lastName: validatedContact.lastName,
              fullName: `${validatedContact.firstName} ${validatedContact.lastName}`,
              title: validatedContact.title,
              email: validatedContact.email || undefined,
              phone: validatedContact.phone || undefined,
              linkedinUrl: validatedContact.linkedinUrl || undefined,
              department: validatedContact.department,
              seniority: validatedContact.seniority,
              companyId: company.id,
              isDecisionMaker: validatedContact.isDecisionMaker,
              verified: validatedContact.verified,
              dataQuality: validatedContact.dataQuality,
            }
          });

          result.imported++;
          this.log(`Row ${rowIndex}: Successfully imported contact: ${validatedContact.firstName} ${validatedContact.lastName} at ${company.name}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.log(`Row ${rowIndex}: Error importing contact: ${errorMessage}`, 'error');
          
          result.errors.push({
            row: rowIndex,
            data: row,
            error: errorMessage
          });
        }
      }

      // Small delay between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    result.success = result.errors.length === 0;
    this.log(`Contact import completed. Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);
    
    return result;
  }

  async importFromJSON(filePath: string, type: 'companies' | 'contacts'): Promise<ImportResult> {
    this.log(`Starting ${type} import from JSON: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data)) {
      throw new Error('JSON file must contain an array of objects');
    }

    if (type === 'companies') {
      // Convert JSON to CSV-like format and use existing CSV import logic
      const csvData = data.map(item => ({
        ...item,
        foundedYear: item.foundedYear?.toString(),
        verified: item.verified?.toString(),
      }));

      // Create temporary CSV file
      const tempCsv = Papa.unparse(csvData);
      const tempPath = path.join(process.cwd(), 'temp-import.csv');
      fs.writeFileSync(tempPath, tempCsv);

      try {
        const result = await this.importCompaniesFromCSV(tempPath);
        fs.unlinkSync(tempPath); // Clean up temp file
        return result;
      } catch (error) {
        fs.unlinkSync(tempPath); // Clean up temp file on error
        throw error;
      }
    } else {
      // Similar logic for contacts
      const csvData = data.map(item => ({
        ...item,
        isDecisionMaker: item.isDecisionMaker?.toString(),
        verified: item.verified?.toString(),
      }));

      const tempCsv = Papa.unparse(csvData);
      const tempPath = path.join(process.cwd(), 'temp-import.csv');
      fs.writeFileSync(tempPath, tempCsv);

      try {
        const result = await this.importContactsFromCSV(tempPath);
        fs.unlinkSync(tempPath);
        return result;
      } catch (error) {
        fs.unlinkSync(tempPath);
        throw error;
      }
    }
  }

  getLogFilePath(): string {
    return this.logFile;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage:');
    console.log('  npx tsx scripts/bulk-import-companies.ts companies <file.csv|file.json>');
    console.log('  npx tsx scripts/bulk-import-companies.ts contacts <file.csv|file.json>');
    process.exit(1);
  }

  const [type, filePath] = args;
  
  if (!['companies', 'contacts'].includes(type)) {
    console.error('Type must be either "companies" or "contacts"');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const importer = new BulkImportManager();
  
  try {
    let result: ImportResult;
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === '.json') {
      result = await importer.importFromJSON(filePath, type as 'companies' | 'contacts');
    } else if (fileExtension === '.csv') {
      if (type === 'companies') {
        result = await importer.importCompaniesFromCSV(filePath);
      } else {
        result = await importer.importContactsFromCSV(filePath);
      }
    } else {
      throw new Error('Unsupported file format. Use .csv or .json files.');
    }

    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Status: ${result.success ? 'SUCCESS' : 'COMPLETED WITH ERRORS'}`);
    console.log(`Imported: ${result.imported}`);
    console.log(`Skipped: ${result.skipped}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Log file: ${importer.getLogFilePath()}`);

    if (result.errors.length > 0) {
      console.log('\n=== ERRORS ===');
      result.errors.forEach(error => {
        console.log(`Row ${error.row}: ${error.error}`);
      });
    }

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use as a module
export { BulkImportManager, CompanyImportSchema, ContactImportSchema };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}