/**
 * Error Handling Utilities
 * Provides consistent error handling patterns across the application
 */

import { logger } from '../services/logger';
import { LogContext } from '../services/logger';

export interface ApiError {
  code: string;
  message: string;
  traceId?: string;
  details?: any;
}

/**
 * Handle API errors consistently
 */
export function handleApiError(
  error: any,
  endpoint: string,
  method: string = 'GET',
  context?: LogContext
): ApiError {
  let apiError: ApiError;

  if (error.response) {
    // Axios error with response
    const status = error.response.status;
    const data = error.response.data;
    
    apiError = {
      code: data?.code || `HTTP_${status}`,
      message: data?.message || error.message || `HTTP ${status} Error`,
      traceId: data?.traceId,
      details: data,
    };

    logger.apiError(endpoint, method, status, error, data, context);
  } else if (error.request) {
    // Request made but no response received
    apiError = {
      code: 'NETWORK_ERROR',
      message: 'Network error: No response from server',
      details: { endpoint, method },
    };

    logger.error(
      `Network error: ${method} ${endpoint}`,
      error,
      { ...context, endpoint, method }
    );
  } else {
    // Error setting up request
    apiError = {
      code: 'REQUEST_ERROR',
      message: error.message || 'Failed to make request',
      details: { endpoint, method },
    };

    logger.error(
      `Request setup error: ${method} ${endpoint}`,
      error,
      { ...context, endpoint, method }
    );
  }

  return apiError;
}

/**
 * Create user-friendly error message
 */
export function getUserFriendlyError(error: ApiError | Error | string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // Map common error messages to user-friendly ones
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'You do not have permission to perform this action.';
    }
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'A server error occurred. Please try again later or contact support.';
    }
    return error.message;
  }

  // ApiError object
  const apiError = error as ApiError;
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    REQUEST_ERROR: 'Failed to make request. Please try again.',
    HTTP_401: 'Your session has expired. Please log in again.',
    HTTP_403: 'You do not have permission to perform this action.',
    HTTP_404: 'The requested resource was not found.',
    HTTP_500: 'A server error occurred. Please try again later or contact support.',
    HTTP_502: 'The server is temporarily unavailable. Please try again later.',
    HTTP_503: 'The service is temporarily unavailable. Please try again later.',
  };

  return errorMessages[apiError.code] || apiError.message || 'An unexpected error occurred.';
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: LogContext
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(
        `Error in ${fn.name || 'async function'}`,
        error as Error,
        context
      );
      throw error;
    }
  }) as T;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.warn('Failed to parse JSON', error as Error, {
      action: 'safeJsonParse',
      defaultValue: String(defaultValue),
    });
    return defaultValue;
  }
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  defaultValue: T,
  context?: LogContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(
      'Async operation failed',
      error as Error,
      context
    );
    return defaultValue;
  }
}

