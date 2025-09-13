import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow ADMIN role to access mention search for admin purposes
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ contacts: [] });
    }

    // Search forum users (media sellers) by name for mentions
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query
            }
          },
          {
            email: {
              contains: query
            }
          }
        ],
        NOT: {
          id: userId // Don't include the current user
        }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 10 // Limit for autocomplete dropdown
    });

    // Format for mention autocomplete - these are media sellers/community members
    const mentionSuggestions = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      displayName: `${user.name}${user.company ? ` (${user.company.name})` : ''}`,
      email: user.email,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name,
        logo: user.company.logoUrl,
        type: user.company.companyType
      } : null,
      role: user.role,
      subscriptionTier: user.subscriptionTier
    }));

    return NextResponse.json({ 
      contacts: mentionSuggestions, // Keep the same key for compatibility
      total: users.length 
    });
  } catch (error) {
    console.error('Failed to search contacts for mentions:', error);
    return NextResponse.json(
      { error: 'Failed to search contacts', contacts: [] },
      { status: 500 }
    );
  }
} 