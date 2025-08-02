import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService.js'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Toast instance
  const toast = useToast()

  // Getters
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value && authService.isAuthenticated()
  })

  const userRoles = computed(() => {
    return user.value?.roles || []
  })

  const isAdmin = computed(() => {
    return userRoles.value.includes('Administrador')
  })

  const isModerator = computed(() => {
    return userRoles.value.includes('Moderador') || isAdmin.value
  })

  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`.trim()
  })

  // Actions
  async function login(credentials) {
    isLoading.value = true
    
    try {
      const response = await authService.login(credentials)
      
      // Update store state
      user.value = response.user
      token.value = response.token
      
      toast.success(`¡Bienvenido ${response.user.firstName}!`)
      return response
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    isLoading.value = true
    
    try {
      const response = await authService.register(userData)
      
      // Update store state
      user.value = response.user
      token.value = response.token
      
      toast.success(`¡Bienvenido ${response.user.firstName}! Tu cuenta ha sido creada correctamente.`)
      return response
    } catch (error) {
      toast.error(error.message || 'Error al crear la cuenta')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    
    try {
      await authService.logout()
      
      // Clear store state
      user.value = null
      token.value = null
      
      toast.info('Has cerrado sesión correctamente')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear state even if logout fails
      user.value = null
      token.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProfile() {
    if (!isAuthenticated.value) return null
    
    try {
      const profileData = await authService.getProfile()
      if (profileData) {
        user.value = profileData
      }
      return profileData
    } catch (error) {
      console.error('Error fetching profile:', error)
      // If profile fetch fails due to auth, logout
      if (error.message.includes('401') || error.message.includes('inválidas')) {
        await logout()
      }
      throw error
    }
  }

  async function changePassword(passwordData) {
    isLoading.value = true
    
    try {
      const success = await authService.changePassword(passwordData)
      if (success) {
        toast.success('Contraseña cambiada correctamente')
      }
      return success
    } catch (error) {
      toast.error(error.message || 'Error al cambiar la contraseña')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function checkEmailAvailability(email) {
    try {
      return await authService.isEmailAvailable(email)
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  async function validateToken() {
    try {
      return await authService.validateToken()
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  function init() {
    if (isInitialized.value) return
    
    // Initialize auth service
    authService.init()
    
    // Load user data from storage
    const storedUser = authService.getCurrentUser()
    const storedToken = authService.getToken()
    
    if (storedUser && storedToken && authService.isAuthenticated()) {
      user.value = storedUser
      token.value = storedToken
    } else {
      // Clear invalid data
      authService.clearAuthData()
      user.value = null
      token.value = null
    }
    
    isInitialized.value = true
  }

  function clearError() {
    // This could be used for form error handling if needed
  }

  // Auth guards for navigation
  function requireAuth() {
    if (!isAuthenticated.value) {
      throw new Error('Debes iniciar sesión para acceder a esta página')
    }
  }

  function requireAdmin() {
    requireAuth()
    if (!isAdmin.value) {
      throw new Error('No tienes permisos de administrador para acceder a esta página')
    }
  }

  function requireModerator() {
    requireAuth()
    if (!isModerator.value) {
      throw new Error('No tienes permisos de moderador para acceder a esta página')
    }
  }

  // Utility functions
  function hasRole(role) {
    return userRoles.value.includes(role)
  }

  function hasAnyRole(roles) {
    return roles.some(role => userRoles.value.includes(role))
  }

  return {
    // State
    user,
    token,
    isLoading,
    isInitialized,
    
    // Getters
    isAuthenticated,
    userRoles,
    isAdmin,
    isModerator,
    fullName,
    
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    changePassword,
    checkEmailAvailability,
    validateToken,
    init,
    clearError,
    
    // Guards
    requireAuth,
    requireAdmin,
    requireModerator,
    
    // Utilities
    hasRole,
    hasAnyRole
  }
})