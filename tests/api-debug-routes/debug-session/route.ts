import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return Response.json({
      hasSession: !!session,
      user: session?.user || null,
      expires: session?.expires || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      error: 'Session check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 