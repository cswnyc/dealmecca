// 🚀 DealMecca Bulk Import Upload API
// Handles file upload, parsing, and validation for bulk import preview

import { NextRequest, NextResponse } from 'next/server';
import { FileParser } from '@/lib/bulk-import/parsers';
import { requireAuth } from '@/server/requireAuth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and ensure user exists in database
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth; // Auth failed

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.dbUserId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required for bulk import'
      }, { status: 403 });
    }

    console.log('📤 File upload started by user:', auth.dbUserId);

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        error: 'No file uploaded'
      }, { status: 400 });
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes)`);

    // Parse the file using the FileParser
    const parsedData = await FileParser.parseFile(file);

    console.log(`✅ File parsed successfully:`);
    console.log(`   - Companies: ${parsedData.companies.length}`);
    console.log(`   - Contacts: ${parsedData.contacts.length}`);
    console.log(`   - Errors: ${parsedData.errors.length}`);

    // Calculate summary statistics
    const summary = {
      totalCompanies: parsedData.companies.length,
      totalContacts: parsedData.contacts.length,
      errors: parsedData.errors.length,
      validationErrors: parsedData.errors || []
    };

    return NextResponse.json({
      success: true,
      data: {
        companies: parsedData.companies,
        contacts: parsedData.contacts,
        preview: parsedData.preview || parsedData.contacts.slice(0, 5),
        summary
      }
    });

  } catch (error) {
    console.error('❌ File upload error:', error);

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'File upload failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET endpoint to check if upload is available
export async function GET(request: NextRequest) {
  // Verify authentication
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: auth.dbUserId },
    select: { role: true }
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({
    endpoint: '/api/admin/bulk-import/upload',
    description: 'Upload and parse CSV/Excel/JSON files for bulk import',
    method: 'POST',
    supportedFormats: ['CSV', 'Excel (.xlsx, .xls)', 'JSON'],
    maxFileSize: '10MB'
  });
}
