import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user info from headers set by middleware
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get current date for time-based calculations
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Parallel database queries for performance
    const [
      totalCompanies,
      totalContacts,
      verifiedCompanies,
      verifiedContacts,
      companiesThisMonth,
      contactsThisMonth,
      contactsByDepartment,
      contactsBySeniority,
      recentActivity
    ] = await Promise.all([
      // Total companies
      prisma.company.count(),
      
      // Total contacts
      prisma.contact.count(),
      
      // Verified companies
      prisma.company.count({
        where: { verified: true }
      }),
      
      // Verified contacts
      prisma.contact.count({
        where: { verified: true }
      }),
      
      // Companies added this month
      prisma.company.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      }),
      
      // Contacts added this month
      prisma.contact.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      }),
      
      // Contacts by department
      prisma.contact.groupBy({
        by: ['department'],
        _count: true,
        where: {
          department: {
            not: undefined
          }
        }
      }),
      
      // Contacts by seniority
      prisma.contact.groupBy({
        by: ['seniority'],
        _count: true,
        where: {
          seniority: {
            not: undefined
          }
        }
      }),
      
      // Recent activity (last 10 items)
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { name: true }
          }
        }
      })
    ]);

    // Calculate percentage changes
    const companiesGrowth = totalCompanies > 0 ? Math.round((companiesThisMonth / totalCompanies) * 100) : 0;
    const contactsGrowth = totalContacts > 0 ? Math.round((contactsThisMonth / totalContacts) * 100) : 0;
    const verificationRate = totalCompanies > 0 ? Math.round((verifiedCompanies / totalCompanies) * 100) : 0;
    const contactVerificationRate = totalContacts > 0 ? Math.round((verifiedContacts / totalContacts) * 100) : 0;

    // Calculate data quality score based on verification rates and complete profiles
    const dataQualityScore = Math.round((verificationRate + contactVerificationRate) / 2);

    // Format department data
    const departmentStats = contactsByDepartment.map(dept => ({
      name: dept.department?.replace(/_/g, ' ') || 'Unknown',
      count: dept._count
    }));

    // Format seniority data
    const seniorityStats = contactsBySeniority.map(sen => ({
      name: sen.seniority?.replace(/_/g, ' ') || 'Unknown',
      count: sen._count
    }));

    // Format recent activity
    const formattedActivity = recentActivity.map(contact => ({
      id: contact.id,
      type: 'contact_added',
      message: `New contact added: ${contact.firstName} ${contact.lastName}`,
      company: contact.company?.name,
      timestamp: contact.createdAt
    }));

    const stats = {
      overview: {
        totalCompanies: {
          value: totalCompanies,
          change: companiesThisMonth,
          changeLabel: `+${companiesThisMonth} this month`
        },
        totalContacts: {
          value: totalContacts,
          change: contactsThisMonth,
          changeLabel: `+${contactsThisMonth} this month`
        },
        verifiedCompanies: {
          value: verifiedCompanies,
          rate: verificationRate,
          changeLabel: `${verificationRate}% verification rate`
        },
        dataQuality: {
          score: dataQualityScore,
          changeLabel: dataQualityScore >= 80 ? 'Excellent' : dataQualityScore >= 60 ? 'Good' : 'Needs improvement'
        }
      },
      contacts: {
        total: totalContacts,
        verified: verifiedContacts,
        verificationRate: contactVerificationRate,
        byDepartment: departmentStats,
        bySeniority: seniorityStats
      },
      companies: {
        total: totalCompanies,
        verified: verifiedCompanies,
        verificationRate: verificationRate
      },
      activity: formattedActivity,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 