/**
 * Advanced HTTP API Client
 * Type-safe HTTP client with retry logic, caching, and comprehensive error handling
 */

import type { 
  ApiResponse, 
  ApiError, 
  RequestConfig, 
  HttpMethod, 
  Result,
  PromiseResult
} from '@/types';
import config from '@/config/app.config';
import { logger, cache, retry, sleep } from '@/utils';

export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

export interface ResponseInterceptor<T> {
  (response: ApiResponse<T>): ApiResponse<T> | Promise<ApiResponse<T>>;
}

export interface ErrorInterceptor {
  (error: ApiError): ApiError | Promise<ApiError>;
}

export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetryAttempts: number;
  private defaultRetryDelay: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor<any>[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  constructor() {
    this.baseURL = config.api.baseURL;
    this.defaultTimeout = config.api.timeout;
    this.defaultRetryAttempts = config.api.retryAttempts;
    this.defaultRetryDelay = config.api.retryDelay;

    // Add default request interceptor for logging
    this.addRequestInterceptor((config) => {
      logger.debug('API Request', {
        method: config.method,
        url: config.url,
        headers: config.headers
      });
      return config;
    });

    // Add default response interceptor for logging
    this.addResponseInterceptor((response) => {
      logger.debug('API Response', {
        status: response.status,
        url: response.config.url,
        dataSize: JSON.stringify(response.data).length
      });
      return response;
    });

    // Add default error interceptor for logging
    this.addErrorInterceptor((error) => {
      logger.error('API Error', {
        status: error.status,
        code: error.code,
        message: error.message
      });
      return error;
    });
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.setDefaultHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Remove authorization header
   */
  clearAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseUrl}${path}`;
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let modifiedError = error;

    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }

    return modifiedError;
  }

  /**
   * Create AbortController with timeout
   */
  private createAbortController(timeout: number): AbortController {
    const controller = new AbortController();
    
    setTimeout(() => {
      controller.abort();
    }, timeout);

    return controller;
  }

  /**
   * Parse error response
   */
  private async parseError(response: Response, url: string): Promise<ApiError> {
    let message = `HTTP ${response.status}`;
    let code = response.status.toString();
    let data: unknown = null;

    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
      code = errorData.code || code;
      data = errorData;
    } catch {
      // If parsing fails, use status text
      message = response.statusText || message;
    }

    // Map common HTTP status codes to user-friendly messages
    const statusMessages: Record<number, string> = {
      400: config.messages.errors.validation,
      401: config.messages.errors.unauthorized,
      403: config.messages.errors.forbidden,
      404: config.messages.errors.notFound,
      408: config.messages.errors.timeout,
      500: config.messages.errors.server,
      502: config.messages.errors.server,
      503: config.messages.errors.server,
      504: config.messages.errors.timeout
    };

    const userFriendlyMessage = statusMessages[response.status] || config.messages.errors.general;

    return {
      message: userFriendlyMessage,
      code,
      status: response.status,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error: ApiError): boolean {
    // Retry on network errors, timeouts, and server errors (5xx)
    return error.status >= 500 || error.status === 408 || error.status === 0;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
  }

  /**
   * Core request method
   */
  private async makeRequest<T>(config: RequestConfig): Promise<Result<T, ApiError>> {
    try {
      // Apply request interceptors
      const modifiedConfig = await this.applyRequestInterceptors(config);

      // Merge headers
      const headers = {
        ...this.defaultHeaders,
        ...modifiedConfig.headers
      };

      // Create abort controller
      const timeout = modifiedConfig.timeout || this.defaultTimeout;
      const controller = this.createAbortController(timeout);

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: modifiedConfig.method,
        headers,
        signal: controller.signal
      };

      // Add body for non-GET requests
      if (modifiedConfig.body && modifiedConfig.method !== 'GET') {
        fetchOptions.body = typeof modifiedConfig.body === 'string' 
          ? modifiedConfig.body 
          : JSON.stringify(modifiedConfig.body);
      }

      // Make the request
      const response = await fetch(modifiedConfig.url, fetchOptions);

      // Handle non-2xx responses
      if (!response.ok) {
        const error = await this.parseError(response, modifiedConfig.url);
        const modifiedError = await this.applyErrorInterceptors(error);
        return { success: false, error: modifiedError };
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as T;
      }

      // Create response object
      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config: modifiedConfig
      };

      // Apply response interceptors
      const modifiedResponse = await this.applyResponseInterceptors(apiResponse);

      return { success: true, data: modifiedResponse.data };

    } catch (error) {
      // Handle fetch errors (network, timeout, etc.)
      let apiError: ApiError;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          apiError = {
            message: config.messages.errors.timeout,
            code: 'TIMEOUT',
            status: 408,
            timestamp: new Date().toISOString()
          };
        } else {
          apiError = {
            message: config.messages.errors.network,
            code: 'NETWORK_ERROR',
            status: 0,
            data: error.message,
            timestamp: new Date().toISOString()
          };
        }
      } else {
        apiError = {
          message: config.messages.errors.general,
          code: 'UNKNOWN_ERROR',
          status: 0,
          data: error,
          timestamp: new Date().toISOString()
        };
      }

      const modifiedError = await this.applyErrorInterceptors(apiError);
      return { success: false, error: modifiedError };
    }
  }

  /**
   * Request with retry logic
   */
  private async requestWithRetry<T>(config: RequestConfig): Promise<Result<T, ApiError>> {
    const retryAttempts = config.retryAttempts ?? this.defaultRetryAttempts;
    const retryDelay = this.defaultRetryDelay;
    
    let lastError: ApiError;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      const result = await this.makeRequest<T>(config);

      if (result.success) {
        if (attempt > 1) {
          logger.info('Request succeeded after retry', { 
            url: config.url, 
            attempt, 
            totalAttempts: retryAttempts 
          });
        }
        return result;
      }

      lastError = result.error;

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === retryAttempts || !this.isRetryableError(lastError)) {
        break;
      }

      // Calculate delay and wait
      const delay = this.calculateRetryDelay(attempt, retryDelay);
      logger.warn('Request failed, retrying', { 
        url: config.url, 
        attempt, 
        nextRetryIn: `${delay}ms`,
        error: lastError.message 
      });

      await sleep(delay);
    }

    return { success: false, error: lastError! };
  }

  /**
   * Get cached response or make request
   */
  private async getCachedOrFetch<T>(
    config: RequestConfig,
    cacheKey?: string
  ): Promise<Result<T, ApiError>> {
    // Only cache GET requests
    if (config.method !== 'GET' || !config.cache || !cacheKey) {
      return this.requestWithRetry<T>(config);
    }

    // Try to get from cache
    const cached = cache.get<T>(cacheKey);
    if (cached !== null) {
      logger.debug('Response served from cache', { url: config.url, cacheKey });
      return { success: true, data: cached };
    }

    // Make request and cache result
    const result = await this.requestWithRetry<T>(config);
    
    if (result.success && config.cache.ttl) {
      cache.set(cacheKey, result.data, { ttl: config.cache.ttl });
      logger.debug('Response cached', { url: config.url, cacheKey });
    }

    return result;
  }

  /**
   * Generic request method
   */
  async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    options: Partial<RequestConfig> = {}
  ): PromiseResult<T> {
    const config: RequestConfig = {
      method,
      url: this.buildUrl(endpoint),
      body: data,
      timeout: options.timeout || this.defaultTimeout,
      retryAttempts: options.retryAttempts || this.defaultRetryAttempts,
      headers: options.headers,
      cache: options.cache
    };

    const cacheKey = options.cache?.key || 
      (method === 'GET' ? `${method}:${config.url}` : undefined);

    return this.getCachedOrFetch<T>(config, cacheKey);
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    options: Partial<RequestConfig> = {}
  ): PromiseResult<T> {
    return this.request<T>('GET', endpoint, undefined, {
      ...options,
      cache: options.cache || { ttl: config.cache.ttl }
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestConfig> = {}
  ): PromiseResult<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestConfig> = {}
  ): PromiseResult<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestConfig> = {}
  ): PromiseResult<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: Partial<RequestConfig> = {}
  ): PromiseResult<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Upload file
   */
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): PromiseResult<T> {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ success: true, data });
          } catch {
            resolve({ success: true, data: xhr.responseText as T });
          }
        } else {
          const error: ApiError = {
            message: config.messages.errors.server,
            code: xhr.status.toString(),
            status: xhr.status,
            timestamp: new Date().toISOString()
          };
          resolve({ success: false, error });
        }
      });

      xhr.addEventListener('error', () => {
        const error: ApiError = {
          message: config.messages.errors.network,
          code: 'NETWORK_ERROR',
          status: 0,
          timestamp: new Date().toISOString()
        };
        resolve({ success: false, error });
      });

      xhr.open('POST', this.buildUrl(endpoint));
      
      // Add auth header if available
      if (this.defaultHeaders.Authorization) {
        xhr.setRequestHeader('Authorization', this.defaultHeaders.Authorization);
      }

      xhr.send(formData);
    });
  }

  /**
   * Download file
   */
  async download(
    endpoint: string,
    filename?: string
  ): Promise<Result<Blob, ApiError>> {
    const result = await this.get<Blob>(endpoint, {
      headers: { Accept: 'application/octet-stream' }
    });

    if (result.success && filename) {
      // Trigger download
      const url = URL.createObjectURL(result.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return result;
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    // In a real implementation, you'd keep track of all active requests
    // and abort them here. For simplicity, this is a placeholder.
    logger.info('All pending requests cancelled');
  }

  /**
   * Get client configuration
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      timeout: this.defaultTimeout,
      retryAttempts: this.defaultRetryAttempts,
      retryDelay: this.defaultRetryDelay,
      defaultHeaders: { ...this.defaultHeaders }
    };
  }
}

// Create and export default API client instance
export const apiClient = new ApiClient();

export default apiClient;