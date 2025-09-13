import { NextRequest, NextResponse } from 'next/server';
import { Industry } from '@prisma/client';

// Map of Industry enum values to user-friendly display names
const INDUSTRY_DISPLAY_NAMES: Record<Industry, string> = {
  ADVERTISING_TECH: 'Advertising Technology',
  MEDIA_AGENCY: 'Media Agency',
  CREATIVE_AGENCY: 'Creative Agency',
  BRAND: 'Brand',
  PUBLISHER: 'Publisher',
  TECHNOLOGY: 'Technology',
  DATA_ANALYTICS: 'Data & Analytics',
  ECOMMERCE: 'E-commerce',
  CONSULTING: 'Consulting',
  OTHER: 'Other'
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow ADMIN role to access industry tagging
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (query.length < 2) {
      return NextResponse.json({ industries: [] });
    }

    // Filter industries based on query matching display name or enum value
    const filteredIndustries = Object.entries(INDUSTRY_DISPLAY_NAMES)
      .filter(([enumValue, displayName]) => 
        displayName.toLowerCase().includes(query) ||
        enumValue.toLowerCase().includes(query)
      )
      .slice(0, 10) // Limit to 10 results
      .map(([enumValue, displayName]) => ({
        id: enumValue,
        name: displayName,
        displayName: displayName,
        type: 'industry',
        enumValue: enumValue as Industry
      }));

    return NextResponse.json({ industries: filteredIndustries });
  } catch (error) {
    console.error('Error searching industries:', error);
    return NextResponse.json({ error: 'Failed to search industries' }, { status: 500 });
  }
}