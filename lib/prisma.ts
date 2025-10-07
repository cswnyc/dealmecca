import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma client with enhanced logging for diagnostics.
 *
 * Logs:
 * - [prisma-error] Database errors with full context
 * - [prisma-warn] Warnings (e.g., deprecations)
 * - [prisma-slow] Queries taking >50ms (commented out by default - enable for debugging)
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  })

// Log database errors
(prisma as any).$on('error', (e: any) => {
  console.error('[prisma-error]', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp,
  });
});

// Log warnings (deprecations, etc.)
(prisma as any).$on('warn', (e: any) => {
  console.warn('[prisma-warn]', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp,
  });
});

// Log slow queries (>50ms) - OPTIONAL: Comment out if too verbose
// Uncomment the block below to enable slow query logging for performance debugging
/*
(prisma as any).$on('query', (e: any) => {
  if (e.duration > 50) {
    console.log('[prisma-slow]', {
      query: e.query,
      params: e.params,
      duration: e.duration + 'ms',
      timestamp: e.timestamp,
    });
  }
});
*/

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 