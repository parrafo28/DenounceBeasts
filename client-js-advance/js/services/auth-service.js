/**
 * Advanced Authentication Service
 * Handles JWT authentication with secure token management
 */

class AuthService extends BaseService {
    constructor() {
        super('auth');
        
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        
        this.storageKeys = {
            token: 'denounce_beasts_token',
            refreshToken: 'denounce_beasts_refresh_token',
            user: 'denounce_beasts_user',
            expiry: 'denounce_beasts_token_expiry'
        };

        // Auto-load authentication data on initialization
        this._loadFromStorage();
        
        // Set up auto-refresh
        this._setupAutoRefresh();
        
        // Add auth interceptor to API client
        this._setupApiInterceptor();
    }

    /**
     * Initialize authentication
     */
    async initialize() {
        try {
            if (this.isAuthenticated() && this._isTokenExpired()) {
                await this._refreshToken();
            }
            
            if (this.isAuthenticated()) {
                await this._validateToken();
            }
            
            this.logger.info('Authentication initialized', { 
                authenticated: this.isAuthenticated(),
                user: this.currentUser?.email
            });
            
            return this.isAuthenticated();
        } catch (error) {
            this.logger.error('Failed to initialize authentication', error);
            this.logout();
            return false;
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            this.logger.info('Attempting login', { email });
            
            const response = await apiClient.post('/api/auth/login', {
                email,
                password
            });

            const authData = response.data;
            
            // Store authentication data
            this._storeAuthData(authData);
            
            // Emit login event
            this.eventEmitter.emit('login', { 
                user: this.currentUser,
                timestamp: new Date().toISOString()
            });
            
            this.logger.info('Login successful', { 
                userId: this.currentUser.id,
                email: this.currentUser.email
            });
            
            return {
                success: true,
                user: this.currentUser
            };

        } catch (error) {
            this.logger.error('Login failed', error);
            
            this.eventEmitter.emit('loginError', { 
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            throw new Error(error.data?.message || 'Invalid credentials');
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            this.logger.info('Attempting registration', { email: userData.email });
            
            const response = await apiClient.post('/api/auth/register', userData);
            
            const authData = response.data;
            
            // Store authentication data
            this._storeAuthData(authData);
            
            // Emit register event
            this.eventEmitter.emit('register', { 
                user: this.currentUser,
                timestamp: new Date().toISOString()
            });
            
            this.logger.info('Registration successful', { 
                userId: this.currentUser.id,
                email: this.currentUser.email
            });
            
            return {
                success: true,
                user: this.currentUser
            };

        } catch (error) {
            this.logger.error('Registration failed', error);
            
            this.eventEmitter.emit('registerError', { 
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            throw new Error(error.data?.message || 'Registration failed');
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.logger.info('Logging out user', { 
            userId: this.currentUser?.id,
            email: this.currentUser?.email
        });
        
        // Clear authentication data
        this._clearAuthData();
        
        // Emit logout event
        this.eventEmitter.emit('logout', { 
            timestamp: new Date().toISOString()
        });
        
        this.logger.info('Logout completed');
    }

    /**
     * Change user password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            this.logger.info('Attempting password change', { 
                userId: this.currentUser?.id 
            });
            
            await apiClient.post('/api/auth/change-password', {
                currentPassword,
                newPassword,
                confirmNewPassword: newPassword
            });
            
            this.eventEmitter.emit('passwordChanged', { 
                userId: this.currentUser.id,
                timestamp: new Date().toISOString()
            });
            
            this.logger.info('Password changed successfully');
            
            return { success: true };

        } catch (error) {
            this.logger.error('Password change failed', error);
            throw new Error(error.data?.message || 'Failed to change password');
        }
    }

    /**
     * Get current user profile
     */
    async getProfile() {
        try {
            const response = await apiClient.get('/api/auth/profile');
            
            // Update current user data
            this.currentUser = response.data;
            this._saveToStorage();
            
            return this.currentUser;

        } catch (error) {
            this.logger.error('Failed to get profile', error);
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!(this.token && this.currentUser && !this._isTokenExpired());
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        if (!this.isAuthenticated()) return false;
        return this.currentUser.roles?.includes(role) || false;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        if (!this.isAuthenticated()) return false;
        return roles.some(role => this.hasRole(role));
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.hasRole('Administrador');
    }

    /**
     * Check if user is moderator or admin
     */
    isModerator() {
        return this.hasAnyRole(['Moderador', 'Administrador']);
    }

    /**
     * Get authentication headers for API requests
     */
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    /**
     * Store authentication data
     */
    _storeAuthData(authData) {
        this.token = authData.token;
        this.currentUser = authData.user;
        this.tokenExpiry = new Date(authData.expires);
        
        if (authData.refreshToken) {
            this.refreshToken = authData.refreshToken;
        }
        
        this._saveToStorage();
    }

    /**
     * Save data to localStorage
     */
    _saveToStorage() {
        try {
            localStorage.setItem(this.storageKeys.token, this.token || '');
            localStorage.setItem(this.storageKeys.user, JSON.stringify(this.currentUser || null));
            localStorage.setItem(this.storageKeys.expiry, this.tokenExpiry?.toISOString() || '');
            
            if (this.refreshToken) {
                localStorage.setItem(this.storageKeys.refreshToken, this.refreshToken);
            }
        } catch (error) {
            this.logger.error('Failed to save auth data to storage', error);
        }
    }

    /**
     * Load data from localStorage
     */
    _loadFromStorage() {
        try {
            this.token = localStorage.getItem(this.storageKeys.token) || null;
            this.refreshToken = localStorage.getItem(this.storageKeys.refreshToken) || null;
            
            const userStr = localStorage.getItem(this.storageKeys.user);
            this.currentUser = userStr ? JSON.parse(userStr) : null;
            
            const expiryStr = localStorage.getItem(this.storageKeys.expiry);
            this.tokenExpiry = expiryStr ? new Date(expiryStr) : null;
            
        } catch (error) {
            this.logger.error('Failed to load auth data from storage', error);
            this._clearAuthData();
        }
    }

    /**
     * Clear authentication data
     */
    _clearAuthData() {
        this.token = null;
        this.currentUser = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        
        // Clear storage
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * Check if token is expired
     */
    _isTokenExpired() {
        if (!this.tokenExpiry) return true;
        
        // Add 5 minute buffer
        const bufferTime = 5 * 60 * 1000;
        return new Date().getTime() > (this.tokenExpiry.getTime() - bufferTime);
    }

    /**
     * Validate current token with server
     */
    async _validateToken() {
        try {
            await apiClient.get('/api/auth/verify-token');
            return true;
        } catch (error) {
            this.logger.warn('Token validation failed', error);
            this.logout();
            return false;
        }
    }

    /**
     * Refresh authentication token
     */
    async _refreshToken() {
        // This would be implemented if the API supports refresh tokens
        // For now, we'll just logout if token is expired
        this.logger.info('Token expired, logging out user');
        this.logout();
    }

    /**
     * Setup automatic token refresh
     */
    _setupAutoRefresh() {
        setInterval(() => {
            if (this.isAuthenticated() && this._isTokenExpired()) {
                this._refreshToken();
            }
        }, 60000); // Check every minute
    }

    /**
     * Setup API client interceptor for authentication
     */
    _setupApiInterceptor() {
        apiClient.addRequestInterceptor((config) => {
            if (this.token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${this.token}`;
            }
            return config;
        });

        apiClient.addResponseInterceptor((response) => {
            // Handle 401 responses
            if (response.status === 401 && this.isAuthenticated()) {
                this.logger.warn('Received 401, logging out user');
                this.logout();
            }
            return response;
        });
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get current token
     */
    getToken() {
        return this.token;
    }

    /**
     * Check if email exists
     */
    async checkEmailExists(email) {
        try {
            const response = await apiClient.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
            return response.data.exists;
        } catch (error) {
            this.logger.error('Failed to check email existence', error);
            return false;
        }
    }
}

// Create and export singleton instance
const authService = new AuthService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService, authService };
} else {
    window.AuthService = AuthService;
    window.authService = authService;
}