/**
 * TypeScript Authentication Service
 * Handles JWT authentication with type safety and advanced features
 */

import { ApiClient } from './api-client';
import { EventEmitter } from '../utils/event-emitter';
import { Logger } from '../utils/logger';
import { Cache } from '../utils/cache';
import { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto, 
  AuthUser, 
  ChangePasswordDto 
} from '../types/entities';

export interface AuthServiceConfig {
  baseURL: string;
  tokenKey: string;
  userKey: string;
  expiryKey: string;
  refreshTokenKey?: string;
}

export interface AuthHeaders {
  'Content-Type': string;
  'Authorization'?: string;
}

export interface AuthEventData {
  user: AuthUser;
  timestamp: string;
}

export interface AuthErrorEventData {
  error: string;
  timestamp: string;
}

export class AuthService {
  private readonly apiClient: ApiClient;
  private readonly logger: Logger;
  private readonly eventEmitter: EventEmitter;
  private readonly config: AuthServiceConfig;
  
  private currentUser: AuthUser | null = null;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private refreshToken: string | null = null;
  private refreshTimer: number | null = null;

  constructor(config: Partial<AuthServiceConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || 'https://localhost:7175',
      tokenKey: config.tokenKey || 'denounce_beasts_token',
      userKey: config.userKey || 'denounce_beasts_user',
      expiryKey: config.expiryKey || 'denounce_beasts_token_expiry',
      refreshTokenKey: config.refreshTokenKey || 'denounce_beasts_refresh_token'
    };

    this.apiClient = new ApiClient({ baseURL: this.config.baseURL });
    this.logger = new Logger('AuthService');
    this.eventEmitter = new EventEmitter();

    this._loadFromStorage();
    this._setupApiInterceptors();
    this._setupAutoRefresh();
  }

  /**
   * Initialize authentication service
   */
  public async initialize(): Promise<boolean> {
    try {
      if (this.isAuthenticated() && this._isTokenExpired()) {
        await this._attemptRefreshToken();
      }

      if (this.isAuthenticated()) {
        await this._validateCurrentToken();
      }

      this.logger.info('Authentication service initialized', {
        authenticated: this.isAuthenticated(),
        user: this.currentUser?.email
      });

      return this.isAuthenticated();
    } catch (error) {
      this.logger.error('Failed to initialize authentication service', error);
      this.logout();
      return false;
    }
  }

  /**
   * User login
   */
  public async login(loginData: LoginDto): Promise<AuthUser> {
    try {
      this.logger.info('Attempting login', { email: loginData.email });

      const response = await this.apiClient.post<AuthResponseDto>('/api/auth/login', loginData);

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      this._storeAuthData(response.data);

      this.eventEmitter.emit<AuthEventData>('login', {
        user: this.currentUser!,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Login successful', {
        userId: this.currentUser!.id,
        email: this.currentUser!.email
      });

      return this.currentUser!;
    } catch (error) {
      this.logger.error('Login failed', error);
      
      this.eventEmitter.emit<AuthErrorEventData>('loginError', {
        error: error instanceof Error ? error.message : 'Login failed',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * User registration
   */
  public async register(registerData: RegisterDto): Promise<AuthUser> {
    try {
      this.logger.info('Attempting registration', { email: registerData.email });

      const response = await this.apiClient.post<AuthResponseDto>('/api/auth/register', registerData);

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      this._storeAuthData(response.data);

      this.eventEmitter.emit<AuthEventData>('register', {
        user: this.currentUser!,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Registration successful', {
        userId: this.currentUser!.id,
        email: this.currentUser!.email
      });

      return this.currentUser!;
    } catch (error) {
      this.logger.error('Registration failed', error);
      
      this.eventEmitter.emit<AuthErrorEventData>('registerError', {
        error: error instanceof Error ? error.message : 'Registration failed',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * User logout
   */
  public logout(): void {
    this.logger.info('Logging out user', {
      userId: this.currentUser?.id,
      email: this.currentUser?.email
    });

    this._clearAuthData();

    this.eventEmitter.emit('logout', {
      timestamp: new Date().toISOString()
    });

    this.logger.info('Logout completed');
  }

  /**
   * Change user password
   */
  public async changePassword(changePasswordData: ChangePasswordDto): Promise<void> {
    try {
      this.logger.info('Attempting password change', {
        userId: this.currentUser?.id
      });

      await this.apiClient.post('/api/auth/change-password', changePasswordData);

      this.eventEmitter.emit('passwordChanged', {
        userId: this.currentUser!.id,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Password changed successfully');
    } catch (error) {
      this.logger.error('Password change failed', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  public async getProfile(): Promise<AuthUser> {
    try {
      const response = await this.apiClient.get<AuthUser>('/api/auth/profile');
      
      if (response.data) {
        this.currentUser = response.data;
        this._saveToStorage();
      }

      return response.data!;
    } catch (error) {
      this.logger.error('Failed to get user profile', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!(this.token && this.currentUser && !this._isTokenExpired());
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    if (!this.isAuthenticated() || !this.currentUser) {
      return false;
    }
    return this.currentUser.roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    if (!this.isAuthenticated() || !this.currentUser) {
      return false;
    }
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('Administrador');
  }

  /**
   * Check if user is moderator or admin
   */
  public isModerator(): boolean {
    return this.hasAnyRole(['Moderador', 'Administrador']);
  }

  /**
   * Get current user
   */
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Get current token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Get authentication headers
   */
  public getAuthHeaders(): AuthHeaders {
    const headers: AuthHeaders = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Check if email exists
   */
  public async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await this.apiClient.get<{ exists: boolean }>(
        `/api/auth/check-email?email=${encodeURIComponent(email)}`
      );
      return response.data?.exists || false;
    } catch (error) {
      this.logger.error('Failed to check email existence', error);
      return false;
    }
  }

  /**
   * Validate current token with server
   */
  private async _validateCurrentToken(): Promise<void> {
    try {
      await this.apiClient.get('/api/auth/verify-token');
    } catch (error) {
      this.logger.warn('Token validation failed', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Store authentication data
   */
  private _storeAuthData(authData: AuthResponseDto): void {
    this.token = authData.token;
    this.currentUser = authData.user;
    this.tokenExpiry = new Date(authData.expires);

    this._saveToStorage();
    this._scheduleTokenRefresh();
  }

  /**
   * Save authentication data to localStorage
   */
  private _saveToStorage(): void {
    try {
      localStorage.setItem(this.config.tokenKey, this.token || '');
      localStorage.setItem(this.config.userKey, JSON.stringify(this.currentUser));
      localStorage.setItem(this.config.expiryKey, this.tokenExpiry?.toISOString() || '');
      
      if (this.refreshToken) {
        localStorage.setItem(this.config.refreshTokenKey!, this.refreshToken);
      }
    } catch (error) {
      this.logger.error('Failed to save auth data to storage', error);
    }
  }

  /**
   * Load authentication data from localStorage
   */
  private _loadFromStorage(): void {
    try {
      this.token = localStorage.getItem(this.config.tokenKey);
      this.refreshToken = localStorage.getItem(this.config.refreshTokenKey!);
      
      const userJson = localStorage.getItem(this.config.userKey);
      if (userJson) {
        this.currentUser = JSON.parse(userJson) as AuthUser;
      }

      const expiryString = localStorage.getItem(this.config.expiryKey);
      if (expiryString) {
        this.tokenExpiry = new Date(expiryString);
      }
    } catch (error) {
      this.logger.error('Failed to load auth data from storage', error);
      this._clearAuthData();
    }
  }

  /**
   * Clear all authentication data
   */
  private _clearAuthData(): void {
    this.token = null;
    this.currentUser = null;
    this.tokenExpiry = null;
    this.refreshToken = null;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Clear from storage
    localStorage.removeItem(this.config.tokenKey);
    localStorage.removeItem(this.config.userKey);
    localStorage.removeItem(this.config.expiryKey);
    localStorage.removeItem(this.config.refreshTokenKey!);
  }

  /**
   * Check if current token is expired
   */
  private _isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;

    // Add 5 minute buffer before expiry
    const bufferTime = 5 * 60 * 1000;
    return new Date().getTime() > (this.tokenExpiry.getTime() - bufferTime);
  }

  /**
   * Attempt to refresh token
   */
  private async _attemptRefreshToken(): Promise<void> {
    // For now, just logout when token expires
    // In a real implementation, you would call a refresh endpoint
    this.logger.info('Token expired, logging out user');
    this.logout();
  }

  /**
   * Schedule automatic token refresh
   */
  private _scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.tokenExpiry) return;

    // Schedule refresh 5 minutes before expiry
    const refreshTime = this.tokenExpiry.getTime() - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = window.setTimeout(() => {
        this._attemptRefreshToken();
      }, refreshTime);
    }
  }

  /**
   * Setup automatic token refresh check
   */
  private _setupAutoRefresh(): void {
    // Check token validity every minute
    setInterval(() => {
      if (this.isAuthenticated() && this._isTokenExpired()) {
        this._attemptRefreshToken();
      }
    }, 60000);
  }

  /**
   * Setup API client interceptors
   */
  private _setupApiInterceptors(): void {
    // Request interceptor to add auth headers
    this.apiClient.addRequestInterceptor((config) => {
      if (this.token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor to handle auth errors
    this.apiClient.addResponseInterceptor((response) => {
      if (response.status === 401 && this.isAuthenticated()) {
        this.logger.warn('Received 401 response, logging out user');
        this.logout();
      }
      return response;
    });
  }

  /**
   * Get event emitter for subscribing to auth events
   */
  public get events(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Destroy the service and cleanup resources
   */
  public destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.eventEmitter.removeAllListeners();
    this.logger.info('AuthService destroyed');
  }
}

// Create and export singleton instance
export const authService = new AuthService();