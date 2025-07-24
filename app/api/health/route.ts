import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔵 [${requestId}] Health check started`);
  
  const health = {
    status: 'unknown' as 'unknown' | 'healthy' | 'unhealthy',
    timestamp: new Date().toISOString(),
    requestId,
    services: {
      database: { status: 'unknown' as 'unknown' | 'healthy' | 'unhealthy', latency: 0, error: null as string | null },
      prisma: { status: 'unknown' as 'unknown' | 'healthy' | 'unhealthy', error: null as string | null }
    }
  };

  // Test database connectivity
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const dbLatency = Date.now() - dbStartTime;
    
    health.services.database = {
      status: 'healthy',
      latency: dbLatency,
      error: null
    };
    
    console.log(`💾 [${requestId}] Database connection healthy (${dbLatency}ms)`);
  } catch (dbError) {
    const errorInfo = dbError instanceof Error ? dbError.message : String(dbError);
    health.services.database = {
      status: 'unhealthy',
      latency: 0,
      error: errorInfo
    };
    
    console.error(`❌ [${requestId}] Database connection failed:`, dbError);
  }

  // Test Prisma client
  try {
    await prisma.$connect();
    health.services.prisma = {
      status: 'healthy',
      error: null
    };
    
    console.log(`🔧 [${requestId}] Prisma client healthy`);
  } catch (prismaError) {
    const errorInfo = prismaError instanceof Error ? prismaError.message : String(prismaError);
    health.services.prisma = {
      status: 'unhealthy',
      error: errorInfo
    };
    
    console.error(`❌ [${requestId}] Prisma client failed:`, prismaError);
  }

  // Determine overall status
  const allServicesHealthy = Object.values(health.services).every(
    service => service.status === 'healthy'
  );
  
  health.status = allServicesHealthy ? 'healthy' : 'unhealthy';
  
  const duration = Date.now() - startTime;
  console.log(`✅ [${requestId}] Health check completed in ${duration}ms - Status: ${health.status}`);

  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json({
    ...health,
    duration,
    environment: process.env.NODE_ENV || 'unknown'
  }, { status: statusCode });
} 