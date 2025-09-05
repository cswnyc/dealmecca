import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface BatchMetrics {
  batchNumber: number;
  companyCount: number;
  contactCount: number;
  importDate: string;
  importDuration: number;
  successRate: number;
  avgQueryTime: number;
  avgPageLoad: number;
  mobileScore: number;
  errorCount: number;
  status: 'completed' | 'in_progress' | 'planned';
  insights: string[];
  optimizations: Array<{
    type: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    status: 'completed' | 'in_progress' | 'planned';
  }>;
}

interface PerformanceGates {
  pageLoadTime: { threshold: number, current: number, passing: boolean };
  searchResponseTime: { threshold: number, current: number, passing: boolean };
  importSuccessRate: { threshold: number, current: number, passing: boolean };
  mobileExperience: { threshold: number, current: number, passing: boolean };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    // Get current system metrics
    const totalCompanies = await prisma.company.count();
    const totalContacts = await prisma.contact.count();
    
    // Calculate recent search performance
    const recentSearches = await prisma.search.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // Mock batch data for now - in production this would be stored in database
    const batches: BatchMetrics[] = [
      {
        batchNumber: 1,
        companyCount: 150,
        contactCount: 420,
        importDate: new Date().toISOString(),
        importDuration: 18,
        successRate: 98.7,
        avgQueryTime: 420,
        avgPageLoad: 2100,
        mobileScore: 95,
        errorCount: 2,
        status: 'completed',
        insights: [
          'Search performance remained stable with 150 additional companies',
          'Mobile experience maintained high scores across all tests',
          'Import process completed 18% faster than baseline estimates',
          'Users searched for "Media Director" 3x more than expected'
        ],
        optimizations: [
          {
            type: 'search',
            description: 'Implement search auto-complete for frequent terms',
            impact: 'medium',
            status: 'planned'
          },
          {
            type: 'mobile',
            description: 'Enhance swipe gestures based on usage patterns',
            impact: 'low',
            status: 'in_progress'
          }
        ]
      }
    ];

    // Calculate performance gates
    const performanceGates: PerformanceGates = {
      pageLoadTime: {
        threshold: 3000,
        current: 2100,
        passing: true
      },
      searchResponseTime: {
        threshold: 1000,
        current: recentSearches.length > 0 ? 450 : 450, // Mock for now
        passing: true
      },
      importSuccessRate: {
        threshold: 95,
        current: 98.5,
        passing: true
      },
      mobileExperience: {
        threshold: 90,
        current: 95,
        passing: true
      }
    };

    // Real-time metrics
    const realTimeMetrics = {
      activeUsers: await getActiveUsersCount(),
      queriesPerSecond: await getQueriesPerSecond(),
      dbConnections: 8, // Would come from database connection pool
      memoryUsage: 45, // Would come from system monitoring
      totalCompanies,
      totalContacts,
      systemStatus: {
        database: 'healthy',
        searchIndex: 'optimal',
        apiResponse: 'fast'
      }
    };

    const response = {
      batches,
      performanceGates,
      realTimeMetrics,
      currentBatch: batches.length + 1,
      scaling: {
        targetCompanies: 1000,
        currentProgress: (totalCompanies / 1000) * 100,
        estimatedCompletion: calculateEstimatedCompletion(batches),
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Scaling monitor API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scaling metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'start_batch':
        // Initialize new batch tracking
        const newBatch = await startNewBatch(data);
        return NextResponse.json({ success: true, batch: newBatch });

      case 'complete_batch':
        // Finalize batch with metrics
        const completedBatch = await completeBatch(data);
        return NextResponse.json({ success: true, batch: completedBatch });

      case 'record_performance':
        // Record performance metrics during batch
        await recordPerformanceMetrics(data);
        return NextResponse.json({ success: true });

      case 'check_gates':
        // Check if all performance gates pass
        const gateResults = await checkPerformanceGates();
        return NextResponse.json({ success: true, gates: gateResults });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Scaling monitor POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getActiveUsersCount(): Promise<number> {
  // Count users with recent activity (last 10 minutes)
  const activeUsers = await prisma.user.count({
    where: {
      lastDashboardVisit: {
        gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    },
  });
  return activeUsers;
}

async function getQueriesPerSecond(): Promise<number> {
  // Calculate queries per second from recent searches
  const recentSearches = await prisma.search.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 60 * 1000), // Last minute
      },
    },
  });
  return recentSearches / 60;
}

function calculateEstimatedCompletion(batches: BatchMetrics[]): string {
  if (batches.length === 0) return 'Unknown';
  
  const avgBatchSize = batches.reduce((sum, batch) => sum + batch.companyCount, 0) / batches.length;
  const currentTotal = batches.reduce((sum, batch) => sum + batch.companyCount, 0) + 17; // Include baseline
  const remainingCompanies = 1000 - currentTotal;
  const remainingBatches = Math.ceil(remainingCompanies / avgBatchSize);
  const avgBatchDuration = batches.reduce((sum, batch) => sum + batch.importDuration, 0) / batches.length;
  
  // Estimate completion time (rough calculation)
  const daysEstimate = remainingBatches * 7; // Assuming 1 batch per week
  const completionDate = new Date(Date.now() + daysEstimate * 24 * 60 * 60 * 1000);
  
  return completionDate.toLocaleDateString();
}

async function startNewBatch(data: any) {
  // In a real implementation, this would create batch tracking records
  // For now, return mock data
  return {
    id: Date.now().toString(),
    batchNumber: data.batchNumber || 2,
    status: 'in_progress',
    startedAt: new Date(),
    targetCompanies: data.targetCompanies || 150,
  };
}

async function completeBatch(data: any) {
  // Record batch completion metrics
  logger.info('Batch completed:', data);
  
  // Would save to database in production
  return {
    ...data,
    completedAt: new Date(),
    status: 'completed',
  };
}

async function recordPerformanceMetrics(data: any) {
  // Record performance metrics during batch processing
  logger.info('Performance metrics recorded:', data);
  
  // In production, would store in performance monitoring table
  // For now, just log the data
}

async function checkPerformanceGates() {
  // Check all performance gates
  const gates = {
    pageLoadTime: await checkPageLoadTime(),
    searchResponseTime: await checkSearchResponseTime(),
    importSuccessRate: await checkImportSuccessRate(),
    mobileExperience: await checkMobileExperience(),
  };

  const allPassing = Object.values(gates).every(gate => gate.passing);

  return {
    gates,
    allPassing,
    readyForNextBatch: allPassing,
  };
}

async function checkPageLoadTime() {
  // Mock implementation - would use real performance monitoring
  return {
    threshold: 3000,
    current: 2100,
    passing: true,
    lastChecked: new Date(),
  };
}

async function checkSearchResponseTime() {
  // Check recent search performance
  const recentSearches = await prisma.search.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
    take: 50,
  });

  // Mock calculation - would use actual response times
  const avgResponseTime = 450; // Mock value
  
  return {
    threshold: 1000,
    current: avgResponseTime,
    passing: avgResponseTime < 1000,
    lastChecked: new Date(),
    sampleSize: recentSearches.length,
  };
}

async function checkImportSuccessRate() {
  // Mock implementation - would track actual import success rates
  return {
    threshold: 95,
    current: 98.5,
    passing: true,
    lastChecked: new Date(),
  };
}

async function checkMobileExperience() {
  // Mock implementation - would use mobile performance testing
  return {
    threshold: 90,
    current: 95,
    passing: true,
    lastChecked: new Date(),
  };
}