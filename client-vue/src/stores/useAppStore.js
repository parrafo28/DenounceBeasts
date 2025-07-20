import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Estado
  const loading = ref(false)
  const error = ref(null)
  const theme = ref('light')

  // Getters (computed)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  
  // Actions
  function setLoading(state) {
    loading.value = state
  }

  function setError(errorMessage) {
    error.value = errorMessage
    
    // Auto-limpiar error después de 5 segundos
    setTimeout(() => {
      if (error.value === errorMessage) {
        error.value = null
      }
    }, 5000)
  }

  function clearError() {
    error.value = null
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    // Estado
    loading,
    error,
    theme,
    
    // Getters
    isLoading,
    hasError,
    
    // Actions
    setLoading,
    setError,
    clearError,
    toggleTheme
  }
})