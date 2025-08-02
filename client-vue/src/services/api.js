import axios from 'axios'
import { useToast } from 'vue-toastification'
import { API_CONFIG, MESSAGES } from '@/config/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
    
    // Add auth token if available
    const token = localStorage.getItem('denouncebeasts_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error)
    
    const toast = useToast()
    let message = MESSAGES.error.general
    
    if (error.code === 'ECONNABORTED') {
      message = 'La solicitud tardó demasiado tiempo'
    } else if (error.response) {
      switch (error.response.status) {
        case 400:
          message = MESSAGES.error.validation
          break
        case 401:
          // Handle unauthorized - clear auth data
          localStorage.removeItem('denouncebeasts_token')
          localStorage.removeItem('denouncebeasts_user')
          localStorage.removeItem('denouncebeasts_token_expiry')
          
          // Only show message if not an auth endpoint to avoid duplicate messages
          if (!error.config.url?.includes('/auth/')) {
            message = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
            toast.error(message)
            
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.href = '/auth/login'
            }, 1500)
          }
          return Promise.reject(error)
        case 403:
          message = 'No tienes permisos para realizar esta acción'
          break
        case 404:
          message = MESSAGES.error.notFound
          break
        case 500:
          message = MESSAGES.error.server
          break
        default:
          message = error.response.data?.message || MESSAGES.error.general
      }
    } else if (error.request) {
      message = MESSAGES.error.network
    }
    
    // Don't show toast for auth errors as they are handled by the auth service
    if (!error.config.url?.includes('/auth/')) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api