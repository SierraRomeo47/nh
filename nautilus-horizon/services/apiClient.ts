/**
 * API Client with built-in error handling and logging
 */

import { logger } from './logger';
import { handleApiError, getUserFriendlyError, ApiError } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiRequestOptions extends RequestInit {
  skipErrorLogging?: boolean;
  context?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
  traceId?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make API request with error handling
   */
  private async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { skipErrorLogging = false, context, ...fetchOptions } = options;
    const method = fetchOptions.method || 'GET';
    const url = `${this.baseUrl}${endpoint}`;

    try {
      logger.debug(`API Request: ${method} ${endpoint}`, {
        component: 'ApiClient',
        action: 'request',
        method,
        endpoint,
        ...context,
      });

      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.getHeaders(),
          ...fetchOptions.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = handleApiError(
          { response, request: null, message: data.message || 'Request failed' },
          endpoint,
          method,
          { component: 'ApiClient', ...context }
        );

        if (!skipErrorLogging) {
          logger.apiError(endpoint, method, response.status, new Error(apiError.message), data, context);
        }

        throw apiError;
      }

      logger.debug(`API Response: ${method} ${endpoint}`, {
        component: 'ApiClient',
        action: 'response',
        method,
        endpoint,
        status: response.status,
        ...context,
      });

      return data;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        // Already handled API error
        throw error;
      }

      // Network or other error
      const apiError = handleApiError(
        error as any,
        endpoint,
        method,
        { component: 'ApiClient', ...context }
      );

      if (!skipErrorLogging) {
        logger.error(
          `API request failed: ${method} ${endpoint}`,
          error as Error,
          { component: 'ApiClient', method, endpoint, ...context }
        );
      }

      throw apiError;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const apiGet = <T = any>(endpoint: string, options?: ApiRequestOptions) =>
  apiClient.get<T>(endpoint, options);

export const apiPost = <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
  apiClient.post<T>(endpoint, body, options);

export const apiPut = <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
  apiClient.put<T>(endpoint, body, options);

export const apiDelete = <T = any>(endpoint: string, options?: ApiRequestOptions) =>
  apiClient.delete<T>(endpoint, options);

export const apiPatch = <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
  apiClient.patch<T>(endpoint, body, options);

