import { NextRequest, NextResponse } from 'next/server';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { PrismaClient } from '@prisma/client';

// Initialize performance monitor with Prisma
const prisma = new PrismaClient();
const performanceMonitor = getPerformanceMonitor(prisma);

// Performance monitoring middleware
export function createPerformanceMiddleware() {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = performance.now();
    const { pathname, searchParams } = request.nextUrl;
    const method = request.method;
    
    // Skip monitoring for static assets and internal Next.js routes
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname.includes('.') && !pathname.startsWith('/api/') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    let response: NextResponse;
    let statusCode = 200;
    let errorMessage: string | undefined;

    try {
      // Continue with the request
      response = NextResponse.next();
      statusCode = response.status;
    } catch (error) {
      statusCode = 500;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }

    const duration = performance.now() - startTime;

    // Extract user ID from headers or session if available
    const userId = request.headers.get('x-user-id') || undefined;

    // Track the API call
    performanceMonitor.trackAPICall({
      method,
      route: pathname,
      duration,
      statusCode,
      userId,
      errorMessage,
    });

    return response;
  };
}

// Wrapper for API route handlers to track performance
export function withPerformanceTracking<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  routeName: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await handler(...args);
      const duration = performance.now() - startTime;
      
      performanceMonitor.trackAPICall({
        method: 'HANDLER',
        route: routeName,
        duration,
        statusCode: 200,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      performanceMonitor.trackAPICall({
        method: 'HANDLER',
        route: routeName,
        duration,
        statusCode: 500,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
}

// Enhanced error handling with performance tracking
export class PerformanceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public performanceData?: {
      duration: number;
      route: string;
      method: string;
    }
  ) {
    super(message);
    this.name = 'PerformanceError';
  }
}

// Helper function to time async operations
export async function timeAsyncOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: { route?: string; userId?: string }
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    console.log(`⏱️ ${operationName} completed in ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

// Memory usage tracker
export function trackMemoryUsage(operation: string): NodeJS.MemoryUsage {
  const memoryUsage = process.memoryUsage();
  const memoryMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
  };
  
  console.log(`💾 Memory usage for ${operation}:`, memoryMB);
  return memoryUsage;
}