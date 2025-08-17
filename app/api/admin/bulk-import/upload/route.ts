// 🚀 DealMecca Bulk Import Upload API
// Handles file upload, parsing, and validation for bulk company/contact imports

import { NextRequest, NextResponse } from 'next/server';
import { FileParser } from '@/lib/bulk-import/parsers';
import { DataValidator, assessImportQuality } from '@/lib/bulk-import/validators';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication via middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required for bulk import' 
      }, { status: 401 });
    }

    console.log('🚀 Bulk import upload started by user:', userId);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided - Please select a CSV, Excel, or JSON file' 
      }, { status: 400 });
    }

    // File size check (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large - Maximum size is 50MB' 
      }, { status: 400 });
    }

    // File type validation
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'json'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json({ 
        error: 'Invalid file type - Please upload CSV, Excel (.xlsx/.xls), or JSON files only' 
      }, { status: 400 });
    }

    console.log(`📂 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Parse file
    const parsedData = await FileParser.parseFile(file);
    console.log(`📊 Parsed ${parsedData.companies.length} companies, ${parsedData.contacts.length} contacts`);

    // Validate data
    const companyErrors = DataValidator.validateCompanies(parsedData.companies);
    const contactErrors = DataValidator.validateContacts(parsedData.contacts);
    const relationshipErrors = DataValidator.validateDataRelationships(
      parsedData.companies, 
      parsedData.contacts
    );
    
    const allErrors = [
      ...parsedData.errors, 
      ...companyErrors, 
      ...contactErrors, 
      ...relationshipErrors
    ];

    // Assess overall import quality
    const qualityAssessment = assessImportQuality(parsedData.companies, parsedData.contacts);

    // Calculate media seller statistics
    const mediaSellerStats = {
      totalContacts: parsedData.contacts.length,
      highValueContacts: parsedData.contacts.filter(c => {
        const quality = DataValidator.getContactQualityScore(c);
        return quality.score >= 70;
      }).length,
      cLevelContacts: parsedData.contacts.filter(c => 
        c.seniority === 'C_LEVEL' || 
        (c.title && (c.title.toLowerCase().includes('cmo') || c.title.toLowerCase().includes('chief')))
      ).length,
      decisionMakers: parsedData.contacts.filter(c => c.decisionMaking).length,
      contactsWithEmail: parsedData.contacts.filter(c => c.email).length,
      contactsWithPhone: parsedData.contacts.filter(c => c.phone).length,
      contactsWithLinkedIn: parsedData.contacts.filter(c => c.linkedinUrl).length
    };

    console.log('📈 Import quality assessment:', qualityAssessment);
    console.log('🎯 Media seller statistics:', mediaSellerStats);

    // Return parsed data with comprehensive validation results
    return NextResponse.json({
      success: true,
      uploadId: `upload_${Date.now()}_${userId}`, // Unique ID for tracking
      data: {
        companies: parsedData.companies,
        contacts: parsedData.contacts,
        preview: parsedData.preview,
        summary: {
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          },
          counts: {
            totalCompanies: parsedData.companies.length,
            totalContacts: parsedData.contacts.length,
            totalErrors: allErrors.length,
            criticalErrors: allErrors.filter(e => e.message.includes('required')).length,
            warnings: allErrors.filter(e => e.message.includes('may not be')).length
          },
          quality: qualityAssessment,
          mediaSellerStats,
          readyForImport: allErrors.filter(e => e.message.includes('required')).length === 0
        },
        validation: {
          errors: allErrors,
          hasErrors: allErrors.length > 0,
          hasCriticalErrors: allErrors.filter(e => e.message.includes('required')).length > 0,
          errorsByField: groupErrorsByField(allErrors),
          errorsByType: groupErrorsByType(allErrors)
        }
      }
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Upload failed - Please check your file format and try again',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Helper functions for error analysis
function groupErrorsByField(errors: any[]): Record<string, number> {
  return errors.reduce((acc, error) => {
    acc[error.field] = (acc[error.field] || 0) + 1;
    return acc;
  }, {});
}

function groupErrorsByType(errors: any[]): Record<string, number> {
  return errors.reduce((acc, error) => {
    const type = error.message.includes('required') ? 'required' :
                 error.message.includes('duplicate') ? 'duplicate' :
                 error.message.includes('invalid') ? 'format' :
                 error.message.includes('may not be') ? 'warning' : 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
}

// OPTIONS handler for CORS if needed
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
