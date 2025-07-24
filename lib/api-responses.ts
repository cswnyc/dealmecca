import { NextResponse } from 'next/server';

// Standard error codes for different types of failures
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Rate Limiting & Usage
  SEARCH_LIMIT_EXCEEDED: 'SEARCH_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Validation
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_PARAMETERS: 'MISSING_PARAMETERS',
  
  // System Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

interface ApiErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  message?: string;
  helpText?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  metadata?: Record<string, any>;
}

/**
 * Create a standardized error response for authentication failures
 */
export function createAuthError(options?: {
  message?: string;
  helpText?: string;
  metadata?: Record<string, any>;
}): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    success: false,
    error: 'Please log in to access search features',
    code: ERROR_CODES.UNAUTHORIZED,
    message: options?.message || 'Authentication is required to perform searches and access user data.',
    helpText: options?.helpText || 'Sign in to your account or create a new account to get started.',
    actionUrl: '/auth/signin',
    actionText: 'Sign In',
    metadata: options?.metadata,
  }, { status: 401 });
}

/**
 * Create a standardized error response for search limit exceeded
 */
export function createSearchLimitError(options: {
  currentUsage: number;
  limit: number;
  tier: string;
  resetDate?: string;
  metadata?: Record<string, any>;
}): NextResponse<ApiErrorResponse> {
  const isFreeTier = options.tier === 'FREE';
  
  return NextResponse.json({
    success: false,
    error: isFreeTier 
      ? 'Monthly search limit reached' 
      : 'Search quota exceeded',
    code: ERROR_CODES.SEARCH_LIMIT_EXCEEDED,
    message: isFreeTier
      ? `You've used all ${options.limit} of your monthly searches. Upgrade to Pro for unlimited searches.`
      : `You've reached your search limit of ${options.limit} for this period.`,
    helpText: isFreeTier 
      ? 'Pro and Team plans include unlimited searches, advanced filters, and export capabilities.'
      : `Your search quota will reset ${options.resetDate ? `on ${options.resetDate}` : 'next month'}.`,
    actionUrl: isFreeTier ? '/pricing' : undefined,
    actionText: isFreeTier ? 'Upgrade Now' : undefined,
    metadata: {
      currentUsage: options.currentUsage,
      limit: options.limit,
      tier: options.tier,
      resetDate: options.resetDate,
      ...options.metadata,
    },
  }, { status: 429 });
}

/**
 * Create a standardized error response for validation errors
 */
export function createValidationError(
  error: string,
  options?: {
    message?: string;
    helpText?: string;
    metadata?: Record<string, any>;
  }
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    success: false,
    error,
    code: ERROR_CODES.INVALID_REQUEST,
    message: options?.message,
    helpText: options?.helpText || 'Please check your request parameters and try again.',
    metadata: options?.metadata,
  }, { status: 400 });
}

/**
 * Create a standardized error response for internal server errors
 */
export function createInternalError(options?: {
  message?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    success: false,
    error: 'Something went wrong on our end',
    code: ERROR_CODES.INTERNAL_ERROR,
    message: options?.message || 'An unexpected error occurred while processing your request.',
    helpText: 'Please try again in a moment. If the problem persists, contact support.',
    metadata: {
      requestId: options?.requestId,
      timestamp: new Date().toISOString(),
      ...options?.metadata,
    },
  }, { status: 500 });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    metadata?: Record<string, any>;
  }
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata: options?.metadata,
  });
}

/**
 * Create a standardized error response for forbidden access
 */
export function createForbiddenError(options?: {
  message?: string;
  helpText?: string;
  requiredRole?: string;
  metadata?: Record<string, any>;
}): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    success: false,
    error: 'Access denied',
    code: ERROR_CODES.FORBIDDEN,
    message: options?.message || 'You don\'t have permission to access this resource.',
    helpText: options?.helpText || options?.requiredRole 
      ? `${options.requiredRole} access is required for this action.`
      : 'Contact your administrator if you believe you should have access.',
    metadata: options?.metadata,
  }, { status: 403 });
} 