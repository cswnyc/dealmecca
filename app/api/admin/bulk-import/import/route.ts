// 🚀 DealMecca Bulk Import Execution API  
// Handles the actual import of validated companies and contacts into the database

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BulkImportCompany, BulkImportContact } from '@/lib/types/bulk-import';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check admin authentication via middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required for bulk import' 
      }, { status: 401 });
    }

    console.log('🚀 Bulk import execution started by user:', userId);

    const { companies, contacts, uploadId } = await request.json();

    if (!companies || !contacts) {
      return NextResponse.json({ 
        error: 'Invalid data format - Companies and contacts are required' 
      }, { status: 400 });
    }

    console.log(`📊 Starting import: ${companies.length} companies, ${contacts.length} contacts`);

    const results = {
      companiesCreated: 0,
      companiesUpdated: 0,
      companiesSkipped: 0,
      contactsCreated: 0,
      contactsUpdated: 0,
      contactsSkipped: 0,
      errors: [] as string[],
      warnings: [] as string[],
      processedAt: new Date().toISOString(),
      executionTime: 0,
      uploadId: uploadId || `import_${Date.now()}_${userId}`
    };

    // =========================================================================
    // PHASE 1: PROCESS COMPANIES IN BATCHES
    // =========================================================================
    
    console.log('📦 Phase 1: Processing companies...');
    const companyBatchSize = 50; // Reduced batch size for better performance
    const createdCompanies = new Map<string, string>(); // name -> id mapping
    
    for (let i = 0; i < companies.length; i += companyBatchSize) {
      const batch = companies.slice(i, i + companyBatchSize);
      console.log(`🔄 Processing company batch ${Math.floor(i / companyBatchSize) + 1}/${Math.ceil(companies.length / companyBatchSize)}`);
      
      for (const companyData of batch) {
        try {
          console.log(`🏢 Processing company: ${companyData.name}`);
          
          // Check for existing company by name or website
          const existingCompany = await prisma.company.findFirst({
            where: {
              OR: [
                { name: { equals: companyData.name, mode: 'insensitive' } },
                ...(companyData.website ? [{ website: companyData.website }] : []),
                ...(companyData.domain ? [{ website: companyData.domain }] : [])
              ]
            }
          });

          if (existingCompany) {
            // Update existing company with new data (only non-null values)
            const updateData: any = {
              updatedAt: new Date()
            };
            
            if (companyData.industry && companyData.industry !== existingCompany.industry) {
              updateData.industry = companyData.industry;
            }
            if (companyData.employeeCount && companyData.employeeCount !== existingCompany.employeeCount) {
              updateData.employeeCount = companyData.employeeCount;
            }
            if (companyData.revenue && companyData.revenue !== existingCompany.revenue) {
              updateData.revenue = companyData.revenue;
            }
            if (companyData.headquarters && companyData.headquarters !== existingCompany.headquarters) {
              updateData.headquarters = companyData.headquarters;
            }
            if (companyData.description && companyData.description !== existingCompany.description) {
              updateData.description = companyData.description;
            }
            if (companyData.website && companyData.website !== existingCompany.website) {
              updateData.website = companyData.website;
            }
            if (companyData.domain && companyData.domain !== existingCompany.website) {
              updateData.website = companyData.domain; // Map domain to website field
            }
            if (companyData.type && companyData.type !== existingCompany.companyType) {
              updateData.companyType = companyData.type;
            }

            // Only update if there are actual changes
            if (Object.keys(updateData).length > 1) { // More than just updatedAt
              await prisma.company.update({
                where: { id: existingCompany.id },
                data: updateData
              });
              results.companiesUpdated++;
            } else {
              results.companiesSkipped++;
            }
            
            createdCompanies.set(companyData.name.toLowerCase(), existingCompany.id);

          } else {
            // Create new company
            const newCompany = await prisma.company.create({
              data: {
                name: companyData.name,
                slug: companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
                website: companyData.website || companyData.domain, // Map domain to website field
                industry: companyData.industry,
                employeeCount: companyData.employeeCount,
                revenue: companyData.revenue,
                headquarters: companyData.headquarters,
                description: companyData.description,
                companyType: companyData.type || 'ADVERTISER', // Use valid enum value
                dataQuality: 'BASIC',
                verified: false
              }
            });
            
            results.companiesCreated++;
            createdCompanies.set(companyData.name.toLowerCase(), newCompany.id);
          }

        } catch (error) {
          const errorMsg = `Company "${companyData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error('❌ Company error:', errorMsg);
          console.error('🔍 Company data:', companyData);
          console.error('🔍 Full error:', error);
        }
      }
    }

    console.log(`✅ Companies processed: ${results.companiesCreated} created, ${results.companiesUpdated} updated, ${results.companiesSkipped} skipped`);

    // =========================================================================
    // PHASE 2: PROCESS CONTACTS IN BATCHES
    // =========================================================================
    
    console.log('👤 Phase 2: Processing contacts...');
    const contactBatchSize = 100;
    
    for (let i = 0; i < contacts.length; i += contactBatchSize) {
      const batch = contacts.slice(i, i + contactBatchSize);
      console.log(`🔄 Processing contact batch ${Math.floor(i / contactBatchSize) + 1}/${Math.ceil(contacts.length / contactBatchSize)}`);
      
      for (const contactData of batch) {
        try {
          // Find the company for this contact
          const companyId = createdCompanies.get(contactData.companyName.toLowerCase());
          
          if (!companyId) {
            // Try to find company in database if not in our created list
            const company = await prisma.company.findFirst({
              where: { name: { equals: contactData.companyName, mode: 'insensitive' } }
            });
            
            if (!company) {
              results.warnings.push(`Contact "${contactData.firstName} ${contactData.lastName}": Company "${contactData.companyName}" not found`);
              continue;
            }
            createdCompanies.set(contactData.companyName.toLowerCase(), company.id);
          }

          const finalCompanyId = createdCompanies.get(contactData.companyName.toLowerCase())!;

          // Check for existing contact
          const existingContact = await prisma.contact.findFirst({
            where: {
              AND: [
                { firstName: { equals: contactData.firstName, mode: 'insensitive' } },
                { lastName: { equals: contactData.lastName, mode: 'insensitive' } },
                { companyId: finalCompanyId }
              ]
            }
          });

          if (existingContact) {
            // Update existing contact with new/better data
            const updateData: any = {
              updatedAt: new Date()
            };

            // Only update fields that have new/better data
            if (contactData.email && (!existingContact.email || contactData.email !== existingContact.email)) {
              updateData.email = contactData.email;
            }
            if (contactData.phone && (!existingContact.phone || contactData.phone !== existingContact.phone)) {
              updateData.phone = contactData.phone;
            }
            if (contactData.title && (!existingContact.title || contactData.title !== existingContact.title)) {
              updateData.title = contactData.title;
            }
            if (contactData.department && (!existingContact.department || contactData.department !== existingContact.department)) {
              updateData.department = contactData.department;
            }
            if (contactData.linkedinUrl && (!existingContact.linkedinUrl || contactData.linkedinUrl !== existingContact.linkedinUrl)) {
              updateData.linkedinUrl = contactData.linkedinUrl;
            }

            // Only update if there are actual changes
            if (Object.keys(updateData).length > 1) { // More than just updatedAt
              await prisma.contact.update({
                where: { id: existingContact.id },
                data: updateData
              });
              results.contactsUpdated++;
            } else {
              results.contactsSkipped++;
            }

          } else {
            // Create new contact
            await prisma.contact.create({
              data: {
                firstName: contactData.firstName,
                lastName: contactData.lastName,
                fullName: `${contactData.firstName} ${contactData.lastName}`,
                email: contactData.email,
                phone: contactData.phone,
                title: contactData.title,
                department: contactData.department,
                linkedinUrl: contactData.linkedinUrl,
                companyId: finalCompanyId,
                seniority: contactData.seniority || 'COORDINATOR',
                isDecisionMaker: contactData.decisionMaking || false,
                dataQuality: 'BASIC',
                verified: false,
                isActive: true
              }
            });
            results.contactsCreated++;
          }

        } catch (error) {
          const errorMsg = `Contact "${contactData.firstName} ${contactData.lastName}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error('❌ Contact error:', errorMsg);
        }
      }
    }

    results.executionTime = Date.now() - startTime;
    
    console.log(`✅ Contacts processed: ${results.contactsCreated} created, ${results.contactsUpdated} updated, ${results.contactsSkipped} skipped`);
    console.log(`⏱️ Total execution time: ${results.executionTime}ms`);

    // =========================================================================
    // FINAL SUMMARY AND RESPONSE
    // =========================================================================

    const successfulOperations = results.companiesCreated + results.companiesUpdated + 
                                 results.contactsCreated + results.contactsUpdated;
    const totalOperations = companies.length + contacts.length;
    const successRate = Math.round((successfulOperations / totalOperations) * 100);

    return NextResponse.json({
      success: true,
      results: {
        ...results,
        summary: {
          successRate,
          totalProcessed: totalOperations,
          successfulOperations,
          failedOperations: results.errors.length,
          warningCount: results.warnings.length,
          executionTimeMs: results.executionTime,
          executionTimeFormatted: `${(results.executionTime / 1000).toFixed(2)}s`
        }
      }
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Bulk import execution error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Import execution failed',
      executionTime,
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
