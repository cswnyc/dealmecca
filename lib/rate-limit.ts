/**
 * Simple in-memory rate limiter for bulk import operations
 * Production-ready with configurable limits
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
  inProgress: boolean;
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old records every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.records.entries()) {
        if (record.resetTime < now && !record.inProgress) {
          this.records.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Check if a request should be rate limited
   * @returns { allowed: boolean, remaining: number, resetTime: number, error?: string }
   */
  check(
    identifier: string,
    config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
    retryAfter?: number;
  } {
    const now = Date.now();
    const record = this.records.get(identifier);

    // Check if there's an import in progress
    if (record?.inProgress) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        error: 'A bulk import is currently in progress. Please wait for it to complete.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      };
    }

    // No existing record or expired window
    if (!record || record.resetTime < now) {
      this.records.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
        inProgress: false
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      };
    }

    // Within window, check if limit exceeded
    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        error: config.message || `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowMs / 1000} seconds.`,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      };
    }

    // Increment and allow
    record.count++;
    this.records.set(identifier, record);

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  /**
   * Mark an import as in progress
   */
  markInProgress(identifier: string, durationMs: number = 600000) {
    const now = Date.now();
    const record = this.records.get(identifier) || {
      count: 0,
      resetTime: now + durationMs,
      inProgress: false
    };

    record.inProgress = true;
    record.resetTime = Math.max(record.resetTime, now + durationMs);
    this.records.set(identifier, record);
  }

  /**
   * Mark an import as complete
   */
  markComplete(identifier: string) {
    const record = this.records.get(identifier);
    if (record) {
      record.inProgress = false;
      this.records.set(identifier, record);
    }
  }

  /**
   * Clear rate limit for an identifier (admin override)
   */
  reset(identifier: string) {
    this.records.delete(identifier);
  }

  /**
   * Get current status for an identifier
   */
  getStatus(identifier: string): {
    count: number;
    remaining: number;
    resetTime: number;
    inProgress: boolean;
  } | null {
    const record = this.records.get(identifier);
    if (!record) return null;

    return {
      count: record.count,
      remaining: Math.max(0, 10 - record.count),
      resetTime: record.resetTime,
      inProgress: record.inProgress
    };
  }

  /**
   * Cleanup and stop interval
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.records.clear();
  }
}

// Singleton instance for the application
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

// Production-ready rate limits for bulk imports
export const BULK_IMPORT_RATE_LIMITS = {
  // Strict limits for production safety
  ENHANCED: {
    maxRequests: 5, // 5 imports per 10 minutes
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: 'Bulk import rate limit exceeded. Maximum 5 imports per 10 minutes.'
  },
  STANDARD: {
    maxRequests: 10, // 10 imports per 5 minutes
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Import rate limit exceeded. Maximum 10 imports per 5 minutes.'
  },
  // Maximum duration for a single import operation
  MAX_IMPORT_DURATION: 10 * 60 * 1000 // 10 minutes
};

// Helper function to create rate limit response
export function createRateLimitResponse(result: ReturnType<RateLimiter['check']>) {
  return new Response(
    JSON.stringify({
      error: result.error || 'Rate limit exceeded',
      retryAfter: result.retryAfter,
      resetTime: new Date(result.resetTime).toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000))
      }
    }
  );
}
