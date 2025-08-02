import api from './api'
import { API_CONFIG } from '@/config/api'

class MunicipalityService {
  constructor() {
    this.endpoint = API_CONFIG.endpoints.municipalities
  }

  // Obtener todos los municipios
  async getAll() {
    try {
      const response = await api.get(this.endpoint)
      return response.data
    } catch (error) {
      console.error('Error fetching municipalities:', error)
      throw error
    }
  }

  // Obtener municipio por ID
  async getById(id) {
    try {
      const response = await api.get(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching municipality ${id}:`, error)
      throw error
    }
  }

  // Crear nuevo municipio
  async create(municipalityData) {
    try {
      const response = await api.post(this.endpoint, municipalityData)
      return response.data
    } catch (error) {
      console.error('Error creating municipality:', error)
      throw error
    }
  }

  // Actualizar municipio
  async update(id, municipalityData) {
    try {
      const response = await api.put(`${this.endpoint}/${id}`, municipalityData)
      return response.data
    } catch (error) {
      console.error(`Error updating municipality ${id}:`, error)
      throw error
    }
  }

  // Eliminar municipio
  async delete(id) {
    try {
      await api.delete(`${this.endpoint}/${id}`)
      return true
    } catch (error) {
      console.error(`Error deleting municipality ${id}:`, error)
      throw error
    }
  }

  // Buscar municipios
  async search(query) {
    try {
      const municipalities = await this.getAll()
      if (!query) return municipalities
      
      return municipalities.filter(municipality =>
        municipality.name.toLowerCase().includes(query.toLowerCase()) ||
        municipality.code.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching municipalities:', error)
      throw error
    }
  }

  // Obtener municipios activos
  async getActive() {
    try {
      const municipalities = await this.getAll()
      return municipalities.filter(m => m.isActive)
    } catch (error) {
      console.error('Error fetching active municipalities:', error)
      throw error
    }
  }

  // Verificar si el código es único
  async isCodeUnique(code, excludeId = null) {
    try {
      const municipalities = await this.getAll()
      return !municipalities.some(m => 
        m.code.toLowerCase() === code.toLowerCase() && 
        (excludeId === null || m.id !== excludeId)
      )
    } catch (error) {
      console.error('Error checking code uniqueness:', error)
      return false
    }
  }

  // Obtener sectores de un municipio
  async getSectors(municipalityId) {
    try {
      const response = await api.get(`${this.endpoint}/${municipalityId}/sectors`)
      return response.data
    } catch (error) {
      console.error(`Error fetching sectors for municipality ${municipalityId}:`, error)
      throw error
    }
  }
}

export default new MunicipalityService()