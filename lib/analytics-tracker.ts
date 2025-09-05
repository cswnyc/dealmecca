import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export type AnalyticsEvent = 
  // Search Events
  | 'search_performed'
  | 'search_filters_applied'
  | 'search_results_viewed'
  | 'search_saved'
  | 'search_shared'
  | 'search_exported'
  
  // Contact Events
  | 'contact_viewed'
  | 'contact_email_revealed'
  | 'contact_phone_revealed'
  | 'contact_linkedin_clicked'
  | 'contact_added_to_list'
  | 'contact_note_added'
  
  // Company Events
  | 'company_viewed'
  | 'company_employees_viewed'
  | 'company_details_expanded'
  
  // User Engagement
  | 'session_started'
  | 'session_ended'
  | 'feature_used'
  | 'tutorial_completed'
  | 'feedback_submitted'
  
  // Business Events
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'payment_completed'
  | 'trial_started'
  | 'trial_ended'
  
  // System Events
  | 'error_occurred'
  | 'performance_measured'
  | 'api_request_made';

export interface AnalyticsEventData {
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  event: AnalyticsEvent;
  properties: Record<string, any>;
  context: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    path: string;
    device?: 'mobile' | 'tablet' | 'desktop';
    browser?: string;
    os?: string;
  };
  metadata?: Record<string, any>;
}

export interface SearchAnalytics {
  searchId: string;
  userId?: string;
  sessionId: string;
  query: string;
  filters: Record<string, any>;
  results: {
    total: number;
    returned: number;
    page: number;
    loadTime: number;
  };
  interactions: {
    contactsViewed: number;
    emailsRevealed: number;
    phonesRevealed: number;
    exported: boolean;
    saved: boolean;
  };
  timestamp: Date;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  searches: number;
  contactsViewed: number;
  features: string[];
  device: 'mobile' | 'tablet' | 'desktop';
  exitPage?: string;
}

/**
 * Comprehensive analytics tracking system
 */
export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private eventQueue: AnalyticsEventData[] = [];
  private isProcessing = false;
  private batchSize = 100;
  private flushInterval = 30000; // 30 seconds

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
      AnalyticsTracker.instance.startBatchProcessor();
    }
    return AnalyticsTracker.instance;
  }

  /**
   * Track an analytics event
   */
  async track(event: AnalyticsEvent, properties: Record<string, any>, context?: Partial<AnalyticsEventData['context']>, userId?: string): Promise<void> {
    const eventData: AnalyticsEventData = {
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date(),
      event,
      properties,
      context: {
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        device: this.detectDevice(),
        ...context
      }
    };

    // Add to queue for batch processing
    this.eventQueue.push(eventData);

    // If queue is getting large, process immediately
    if (this.eventQueue.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  /**
   * Track search analytics
   */
  async trackSearch(searchData: Omit<SearchAnalytics, 'timestamp'>): Promise<void> {
    try {
      // Use the analytics_events table instead of searchAnalytics
      await prisma.analytics_events.create({
        data: {
          id: `search_${Date.now()}_${Math.random()}`,
          userId: searchData.userId || null,
          sessionId: searchData.sessionId,
          eventType: 'search_performed',
          eventCategory: 'search',
          eventAction: 'performed',
          eventLabel: searchData.query,
          eventValue: searchData.results.total,
          metadata: {
            searchId: searchData.searchId,
            query: searchData.query,
            filters: searchData.filters,
            results: searchData.results,
            interactions: searchData.interactions
          },
          createdAt: new Date()
        }
      });

      logger.info('analytics', 'Search analytics tracked', {
        searchId: searchData.searchId,
        userId: searchData.userId,
        query: searchData.query
      });

    } catch (error) {
      logger.error('analytics', 'Failed to track search analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        searchId: searchData.searchId
      });
      throw error;
    }
  }

  /**
   * Track user session
   */
  async trackSession(sessionData: UserSession): Promise<void> {
    try {
      await prisma.userSession.upsert({
        where: { sessionId: sessionData.sessionId },
        create: {
          sessionId: sessionData.sessionId,
          userId: sessionData.userId,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          duration: sessionData.duration,
          pageViews: sessionData.pageViews,
          searches: sessionData.searches,
          contactsViewed: sessionData.contactsViewed,
          features: sessionData.features,
          device: sessionData.device,
          exitPage: sessionData.exitPage
        },
        update: {
          endTime: sessionData.endTime,
          duration: sessionData.duration,
          pageViews: sessionData.pageViews,
          searches: sessionData.searches,
          contactsViewed: sessionData.contactsViewed,
          features: sessionData.features,
          exitPage: sessionData.exitPage
        }
      });

      logger.info('analytics', 'User session tracked', {
        sessionId: sessionData.sessionId,
        userId: sessionData.userId,
        duration: sessionData.duration
      });

    } catch (error) {
      logger.error('analytics', 'Failed to track user session', {
        error,
        sessionId: sessionData.sessionId
      });
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: {
    path: string;
    loadTime: number;
    dbQueryTime?: number;
    apiResponseTime?: number;
    renderTime?: number;
    userId?: string;
  }): Promise<void> {
    try {
      await prisma.performanceMetrics.create({
        data: {
          path: metrics.path,
          loadTime: metrics.loadTime,
          dbQueryTime: metrics.dbQueryTime,
          apiResponseTime: metrics.apiResponseTime,
          renderTime: metrics.renderTime,
          userId: metrics.userId,
          timestamp: new Date()
        }
      });

      await this.track('performance_measured', {
        path: metrics.path,
        loadTime: metrics.loadTime,
        dbQueryTime: metrics.dbQueryTime,
        apiResponseTime: metrics.apiResponseTime,
        renderTime: metrics.renderTime
      }, { path: metrics.path }, metrics.userId);

    } catch (error) {
      logger.error('analytics', 'Failed to track performance metrics', {
        error,
        path: metrics.path
      });
    }
  }

  /**
   * Get user analytics data
   */
  async getUserAnalytics(userId: string, dateRange?: { start: Date; end: Date }) {
    try {
      const where: any = { userId };
      if (dateRange) {
        where.timestamp = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      const [events, searches, sessions] = await Promise.all([
        // Recent events
        prisma.analyticsEvent.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: 100,
          select: {
            event: true,
            properties: true,
            timestamp: true,
            context: true
          }
        }),

        // Search analytics
        prisma.searchAnalytics.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: 50
        }),

        // Sessions
        prisma.userSession.findMany({
          where: { userId },
          orderBy: { startTime: 'desc' },
          take: 30
        })
      ]);

      // Calculate metrics
      const totalSearches = searches.length;
      const totalSessions = sessions.length;
      const avgSessionDuration = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
        : 0;
      
      const contactsViewed = searches.reduce((sum, s) => sum + s.contactsViewed, 0);
      const emailsRevealed = searches.reduce((sum, s) => sum + s.emailsRevealed, 0);
      const totalResults = searches.reduce((sum, s) => sum + s.totalResults, 0);

      return {
        summary: {
          totalSearches,
          totalSessions,
          avgSessionDuration: Math.round(avgSessionDuration / 1000 / 60), // minutes
          contactsViewed,
          emailsRevealed,
          totalResults
        },
        events: events.map(event => ({
          type: event.event,
          properties: event.properties,
          timestamp: event.timestamp,
          device: event.context?.device,
          path: event.context?.path
        })),
        searches: searches.map(search => ({
          query: search.query,
          results: search.totalResults,
          loadTime: search.loadTime,
          contactsViewed: search.contactsViewed,
          emailsRevealed: search.emailsRevealed,
          timestamp: search.timestamp
        })),
        sessions: sessions.map(session => ({
          duration: session.duration ? Math.round(session.duration / 1000 / 60) : 0,
          pageViews: session.pageViews,
          searches: session.searches,
          device: session.device,
          startTime: session.startTime
        }))
      };

    } catch (error) {
      logger.error('analytics', 'Failed to get user analytics', { error, userId });
      throw error;
    }
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(dateRange?: { start: Date; end: Date }) {
    try {
      const where: any = {};
      if (dateRange) {
        where.timestamp = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      const [eventStats, searchStats, sessionStats, performanceStats] = await Promise.all([
        // Event statistics
        prisma.analyticsEvent.groupBy({
          by: ['event'],
          where,
          _count: true,
          orderBy: { _count: { event: 'desc' } }
        }),

        // Search statistics
        prisma.searchAnalytics.aggregate({
          where,
          _count: true,
          _avg: {
            loadTime: true,
            totalResults: true,
            contactsViewed: true
          },
          _sum: {
            totalResults: true,
            contactsViewed: true,
            emailsRevealed: true
          }
        }),

        // Session statistics
        prisma.userSession.aggregate({
          where: dateRange ? {
            startTime: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          } : {},
          _count: true,
          _avg: {
            duration: true,
            pageViews: true
          }
        }),

        // Performance statistics
        prisma.performanceMetrics.aggregate({
          where,
          _avg: {
            loadTime: true,
            dbQueryTime: true,
            apiResponseTime: true
          },
          _count: true
        })
      ]);

      return {
        events: {
          total: eventStats.reduce((sum, stat) => sum + stat._count, 0),
          breakdown: eventStats.map(stat => ({
            event: stat.event,
            count: stat._count
          }))
        },
        searches: {
          total: searchStats._count,
          avgLoadTime: searchStats._avg.loadTime,
          avgResults: searchStats._avg.totalResults,
          avgContactsViewed: searchStats._avg.contactsViewed,
          totalResults: searchStats._sum.totalResults,
          totalContactsViewed: searchStats._sum.contactsViewed,
          totalEmailsRevealed: searchStats._sum.emailsRevealed
        },
        sessions: {
          total: sessionStats._count,
          avgDuration: sessionStats._avg.duration ? Math.round(sessionStats._avg.duration / 1000 / 60) : 0,
          avgPageViews: sessionStats._avg.pageViews
        },
        performance: {
          avgLoadTime: performanceStats._avg.loadTime,
          avgDbQueryTime: performanceStats._avg.dbQueryTime,
          avgApiResponseTime: performanceStats._avg.apiResponseTime,
          totalMeasurements: performanceStats._count
        }
      };

    } catch (error) {
      logger.error('analytics', 'Failed to get system analytics', { error });
      throw error;
    }
  }

  /**
   * Process queued events in batches
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.eventQueue.splice(0, this.batchSize);

    try {
      for (const event of batch) {
        await prisma.analytics_events.create({
          data: {
            id: `event_${Date.now()}_${Math.random()}`,
            userId: event.userId || null,
            sessionId: event.sessionId,
            eventType: event.event,
            eventCategory: 'user_action',
            eventAction: event.event,
            eventLabel: event.properties?.label || null,
            eventValue: event.properties?.value || null,
            metadata: {
              properties: event.properties,
              context: event.context
            },
            createdAt: event.timestamp
          }
        });
      }

      logger.info('analytics', 'Batch processed successfully', {
        batchSize: batch.length
      });

    } catch (error) {
      logger.error('analytics', 'Failed to process analytics batch', {
        error,
        batchSize: batch.length
      });
      
      // Re-queue failed events
      this.eventQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start the batch processor
   */
  private startBatchProcessor(): void {
    setInterval(() => {
      this.processBatch();
    }, this.flushInterval);
  }

  /**
   * Get or generate session ID
   */
  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return `server_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect user's device type
   */
  private detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Flush all pending events
   */
  async flush(): Promise<void> {
    while (this.eventQueue.length > 0) {
      await this.processBatch();
    }
  }
}

// Export singleton instance
export const analyticsTracker = AnalyticsTracker.getInstance();

// Utility functions for common tracking scenarios
export const trackSearchPerformed = (searchData: Omit<SearchAnalytics, 'timestamp'>) =>
  analyticsTracker.trackSearch(searchData);

export const trackContactViewed = (contactId: string, userId?: string) =>
  analyticsTracker.track('contact_viewed', { contactId }, undefined, userId);

export const trackFeatureUsed = (feature: string, userId?: string) =>
  analyticsTracker.track('feature_used', { feature }, undefined, userId);

export const trackPerformance = (metrics: Parameters<AnalyticsTracker['trackPerformance']>[0]) =>
  analyticsTracker.trackPerformance(metrics);