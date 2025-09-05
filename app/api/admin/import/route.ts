import { NextRequest, NextResponse } from 'next/server';
import { BulkImportManager } from '@/scripts/bulk-import-companies';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'File and type are required' },
        { status: 400 }
      );
    }

    if (!['companies', 'contacts'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be companies or contacts' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Only CSV and JSON files are supported' },
        { status: 400 }
      );
    }

    // Save uploaded file temporarily
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    // Initialize import manager
    const importer = new BulkImportManager();

    try {
      let result;
      if (file.name.endsWith('.json')) {
        result = await importer.importFromJSON(filePath, type as 'companies' | 'contacts');
      } else {
        if (type === 'companies') {
          result = await importer.importCompaniesFromCSV(filePath);
        } else {
          result = await importer.importContactsFromCSV(filePath);
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      return NextResponse.json({
        success: result.success,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
        logFile: importer.getLogFilePath()
      });

    } catch (importError) {
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw importError;
    }

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { 
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve import history/logs
export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const logsDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logsDir)) {
      return NextResponse.json({ logs: [] });
    }

    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.startsWith('import-') && file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, 20); // Return last 20 import logs

    return NextResponse.json({ logs: logFiles });

  } catch (error) {
    console.error('Error fetching import logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import logs' },
      { status: 500 }
    );
  }
}