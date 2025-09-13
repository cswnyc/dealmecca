import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

interface BulkOperation {
  operation: 'edit' | 'delete' | 'export';
  contactIds: string[];
  data?: {
    department?: string;
    verified?: boolean;
    isActive?: boolean;
    seniority?: string;
  };
}

interface BulkResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    contactId: string;
    error: string;
  }>;
}

// GET /api/admin/contacts/bulk - Export contacts
export async function GET(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactIds = searchParams.get('ids')?.split(',') || [];
    const format = searchParams.get('format') || 'csv';

    if (contactIds.length === 0) {
      return NextResponse.json({ error: 'No contact IDs provided' }, { status: 400 });
    }

    // Fetch contacts with company information
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds }
      },
      include: {
        company: {
          select: {
            name: true,
            companyType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeader = [
        'ID',
        'First Name',
        'Last Name',
        'Title',
        'Email',
        'Personal Email',
        'Phone',
        'LinkedIn URL',
        'Department',
        'Seniority',
        'Company',
        'Company Type',
        'Verified',
        'Active',
        'Decision Maker',
        'Preferred Contact',
        'Created Date'
      ].join(',');

      const csvRows = contacts.map(contact => [
        contact.id,
        `"${contact.firstName || ''}"`,
        `"${contact.lastName || ''}"`,
        `"${contact.title || ''}"`,
        `"${contact.email || ''}"`,
        `"${contact.personalEmail || ''}"`,
        `"${contact.phone || ''}"`,
        `"${contact.linkedinUrl || ''}"`,
        `"${contact.department?.replace(/_/g, ' ') || ''}"`,
        `"${contact.seniority?.replace(/_/g, ' ') || ''}"`,
        `"${contact.company?.name || ''}"`,
        `"${contact.company?.companyType || ''}"`,
        contact.verified ? 'Yes' : 'No',
        contact.isActive ? 'Yes' : 'No',
        contact.isDecisionMaker ? 'Yes' : 'No',
        `"${contact.preferredContact?.replace(/_/g, ' ') || ''}"`,
        `"${contact.createdAt.toISOString().split('T')[0]}"`
      ].join(','));

      const csvContent = [csvHeader, ...csvRows].join('\n');
      
      const headers = new Headers({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="contacts-export-${new Date().toISOString().split('T')[0]}.csv"`
      });

      return new NextResponse(csvContent, { status: 200, headers });
    }

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Export contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to export contacts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contacts/bulk - Bulk operations
export async function POST(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BulkOperation = await request.json();
    const { operation, contactIds, data } = body;

    if (!operation || !contactIds || contactIds.length === 0) {
      return NextResponse.json({ 
        error: 'Operation and contact IDs are required' 
      }, { status: 400 });
    }

    const result: BulkResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    };

    if (operation === 'edit' && data) {
      // Bulk edit operation
      try {
        const updateData: any = {};
        
        if (data.department !== undefined) updateData.department = data.department;
        if (data.verified !== undefined) updateData.verified = data.verified;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.seniority !== undefined) updateData.seniority = data.seniority;

        const updateResult = await prisma.contact.updateMany({
          where: {
            id: { in: contactIds }
          },
          data: updateData
        });

        result.processed = updateResult.count;
      } catch (error) {
        console.error('Bulk edit error:', error);
        result.success = false;
        result.failed = contactIds.length;
        result.errors = contactIds.map(id => ({
          contactId: id,
          error: 'Failed to update contact'
        }));
      }
    } else if (operation === 'delete') {
      // Bulk delete operation
      const results = await Promise.allSettled(
        contactIds.map(async (contactId) => {
          try {
            await prisma.contact.delete({
              where: { id: contactId }
            });
            return { success: true, contactId };
          } catch (error) {
            console.error(`Failed to delete contact ${contactId}:`, error);
            return { 
              success: false, 
              contactId, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        })
      );

      results.forEach((promiseResult, index) => {
        if (promiseResult.status === 'fulfilled') {
          const result_data = promiseResult.value;
          if (result_data.success) {
            result.processed++;
          } else {
            result.failed++;
            result.errors.push({
              contactId: result_data.contactId,
              error: result_data.error || 'Failed to delete'
            });
          }
        } else {
          result.failed++;
          result.errors.push({
            contactId: contactIds[index],
            error: 'Promise rejected'
          });
        }
      });

      result.success = result.failed === 0;
    } else {
      return NextResponse.json({ 
        error: 'Invalid operation or missing data' 
      }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
} 