import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createId } from '@paralleldrive/cuid2';
import { requireAdmin } from '@/server/requireAdmin';

const VALID_CATEGORIES = ['CONFERENCE', 'TRADE_SHOW', 'SUMMIT', 'WORKSHOP', 'NETWORKING', 'AWARDS', 'WEBINAR', 'MASTERCLASS'];
const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'SUSPENDED'];

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { events } = await request.json();

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        // Validate required fields
        if (!event.name || !event.startDate || !event.location) {
          errors.push(`Skipped "${event.name || 'unnamed'}": missing required fields`);
          skipped++;
          continue;
        }

        // Check for duplicate by name + startDate
        const startDate = new Date(event.startDate);
        if (isNaN(startDate.getTime())) {
          errors.push(`Skipped "${event.name}": invalid start date`);
          skipped++;
          continue;
        }

        const endDate = event.endDate ? new Date(event.endDate) : startDate;

        const existing = await prisma.event.findFirst({
          where: {
            name: { equals: event.name, mode: 'insensitive' },
            startDate: startDate,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Validate category
        const category = VALID_CATEGORIES.includes(event.category) ? event.category : 'CONFERENCE';
        const status = VALID_STATUSES.includes(event.status) ? event.status : 'PUBLISHED';

        await prisma.event.create({
          data: {
            id: createId(),
            name: event.name.trim(),
            description: event.description?.trim() || null,
            website: event.website?.trim() || null,
            startDate,
            endDate,
            location: event.location.trim(),
            venue: event.venue?.trim() || null,
            category,
            industry: event.industry?.trim() || 'MEDIA_ENTERTAINMENT',
            estimatedCost: event.estimatedCost ? parseInt(event.estimatedCost) || null : null,
            isVirtual: event.isVirtual === true,
            isHybrid: event.isHybrid === true,
            organizerName: event.organizerName?.trim() || null,
            organizerUrl: event.organizerUrl?.trim() || null,
            registrationUrl: event.registrationUrl?.trim() || null,
            capacity: event.capacity ? parseInt(event.capacity) || null : null,
            eventType: event.eventType?.trim() || null,
            status,
            updatedAt: new Date(),
          },
        });

        created++;
      } catch (err: any) {
        errors.push(`Error importing "${event.name}": ${err.message}`);
      }
    }

    return NextResponse.json({ created, skipped, errors });
  } catch (error: any) {
    console.error('[BULK IMPORT EVENTS ERROR]', error);
    return NextResponse.json({ error: 'Import failed: ' + error.message }, { status: 500 });
  }
}
