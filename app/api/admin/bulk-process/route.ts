import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

// Valid enums from Prisma schema
const VALID_COMPANY_TYPES = [
  'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY',
  'NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADTECH_VENDOR', 'MARTECH_VENDOR',
  'MEDIA_OWNER', 'BROADCASTER', 'PUBLISHER', 'CONSULTANCY', 'PRODUCTION_COMPANY',
  'ADVERTISER', 'AGENCY', 'MEDIA_COMPANY', 'TECH_VENDOR'
];

const VALID_INDUSTRIES = [
  'AUTOMOTIVE', 'CPG_FOOD_BEVERAGE', 'CPG_PERSONAL_CARE', 'CPG_HOUSEHOLD',
  'FINANCIAL_SERVICES', 'HEALTHCARE_PHARMA', 'RETAIL_ECOMMERCE', 'TECHNOLOGY',
  'ENTERTAINMENT_MEDIA', 'TRAVEL_HOSPITALITY', 'TELECOM', 'FASHION_BEAUTY',
  'SPORTS_FITNESS', 'EDUCATION', 'REAL_ESTATE', 'ENERGY', 'GOVERNMENT_NONPROFIT',
  'GAMING', 'CRYPTOCURRENCY', 'INSURANCE', 'B2B_SERVICES', 'STARTUPS', 'NONPROFIT'
];

const VALID_EMPLOYEE_RANGES = [
  'STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000',
  'ENTERPRISE_1001_5000', 'MEGA_5000_PLUS'
];

const VALID_REGIONS = [
  'NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST', 'NORTHWEST',
  'NATIONAL', 'INTERNATIONAL', 'CANADA', 'GLOBAL'
];

interface CompanyInput {
  name: string;
  description: string;
  companyType: string;
  website?: string;
  industry?: string;
  city?: string;
  state?: string;
  employeeCount?: string;
  region?: string;
}

interface ProcessResult {
  success: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateCompany(company: CompanyInput, index: number): string[] {
  const errors: string[] = [];

  // Required fields
  if (!company.name || company.name.trim() === '') {
    errors.push(`Row ${index + 1}: Name is required`);
  }

  if (!company.description || company.description.trim() === '') {
    errors.push(`Row ${index + 1}: Description is required`);
  }

  if (!company.companyType || !VALID_COMPANY_TYPES.includes(company.companyType)) {
    errors.push(`Row ${index + 1}: Invalid company type '${company.companyType}'`);
  }

  // Optional field validation
  if (company.industry && !VALID_INDUSTRIES.includes(company.industry)) {
    errors.push(`Row ${index + 1}: Invalid industry '${company.industry}'`);
  }

  if (company.employeeCount && !VALID_EMPLOYEE_RANGES.includes(company.employeeCount)) {
    errors.push(`Row ${index + 1}: Invalid employee count '${company.employeeCount}'`);
  }

  if (company.region && !VALID_REGIONS.includes(company.region)) {
    errors.push(`Row ${index + 1}: Invalid region '${company.region}'`);
  }

  if (company.website && company.website.trim() !== '' && !isValidUrl(company.website)) {
    errors.push(`Row ${index + 1}: Invalid website URL '${company.website}'`);
  }

  return errors;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function prepareCompanyData(company: CompanyInput): any {
  const slug = generateSlug(company.name);
  
  return {
    name: company.name.trim(),
    slug,
    description: company.description.trim(),
    companyType: company.companyType,
    website: company.website?.trim() || null,
    industry: company.industry || null,
    city: company.city?.trim() || null,
    state: company.state?.trim() || null,
    employeeCount: company.employeeCount || null,
    region: company.region || null,
    verified: false,
    dataQuality: 'BASIC',
    country: 'US'
  };
}

export async function POST(request: NextRequest) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  if (!session || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { companies }: { companies: CompanyInput[] } = await request.json();
    
    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: 'Invalid request: companies array is required' },
        { status: 400 }
      );
    }

    if (companies.length === 0) {
      return NextResponse.json(
        { error: 'No companies provided' },
        { status: 400 }
      );
    }

    if (companies.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 companies allowed per upload' },
        { status: 400 }
      );
    }

    // Validate all companies first
    const allErrors: string[] = [];
    companies.forEach((company, index) => {
      const errors = validateCompany(company, index);
      allErrors.push(...errors);
    });

    if (allErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        validationErrors: allErrors
      }, { status: 400 });
    }

    // Prepare company data
    const preparedCompanies = companies.map(prepareCompanyData);

    // Check for existing companies by name and slug to avoid duplicates
    const existingNames = await prisma.company.findMany({
      where: {
        OR: [
          { name: { in: preparedCompanies.map(c => c.name) } },
          { slug: { in: preparedCompanies.map(c => c.slug) } }
        ]
      },
      select: { name: true, slug: true }
    });

    const existingNameSet = new Set(existingNames.map(c => c.name.toLowerCase()));
    const existingSlugSet = new Set(existingNames.map(c => c.slug));

    // Filter out duplicates
    const newCompanies = preparedCompanies.filter(company => 
      !existingNameSet.has(company.name.toLowerCase()) && 
      !existingSlugSet.has(company.slug)
    );

    const duplicateCount = preparedCompanies.length - newCompanies.length;

    let successCount = 0;
    let failedCount = 0;
    const processErrors: string[] = [];

    if (newCompanies.length > 0) {
      try {
        // Process in batches of 50 to avoid overwhelming the database
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < newCompanies.length; i += batchSize) {
          batches.push(newCompanies.slice(i, i + batchSize));
        }

        // Process each batch within a transaction
        for (const batch of batches) {
          try {
            await prisma.$transaction(async (tx) => {
              await tx.company.createMany({
                data: batch,
                skipDuplicates: true
              });
            });
            successCount += batch.length;
          } catch (error) {
            console.error('Batch processing error:', error);
            failedCount += batch.length;
            processErrors.push(`Failed to process batch of ${batch.length} companies: ${error}`);
          }
        }
      } catch (error) {
        console.error('Bulk processing error:', error);
        processErrors.push(`Bulk processing failed: ${error}`);
        failedCount = newCompanies.length;
      }
    }

    const result: ProcessResult = {
      success: successCount,
      failed: failedCount,
      duplicates: duplicateCount,
      errors: processErrors
    };

    // Log the bulk upload activity
    console.log(`Bulk upload completed by ${request.headers.get('x-user-email')}: ${successCount} success, ${failedCount} failed, ${duplicateCount} duplicates`);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Bulk process API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk processing' },
      { status: 500 }
    );
  }
} 