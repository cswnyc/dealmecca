import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Format the response
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
