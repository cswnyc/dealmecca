import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// We'll use Prisma's auto-generated cuid() for IDs

interface ImportContact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  department?: string;
  company: string;
  companyId?: string;
  isValid: boolean;
}

interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    contact: string;
    error: string;
  }>;
}

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  return phonePattern.test(phone);
};

const validateLinkedIn = (url: string): boolean => {
  const linkedinPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
  return linkedinPattern.test(url);
};

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { contacts }: { contacts: ImportContact[] } = await request.json();

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contacts data' },
        { status: 400 }
      );
    }

    const results: ImportResult = {
      imported: 0,
      failed: 0,
      errors: []
    };

    // Process each contact
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      try {
        // Skip invalid contacts
        if (!contact.isValid) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            contact: `${contact.firstName} ${contact.lastName}`,
            error: 'Contact failed validation'
          });
          continue;
        }

        // Additional server-side validation
        const validationErrors: string[] = [];

        // Required fields
        if (!contact.firstName?.trim()) validationErrors.push('First name is required');
        if (!contact.lastName?.trim()) validationErrors.push('Last name is required');
        if (!contact.title?.trim()) validationErrors.push('Title is required');
        if (!contact.companyId) validationErrors.push('Valid company is required');

        // Optional field validation
        if (contact.email && !validateEmail(contact.email)) {
          validationErrors.push('Invalid email format');
        }
        if (contact.phone && !validatePhone(contact.phone)) {
          validationErrors.push('Invalid phone format');
        }
        if (contact.linkedinUrl && !validateLinkedIn(contact.linkedinUrl)) {
          validationErrors.push('Invalid LinkedIn URL format');
        }

        if (validationErrors.length > 0) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            contact: `${contact.firstName} ${contact.lastName}`,
            error: validationErrors.join(', ')
          });
          continue;
        }

        // Check for existing contact (same email or same name + company)
        const existingContact = await prisma.contact.findFirst({
          where: {
            OR: [
              // Check by email if provided
              ...(contact.email ? [{
                email: contact.email
              }] : []),
              // Check by name + company
              {
                AND: [
                  { firstName: contact.firstName },
                  { lastName: contact.lastName },
                  { companyId: contact.companyId }
                ]
              }
            ]
          }
        });

        if (existingContact) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            contact: `${contact.firstName} ${contact.lastName}`,
            error: 'Contact already exists'
          });
          continue;
        }

        // Verify company exists
        const company = await prisma.company.findUnique({
          where: { id: contact.companyId }
        });

        if (!company) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            contact: `${contact.firstName} ${contact.lastName}`,
            error: 'Company not found'
          });
          continue;
        }

        // Determine seniority level based on title
        const getSeniorityLevel = (title: string) => {
          const titleLower = title.toLowerCase();
          if (titleLower.includes('ceo') || titleLower.includes('president') || titleLower.includes('founder')) {
            return 'C_LEVEL' as const;
          } else if (titleLower.includes('vp') || titleLower.includes('vice president')) {
            return 'VP' as const;
          } else if (titleLower.includes('director')) {
            return 'DIRECTOR' as const;
          } else if (titleLower.includes('manager') || titleLower.includes('lead') || titleLower.includes('head')) {
            return 'MANAGER' as const;
          } else if (titleLower.includes('senior') || titleLower.includes('sr')) {
            return 'SENIOR_SPECIALIST' as const;
          } else if (titleLower.includes('junior') || titleLower.includes('jr') || titleLower.includes('associate')) {
            return 'COORDINATOR' as const;
          } else {
            return 'SPECIALIST' as const;
          }
        };

        // Map department string to enum value
        const getDepartment = (dept?: string) => {
          if (!dept) return null;
          const deptUpper = dept.toUpperCase().replace(/[^A-Z]/g, '_');
          const validDepartments = [
            'MEDIA_PLANNING', 'MEDIA_BUYING', 'DIGITAL_MARKETING', 'PROGRAMMATIC', 
            'SOCIAL_MEDIA', 'SEARCH_MARKETING', 'STRATEGY_PLANNING', 'ANALYTICS_INSIGHTS',
            'CREATIVE_SERVICES', 'ACCOUNT_MANAGEMENT', 'BUSINESS_DEVELOPMENT', 'OPERATIONS',
            'TECHNOLOGY', 'FINANCE', 'LEADERSHIP', 'HUMAN_RESOURCES', 'SALES', 'MARKETING',
            'PRODUCT', 'DATA_SCIENCE'
          ];
          return validDepartments.includes(deptUpper) ? deptUpper as any : 'MARKETING';
        };

        // Create the contact
        await prisma.contact.create({
          data: {
            firstName: contact.firstName.trim(),
            lastName: contact.lastName.trim(),
            fullName: `${contact.firstName.trim()} ${contact.lastName.trim()}`,
            title: contact.title.trim(),
            email: contact.email?.trim() || null,
            phone: contact.phone?.trim() || null,
            linkedinUrl: contact.linkedinUrl?.trim() || null,
            department: getDepartment(contact.department),
            seniority: getSeniorityLevel(contact.title),
            company: {
              connect: { id: contact.companyId }
            },
            verified: false,
            isActive: true,
            isDecisionMaker: false,
            preferredContact: contact.email ? 'EMAIL' : 'PHONE'
          }
        });

        results.imported++;

      } catch (error) {
        console.error(`Error importing contact ${i + 1}:`, error);
        results.failed++;
        results.errors.push({
          row: i + 1,
          contact: `${contact.firstName} ${contact.lastName}`,
          error: 'Database error during import'
        });
      }
    }

    // Log the import activity
    console.log(`Bulk import completed by ${session.user.email}: ${results.imported} imported, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      imported: results.imported,
      failed: results.failed,
      errors: results.errors,
      message: `Successfully imported ${results.imported} contacts`
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during bulk import' },
      { status: 500 }
    );
  }
} 