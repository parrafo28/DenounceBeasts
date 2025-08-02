/**
 * Advanced API Client
 * Handles HTTP requests with retry, caching, and error handling
 */

class ApiClient {
    constructor(options = {}) {
        this.baseURL = options.baseURL || AppConfig.api.baseURL;
        this.timeout = options.timeout || AppConfig.api.timeout;
        this.retryAttempts = options.retryAttempts || AppConfig.api.retryAttempts;
        this.retryDelay = options.retryDelay || AppConfig.api.retryDelay;
        
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        this.interceptors = {
            request: [],
            response: []
        };

        this.logger = logger.child('ApiClient');
        this.eventEmitter = eventBus.namespace('api');
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }

    /**
     * Create request configuration
     */
    _createRequestConfig(url, options = {}) {
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders },
            ...options,
            url: url.startsWith('http') ? url : `${this.baseURL}${url}`
        };

        // Apply request interceptors
        let modifiedConfig = config;
        for (const interceptor of this.interceptors.request) {
            modifiedConfig = interceptor(modifiedConfig) || modifiedConfig;
        }

        return modifiedConfig;
    }

    /**
     * Execute HTTP request with retry logic
     */
    async _executeRequest(config) {
        const { url, method, headers, body, ...fetchOptions } = config;

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            // Prepare fetch options
            const requestOptions = {
                method,
                headers,
                signal: controller.signal,
                ...fetchOptions
            };

            if (body && method !== 'GET') {
                requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
            }

            this.logger.debug(`${method} ${url}`, { headers, body });

            // Execute request with retry
            const response = await Utils.retry(
                () => fetch(url, requestOptions),
                this.retryAttempts,
                this.retryDelay
            );

            clearTimeout(timeoutId);

            // Apply response interceptors
            let modifiedResponse = response;
            for (const interceptor of this.interceptors.response) {
                modifiedResponse = interceptor(modifiedResponse) || modifiedResponse;
            }

            return modifiedResponse;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 'TIMEOUT', 408);
            }
            
            throw this._handleError(error, config);
        }
    }

    /**
     * Handle API errors
     */
    _handleError(error, config) {
        this.logger.error(`Request failed: ${config.method} ${config.url}`, error);

        if (error instanceof ApiError) {
            return error;
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return new ApiError('Network error', 'NETWORK_ERROR', 0);
        }

        return new ApiError(
            error.message || 'Unknown error',
            'UNKNOWN_ERROR',
            error.status || 500
        );
    }

    /**
     * Process response
     */
    async _processResponse(response, config) {
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const error = new ApiError(
                data.message || `HTTP ${response.status}`,
                data.code || `HTTP_${response.status}`,
                response.status,
                data
            );
            
            this.eventEmitter.emit('error', { error, config });
            throw error;
        }

        this.logger.debug(`Response: ${config.method} ${config.url}`, {
            status: response.status,
            size: JSON.stringify(data).length
        });

        return {
            data,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            config
        };
    }

    /**
     * Generic request method
     */
    async request(url, options = {}) {
        const config = this._createRequestConfig(url, options);
        
        // Emit loading event
        this.eventEmitter.emit('loading', { config });

        try {
            const response = await this._executeRequest(config);
            const result = await this._processResponse(response, config);
            
            // Emit success event
            this.eventEmitter.emit('success', { result, config });
            
            return result;
        } catch (error) {
            // Emit error event
            this.eventEmitter.emit('error', { error, config });
            throw error;
        }
    }

    /**
     * HTTP method shortcuts
     */
    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    async post(url, data, options = {}) {
        return this.request(url, { 
            ...options, 
            method: 'POST', 
            body: data 
        });
    }

    async put(url, data, options = {}) {
        return this.request(url, { 
            ...options, 
            method: 'PUT', 
            body: data 
        });
    }

    async patch(url, data, options = {}) {
        return this.request(url, { 
            ...options, 
            method: 'PATCH', 
            body: data 
        });
    }

    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }

    /**
     * Request with caching
     */
    async cachedRequest(key, url, options = {}) {
        const cacheOptions = options.cache || {};
        
        return cache.getOrSet(
            key,
            () => this.request(url, options).then(response => response.data),
            cacheOptions
        );
    }

    /**
     * Upload file
     */
    async upload(url, file, options = {}) {
        const formData = new FormData();
        formData.append(options.fieldName || 'file', file);

        // Add additional fields
        if (options.fields) {
            Object.entries(options.fields).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        return this.request(url, {
            ...options,
            method: 'POST',
            headers: {
                // Don't set Content-Type, let browser set it with boundary
                ...this.defaultHeaders,
                'Content-Type': undefined
            },
            body: formData
        });
    }

    /**
     * Download file
     */
    async download(url, options = {}) {
        const response = await this.request(url, {
            ...options,
            headers: {
                ...this.defaultHeaders,
                'Accept': '*/*'
            }
        });

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        if (options.autoDownload !== false) {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = options.filename || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        return {
            blob,
            url: downloadUrl,
            cleanup: () => URL.revokeObjectURL(downloadUrl)
        };
    }

    /**
     * Batch requests
     */
    async batch(requests) {
        const promises = requests.map(({ url, options, key }) => 
            this.request(url, options)
                .then(result => ({ key, result, success: true }))
                .catch(error => ({ key, error, success: false }))
        );

        return Promise.all(promises);
    }

    /**
     * Create a new instance with different configuration
     */
    create(options = {}) {
        return new ApiClient({
            baseURL: this.baseURL,
            timeout: this.timeout,
            retryAttempts: this.retryAttempts,
            retryDelay: this.retryDelay,
            headers: { ...this.defaultHeaders },
            ...options
        });
    }
}

/**
 * API Error Class
 */
class ApiError extends Error {
    constructor(message, code = 'API_ERROR', status = 500, data = null) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            status: this.status,
            data: this.data,
            timestamp: this.timestamp
        };
    }
}

// Create default API client instance
const apiClient = new ApiClient();

// Add common interceptors
apiClient.addRequestInterceptor((config) => {
    // Add timestamp to prevent caching on IE
    if (config.method === 'GET') {
        const separator = config.url.includes('?') ? '&' : '?';
        config.url += `${separator}_t=${Date.now()}`;
    }
    return config;
});

apiClient.addResponseInterceptor((response) => {
    // Log slow requests
    const duration = performance.now() - response.config.startTime;
    if (duration > 2000) { // 2 seconds
        logger.warn(`Slow API request detected: ${response.config.method} ${response.config.url}`, {
            duration: `${duration.toFixed(2)}ms`
        });
    }
    return response;
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, ApiError, apiClient };
} else {
    window.ApiClient = ApiClient;
    window.ApiError = ApiError;
    window.apiClient = apiClient;
}