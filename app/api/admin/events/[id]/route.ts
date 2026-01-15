import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/requireAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const event = await prisma.event.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

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
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

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
      registrationDeadline,
      eventType
    } = body;

    if (!name || !startDate || !endDate || !location || !category || !industry) {
      return NextResponse.json(
        { error: 'Name, startDate, endDate, location, category, and industry are required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.update({
      where: { id: params.id },
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
        estimatedCost: estimatedCost ? parseInt(estimatedCost) : null,
        attendeeCount: attendeeCount ? parseInt(String(attendeeCount)) : null,
        isVirtual: Boolean(isVirtual),
        isHybrid: Boolean(isHybrid),
        imageUrl,
        logoUrl,
        organizerName,
        organizerUrl,
        registrationUrl,
        callForSpeakers: Boolean(callForSpeakers),
        sponsorshipAvailable: Boolean(sponsorshipAvailable),
        status,
        capacity: capacity ? parseInt(String(capacity)) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        eventType,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(event);

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
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    await prisma.event.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
