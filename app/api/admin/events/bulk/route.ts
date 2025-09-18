import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, eventIds } = body;

    if (!action || !eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and eventIds are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'publish':
        updateData = { status: 'PUBLISHED' };
        break;
      case 'unpublish':
        updateData = { status: 'DRAFT' };
        break;
      case 'cancel':
        updateData = { status: 'CANCELLED' };
        break;
      case 'postpone':
        updateData = { status: 'POSTPONED' };
        break;
      case 'delete':
        // Delete the events
        await prisma.event.deleteMany({
          where: {
            id: { in: eventIds }
          }
        });
        return NextResponse.json({
          message: `${eventIds.length} events deleted successfully`
        });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update the events
    const result = await prisma.event.updateMany({
      where: {
        id: { in: eventIds }
      },
      data: updateData
    });

    return NextResponse.json({
      message: `${result.count} events updated with ${action} action`,
      count: result.count
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}