import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventUrl, notes, submitterEmail } = body;

    if (!eventName || eventName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Anonymous suggestions are allowed - submitterId stays null
    const submitterId: string | null = null;

    // Check for duplicate suggestions (same name in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existingSuggestion = await prisma.eventSuggestion.findFirst({
      where: {
        eventName: {
          equals: eventName.trim(),
          mode: 'insensitive'
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    if (existingSuggestion) {
      return NextResponse.json(
        {
          message: 'This event has already been suggested recently. Thank you for your interest!',
          duplicate: true
        },
        { status: 200 }
      );
    }

    // Create the suggestion
    const suggestion = await prisma.eventSuggestion.create({
      data: {
        eventName: eventName.trim(),
        eventUrl: eventUrl?.trim() || null,
        notes: notes?.trim() || null,
        submitterEmail: submitterEmail?.trim() || null,
        submitterId
      }
    });

    return NextResponse.json({
      message: 'Thank you for your suggestion! Our team will review it shortly.',
      suggestionId: suggestion.id
    });

  } catch (error) {
    console.error('Error creating event suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to submit suggestion' },
      { status: 500 }
    );
  }
}

// GET endpoint for admin to view suggestions
// Note: Admin verification should be done via admin routes
export async function GET(request: NextRequest) {
  try {
    // For now, this endpoint requires manual admin authentication
    // In production, integrate with proper session management
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const adminKey = request.headers.get('x-admin-key');

    // Basic admin check - in production use proper session auth
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    const suggestions = await prisma.eventSuggestion.findMany({
      where: {
        status: status as any
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json(suggestions);

  } catch (error) {
    console.error('Error fetching event suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
