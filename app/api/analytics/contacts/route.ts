import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await rbacMiddleware.protect(request, {
      requiredPermissions: ['search_analytics:view']
    });
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get contact interaction events
    const contactEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        event: {
          in: [
            'contact_viewed',
            'contact_email_revealed', 
            'contact_phone_revealed',
            'contact_linkedin_clicked',
            'contact_added_to_list',
            'contact_note_added'
          ]
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Process analytics data
    const analytics = processContactAnalytics(contactEvents);

    logger.info('analytics', 'Contact analytics requested', {
      userId: user.id,
      range,
      totalEvents: contactEvents.length
    });

    return NextResponse.json(analytics);

  } catch (error) {
    logger.error('analytics', 'Failed to get contact analytics', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve contact analytics' },
      { status: 500 }
    );
  }
}

function processContactAnalytics(events: any[]) {
  const totalInteractions = events.length;
  const uniqueContacts = new Set(events.map(e => e.properties?.contactId).filter(Boolean)).size;
  
  // Count interactions by type
  const interactionTypes = events.reduce((acc: Record<string, number>, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {});

  const topInteractionTypes = Object.entries(interactionTypes)
    .map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalInteractions) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // Interactions by hour
  const interactionsByTime = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: events.filter(e => new Date(e.timestamp).getHours() === hour).length
  }));

  // Group by contact for engagement analysis
  const contactInteractions = events.reduce((acc: Record<string, any>, event) => {
    const contactId = event.properties?.contactId;
    if (!contactId) return acc;

    if (!acc[contactId]) {
      acc[contactId] = {
        contactId,
        name: event.properties?.contactName || 'Unknown',
        company: event.properties?.companyName || '',
        interactions: 0,
        lastInteraction: event.timestamp,
        interactionTypes: new Set()
      };
    }

    acc[contactId].interactions++;
    acc[contactId].interactionTypes.add(event.event);
    
    if (new Date(event.timestamp) > new Date(acc[contactId].lastInteraction)) {
      acc[contactId].lastInteraction = event.timestamp;
    }

    return acc;
  }, {});

  const contactEngagement = Object.values(contactInteractions)
    .map((contact: any) => ({
      ...contact,
      interactionTypes: Array.from(contact.interactionTypes)
    }))
    .sort((a: any, b: any) => b.interactions - a.interactions);

  // Conversion funnel
  const conversionFunnel = {
    viewed: interactionTypes['contact_viewed'] || 0,
    emailRevealed: interactionTypes['contact_email_revealed'] || 0,
    phoneRevealed: interactionTypes['contact_phone_revealed'] || 0,
    linkedinClicked: interactionTypes['contact_linkedin_clicked'] || 0,
    addedToList: interactionTypes['contact_added_to_list'] || 0
  };

  return {
    totalInteractions,
    uniqueContacts,
    averageInteractionsPerContact: uniqueContacts > 0 ? totalInteractions / uniqueContacts : 0,
    topInteractionTypes,
    interactionsByTime,
    contactEngagement,
    conversionFunnel
  };
}