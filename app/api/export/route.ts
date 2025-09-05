import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware } from '@/middleware/rbac';
import { dataExporter, ExportOptions } from '@/lib/data-export';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await rbacMiddleware.protect(request, {
      requiredPermissions: ['contacts:export']
    });
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const body = await request.json();

    const {
      type = 'contacts',
      format = 'csv',
      filters = {},
      fields,
      includeMetadata = true,
      maxRecords = 10000,
      dateRange
    } = body;

    // Validate export request
    if (!['contacts', 'companies', 'searches', 'analytics'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      );
    }

    if (!['csv', 'excel', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format. Supported: csv, excel, json' },
        { status: 400 }
      );
    }

    // Check export permissions based on type
    if (type === 'analytics' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required for analytics export' },
        { status: 403 }
      );
    }

    // Parse date range if provided
    let parsedDateRange;
    if (dateRange && dateRange.start && dateRange.end) {
      parsedDateRange = {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      };
    }

    // Prepare export options
    const exportOptions: ExportOptions = {
      type,
      format,
      filters,
      fields,
      includeMetadata,
      maxRecords: Math.min(maxRecords, 50000), // Cap at 50k records
      dateRange: parsedDateRange,
      userId: user.id
    };

    // Perform export
    const exportResult = await dataExporter.export(exportOptions, user.id);

    // Return file as response
    const response = new NextResponse(exportResult.data, {
      headers: {
        'Content-Type': exportResult.mimeType,
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
        'Content-Length': exportResult.data.length.toString(),
        'X-Export-Records': exportResult.recordCount.toString(),
        'X-Export-Type': type,
        'X-Export-Format': format
      }
    });

    logger.info('export', 'Data export completed', {
      userId: user.id,
      type,
      format,
      recordCount: exportResult.recordCount,
      filename: exportResult.filename
    });

    return response;

  } catch (error) {
    logger.error('export', 'Export failed', { error });
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get export history for user
    const authResult = await rbacMiddleware.protect(request, {});
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    
    // This would typically come from an exports tracking table
    // For now, return a simple response
    const exportHistory = [
      {
        id: 'export-1',
        type: 'contacts',
        format: 'csv',
        recordCount: 1250,
        filename: 'contacts_export_2024-01-15.csv',
        createdAt: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 'export-2',
        type: 'companies',
        format: 'excel',
        recordCount: 890,
        filename: 'companies_export_2024-01-14.xlsx',
        createdAt: '2024-01-14T15:45:00Z',
        status: 'completed'
      }
    ];

    return NextResponse.json({
      exports: exportHistory,
      pagination: {
        total: exportHistory.length,
        page: 1,
        limit: 20
      }
    });

  } catch (error) {
    logger.error('export', 'Failed to get export history', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve export history' },
      { status: 500 }
    );
  }
}