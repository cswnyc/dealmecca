import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    // Log the error to our database for tracking
    await prisma.$executeRaw`
      INSERT INTO error_logs (
        event_id,
        error_name,
        error_message,
        error_stack,
        component_stack,
        url,
        user_agent,
        level,
        timestamp
      ) VALUES (
        ${errorData.eventId},
        ${errorData.error.name},
        ${errorData.error.message},
        ${errorData.error.stack},
        ${errorData.errorInfo?.componentStack || ''},
        ${errorData.url},
        ${errorData.userAgent},
        ${errorData.level},
        NOW()
      )
      ON CONFLICT (event_id) DO NOTHING
    `;

    // Log to console for development
    console.error('Client Error Report:', {
      eventId: errorData.eventId,
      error: errorData.error.name + ': ' + errorData.error.message,
      url: errorData.url,
      level: errorData.level,
    });

    // If critical error, send alert (implement your alerting logic here)
    if (errorData.level === 'critical') {
      await sendCriticalErrorAlert(errorData);
    }

    return NextResponse.json({ 
      success: true, 
      eventId: errorData.eventId 
    });

  } catch (error) {
    console.error('Failed to log error report:', error);
    
    // Even if logging fails, don't throw - we don't want to create an error loop
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to log error' 
    }, { 
      status: 500 
    });
  }
}

async function sendCriticalErrorAlert(errorData: any) {
  // Implement your alerting mechanism here
  // This could be email, Slack, Discord, etc.
  
  try {
    // Example: Log critical errors for monitoring
    console.error('🚨 CRITICAL ERROR ALERT:', {
      eventId: errorData.eventId,
      error: errorData.error,
      url: errorData.url,
      timestamp: errorData.timestamp,
    });

    // You could integrate with services like:
    // - Slack webhook
    // - Discord webhook  
    // - Email service
    // - PagerDuty
    // - Sentry
    
  } catch (alertError) {
    console.error('Failed to send critical error alert:', alertError);
  }
}