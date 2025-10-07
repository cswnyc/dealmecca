import { PrismaClient } from '@prisma/client';

/**
 * Prisma client with enhanced logging for diagnostics.
 *
 * Features:
 * - Event-based error logging ([prisma-error])
 * - Event-based warning logging ([prisma-warn])
 * - Optional slow query logging (commented out by default)
 *
 * Logs are structured JSON for easy parsing in production.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaListenersAttached: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      // Uncomment for slow query debugging:
      // { emit: 'event', level: 'query' },
    ],
  });

// Attach event listeners only once, and only at runtime (not during build)
if (
  !globalForPrisma.prismaListenersAttached &&
  typeof window === 'undefined' &&
  (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development')
) {
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

  // Uncomment for slow query logging (>50ms):
  // (prisma as any).$on('query', (e: any) => {
  //   if (e.duration > 50) {
  //     console.log('[prisma-slow]', {
  //       query: e.query,
  //       params: e.params,
  //       duration: e.duration + 'ms',
  //       timestamp: e.timestamp,
  //     });
  //   }
  // });

  globalForPrisma.prismaListenersAttached = true;
}

// In development, store prisma in global to prevent hot-reload duplicates
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
