import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import municipalityService from '@/services/municipalityService'
import { useToast } from 'vue-toastification'
import { MESSAGES } from '@/config/api'

export const useMunicipalityStore = defineStore('municipality', () => {
  const toast = useToast()
  
  // Estado
  const municipalities = ref([])
  const currentMunicipality = ref(null)
  const loading = ref(false)
  const searchQuery = ref('')

  // Getters
  const activeMunicipalities = computed(() => 
    municipalities.value.filter(m => m.isActive)
  )

  const inactiveMunicipalities = computed(() => 
    municipalities.value.filter(m => !m.isActive)
  )

  const filteredMunicipalities = computed(() => {
    if (!searchQuery.value) return municipalities.value
    
    const query = searchQuery.value.toLowerCase()
    return municipalities.value.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query)
    )
  })

  const totalCount = computed(() => municipalities.value.length)
  const activeCount = computed(() => activeMunicipalities.value.length)
  const inactiveCount = computed(() => inactiveMunicipalities.value.length)

  // Actions
  async function fetchMunicipalities() {
    loading.value = true
    try {
      municipalities.value = await municipalityService.getAll()
    } catch (error) {
      console.error('Error fetching municipalities:', error)
      toast.error(MESSAGES.error.general)
    } finally {
      loading.value = false
    }
  }

  async function fetchMunicipality(id) {
    loading.value = true
    try {
      currentMunicipality.value = await municipalityService.getById(id)
      return currentMunicipality.value
    } catch (error) {
      console.error('Error fetching municipality:', error)
      toast.error(MESSAGES.error.notFound)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createMunicipality(municipalityData) {
    loading.value = true
    try {
      const newMunicipality = await municipalityService.create(municipalityData)
      municipalities.value.push(newMunicipality)
      toast.success(MESSAGES.success.created)
      return newMunicipality
    } catch (error) {
      console.error('Error creating municipality:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateMunicipality(id, municipalityData) {
    loading.value = true
    try {
      const updatedMunicipality = await municipalityService.update(id, municipalityData)
      
      // Actualizar en la lista
      const index = municipalities.value.findIndex(m => m.id === id)
      if (index !== -1) {
        municipalities.value[index] = updatedMunicipality
      }
      
      // Actualizar current si es el mismo
      if (currentMunicipality.value?.id === id) {
        currentMunicipality.value = updatedMunicipality
      }
      
      toast.success(MESSAGES.success.updated)
      return updatedMunicipality
    } catch (error) {
      console.error('Error updating municipality:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteMunicipality(id) {
    loading.value = true
    try {
      await municipalityService.delete(id)
      
      // Remover de la lista
      municipalities.value = municipalities.value.filter(m => m.id !== id)
      
      // Limpiar current si es el mismo
      if (currentMunicipality.value?.id === id) {
        currentMunicipality.value = null
      }
      
      toast.success(MESSAGES.success.deleted)
      return true
    } catch (error) {
      console.error('Error deleting municipality:', error)
      toast.error(MESSAGES.error.general)
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkCodeUnique(code, excludeId = null) {
    try {
      return await municipalityService.isCodeUnique(code, excludeId)
    } catch (error) {
      console.error('Error checking code uniqueness:', error)
      return false
    }
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function clearSearch() {
    searchQuery.value = ''
  }

  function clearCurrentMunicipality() {
    currentMunicipality.value = null
  }

  return {
    // Estado
    municipalities,
    currentMunicipality,
    loading,
    searchQuery,
    
    // Getters
    activeMunicipalities,
    inactiveMunicipalities,
    filteredMunicipalities,
    totalCount,
    activeCount,
    inactiveCount,
    
    // Actions
    fetchMunicipalities,
    fetchMunicipality,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality,
    checkCodeUnique,
    setSearchQuery,
    clearSearch,
    clearCurrentMunicipality
  }
})