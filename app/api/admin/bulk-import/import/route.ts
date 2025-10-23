// 🚀 DealMecca Bulk Import Execution API
// Handles the actual import of validated companies and contacts into the database
// WITH automated logo and photo generation

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findCompanyDuplicates, findContactDuplicates } from '@/lib/bulk-import/duplicate-detection';
import { prepareCompanyForDatabase } from '@/lib/normalization-utils';
import { getCompanyLogoUrl, getContactPhotoUrl } from '@/lib/logo-utils';
import { requireAuth } from '@/server/requireAuth';
import { createId } from '@paralleldrive/cuid2';
import { getRateLimiter, BULK_IMPORT_RATE_LIMITS, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authentication and ensure user exists in database
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth; // Auth failed

    // Rate limiting check
    const rateLimiter = getRateLimiter();
    const rateLimitResult = rateLimiter.check(
      `bulk-import:${auth.dbUserId}`,
      BULK_IMPORT_RATE_LIMITS.STANDARD
    );

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

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

    console.log('🚀 Bulk import execution started by user:', auth.dbUserId);

    // Mark import as in progress to prevent concurrent imports
    rateLimiter.markInProgress(
      `bulk-import:${auth.dbUserId}`,
      BULK_IMPORT_RATE_LIMITS.MAX_IMPORT_DURATION
    );

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
      uploadId: uploadId || `import_${Date.now()}_${auth.dbUserId}`
    };

    // =========================================================================
    // PHASE 1: PROCESS COMPANIES IN BATCHES
    // =========================================================================

    console.log('📦 Phase 1: Processing companies...');
    const companyBatchSize = 50;
    const createdCompanies = new Map<string, string>(); // name -> id mapping

    for (let i = 0; i < companies.length; i += companyBatchSize) {
      const batch = companies.slice(i, i + companyBatchSize);
      console.log(`🔄 Processing company batch ${Math.floor(i / companyBatchSize) + 1}/${Math.ceil(companies.length / companyBatchSize)}`);

      for (const companyData of batch) {
        try {
          console.log(`🏢 Processing company: ${companyData.name}`);

          // Generate logo URL with smart domain extraction
          // Priority: explicit website > explicit domain > extract from first contact's email
          let websiteForLogo = companyData.website || companyData.domain;

          // If no website/domain provided, try to extract from contact emails
          if (!websiteForLogo) {
            const contactWithEmail = contacts.find(c =>
              c.companyName?.toLowerCase() === companyData.name.toLowerCase() && c.email
            );
            if (contactWithEmail?.email) {
              // Extract domain from email (john@acme.com → acme.com)
              const emailDomain = contactWithEmail.email.split('@')[1];
              if (emailDomain) {
                websiteForLogo = emailDomain;
                console.log(`📧 Extracted domain from email: ${emailDomain} for ${companyData.name}`);
              }
            }
          }

          const logoUrl = getCompanyLogoUrl(websiteForLogo, companyData.name);

          // Check for existing company using enhanced duplicate detection
          const existingCompany = await findCompanyDuplicates({
            name: companyData.name,
            website: companyData.website || companyData.domain
          });

          if (existingCompany) {
            // Update existing company with new data (only non-null values)
            const updateData: any = {
              updatedAt: new Date()
            };

            if (logoUrl && !existingCompany.logoUrl) {
              updateData.logoUrl = logoUrl; // Add logo if missing
            }
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
              updateData.website = companyData.domain;
            }
            if (companyData.type && companyData.type !== existingCompany.companyType) {
              updateData.companyType = companyData.type;
            }

            // Only update if there are actual changes
            if (Object.keys(updateData).length > 1) {
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
            // Create new company with normalized fields + logo
            const generatedId = createId();
            console.log(`🆔 Generated ID for ${companyData.name}: ${generatedId}`);

            const companyDataWithNormalized = prepareCompanyForDatabase({
              id: generatedId, // Generate unique ID
              name: companyData.name,
              slug: companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
              website: companyData.website || companyData.domain,
              logoUrl: logoUrl, // Add generated logo
              industry: companyData.industry,
              employeeCount: companyData.employeeCount,
              revenue: companyData.revenue,
              headquarters: companyData.headquarters,
              description: companyData.description,
              companyType: companyData.type || 'ADVERTISER',
              dataQuality: 'BASIC',
              verified: false,
              updatedAt: new Date() // Required field without @default
            });

            console.log(`📝 Prepared company data:`, {
              hasId: !!companyDataWithNormalized.id,
              idValue: companyDataWithNormalized.id,
              name: companyDataWithNormalized.name,
              keys: Object.keys(companyDataWithNormalized)
            });

            const newCompany = await prisma.company.create({
              data: companyDataWithNormalized as any
            });

            results.companiesCreated++;
            createdCompanies.set(companyData.name.toLowerCase(), newCompany.id);
            console.log(`✅ Created company with logo: ${logoUrl || 'none'}`);
          }

        } catch (error: any) {
          // 🔍 DETAILED ERROR LOGGING FOR DEBUGGING
          console.error('❌ FULL Company creation error:', {
            company: companyData.name,
            errorType: error.constructor?.name,
            errorCode: error.code,
            errorMessage: error.message,
            errorMeta: error.meta,
            errorDetails: JSON.stringify(error, null, 2)
          });

          let errorMsg = `Company "${companyData.name}": `;

          if (error.code === 'P2002') {
            const field = error.meta?.target?.[0];
            if (field === 'name') {
              errorMsg += 'A company with this name already exists';
              results.companiesSkipped++;
            } else if (field === 'website') {
              errorMsg += 'A company with this website already exists';
              results.companiesSkipped++;
            } else {
              errorMsg += 'This company already exists';
              results.companiesSkipped++;
            }
            results.warnings.push(errorMsg);
          } else {
            errorMsg += error instanceof Error ? error.message : 'Unknown error';
            results.errors.push(errorMsg);
            console.error('❌ Company error:', errorMsg);
          }
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

          // Generate photo URL with Gravatar/DiceBear fallback
          const photoUrl = getContactPhotoUrl(
            contactData.firstName,
            contactData.lastName,
            contactData.email
          );

          // Check for existing contact
          const existingContact = await findContactDuplicates({
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            email: contactData.email,
            companyId: finalCompanyId
          });

          if (existingContact) {
            // Update existing contact with new/better data
            const updateData: any = {
              updatedAt: new Date()
            };

            // Only update if no uploaded photo exists (preserve manual uploads)
            if (!existingContact.logoUrl || existingContact.logoUrl.includes('dicebear')) {
              updateData.logoUrl = photoUrl;
            }
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
            if (Object.keys(updateData).length > 1) {
              await prisma.contact.update({
                where: { id: existingContact.id },
                data: updateData
              });
              results.contactsUpdated++;
            } else {
              results.contactsSkipped++;
            }

          } else {
            // Create new contact with photo
            await prisma.contact.create({
              data: {
                id: createId(), // Generate unique ID
                firstName: contactData.firstName,
                lastName: contactData.lastName,
                fullName: `${contactData.firstName} ${contactData.lastName}`,
                email: contactData.email,
                phone: contactData.phone,
                title: contactData.title,
                department: contactData.department,
                linkedinUrl: contactData.linkedinUrl,
                logoUrl: photoUrl, // Add generated photo
                companyId: finalCompanyId,
                seniority: contactData.seniority || 'SPECIALIST',
                isDecisionMaker: contactData.isDecisionMaker || contactData.decisionMaking || false,
                dataQuality: 'BASIC',
                verified: false,
                isActive: true,
                updatedAt: new Date() // Required field without @default
              }
            });
            results.contactsCreated++;
            console.log(`✅ Created contact with photo: ${photoUrl}`);
          }

        } catch (error: any) {
          // 🔍 DETAILED ERROR LOGGING FOR DEBUGGING
          console.error('❌ FULL Contact creation error:', {
            contact: `${contactData.firstName} ${contactData.lastName}`,
            errorType: error.constructor?.name,
            errorCode: error.code,
            errorMessage: error.message,
            errorMeta: error.meta,
            errorDetails: JSON.stringify(error, null, 2)
          });

          let errorMsg = `Contact "${contactData.firstName} ${contactData.lastName}": `;

          if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('email')) {
              errorMsg += 'A contact with this email already exists';
            } else {
              errorMsg += 'This contact already exists';
            }
            results.contactsSkipped++;
            results.warnings.push(errorMsg);
          } else {
            errorMsg += error instanceof Error ? error.message : 'Unknown error';
            results.errors.push(errorMsg);
            console.error('❌ Contact error:', errorMsg);
          }
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

    // Mark import as complete
    rateLimiter.markComplete(`bulk-import:${auth.dbUserId}`);

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

    // Mark import as complete even on error
    try {
      const auth = await requireAuth(request);
      if (!(auth instanceof NextResponse)) {
        getRateLimiter().markComplete(`bulk-import:${auth.dbUserId}`);
      }
    } catch (e) {
      // Ignore errors in cleanup
    }

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
