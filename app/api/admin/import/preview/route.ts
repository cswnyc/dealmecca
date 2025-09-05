import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';
import { CompanyImportSchema, ContactImportSchema } from '@/scripts/bulk-import-companies';

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

    // Read file content
    const fileContent = await file.text();
    let data: any[] = [];
    let headers: string[] = [];

    if (file.name.endsWith('.json')) {
      try {
        const jsonData = JSON.parse(fileContent);
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON must contain an array of objects');
        }
        data = jsonData.slice(0, 10); // Preview first 10 rows
        headers = data.length > 0 ? Object.keys(data[0]) : [];
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith('.csv')) {
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        preview: 10, // Preview first 10 rows
        transformHeader: (header: string) => header.trim()
      });

      if (parseResult.errors.length > 0) {
        return NextResponse.json(
          { 
            error: 'CSV parsing errors', 
            details: parseResult.errors 
          },
          { status: 400 }
        );
      }

      data = parseResult.data as any[];
      headers = parseResult.meta.fields || [];
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Use CSV or JSON.' },
        { status: 400 }
      );
    }

    // Validate sample data
    const validationResults = {
      valid: 0,
      invalid: 0,
      errors: [] as Array<{ row: number; errors: string[] }>
    };

    const schema = type === 'companies' ? CompanyImportSchema : ContactImportSchema;

    data.forEach((row, index) => {
      try {
        // For companies, transform numeric fields
        if (type === 'companies') {
          row.foundedYear = row.foundedYear ? parseInt(row.foundedYear) : undefined;
          row.verified = row.verified === 'true' || row.verified === '1';
        } else {
          // For contacts
          row.isDecisionMaker = row.isDecisionMaker === 'true' || row.isDecisionMaker === '1';
          row.verified = row.verified === 'true' || row.verified === '1';
        }

        schema.parse(row);
        validationResults.valid++;
      } catch (error: any) {
        validationResults.invalid++;
        validationResults.errors.push({
          row: index + 1,
          errors: error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [error.message]
        });
      }
    });

    // Generate field mapping suggestions
    const expectedFields = type === 'companies' 
      ? Object.keys(CompanyImportSchema.shape)
      : Object.keys(ContactImportSchema.shape);

    const fieldMapping = headers.map(header => {
      const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      const suggestion = expectedFields.find(field => 
        field.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalized) ||
        normalized.includes(field.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
      
      return {
        source: header,
        suggested: suggestion,
        required: expectedFields.includes(suggestion || '') && 
                  !['id', 'createdAt', 'updatedAt'].includes(suggestion || '')
      };
    });

    return NextResponse.json({
      preview: data,
      headers,
      totalRows: data.length,
      validation: validationResults,
      fieldMapping,
      expectedFields
    });

  } catch (error) {
    console.error('Preview API error:', error);
    return NextResponse.json(
      { 
        error: 'Preview failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}