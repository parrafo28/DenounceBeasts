import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import sectorService from '@/services/sectorService'
import { useToast } from 'vue-toastification'
import { MESSAGES } from '@/config/api'

export const useSectorStore = defineStore('sector', () => {
  const toast = useToast()
  
  // Estado
  const sectors = ref([])
  const currentSector = ref(null)
  const loading = ref(false)
  const searchQuery = ref('')
  const municipalityFilter = ref('')

  // Getters
  const activeSectors = computed(() => 
    sectors.value.filter(s => s.isActive)
  )

  const inactiveSectors = computed(() => 
    sectors.value.filter(s => !s.isActive)
  )

  const filteredSectors = computed(() => {
    let filtered = sectors.value

    // Filtro por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query)
      )
    }

    // Filtro por municipio
    if (municipalityFilter.value) {
      filtered = filtered.filter(s => s.municipalityId === municipalityFilter.value)
    }

    return filtered
  })

  const totalCount = computed(() => sectors.value.length)
  const activeCount = computed(() => activeSectors.value.length)
  const inactiveCount = computed(() => inactiveSectors.value.length)

  // Actions
  async function fetchSectors() {
    loading.value = true
    try {
      sectors.value = await sectorService.getAll()
    } catch (error) {
      console.error('Error fetching sectors:', error)
      toast.error(MESSAGES.error.general)
    } finally {
      loading.value = false
    }
  }

  async function fetchSector(id) {
    loading.value = true
    try {
      currentSector.value = await sectorService.getById(id)
      return currentSector.value
    } catch (error) {
      console.error('Error fetching sector:', error)
      toast.error(MESSAGES.error.notFound)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createSector(sectorData) {
    loading.value = true
    try {
      const newSector = await sectorService.create(sectorData)
      sectors.value.push(newSector)
      toast.success(MESSAGES.success.created)
      return newSector
    } catch (error) {
      console.error('Error creating sector:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateSector(id, sectorData) {
    loading.value = true
    try {
      const updatedSector = await sectorService.update(id, sectorData)
      
      // Actualizar en la lista
      const index = sectors.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sectors.value[index] = updatedSector
      }
      
      // Actualizar current si es el mismo
      if (currentSector.value?.id === id) {
        currentSector.value = updatedSector
      }
      
      toast.success(MESSAGES.success.updated)
      return updatedSector
    } catch (error) {
      console.error('Error updating sector:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteSector(id) {
    loading.value = true
    try {
      await sectorService.delete(id)
      
      // Remover de la lista
      sectors.value = sectors.value.filter(s => s.id !== id)
      
      // Limpiar current si es el mismo
      if (currentSector.value?.id === id) {
        currentSector.value = null
      }
      
      toast.success(MESSAGES.success.deleted)
      return true
    } catch (error) {
      console.error('Error deleting sector:', error)
      toast.error(MESSAGES.error.general)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchSectorsByMunicipality(municipalityId) {
    try {
      return await sectorService.getByMunicipality(municipalityId)
    } catch (error) {
      console.error('Error fetching sectors by municipality:', error)
      return []
    }
  }

  async function checkCodeUniqueInMunicipality(code, municipalityId, excludeId = null) {
    try {
      return await sectorService.isCodeUniqueInMunicipality(code, municipalityId, excludeId)
    } catch (error) {
      console.error('Error checking code uniqueness:', error)
      return false
    }
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function setMunicipalityFilter(municipalityId) {
    municipalityFilter.value = municipalityId
  }

  function clearFilters() {
    searchQuery.value = ''
    municipalityFilter.value = ''
  }

  function clearCurrentSector() {
    currentSector.value = null
  }

  return {
    // Estado
    sectors,
    currentSector,
    loading,
    searchQuery,
    municipalityFilter,
    
    // Getters
    activeSectors,
    inactiveSectors,
    filteredSectors,
    totalCount,
    activeCount,
    inactiveCount,
    
    // Actions
    fetchSectors,
    fetchSector,
    createSector,
    updateSector,
    deleteSector,
    fetchSectorsByMunicipality,
    checkCodeUniqueInMunicipality,
    setSearchQuery,
    setMunicipalityFilter,
    clearFilters,
    clearCurrentSector
  }
})