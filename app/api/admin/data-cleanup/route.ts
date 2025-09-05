import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { dataQualityManager, type DuplicateMatch } from '@/lib/data-quality';

const prisma = new PrismaClient();

export interface DataCleanupOperation {
  id: string;
  type: 'merge_duplicates' | 'fix_inconsistencies' | 'normalize_data' | 'remove_invalid' | 'complete_missing';
  table: 'companies' | 'contacts' | 'both';
  description: string;
  affectedRecords: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  results?: {
    processed: number;
    succeeded: number;
    failed: number;
    errors: string[];
  };
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Admin data cleanup utilities API
 * 
 * GET /api/admin/data-cleanup - Get cleanup operations status
 * POST /api/admin/data-cleanup - Execute cleanup operations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return unauthorizedResponse();
    }

    // Check admin permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        return await getCleanupStatus();
      
      case 'quality-report':
        return await getDataQualityReport();
        
      case 'duplicates':
        return await getDuplicates(searchParams);
        
      case 'suggestions':
        return await getCleanupSuggestions();
        
      default:
        return errorResponse('Invalid action', 400);
    }

  } catch (error) {
    logger.error('admin', 'Data cleanup GET failed', error);
    return errorResponse('Data cleanup request failed', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return unauthorizedResponse();
    }

    // Check admin permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (user?.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const { action, options } = body;

    logger.info('admin', 'Data cleanup operation requested', {
      action,
      userId: user.id,
      options,
    });

    switch (action) {
      case 'merge_duplicates':
        return await mergeDuplicates(options, user.id);
      
      case 'normalize_data':
        return await normalizeData(options, user.id);
        
      case 'fix_inconsistencies':
        return await fixInconsistencies(options, user.id);
        
      case 'remove_invalid':
        return await removeInvalidData(options, user.id);
        
      case 'complete_missing':
        return await completeMissingData(options, user.id);
        
      case 'bulk_cleanup':
        return await performBulkCleanup(options, user.id);
        
      default:
        return errorResponse('Invalid cleanup action', 400);
    }

  } catch (error) {
    logger.error('admin', 'Data cleanup POST failed', error);
    return errorResponse('Data cleanup operation failed', 500);
  }
}

async function getCleanupStatus(): Promise<NextResponse> {
  // In a real implementation, you'd track cleanup operations in a database table
  // For now, return mock data structure
  const operations: DataCleanupOperation[] = [
    {
      id: 'cleanup_001',
      type: 'merge_duplicates',
      table: 'companies',
      description: 'Merge duplicate company records',
      affectedRecords: 12,
      status: 'completed',
      progress: 100,
      results: {
        processed: 12,
        succeeded: 10,
        failed: 2,
        errors: ['Could not merge companies with different industries'],
      },
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      completedAt: new Date(Date.now() - 82800000),
    },
  ];

  return successResponse({
    operations,
    summary: {
      total: operations.length,
      running: operations.filter(op => op.status === 'running').length,
      completed: operations.filter(op => op.status === 'completed').length,
      failed: operations.filter(op => op.status === 'failed').length,
    },
  });
}

async function getDataQualityReport(): Promise<NextResponse> {
  try {
    const report = await dataQualityManager.generateQualityReport();
    return successResponse(report);
  } catch (error) {
    logger.error('admin', 'Failed to generate quality report', error);
    return errorResponse('Failed to generate quality report', 500);
  }
}

async function getDuplicates(searchParams: URLSearchParams): Promise<NextResponse> {
  try {
    const type = searchParams.get('type') as 'companies' | 'contacts' || 'companies';
    const limit = parseInt(searchParams.get('limit') || '50');

    const duplicates = type === 'companies' 
      ? await dataQualityManager.findCompanyDuplicates(limit)
      : await dataQualityManager.findContactDuplicates(limit);

    return successResponse({
      type,
      duplicates,
      total: duplicates.length,
    });
  } catch (error) {
    logger.error('admin', 'Failed to find duplicates', error);
    return errorResponse('Failed to find duplicates', 500);
  }
}

async function getCleanupSuggestions(): Promise<NextResponse> {
  try {
    const [companyIssues, contactIssues, duplicates] = await Promise.all([
      findCompanyDataIssues(),
      findContactDataIssues(),
      dataQualityManager.findCompanyDuplicates(10),
    ]);

    const suggestions = [
      ...companyIssues.map(issue => ({
        ...issue,
        priority: calculatePriority(issue.type, issue.count),
        estimatedTime: estimateCleanupTime(issue.type, issue.count),
      })),
      ...contactIssues.map(issue => ({
        ...issue,
        priority: calculatePriority(issue.type, issue.count),
        estimatedTime: estimateCleanupTime(issue.type, issue.count),
      })),
    ];

    if (duplicates.length > 0) {
      suggestions.push({
        type: 'merge_duplicates',
        table: 'companies',
        description: 'Merge duplicate company records',
        count: duplicates.length,
        priority: 'high' as const,
        estimatedTime: duplicates.length * 2, // 2 minutes per duplicate
        autoFixable: true,
      });
    }

    return successResponse({
      suggestions: suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      summary: {
        total: suggestions.length,
        autoFixable: suggestions.filter(s => s.autoFixable).length,
        highPriority: suggestions.filter(s => s.priority === 'high').length,
      },
    });
  } catch (error) {
    logger.error('admin', 'Failed to get cleanup suggestions', error);
    return errorResponse('Failed to get cleanup suggestions', 500);
  }
}

async function mergeDuplicates(
  options: { type: 'companies' | 'contacts'; duplicates: string[] },
  userId: string
): Promise<NextResponse> {
  try {
    const { type, duplicates } = options;
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    logger.info('admin', 'Starting duplicate merge operation', {
      type,
      count: duplicates.length,
      userId,
    });

    // Process each duplicate pair
    for (const duplicateId of duplicates) {
      try {
        results.processed++;
        
        if (type === 'companies') {
          await mergeCompanyDuplicate(duplicateId);
        } else {
          await mergeContactDuplicate(duplicateId);
        }
        
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to merge ${duplicateId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        logger.error('admin', `Failed to merge duplicate ${duplicateId}`, error);
      }
    }

    logger.info('admin', 'Duplicate merge operation completed', results);

    return successResponse({
      operation: 'merge_duplicates',
      results,
      message: `Processed ${results.processed} duplicates. ${results.succeeded} succeeded, ${results.failed} failed.`,
    });

  } catch (error) {
    logger.error('admin', 'Merge duplicates operation failed', error);
    return errorResponse('Merge duplicates operation failed', 500);
  }
}

async function normalizeData(
  options: { table: 'companies' | 'contacts' | 'both'; fields: string[] },
  userId: string
): Promise<NextResponse> {
  try {
    const { table, fields } = options;
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    logger.info('admin', 'Starting data normalization', {
      table,
      fields,
      userId,
    });

    if (table === 'companies' || table === 'both') {
      const companyResults = await normalizeCompanyData(fields);
      results.processed += companyResults.processed;
      results.succeeded += companyResults.succeeded;
      results.failed += companyResults.failed;
      results.errors.push(...companyResults.errors);
    }

    if (table === 'contacts' || table === 'both') {
      const contactResults = await normalizeContactData(fields);
      results.processed += contactResults.processed;
      results.succeeded += contactResults.succeeded;
      results.failed += contactResults.failed;
      results.errors.push(...contactResults.errors);
    }

    logger.info('admin', 'Data normalization completed', results);

    return successResponse({
      operation: 'normalize_data',
      results,
      message: `Normalized ${results.succeeded} records successfully.`,
    });

  } catch (error) {
    logger.error('admin', 'Data normalization failed', error);
    return errorResponse('Data normalization failed', 500);
  }
}

async function fixInconsistencies(options: any, userId: string): Promise<NextResponse> {
  try {
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Fix title-seniority inconsistencies
    const inconsistentContacts = await prisma.contact.findMany({
      where: {
        isActive: true,
        title: { contains: 'CEO', mode: 'insensitive' },
        seniority: { not: 'C_LEVEL' },
      },
      take: 100,
    });

    for (const contact of inconsistentContacts) {
      try {
        results.processed++;
        
        await prisma.contact.update({
          where: { id: contact.id },
          data: { seniority: 'C_LEVEL' },
        });
        
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to fix contact ${contact.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    logger.info('admin', 'Inconsistency fix completed', results);

    return successResponse({
      operation: 'fix_inconsistencies',
      results,
      message: `Fixed ${results.succeeded} inconsistencies.`,
    });

  } catch (error) {
    logger.error('admin', 'Fix inconsistencies failed', error);
    return errorResponse('Fix inconsistencies failed', 500);
  }
}

async function removeInvalidData(options: any, userId: string): Promise<NextResponse> {
  try {
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Remove contacts without any contact information
    const invalidContacts = await prisma.contact.findMany({
      where: {
        isActive: true,
        AND: [
          { email: null },
          { phone: null },
          { linkedinUrl: null },
        ],
      },
      take: 100,
    });

    for (const contact of invalidContacts) {
      try {
        results.processed++;
        
        await prisma.contact.update({
          where: { id: contact.id },
          data: { isActive: false },
        });
        
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to deactivate contact ${contact.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    logger.info('admin', 'Invalid data removal completed', results);

    return successResponse({
      operation: 'remove_invalid',
      results,
      message: `Deactivated ${results.succeeded} invalid records.`,
    });

  } catch (error) {
    logger.error('admin', 'Remove invalid data failed', error);
    return errorResponse('Remove invalid data failed', 500);
  }
}

async function completeMissingData(options: any, userId: string): Promise<NextResponse> {
  try {
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Complete missing fullName for contacts
    const incompleteContacts = await prisma.contact.findMany({
      where: {
        isActive: true,
        fullName: null,
        firstName: { not: null },
        lastName: { not: null },
      },
      take: 100,
    });

    for (const contact of incompleteContacts) {
      try {
        results.processed++;
        
        await prisma.contact.update({
          where: { id: contact.id },
          data: { 
            fullName: `${contact.firstName} ${contact.lastName}`,
          },
        });
        
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to complete contact ${contact.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    logger.info('admin', 'Missing data completion completed', results);

    return successResponse({
      operation: 'complete_missing',
      results,
      message: `Completed ${results.succeeded} records.`,
    });

  } catch (error) {
    logger.error('admin', 'Complete missing data failed', error);
    return errorResponse('Complete missing data failed', 500);
  }
}

async function performBulkCleanup(options: any, userId: string): Promise<NextResponse> {
  try {
    logger.info('admin', 'Starting bulk cleanup operation', { userId, options });

    // Execute multiple cleanup operations
    const operations = [
      'normalize_data',
      'fix_inconsistencies',
      'complete_missing',
    ];

    const results = {
      totalProcessed: 0,
      totalSucceeded: 0,
      totalFailed: 0,
      operations: {} as Record<string, any>,
    };

    for (const operation of operations) {
      try {
        let operationResult;
        
        switch (operation) {
          case 'normalize_data':
            operationResult = await normalizeData({ table: 'both', fields: ['name', 'email', 'website'] }, userId);
            break;
          case 'fix_inconsistencies':
            operationResult = await fixInconsistencies({}, userId);
            break;
          case 'complete_missing':
            operationResult = await completeMissingData({}, userId);
            break;
        }

        const data = await operationResult.json();
        if (data.success && data.data.results) {
          results.operations[operation] = data.data.results;
          results.totalProcessed += data.data.results.processed;
          results.totalSucceeded += data.data.results.succeeded;
          results.totalFailed += data.data.results.failed;
        }
      } catch (error) {
        logger.error('admin', `Bulk cleanup operation ${operation} failed`, error);
        results.operations[operation] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    logger.info('admin', 'Bulk cleanup operation completed', results);

    return successResponse({
      operation: 'bulk_cleanup',
      results,
      message: `Bulk cleanup completed. ${results.totalSucceeded} succeeded, ${results.totalFailed} failed.`,
    });

  } catch (error) {
    logger.error('admin', 'Bulk cleanup operation failed', error);
    return errorResponse('Bulk cleanup operation failed', 500);
  }
}

// Helper functions
async function mergeCompanyDuplicate(duplicateId: string): Promise<void> {
  // Implementation would merge two company records
  // This is a placeholder for the actual merge logic
  logger.info('admin', `Merging company duplicate ${duplicateId}`);
}

async function mergeContactDuplicate(duplicateId: string): Promise<void> {
  // Implementation would merge two contact records
  // This is a placeholder for the actual merge logic
  logger.info('admin', `Merging contact duplicate ${duplicateId}`);
}

async function normalizeCompanyData(fields: string[]): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const results = { processed: 0, succeeded: 0, failed: 0, errors: [] as string[] };
  
  if (fields.includes('name') || fields.includes('website')) {
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { normalizedName: null },
          { normalizedWebsite: null },
        ]
      },
      take: 100,
    });

    for (const company of companies) {
      try {
        results.processed++;
        
        const updates: any = {};
        if (!company.normalizedName && company.name) {
          updates.normalizedName = company.name.toLowerCase().trim();
        }
        if (!company.normalizedWebsite && company.website) {
          updates.normalizedWebsite = company.website.toLowerCase().replace(/^https?:\/\/(www\.)?/, '');
        }

        if (Object.keys(updates).length > 0) {
          await prisma.company.update({
            where: { id: company.id },
            data: updates,
          });
        }
        
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to normalize company ${company.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  return results;
}

async function normalizeContactData(fields: string[]): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const results = { processed: 0, succeeded: 0, failed: 0, errors: [] as string[] };
  
  if (fields.includes('email')) {
    const contacts = await prisma.contact.findMany({
      where: {
        isActive: true,
        email: { not: null },
      },
      take: 100,
    });

    for (const contact of contacts) {
      try {
        results.processed++;
        
        if (contact.email && contact.email !== contact.email.toLowerCase()) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { email: contact.email.toLowerCase().trim() },
          });
        }
        
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to normalize contact ${contact.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  return results;
}

async function findCompanyDataIssues() {
  const issues = [];

  // Missing company types
  const missingTypes = await prisma.company.count({
    where: { companyType: null }
  });
  if (missingTypes > 0) {
    issues.push({
      type: 'complete_missing',
      table: 'companies',
      description: 'Companies missing company type',
      count: missingTypes,
      autoFixable: false,
    });
  }

  // Missing normalized data
  const missingNormalized = await prisma.company.count({
    where: {
      OR: [
        { normalizedName: null },
        { normalizedWebsite: null },
      ]
    }
  });
  if (missingNormalized > 0) {
    issues.push({
      type: 'normalize_data',
      table: 'companies',
      description: 'Companies with missing normalized data',
      count: missingNormalized,
      autoFixable: true,
    });
  }

  return issues;
}

async function findContactDataIssues() {
  const issues = [];

  // Missing full names
  const missingFullNames = await prisma.contact.count({
    where: {
      isActive: true,
      fullName: null,
      firstName: { not: null },
      lastName: { not: null },
    }
  });
  if (missingFullNames > 0) {
    issues.push({
      type: 'complete_missing',
      table: 'contacts',
      description: 'Contacts missing full name',
      count: missingFullNames,
      autoFixable: true,
    });
  }

  // Invalid email formats (simple check)
  const invalidEmails = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count
    FROM contacts 
    WHERE "isActive" = true 
    AND email IS NOT NULL 
    AND email NOT LIKE '%@%.%'
  `;
  const invalidEmailCount = parseInt(invalidEmails[0]?.count || '0');
  if (invalidEmailCount > 0) {
    issues.push({
      type: 'fix_inconsistencies',
      table: 'contacts',
      description: 'Contacts with invalid email formats',
      count: invalidEmailCount,
      autoFixable: false,
    });
  }

  return issues;
}

function calculatePriority(type: string, count: number): 'high' | 'medium' | 'low' {
  if (count > 100) return 'high';
  if (count > 20) return 'medium';
  return 'low';
}

function estimateCleanupTime(type: string, count: number): number {
  const timePerRecord = {
    'merge_duplicates': 2, // 2 minutes per duplicate
    'normalize_data': 0.1, // 6 seconds per record
    'fix_inconsistencies': 0.2, // 12 seconds per record
    'complete_missing': 0.1, // 6 seconds per record
  };

  return Math.ceil(count * (timePerRecord[type as keyof typeof timePerRecord] || 1));
}