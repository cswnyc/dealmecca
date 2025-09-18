import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
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

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Transform data to match frontend expectations (following user-facing API structure)
    const formattedEvent = {
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
    };

    return NextResponse.json(formattedEvent);

  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
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
        status,
        capacity,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        eventType,
        updatedAt: new Date()
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

    return NextResponse.json(updatedEvent);

  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}