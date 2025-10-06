import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'startDate';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Build orderBy clause
    let orderBy: any = { startDate: 'asc' }; // default to start date

    switch (sortBy) {
      case 'created':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'rating':
        orderBy = { avgOverallRating: 'desc' };
        break;
      case 'attendees':
        orderBy = { attendeeCount: 'desc' };
        break;
      case 'startDate':
      default:
        orderBy = { startDate: 'asc' };
        break;
    }

    // Get events with relationships
    const events = await prisma.event.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            EventAttendee: true,
            EventRating: true,
            ForumPost: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.event.count({ where });

    // Get stats for dashboard
    const now = new Date();
    const stats = await Promise.all([
      prisma.event.count(), // total
      prisma.event.count({ where: { status: 'PUBLISHED' } }), // published
      prisma.event.count({ where: { status: 'DRAFT' } }), // draft
      prisma.event.count({ where: { startDate: { gte: now } } }), // upcoming
      prisma.event.count({ where: { endDate: { lt: now } } }) // past
    ]);

    const formattedStats = {
      total: stats[0],
      published: stats[1],
      draft: stats[2],
      upcoming: stats[3],
      past: stats[4]
    };

    // Transform data to match frontend expectations (following user-facing API structure)
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      website: event.website,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      venue: event.venue,
      category: event.category,
      industry: event.industry,
      estimatedCost: event.estimatedCost,
      attendeeCount: event.attendeeCount,
      isVirtual: event.isVirtual,
      isHybrid: event.isHybrid,
      imageUrl: event.imageUrl,
      logoUrl: event.logoUrl,
      organizerName: event.organizerName,
      organizerUrl: event.organizerUrl,
      registrationUrl: event.registrationUrl,
      callForSpeakers: event.callForSpeakers,
      sponsorshipAvailable: event.sponsorshipAvailable,
      status: event.status,
      capacity: event.capacity,
      registrationDeadline: event.registrationDeadline?.toISOString(),
      eventType: event.eventType,
      avgOverallRating: event.avgOverallRating,
      avgNetworkingRating: event.avgNetworkingRating,
      avgContentRating: event.avgContentRating,
      avgROIRating: event.avgROIRating,
      totalRatings: event.totalRatings,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      creator: event.User ? {
        id: event.User.id,
        name: event.User.name || 'Anonymous',
        email: event.User.email
      } : null,
      _count: {
        attendees: event._count.EventAttendee,
        ratings: event._count.EventRating,
        forumPosts: event._count.ForumPost
      }
    }));

    return NextResponse.json({
      events: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: formattedStats
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      website,
      startDate,
      endDate,
      location,
      venue,
      category,
      industry,
      estimatedCost,
      attendeeCount,
      isVirtual = false,
      isHybrid = false,
      imageUrl,
      logoUrl,
      organizerName,
      organizerUrl,
      registrationUrl,
      callForSpeakers = false,
      sponsorshipAvailable = false,
      createdBy,
      status = 'DRAFT',
      capacity,
      registrationDeadline,
      eventType
    } = body;

    if (!name || !startDate || !endDate || !location || !category || !industry) {
      return NextResponse.json(
        { error: 'Name, startDate, endDate, location, category, and industry are required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        website,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        venue,
        category,
        industry,
        estimatedCost,
        attendeeCount,
        isVirtual,
        isHybrid,
        imageUrl,
        logoUrl,
        organizerName,
        organizerUrl,
        registrationUrl,
        callForSpeakers,
        sponsorshipAvailable,
        createdBy,
        status,
        capacity,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        eventType
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            attendees: true,
            ratings: true,
            forumPosts: true
          }
        }
      }
    });

    return NextResponse.json(event, { status: 201 });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}