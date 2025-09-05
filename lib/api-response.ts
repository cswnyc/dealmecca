import { NextResponse } from 'next/server';
import { logger, LogCategory } from './logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  userMessage?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  errors?: ApiError[];
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    };
    performance?: {
      duration: number;
      cached: boolean;
    };
  };
}

/**
 * Standardized API response utility for consistent error handling
 */
export class ApiResponseHandler {
  private static instance: ApiResponseHandler;

  static getInstance(): ApiResponseHandler {
    if (!ApiResponseHandler.instance) {
      ApiResponseHandler.instance = new ApiResponseHandler();
    }
    return ApiResponseHandler.instance;
  }

  /**
   * Create success response
   */
  success<T>(
    data: T,
    meta?: ApiResponse<T>['meta'],
    status: number = 200
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Create error response
   */
  error(
    error: ApiError | string,
    status: number = 500,
    category: LogCategory = 'api',
    context?: any
  ): NextResponse<ApiResponse> {
    const apiError: ApiError = typeof error === 'string' 
      ? { code: 'GENERIC_ERROR', message: error }
      : error;

    // Log the error
    logger.error(category, `API Error: ${apiError.message}`, {
      code: apiError.code,
      details: apiError.details,
      context,
    });

    const response: ApiResponse = {
      success: false,
      error: {
        ...apiError,
        userMessage: apiError.userMessage || this.getUserFriendlyMessage(apiError.code, status),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Create validation error response
   */
  validationError(
    errors: ApiError[] | ZodError,
    context?: any
  ): NextResponse<ApiResponse> {
    let apiErrors: ApiError[];

    if (errors instanceof ZodError) {
      apiErrors = errors.errors.map(err => ({
        code: 'VALIDATION_ERROR',
        message: err.message,
        field: err.path.join('.'),
        userMessage: this.formatValidationMessage(err.path.join('.'), err.message),
      }));
    } else {
      apiErrors = errors;
    }

    // Log validation errors
    logger.warn('api', 'Validation errors', {
      errors: apiErrors,
      context,
    });

    const response: ApiResponse = {
      success: false,
      errors: apiErrors,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 400 });
  }

  /**
   * Handle common errors automatically
   */
  handleError(
    error: any,
    category: LogCategory = 'api',
    context?: any
  ): NextResponse<ApiResponse> {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return this.validationError(error, context);
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error, context);
    }

    // Handle custom API errors
    if (error.code && error.message) {
      return this.error(error, error.status || 500, category, context);
    }

    // Handle generic errors
    const genericError: ApiError = {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    return this.error(genericError, 500, category, context);
  }

  /**
   * Handle Prisma-specific errors
   */
  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    context?: any
  ): NextResponse<ApiResponse> {
    let apiError: ApiError;

    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(', ') || 'field';
        apiError = {
          code: 'DUPLICATE_ENTRY',
          message: `Duplicate entry for ${field}`,
          field,
          userMessage: `This ${field} already exists. Please use a different value.`,
        };
        return this.error(apiError, 409, 'database', context);

      case 'P2025':
        // Record not found
        apiError = {
          code: 'NOT_FOUND',
          message: 'Record not found',
          userMessage: 'The requested item could not be found.',
        };
        return this.error(apiError, 404, 'database', context);

      case 'P2003':
        // Foreign key constraint violation
        apiError = {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Related record not found',
          userMessage: 'Cannot perform this action due to related data constraints.',
        };
        return this.error(apiError, 400, 'database', context);

      case 'P2014':
        // Required relation violation
        apiError = {
          code: 'REQUIRED_RELATION_VIOLATION',
          message: 'Required relationship missing',
          userMessage: 'Missing required related data.',
        };
        return this.error(apiError, 400, 'database', context);

      default:
        apiError = {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          userMessage: 'A database error occurred. Please try again.',
        };
        return this.error(apiError, 500, 'database', context);
    }
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyMessage(code: string, status: number): string {
    const messages: Record<string, string> = {
      // Authentication errors
      'UNAUTHORIZED': 'Please log in to access this resource.',
      'FORBIDDEN': 'You don\'t have permission to perform this action.',
      'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
      'INVALID_CREDENTIALS': 'Invalid email or password.',

      // Validation errors
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'INVALID_INPUT': 'The provided data is not valid.',
      'REQUIRED_FIELD': 'This field is required.',

      // Resource errors
      'NOT_FOUND': 'The requested item could not be found.',
      'DUPLICATE_ENTRY': 'This item already exists.',
      'RESOURCE_LIMIT_EXCEEDED': 'You\'ve reached the maximum limit for this resource.',

      // Rate limiting
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait before trying again.',
      'QUOTA_EXCEEDED': 'You\'ve exceeded your usage quota.',

      // Search errors
      'SEARCH_FAILED': 'Search is temporarily unavailable. Please try again.',
      'SEARCH_TIMEOUT': 'Search took too long to complete. Please try a simpler query.',

      // Import/Export errors
      'IMPORT_FAILED': 'Failed to import data. Please check your file format.',
      'EXPORT_FAILED': 'Failed to export data. Please try again.',

      // Code generation errors
      'CODE_GENERATION_FAILED': 'Code generation failed. Please try again.',
      'INVALID_CODE_REQUEST': 'Invalid code generation request.',

      // Forum errors
      'POST_CREATION_FAILED': 'Failed to create post. Please try again.',
      'COMMENT_CREATION_FAILED': 'Failed to add comment. Please try again.',

      // System errors
      'INTERNAL_SERVER_ERROR': 'An unexpected error occurred. Please try again.',
      'SERVICE_UNAVAILABLE': 'This service is temporarily unavailable.',
      'MAINTENANCE_MODE': 'The system is currently under maintenance.',
    };

    return messages[code] || this.getGenericMessage(status);
  }

  /**
   * Get generic messages based on HTTP status
   */
  private getGenericMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Authentication required.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict with existing data.';
      case 422:
        return 'Unable to process your request.';
      case 429:
        return 'Too many requests. Please wait.';
      case 500:
        return 'Server error. Please try again.';
      case 502:
        return 'Service temporarily unavailable.';
      case 503:
        return 'Service under maintenance.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Format validation error messages
   */
  private formatValidationMessage(field: string, message: string): string {
    const fieldName = field.split('.').pop() || 'field';
    const formattedField = fieldName.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    // Common validation message patterns
    if (message.includes('required')) {
      return `${formattedField} is required.`;
    }
    if (message.includes('email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('minimum')) {
      return `${formattedField} is too short.`;
    }
    if (message.includes('maximum')) {
      return `${formattedField} is too long.`;
    }
    if (message.includes('invalid')) {
      return `${formattedField} is not valid.`;
    }

    return message;
  }

  /**
   * Create paginated response
   */
  paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    },
    performance?: {
      duration: number;
      cached: boolean;
    }
  ): NextResponse<ApiResponse<T[]>> {
    return this.success(data, {
      pagination,
      performance,
    });
  }

  /**
   * Create cached response
   */
  cached<T>(
    data: T,
    cacheInfo: {
      cached: boolean;
      ttl?: number;
      key?: string;
    },
    status: number = 200
  ): NextResponse<ApiResponse<T>> {
    return this.success(data, {
      performance: {
        duration: 0,
        cached: cacheInfo.cached,
      },
    }, status);
  }
}

// Export singleton instance
export const apiResponse = ApiResponseHandler.getInstance();

// Convenience functions for common patterns
export const successResponse = <T>(data: T, meta?: any, status?: number) =>
  apiResponse.success(data, meta, status);

export const errorResponse = (error: ApiError | string, status?: number, category?: LogCategory, context?: any) =>
  apiResponse.error(error, status, category, context);

export const validationErrorResponse = (errors: ApiError[] | ZodError, context?: any) =>
  apiResponse.validationError(errors, context);

export const handleApiError = (error: any, category?: LogCategory, context?: any) =>
  apiResponse.handleError(error, category, context);

// Pre-defined error responses for common scenarios
export const unauthorizedResponse = (message?: string) =>
  errorResponse({
    code: 'UNAUTHORIZED',
    message: message || 'Authentication required',
  }, 401, 'auth');

export const forbiddenResponse = (message?: string) =>
  errorResponse({
    code: 'FORBIDDEN',
    message: message || 'Access denied',
  }, 403, 'auth');

export const notFoundResponse = (resource?: string) =>
  errorResponse({
    code: 'NOT_FOUND',
    message: `${resource || 'Resource'} not found`,
  }, 404);

export const rateLimitResponse = (retryAfter?: number) =>
  errorResponse({
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
    details: retryAfter ? { retryAfter } : undefined,
  }, 429);

export const maintenanceResponse = () =>
  errorResponse({
    code: 'MAINTENANCE_MODE',
    message: 'System is under maintenance',
  }, 503, 'system');