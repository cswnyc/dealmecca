import { NextRequest } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    // Check if user is authenticated via middleware headers
  const userId = request.headers.get('x-user-id');
  if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return companies with contact counts as a proxy for org chart availability
    const companies = await prisma.company.findMany({
      include: {
        contacts: {
          select: {
            id: true,
            title: true,
            department: true
          }
        }
      },
      orderBy: [
        { companyType: 'asc' },
        { name: 'asc' }
      ],
      take: 20
    });

    // Transform data for frontend
    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      companyType: company.companyType,
      industry: company.industry,
      description: company.description,
      employeeCount: company.employeeCount,
      city: company.city,
      state: company.state,
      website: company.website,
      verified: company.verified,
      contactCount: company.contacts.length,
      hasOrgChart: company.contacts.length > 0,
      departments: [...new Set(company.contacts.map(c => c.department).filter(Boolean))]
    }));

    // Group by company type for easier frontend handling
    const groupedCompanies = {
      agencies: transformedCompanies.filter(c => 
        ['INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'AGENCY'].includes(c.companyType || '')
      ),
      advertisers: transformedCompanies.filter(c => 
        ['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADVERTISER'].includes(c.companyType || '')
      ),
      vendors: transformedCompanies.filter(c => 
        ['ADTECH_VENDOR', 'TECH_VENDOR', 'MEDIA_OWNER'].includes(c.companyType || '')
      ),
      other: transformedCompanies.filter(c => 
        !['INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'AGENCY', 
          'NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADVERTISER',
          'ADTECH_VENDOR', 'TECH_VENDOR', 'MEDIA_OWNER'].includes(c.companyType || '')
      )
    };

    return Response.json({
      success: true,
      data: {
        companies: transformedCompanies,
        grouped: groupedCompanies,
        total: transformedCompanies.length,
        summary: {
          agencies: groupedCompanies.agencies.length,
          advertisers: groupedCompanies.advertisers.length,
          vendors: groupedCompanies.vendors.length,
          other: groupedCompanies.other.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching companies with org charts:', error);
    return Response.json(
      { error: 'Failed to fetch companies with org charts' },
      { status: 500 }
    );
  }
}
