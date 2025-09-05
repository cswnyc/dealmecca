import { prisma } from '@/lib/prisma';

export interface SimpleAnalytics {
  trackEvent(eventType: string, data: any, userId?: string): Promise<void>;
  trackSearch(query: string, results: number, userId?: string): Promise<void>;
  getAnalytics(timeframe?: 'day' | 'week' | 'month'): Promise<any>;
  getUserAnalytics(userId: string, dateRange?: { start: Date; end: Date }): Promise<any>;
}

class SimpleAnalyticsTracker implements SimpleAnalytics {
  async trackEvent(eventType: string, data: any, userId?: string): Promise<void> {
    try {
      await prisma.analytics_events.create({
        data: {
          id: `${eventType}_${Date.now()}_${Math.random()}`,
          userId: userId || null,
          sessionId: this.getSessionId(),
          eventType,
          eventCategory: 'user_action',
          eventAction: eventType,
          eventLabel: data.label || null,
          eventValue: data.value || null,
          metadata: data,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  async trackSearch(query: string, results: number, userId?: string): Promise<void> {
    await this.trackEvent('search_performed', {
      query,
      results,
      timestamp: new Date()
    }, userId);
  }

  async getAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    try {
      const events = await prisma.analytics_events.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        totalEvents: events.length,
        eventsByType: events.reduce((acc, event) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        events: events.slice(0, 100) // Return latest 100 events
      };
    } catch (error) {
      console.warn('Analytics query failed:', error);
      return { totalEvents: 0, eventsByType: {}, events: [] };
    }
  }

  async getUserAnalytics(userId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const where: any = { userId };
      if (dateRange) {
        where.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      const events = await prisma.analytics_events.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      const searches = events.filter(e => e.eventType === 'search_performed');
      const contacts = events.filter(e => e.eventType.includes('contact_'));

      return {
        summary: {
          totalSearches: searches.length,
          totalSessions: new Set(events.map(e => e.sessionId)).size,
          avgSessionDuration: 0, // Placeholder
          contactsViewed: contacts.filter(e => e.eventType === 'contact_viewed').length,
          emailsRevealed: contacts.filter(e => e.eventType === 'contact_email_revealed').length,
          totalResults: searches.reduce((sum, s) => sum + (s.eventValue || 0), 0)
        },
        events: events.slice(0, 50).map(event => ({
          type: event.eventType,
          properties: event.metadata || {},
          timestamp: event.createdAt,
          device: 'desktop', // Placeholder
          path: event.eventLabel || '/'
        })),
        searches: searches.slice(0, 25).map(search => ({
          query: search.eventLabel || '',
          results: search.eventValue || 0,
          loadTime: 500, // Placeholder
          contactsViewed: 0, // Placeholder
          emailsRevealed: 0, // Placeholder
          timestamp: search.createdAt
        })),
        sessions: [] // Placeholder
      };
    } catch (error) {
      console.warn('getUserAnalytics failed:', error);
      return {
        summary: {
          totalSearches: 0,
          totalSessions: 0,
          avgSessionDuration: 0,
          contactsViewed: 0,
          emailsRevealed: 0,
          totalResults: 0
        },
        events: [],
        searches: [],
        sessions: []
      };
    }
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem('analytics_session', sessionId);
      }
      return sessionId;
    }
    return `server_session_${Date.now()}_${Math.random()}`;
  }
}

export const simpleAnalytics = new SimpleAnalyticsTracker();