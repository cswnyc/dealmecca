// 🚀 DealMecca Bulk Import Validation API
// Additional validation endpoint for pre-import data quality checks

import { NextRequest, NextResponse } from 'next/server';
import { DataValidator, validateMediaSellerProfile, assessImportQuality } from '@/lib/bulk-import/validators';
import { BulkImportCompany, BulkImportContact } from '@/lib/types/bulk-import';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication via middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required for validation' 
      }, { status: 401 });
    }

    const { companies, contacts, validationType } = await request.json();

    if (!companies || !contacts) {
      return NextResponse.json({ 
        error: 'Invalid data format - Companies and contacts are required' 
      }, { status: 400 });
    }

    console.log(`🔍 Running ${validationType || 'full'} validation for ${companies.length} companies, ${contacts.length} contacts`);

    const results: any = {
      validationType: validationType || 'full',
      timestamp: new Date().toISOString(),
      summary: {},
      details: {}
    };

    // =========================================================================
    // STANDARD VALIDATION
    // =========================================================================
    
    if (validationType === 'quick' || !validationType) {
      const companyErrors = DataValidator.validateCompanies(companies);
      const contactErrors = DataValidator.validateContacts(contacts);
      const relationshipErrors = DataValidator.validateDataRelationships(companies, contacts);
      
      const allErrors = [...companyErrors, ...contactErrors, ...relationshipErrors];

      results.summary = {
        totalErrors: allErrors.length,
        companyErrors: companyErrors.length,
        contactErrors: contactErrors.length,
        relationshipErrors: relationshipErrors.length,
        criticalErrors: allErrors.filter(e => e.message.includes('required')).length,
        warningCount: allErrors.filter(e => e.message.includes('may not be')).length
      };

      results.details.errors = allErrors;
    }

    // =========================================================================
    // COMPREHENSIVE VALIDATION
    // =========================================================================
    
    if (validationType === 'comprehensive' || !validationType) {
      // Quality assessment
      const qualityAssessment = assessImportQuality(companies, contacts);
      results.details.qualityAssessment = qualityAssessment;

      // Media seller profiling
      const contactProfiles = contacts.map((contact: BulkImportContact, index: number) => {
        const profile = validateMediaSellerProfile(contact);
        const qualityScore = DataValidator.getContactQualityScore(contact);
        
        return {
          index: index + 1,
          name: `${contact.firstName} ${contact.lastName}`,
          company: contact.companyName,
          title: contact.title,
          isTargetRole: profile.isTargetRole,
          confidence: profile.confidence,
          qualityScore: qualityScore.score,
          hasContactInfo: !!(contact.email || contact.phone),
          profile,
          quality: qualityScore
        };
      });

      // Sort by quality score descending
      contactProfiles.sort((a: any, b: any) => b.qualityScore - a.qualityScore);

      results.details.contactProfiles = contactProfiles;
      
      // Statistics
      results.details.statistics = {
        highValueContacts: contactProfiles.filter((c: any) => c.qualityScore >= 70).length,
        targetRoleContacts: contactProfiles.filter((c: any) => c.isTargetRole).length,
        cLevelContacts: contactProfiles.filter((c: any) => 
          c.title?.toLowerCase().includes('cmo') || 
          c.title?.toLowerCase().includes('chief')
        ).length,
        contactsWithEmail: contactProfiles.filter((c: any) => c.profile.reasons.some((r: any) => r.includes('email'))).length,
        averageQualityScore: Math.round(
          contactProfiles.reduce((sum: number, c: any) => sum + c.qualityScore, 0) / contactProfiles.length
        ),
        averageConfidence: Math.round(
          contactProfiles.reduce((sum: number, c: any) => sum + c.confidence, 0) / contactProfiles.length
        )
      };
    }

    // =========================================================================
    // DUPLICATE ANALYSIS
    // =========================================================================
    
    if (validationType === 'duplicates' || validationType === 'comprehensive') {
      const duplicateAnalysis = {
        companyDuplicates: findDuplicateCompanies(companies),
        contactDuplicates: findDuplicateContacts(contacts),
        emailDuplicates: findDuplicateEmails(contacts)
      };

      results.details.duplicateAnalysis = duplicateAnalysis;
      results.summary.duplicateCompanies = duplicateAnalysis.companyDuplicates.length;
      results.summary.duplicateContacts = duplicateAnalysis.contactDuplicates.length;
      results.summary.duplicateEmails = duplicateAnalysis.emailDuplicates.length;
    }

    return NextResponse.json({
      success: true,
      validation: results
    });

  } catch (error) {
    console.error('❌ Validation error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Validation failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

function findDuplicateCompanies(companies: BulkImportCompany[]): any[] {
  const seen = new Map<string, number[]>();
  const duplicates: any[] = [];

  companies.forEach((company, index) => {
    const key = company.name.toLowerCase().trim();
    if (seen.has(key)) {
      seen.get(key)!.push(index);
    } else {
      seen.set(key, [index]);
    }
  });

  seen.forEach((indices, name) => {
    if (indices.length > 1) {
      duplicates.push({
        name,
        indices,
        count: indices.length,
        companies: indices.map(i => companies[i])
      });
    }
  });

  return duplicates;
}

function findDuplicateContacts(contacts: BulkImportContact[]): any[] {
  const seen = new Map<string, number[]>();
  const duplicates: any[] = [];

  contacts.forEach((contact, index) => {
    const key = `${contact.firstName?.toLowerCase() || ''}_${contact.lastName?.toLowerCase() || ''}_${contact.companyName?.toLowerCase() || ''}`;
    if (seen.has(key)) {
      seen.get(key)!.push(index);
    } else {
      seen.set(key, [index]);
    }
  });

  seen.forEach((indices, key) => {
    if (indices.length > 1) {
      duplicates.push({
        key,
        indices,
        count: indices.length,
        contacts: indices.map(i => contacts[i])
      });
    }
  });

  return duplicates;
}

function findDuplicateEmails(contacts: BulkImportContact[]): any[] {
  const seen = new Map<string, number[]>();
  const duplicates: any[] = [];

  contacts.forEach((contact, index) => {
    if (contact.email) {
      const email = contact.email.toLowerCase().trim();
      if (seen.has(email)) {
        seen.get(email)!.push(index);
      } else {
        seen.set(email, [index]);
      }
    }
  });

  seen.forEach((indices, email) => {
    if (indices.length > 1) {
      duplicates.push({
        email,
        indices,
        count: indices.length,
        contacts: indices.map(i => contacts[i])
      });
    }
  });

  return duplicates;
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
