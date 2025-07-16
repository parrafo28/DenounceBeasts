import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { 
  Municipality, 
  District, 
  CreateMunicipalityDto, 
  CreateDistrictDto, 
  UpdateMunicipalityDto, 
  UpdateDistrictDto,
  CrudResult,
  HttpService
} from '@/types'

/**
 * Configuración base para el cliente HTTP
 */
const API_BASE_URL = 'https://localhost:7175/api'

/**
 * Instancia de Axios configurada para comunicarse con la API
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

/**
 * Interceptor para requests - agregar headers, auth, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }
    
    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Error en request:', error)
    return Promise.reject(error)
  }
)

/**
 * Interceptor para responses - manejar errores globales
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data)
    }
    return response
  },
  (error: AxiosError) => {
    console.error('❌ Error en response:', error.response?.status, error.message)
    
    // Manejo de errores específicos
    if (error.response?.status === 401) {
      // Redirect a login o mostrar mensaje de no autorizado
      console.log('🔐 No autorizado - redirigir a login')
    } else if (error.response?.status === 404) {
      console.log('🔍 Recurso no encontrado')
    } else if (error.response?.status >= 500) {
      console.log('🔥 Error del servidor')
    }
    
    return Promise.reject(error)
  }
)

/**
 * Clase base para servicios API
 */
abstract class BaseApiService {
  protected async handleRequest<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
    try {
      const response = await request
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Error desconocido en la API'
        )
      }
      throw error
    }
  }

  protected async handleCrudRequest(request: Promise<AxiosResponse>): Promise<CrudResult> {
    try {
      const response = await request
      return {
        success: true,
        message: 'Operación realizada exitosamente',
        data: response.data
      }
    } catch (error) {
      let message = 'Error desconocido'
      
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || 
                  error.message || 
                  `Error ${error.response?.status || 'desconocido'}`
      }
      
      return {
        success: false,
        message
      }
    }
  }
}

/**
 * Servicio para operaciones CRUD de Municipios
 */
export class MunicipalityService extends BaseApiService {
  private readonly endpoint = '/municipalities'

  /**
   * Obtener todos los municipios
   */
  async getAll(): Promise<Municipality[]> {
    return this.handleRequest(
      apiClient.get<Municipality[]>(this.endpoint)
    )
  }

  /**
   * Obtener municipio por ID
   */
  async getById(id: number): Promise<Municipality> {
    return this.handleRequest(
      apiClient.get<Municipality>(`${this.endpoint}/${id}`)
    )
  }

  /**
   * Crear nuevo municipio
   */
  async create(municipality: CreateMunicipalityDto): Promise<CrudResult> {
    return this.handleCrudRequest(
      apiClient.post(this.endpoint, municipality)
    )
  }

  /**
   * Actualizar municipio existente
   */
  async update(municipality: UpdateMunicipalityDto): Promise<CrudResult> {
    return this.handleCrudRequest(
      apiClient.put(this.endpoint, municipality)
    )
  }

  /**
   * Eliminar municipio por ID
   */
  async delete(id: number): Promise<CrudResult> {
    return this.handleCrudRequest(
      apiClient.delete(`${this.endpoint}/${id}`)
    )
  }

  /**
   * Buscar municipios por filtros
   */
  async search(searchTerm: string, isActive?: boolean): Promise<Municipality[]> {
    const params: any = {}
    
    if (searchTerm) {
      params.search = searchTerm
    }
    
    if (isActive !== undefined) {
      params.isActive = isActive
    }
    
    return this.handleRequest(
      apiClient.get<Municipality[]>(this.endpoint, { params })
    )
  }
}

/**
 * Servicio para operaciones CRUD de Distritos
 */
export class DistrictService extends BaseApiService {
  private readonly endpoint = '/districts'

  /**
   * Obtener todos los distritos con información del municipio
   */
  async getAll(): Promise<District[]> {
    return this.handleRequest(
      apiClient.get<District[]>(`${this.endpoint}/with-municipality`)
    )
  }

  /**
   * Obtener distrito por ID
   */
  async getById(id: number): Promise<District> {
    return this.handleRequest(
      apiClient.get<District>(`${this.endpoint}/${id}`)
    )
  }

  /**
   * Crear nuevo distrito
   */
  async create(district: CreateDistrictDto): Promise<CrudResult> {
    return this.handleCrudRequest(
      apiClient.post(this.endpoint, district)
    )
  }

  /**
   * Actualizar distrito existente
   */
  async update(district: UpdateDistrictDto): Promise<CrudResult> {
    return this.handleCrudRequest(
      apiClient.put(this.endpoint, district)
    )
  }

  /**
   * Eliminar distrito por ID
   */
  async delete(id: number): Promise<CrudResult> {
    return this.handleCrudRequest(
      apiClient.delete(`${this.endpoint}/${id}`)
    )
  }

  /**
   * Buscar distritos por filtros
   */
  async search(
    searchTerm: string, 
    municipalityId?: number, 
    isActive?: boolean
  ): Promise<District[]> {
    const params: any = {}
    
    if (searchTerm) {
      params.search = searchTerm
    }
    
    if (municipalityId) {
      params.municipalityId = municipalityId
    }
    
    if (isActive !== undefined) {
      params.isActive = isActive
    }
    
    return this.handleRequest(
      apiClient.get<District[]>(`${this.endpoint}/with-municipality`, { params })
    )
  }

  /**
   * Obtener distritos por municipio
   */
  async getByMunicipalityId(municipalityId: number): Promise<District[]> {
    return this.handleRequest(
      apiClient.get<District[]>(`${this.endpoint}/by-municipality`, {
        params: { municipalityId }
      })
    )
  }
}

/**
 * Servicio HTTP genérico que implementa la interfaz HttpService
 */
export class GenericHttpService implements HttpService {
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await apiClient.get<T>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.post<T>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.put<T>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<T>(url)
    return response.data
  }
}

/**
 * Instancias de los servicios para exportar
 */
export const municipalityService = new MunicipalityService()
export const districtService = new DistrictService()
export const httpService = new GenericHttpService()

/**
 * Función utilitaria para manejar errores de API
 */
export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    // Error de respuesta del servidor
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message
      
      switch (status) {
        case 400:
          return `Solicitud incorrecta: ${message}`
        case 401:
          return 'No autorizado. Por favor, inicie sesión.'
        case 403:
          return 'Acceso denegado. No tiene permisos suficientes.'
        case 404:
          return 'Recurso no encontrado.'
        case 409:
          return 'Conflicto: El recurso ya existe o está en uso.'
        case 422:
          return `Datos inválidos: ${message}`
        case 500:
          return 'Error interno del servidor. Intente más tarde.'
        case 503:
          return 'Servicio no disponible temporalmente.'
        default:
          return `Error del servidor (${status}): ${message}`
      }
    }
    
    // Error de red
    if (error.request) {
      return 'Error de conexión. Verifique su conexión a internet.'
    }
  }
  
  return error.message || 'Error desconocido'
}

/**
 * Función utilitaria para verificar conectividad
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get('/health', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/**
 * Configuración de la API para desarrollo
 */
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  enableLogging: process.env.NODE_ENV === 'development'
}

// Exportar el cliente axios para uso directo si es necesario
export { apiClient }

// Exportar tipos relacionados con la API
export type { CrudResult, HttpService } from '@/types'