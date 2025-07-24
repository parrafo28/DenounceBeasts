import api from './api.js'

/**
 * Service for handling authentication operations
 */
export class AuthService {
  constructor() {
    this.tokenKey = 'denouncebeasts_token'
    this.userKey = 'denouncebeasts_user'
    this.expiryKey = 'denouncebeasts_token_expiry'
  }

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Authentication response
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data) {
        this.setAuthData(response.data.token, response.data.user, response.data.expires)
        this.setAuthHeader(response.data.token)
        return response.data
      }
      
      throw new Error('Invalid response from server')
    } catch (error) {
      console.error('Login error:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data) {
        this.setAuthData(response.data.token, response.data.user, response.data.expires)
        this.setAuthHeader(response.data.token)
        return response.data
      }
      
      throw new Error('Invalid response from server')
    } catch (error) {
      console.error('Registration error:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      // Clear local storage first
      this.clearAuthData()
      this.clearAuthHeader()
      
      // Optionally call logout endpoint for server-side cleanup
      // await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if server logout fails, clear local data
      this.clearAuthData()
      this.clearAuthHeader()
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile')
      
      if (response.data) {
        // Update stored user info
        this.setUserData(response.data)
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('Get profile error:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmNewPassword - Confirm new password
   * @returns {Promise<boolean>} Success status
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', passwordData)
      return response.status === 200
    } catch (error) {
      console.error('Change password error:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * Check if email is available for registration
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email is available
   */
  async isEmailAvailable(email) {
    try {
      const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`)
      return !response.data?.exists
    } catch (error) {
      console.error('Email check error:', error)
      return false
    }
  }

  /**
   * Validate current token
   * @returns {Promise<boolean>} True if token is valid
   */
  async validateToken() {
    try {
      const response = await api.get('/auth/verify-token')
      return response.status === 200
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken()
    const user = this.getCurrentUser()
    
    if (!token || !user) {
      return false
    }

    // Check token expiry
    const expiry = this.getTokenExpiry()
    if (expiry && new Date(expiry) <= new Date(Date.now() + 5 * 60 * 1000)) { // 5 minute buffer
      this.clearAuthData()
      return false
    }

    return true
  }

  /**
   * Get current user from storage
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(this.userKey)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Get current token from storage
   * @returns {string|null} Current token or null
   */
  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Get token expiry from storage
   * @returns {string|null} Token expiry or null
   */
  getTokenExpiry() {
    return localStorage.getItem(this.expiryKey)
  }

  /**
   * Set authentication data in storage
   * @param {string} token - JWT token
   * @param {Object} user - User data
   * @param {string} expires - Token expiry date
   */
  setAuthData(token, user, expires) {
    localStorage.setItem(this.tokenKey, token)
    localStorage.setItem(this.userKey, JSON.stringify(user))
    localStorage.setItem(this.expiryKey, expires)
  }

  /**
   * Set user data in storage
   * @param {Object} user - User data
   */
  setUserData(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  /**
   * Clear authentication data from storage
   */
  clearAuthData() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
    localStorage.removeItem(this.expiryKey)
  }

  /**
   * Set authorization header for API requests
   * @param {string} token - JWT token
   */
  setAuthHeader(token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * Clear authorization header
   */
  clearAuthHeader() {
    delete api.defaults.headers.common['Authorization']
  }

  /**
   * Initialize auth service (set token if exists)
   */
  init() {
    const token = this.getToken()
    if (token && this.isAuthenticated()) {
      this.setAuthHeader(token)
    } else {
      this.clearAuthData()
    }
  }

  /**
   * Handle authentication errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleAuthError(error) {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.errors?.[0] || 'Error de autenticación'
      
      if (status === 401) {
        this.clearAuthData()
        this.clearAuthHeader()
        return new Error('Credenciales inválidas')
      } else if (status === 403) {
        return new Error('No tienes permisos para realizar esta acción')
      } else if (status === 422) {
        return new Error(message)
      } else if (status >= 500) {
        return new Error('Error del servidor. Por favor, inténtalo de nuevo más tarde')
      }
      
      return new Error(message)
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor')
    } else {
      return new Error(error.message || 'Error desconocido')
    }
  }
}

// Export singleton instance
export default new AuthService()