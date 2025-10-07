export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdmin } from '@/server/firebaseAdmin';

/**
 * Health check endpoint.
 *
 * Tests:
 * - PostgreSQL database connectivity
 * - Firebase Admin SDK initialization
 *
 * Returns:
 * - 200 OK: { ok: true, checks: {...} }
 * - 500 Error: { ok: false, error: string, checks: {...} }
 *
 * Usage:
 * - Uptime monitoring
 * - Load balancer health checks
 * - Deployment verification
 */
export async function GET() {
  const checks: Record<string, boolean | string> = {};
  const errors: string[] = [];

  try {
    // Test PostgreSQL connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (dbError: any) {
      checks.database = false;
      errors.push(`Database: ${dbError?.message || 'Connection failed'}`);
    }

    // Test Firebase Admin SDK
    try {
      const admin = getAdmin();
      await admin.auth().listUsers(1); // Smoke test
      checks.firebaseAdmin = true;
    } catch (adminError: any) {
      checks.firebaseAdmin = false;
      errors.push(`Firebase Admin: ${adminError?.message || 'Initialization failed'}`);
    }

    // Determine overall health
    const isHealthy = Object.values(checks).every(v => v === true);

    if (isHealthy) {
      return NextResponse.json({
        ok: true,
        checks,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: errors.join('; '),
          checks,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (e: any) {
    // Catch-all for unexpected errors
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || String(e),
        checks,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
