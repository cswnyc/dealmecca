import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

/**
 * Metadata provided to wrapped handlers.
 */
export interface HandlerMeta {
  /** Unique request ID for tracing */
  requestId: string;
  /** Request start timestamp (ms) */
  start: number;
}

/**
 * Generic API route handler function type.
 * Returns NextResponse with typed JSON data.
 */
type Handler<T = any> = (
  req: NextRequest,
  ctx: any,
  meta: HandlerMeta
) => Promise<NextResponse<T>> | NextResponse<T>;

/**
 * Wraps API route handlers with standardized error handling and diagnostics.
 *
 * Features:
 * - Generates unique requestId for each request
 * - Automatically adds x-request-id header to all responses
 * - Catches and logs all uncaught errors with context
 * - Returns consistent JSON error format
 * - Tracks request timing
 *
 * Usage:
 * ```typescript
 * export const POST = safeHandler(async (req, ctx, { requestId, start }) => {
 *   // Your handler logic here
 *   return NextResponse.json({ success: true });
 * });
 * ```
 *
 * @param fn - The handler function to wrap
 * @returns Wrapped handler with error handling
 */
export function safeHandler<T = any>(fn: Handler<T>) {
  return async (req: NextRequest, ctx: any) => {
    // Generate or extract request ID
    const requestId = req.headers.get('x-request-id') || randomUUID();
    const start = Date.now();

    try {
      // Execute the wrapped handler
      const res = await fn(req, ctx, { requestId, start });

      // Ensure requestId and response time are echoed in response
      res.headers.set('x-request-id', requestId);
      res.headers.set('x-response-time-ms', String(Date.now() - start));

      return res;
    } catch (e: any) {
      // Calculate request duration
      const ms = Date.now() - start;

      // Extract error details
      const detail = e?.meta?.cause || e?.message || String(e);
      const stack = e?.stack;

      // Structured error logging
      console.error('[api-error]', {
        requestId,
        url: req.nextUrl.pathname,
        method: req.method,
        ms,
        detail,
        stack: stack ? stack.split('\n').slice(0, 5).join('\n') : undefined,
      });

      // Return standardized error response
      return NextResponse.json(
        {
          error: 'server_error',
          requestId,
          detail,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'x-request-id': requestId,
            'x-response-time-ms': String(ms),
          },
        }
      );
    }
  };
}

/**
 * Helper function to create standardized error responses.
 *
 * Usage:
 * ```typescript
 * if (!content) return bad(400, requestId, 'invalid_content', { field: 'content' });
 * if (!post) return bad(404, requestId, 'post_not_found');
 * ```
 *
 * @param status - HTTP status code
 * @param requestId - Request ID for tracing
 * @param error - Error code/message
 * @param extra - Optional additional data to include
 * @returns NextResponse with error JSON
 */
export function bad(
  status: number,
  requestId: string,
  error: string,
  extra?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      error,
      requestId,
      timestamp: new Date().toISOString(),
      ...(extra || {}),
    },
    {
      status,
      headers: { 'x-request-id': requestId },
    }
  );
}
