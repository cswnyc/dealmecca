import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, RBAC_CONFIGS } from '@/middleware/rbac';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const protection = await rbacMiddleware.protect(request, RBAC_CONFIGS.VIEW_PREMIUM_DATA);
    
    if (!protection.success || !protection.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = protection.user;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || 'month';
    const userId = searchParams.get('userId');
    
    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setHours(now.getHours() - 24);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };
    
    if (userId && userId !== 'all') {
      whereClause.userId = userId;
    }

    // Get analytics events for the period
    const events = await prisma.analytics_events.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });

    // Get previous period data for comparison
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    const periodDiff = now.getTime() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - periodDiff);

    const previousEvents = await prisma.analytics_events.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      }
    });

    // Calculate metrics
    const currentSearches = events.filter(e => e.eventType === 'search_performed').length;
    const previousSearches = previousEvents.filter(e => e.eventType === 'search_performed').length;
    
    const currentUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    const previousUsers = new Set(previousEvents.map(e => e.userId).filter(Boolean)).size;
    
    const currentSessions = new Set(events.map(e => e.sessionId)).size;
    const previousSessions = new Set(previousEvents.map(e => e.sessionId)).size;
    
    const currentContacts = events.filter(e => e.eventType.includes('contact_')).length;
    const previousContacts = previousEvents.filter(e => e.eventType.includes('contact_')).length;

    // Calculate changes
    const searchChange = currentSearches - previousSearches;
    const searchChangePercent = previousSearches > 0 ? (searchChange / previousSearches) * 100 : 0;
    
    const userChange = currentUsers - previousUsers;
    const userChangePercent = previousUsers > 0 ? (userChange / previousUsers) * 100 : 0;
    
    const sessionChange = currentSessions - previousSessions;
    const sessionChangePercent = previousSessions > 0 ? (sessionChange / previousSessions) * 100 : 0;
    
    const contactChange = currentContacts - previousContacts;
    const contactChangePercent = previousContacts > 0 ? (contactChange / previousContacts) * 100 : 0;

    // Generate time series data
    const generateTimeSeriesData = (events: any[], periods: number) => {
      const periodMs = (now.getTime() - startDate.getTime()) / periods;
      const data = [];
      
      for (let i = 0; i < periods; i++) {
        const periodStart = new Date(startDate.getTime() + (i * periodMs));
        const periodEnd = new Date(startDate.getTime() + ((i + 1) * periodMs));
        
        const periodEvents = events.filter(e => {
          const eventDate = new Date(e.createdAt);
          return eventDate >= periodStart && eventDate < periodEnd;
        });
        
        data.push({
          period: formatPeriodLabel(periodStart, timeframe),
          value: periodEvents.length,
          label: `Activity for ${formatPeriodLabel(periodStart, timeframe)}`
        });
      }
      
      return data;
    };

    const formatPeriodLabel = (date: Date, timeframe: string) => {
      switch (timeframe) {
        case 'day':
          return date.getHours().toString().padStart(2, '0') + ':00';
        case 'week':
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        case 'month':
        case 'quarter':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'year':
          return date.toLocaleDateString('en-US', { month: 'short' });
        default:
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    };

    // Build response
    const trendData = {
      metrics: [
        {
          id: 'total_searches',
          title: 'Total Searches',
          value: currentSearches,
          change: searchChange,
          changePercent: searchChangePercent,
          trend: searchChangePercent > 0 ? 'up' : searchChangePercent < 0 ? 'down' : 'stable',
          period: 'vs previous period',
          format: 'number'
        },
        {
          id: 'active_users',
          title: 'Active Users',
          value: currentUsers,
          change: userChange,
          changePercent: userChangePercent,
          trend: userChangePercent > 0 ? 'up' : userChangePercent < 0 ? 'down' : 'stable',
          period: 'vs previous period',
          format: 'number'
        },
        {
          id: 'total_sessions',
          title: 'Total Sessions',
          value: currentSessions,
          change: sessionChange,
          changePercent: sessionChangePercent,
          trend: sessionChangePercent > 0 ? 'up' : sessionChangePercent < 0 ? 'down' : 'stable',
          period: 'vs previous period',
          format: 'number'
        },
        {
          id: 'contact_interactions',
          title: 'Contact Interactions',
          value: currentContacts,
          change: contactChange,
          changePercent: contactChangePercent,
          trend: contactChangePercent > 0 ? 'up' : contactChangePercent < 0 ? 'down' : 'stable',
          period: 'vs previous period',
          format: 'number'
        }
      ],
      timeSeriesData: generateTimeSeriesData(events, 6),
      categoryBreakdown: [
        { 
          name: 'Search Queries', 
          value: Math.round((currentSearches / events.length) * 100) || 0, 
          color: '#3B82F6' 
        },
        { 
          name: 'Contact Views', 
          value: Math.round((events.filter(e => e.eventType === 'contact_viewed').length / events.length) * 100) || 0, 
          color: '#10B981' 
        },
        { 
          name: 'Email Reveals', 
          value: Math.round((events.filter(e => e.eventType === 'contact_email_revealed').length / events.length) * 100) || 0, 
          color: '#F59E0B' 
        },
        { 
          name: 'Profile Visits', 
          value: Math.round((events.filter(e => e.eventType === 'profile_visit').length / events.length) * 100) || 0, 
          color: '#EF4444' 
        },
        { 
          name: 'Exports', 
          value: Math.round((events.filter(e => e.eventType === 'export_performed').length / events.length) * 100) || 0, 
          color: '#8B5CF6' 
        }
      ],
      userGrowth: generateTimeSeriesData(events.filter(e => e.eventType === 'user_registration'), 6),
      searchTrends: generateTimeSeriesData(events.filter(e => e.eventType === 'search_performed'), 6),
      engagementTrends: generateTimeSeriesData(events.filter(e => e.eventType.includes('contact_')), 6)
    };

    logger.info('analytics', 'Trend analytics requested', {
      userId: user.id,
      timeframe,
      totalEvents: events.length,
      searchCount: currentSearches
    });

    return NextResponse.json(trendData);

  } catch (error) {
    logger.error('analytics', 'Failed to get trend analytics', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve trend analytics' },
      { status: 500 }
    );
  }
}