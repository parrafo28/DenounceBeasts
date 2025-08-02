import api from './api'
import { API_CONFIG } from '@/config/api'

class SectorService {
  constructor() {
    this.endpoint = API_CONFIG.endpoints.sectors
  }

  // Obtener todos los sectores
  async getAll() {
    try {
      const response = await api.get(this.endpoint)
      return response.data
    } catch (error) {
      console.error('Error fetching sectors:', error)
      throw error
    }
  }

  // Obtener sector por ID
  async getById(id) {
    try {
      const response = await api.get(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching sector ${id}:`, error)
      throw error
    }
  }

  // Crear nuevo sector
  async create(sectorData) {
    try {
      const response = await api.post(this.endpoint, sectorData)
      return response.data
    } catch (error) {
      console.error('Error creating sector:', error)
      throw error
    }
  }

  // Actualizar sector
  async update(id, sectorData) {
    try {
      const response = await api.put(`${this.endpoint}/${id}`, sectorData)
      return response.data
    } catch (error) {
      console.error(`Error updating sector ${id}:`, error)
      throw error
    }
  }

  // Eliminar sector
  async delete(id) {
    try {
      await api.delete(`${this.endpoint}/${id}`)
      return true
    } catch (error) {
      console.error(`Error deleting sector ${id}:`, error)
      throw error
    }
  }

  // Buscar sectores con filtros opcionales
  async search(query = '', municipalityId = null) {
    try {
      const sectors = await this.getAll()
      let filtered = sectors

      // Filtrar por texto
      if (query) {
        filtered = filtered.filter(sector =>
          sector.name.toLowerCase().includes(query.toLowerCase()) ||
          sector.code.toLowerCase().includes(query.toLowerCase())
        )
      }

      // Filtrar por municipio
      if (municipalityId) {
        filtered = filtered.filter(sector => sector.municipalityId === municipalityId)
      }

      return filtered
    } catch (error) {
      console.error('Error searching sectors:', error)
      throw error
    }
  }

  // Obtener sectores activos
  async getActive() {
    try {
      const sectors = await this.getAll()
      return sectors.filter(s => s.isActive)
    } catch (error) {
      console.error('Error fetching active sectors:', error)
      throw error
    }
  }

  // Obtener sectores por municipio
  async getByMunicipality(municipalityId) {
    try {
      const sectors = await this.getAll()
      return sectors.filter(s => s.municipalityId === municipalityId)
    } catch (error) {
      console.error(`Error fetching sectors for municipality ${municipalityId}:`, error)
      throw error
    }
  }

  // Obtener sectores activos por municipio
  async getActiveByMunicipality(municipalityId) {
    try {
      const sectors = await this.getByMunicipality(municipalityId)
      return sectors.filter(s => s.isActive)
    } catch (error) {
      console.error(`Error fetching active sectors for municipality ${municipalityId}:`, error)
      throw error
    }
  }

  // Verificar si el código es único en el municipio
  async isCodeUniqueInMunicipality(code, municipalityId, excludeId = null) {
    try {
      const sectors = await this.getByMunicipality(municipalityId)
      return !sectors.some(s => 
        s.code.toLowerCase() === code.toLowerCase() && 
        (excludeId === null || s.id !== excludeId)
      )
    } catch (error) {
      console.error('Error checking code uniqueness in municipality:', error)
      return false
    }
  }
}

export default new SectorService()