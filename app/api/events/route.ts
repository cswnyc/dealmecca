import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const industry = searchParams.get('industry');
    const isVirtual = searchParams.get('isVirtual');
    const status = searchParams.get('status') || 'PUBLISHED';
    const sortBy = searchParams.get('sortBy') || 'startDate';
    const upcoming = searchParams.get('upcoming') === 'true';
    
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
    
    if (category) {
      where.category = category;
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }
    
    if (isVirtual !== null && isVirtual !== undefined) {
      where.isVirtual = isVirtual === 'true';
    }
    
    if (status) {
      where.status = status;
    }
    
    if (upcoming) {
      where.startDate = { gte: new Date() };
    }

    // Build orderBy clause
    let orderBy: any = { startDate: 'asc' }; // default to upcoming events first
    
    switch (sortBy) {
      case 'startDate':
        orderBy = { startDate: 'asc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'created':
        orderBy = { createdAt: 'desc' };
        break;
      case 'updated':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'rating':
        orderBy = { avgOverallRating: 'desc' };
        break;
      case 'attendees':
        orderBy = { attendeeCount: 'desc' };
        break;
      default:
        orderBy = { startDate: 'asc' };
    }

    // Get events with relationships
    const events = await prisma.event.findMany({
      where,
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
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.event.count({ where });
    const pages = Math.ceil(total / limit);

    // Transform data to match frontend expectations
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
      creator: event.creator ? {
        id: event.creator.id,
        name: event.creator.name || 'Anonymous',
        email: event.creator.email
      } : null,
      _count: {
        attendees: event._count.attendees,
        ratings: event._count.ratings,
        forumPosts: event._count.forumPosts
      }
    }));

    return NextResponse.json({
      events: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        pages
      }
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

export async function PUT(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Use the specific event ID endpoint for updates: /api/events/[id]',
    message: 'This endpoint handles listing and creating events only'
  }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Use the specific event ID endpoint for deletion: /api/events/[id]',
    message: 'This endpoint handles listing and creating events only'
  }, { status: 405 })
}
