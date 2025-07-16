/**
 * Servicio principal para comunicación con la API
 * Implementa operaciones CRUD para Municipios y Distritos
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import type {
  Municipality,
  District,
  CreateMunicipalityDto,
  CreateDistrictDto,
  UpdateMunicipalityDto,
  UpdateDistrictDto,
  CrudResult,
  HttpService,
  HttpStatusCode,
  HttpMethod,
} from '@/types';
import { Logger } from '@/utils/Logger';

// ===============================================
// CONFIGURACIÓN Y TIPOS
// ===============================================

/**
 * Configuración del cliente HTTP
 */
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Interfaz para interceptores de request
 */
interface RequestInterceptor {
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onRequestError?: (error: any) => any;
}

/**
 * Interfaz para interceptores de response
 */
interface ResponseInterceptor {
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onResponseError?: (error: AxiosError) => any;
}

// ===============================================
// CLASE BASE PARA SERVICIOS API
// ===============================================

/**
 * Clase base abstracta para servicios de API
 */
abstract class BaseApiService {
  protected readonly logger: Logger;

  constructor(loggerName: string) {
    this.logger = new Logger(loggerName);
  }

  /**
   * Maneja una petición HTTP y retorna el resultado
   */
  protected async handleRequest<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
    try {
      const response = await request;
      this.logger.debug('Request successful:', response.status, response.config?.url);
      return response.data;
    } catch (error) {
      this.logger.error('Request failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Maneja una petición CRUD y retorna un resultado estructurado
   */
  protected async handleCrudRequest(request: Promise<AxiosResponse>): Promise<CrudResult> {
    try {
      const response = await request;
      this.logger.info('CRUD operation successful:', response.status, response.config?.method);
      
      return {
        success: true,
        message: this.getSuccessMessage(response.status, response.config?.method as HttpMethod),
        data: response.data,
      };
    } catch (error) {
      this.logger.error('CRUD operation failed:', error);
      const errorMessage = this.extractErrorMessage(error);
      
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Maneja errores de HTTP y los convierte en mensajes legibles
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      switch (status) {
        case HttpStatusCode.BadRequest:
          return new Error(`Solicitud incorrecta: ${message}`);
        case HttpStatusCode.Unauthorized:
          return new Error('No autorizado. Verifique sus credenciales.');
        case HttpStatusCode.Forbidden:
          return new Error('Acceso denegado. No tiene permisos suficientes.');
        case HttpStatusCode.NotFound:
          return new Error('Recurso no encontrado.');
        case HttpStatusCode.Conflict:
          return new Error('Conflicto: El recurso ya existe o está en uso.');
        case HttpStatusCode.UnprocessableEntity:
          return new Error(`Datos inválidos: ${message}`);
        case HttpStatusCode.InternalServerError:
          return new Error('Error interno del servidor. Intente más tarde.');
        case HttpStatusCode.BadGateway:
          return new Error('Error de comunicación con el servidor.');
        case HttpStatusCode.ServiceUnavailable:
          return new Error('Servicio no disponible temporalmente.');
        default:
          return new Error(`Error del servidor (${status}): ${message}`);
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return new Error('Tiempo de espera agotado. Verifique su conexión.');
    }
    
    if (error.request) {
      return new Error('Error de conexión. Verifique su conexión a internet.');
    }
    
    return new Error(error.message || 'Error desconocido');
  }

  /**
   * Extrae mensaje de error legible
   */
  private extractErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || 
             error.message || 
             `Error HTTP ${error.response?.status || 'desconocido'}`;
    }
    
    return error.message || 'Error desconocido';
  }

  /**
   * Genera mensaje de éxito basado en el método HTTP
   */
  private getSuccessMessage(status?: number, method?: HttpMethod): string {
    switch (method) {
      case HttpMethod.POST:
        return 'Elemento creado exitosamente';
      case HttpMethod.PUT:
      case HttpMethod.PATCH:
        return 'Elemento actualizado exitosamente';
      case HttpMethod.DELETE:
        return 'Elemento eliminado exitosamente';
      default:
        return 'Operación realizada exitosamente';
    }
  }
}

// ===============================================
// CLIENTE HTTP PRINCIPAL
// ===============================================

/**
 * Cliente HTTP principal para comunicación con la API
 */
export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly logger: Logger;
  private readonly config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.logger = new Logger('ApiClient');
    this.client = this.createClient();
    this.setupInterceptors();
  }

  /**
   * Crea la instancia de Axios
   */
  private createClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.logger.info('API Client created:', this.config.baseURL);
    return client;
  }

  /**
   * Configura interceptores de request y response
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Agregar timestamp para evitar cache en GET
        if (config.method === 'get') {
          config.params = { ...config.params, _t: Date.now() };
        }

        // Log de desarrollo
        this.logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`, config.data);
        
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`← ${response.status} ${response.config.url}`, response.data);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // Log del error
        this.logger.error(`← ${error.response?.status || 'Network Error'} ${originalRequest?.url}`, 
          error.response?.data || error.message);

        // Retry logic para errores de red
        if (this.shouldRetry(error) && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          this.logger.info('Retrying request:', originalRequest.url);
          await this.delay(this.config.retryDelay);
          
          return this.client(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Determina si una petición debe reintentarse
   */
  private shouldRetry(error: AxiosError): boolean {
    // Reintentar solo para errores de red o errores 5xx
    return !error.response || 
           (error.response.status >= 500 && error.response.status <= 599) ||
           error.code === 'ECONNABORTED';
  }

  /**
   * Delay helper para reintentos
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene la instancia de Axios
   */
  public getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Verifica la salud de la API
   */
  public async checkHealth(): Promise<boolean> {
    try {
      await this.client.get('/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// ===============================================
// SERVICIO PARA MUNICIPIOS
// ===============================================

/**
 * Servicio para operaciones CRUD de Municipios
 */
export class MunicipalityService extends BaseApiService {
  private readonly endpoint = '/municipalities';

  constructor(private readonly client: AxiosInstance) {
    super('MunicipalityService');
  }

  /**
   * Obtiene todos los municipios
   */
  async getAll(): Promise<Municipality[]> {
    this.logger.info('Fetching all municipalities');
    return this.handleRequest(
      this.client.get<Municipality[]>(this.endpoint)
    );
  }

  /**
   * Obtiene municipio por ID
   */
  async getById(id: number): Promise<Municipality> {
    this.logger.info('Fetching municipality by ID:', id);
    return this.handleRequest(
      this.client.get<Municipality>(`${this.endpoint}/${id}`)
    );
  }

  /**
   * Crea un nuevo municipio
   */
  async create(municipality: CreateMunicipalityDto): Promise<CrudResult> {
    this.logger.info('Creating municipality:', municipality.name);
    return this.handleCrudRequest(
      this.client.post(this.endpoint, municipality)
    );
  }

  /**
   * Actualiza un municipio existente
   */
  async update(municipality: UpdateMunicipalityDto): Promise<CrudResult> {
    this.logger.info('Updating municipality:', municipality.id);
    return this.handleCrudRequest(
      this.client.put(this.endpoint, municipality)
    );
  }

  /**
   * Elimina un municipio por ID
   */
  async delete(id: number): Promise<CrudResult> {
    this.logger.info('Deleting municipality:', id);
    return this.handleCrudRequest(
      this.client.delete(`${this.endpoint}/${id}`)
    );
  }

  /**
   * Busca municipios con filtros
   */
  async search(params: {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<Municipality[]> {
    this.logger.info('Searching municipalities with params:', params);
    return this.handleRequest(
      this.client.get<Municipality[]>(this.endpoint, { params })
    );
  }
}

// ===============================================
// SERVICIO PARA DISTRITOS
// ===============================================

/**
 * Servicio para operaciones CRUD de Distritos
 */
export class DistrictService extends BaseApiService {
  private readonly endpoint = '/districts';

  constructor(private readonly client: AxiosInstance) {
    super('DistrictService');
  }

  /**
   * Obtiene todos los distritos con información del municipio
   */
  async getAll(): Promise<District[]> {
    this.logger.info('Fetching all districts');
    return this.handleRequest(
      this.client.get<District[]>(`${this.endpoint}/with-municipality`)
    );
  }

  /**
   * Obtiene distrito por ID
   */
  async getById(id: number): Promise<District> {
    this.logger.info('Fetching district by ID:', id);
    return this.handleRequest(
      this.client.get<District>(`${this.endpoint}/${id}`)
    );
  }

  /**
   * Crea un nuevo distrito
   */
  async create(district: CreateDistrictDto): Promise<CrudResult> {
    this.logger.info('Creating district:', district.name);
    return this.handleCrudRequest(
      this.client.post(this.endpoint, district)
    );
  }

  /**
   * Actualiza un distrito existente
   */
  async update(district: UpdateDistrictDto): Promise<CrudResult> {
    this.logger.info('Updating district:', district.id);
    return this.handleCrudRequest(
      this.client.put(this.endpoint, district)
    );
  }

  /**
   * Elimina un distrito por ID
   */
  async delete(id: number): Promise<CrudResult> {
    this.logger.info('Deleting district:', id);
    return this.handleCrudRequest(
      this.client.delete(`${this.endpoint}/${id}`)
    );
  }

  /**
   * Busca distritos con filtros
   */
  async search(params: {
    search?: string;
    municipalityId?: number;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<District[]> {
    this.logger.info('Searching districts with params:', params);
    return this.handleRequest(
      this.client.get<District[]>(`${this.endpoint}/with-municipality`, { params })
    );
  }

  /**
   * Obtiene distritos por municipio
   */
  async getByMunicipalityId(municipalityId: number): Promise<District[]> {
    this.logger.info('Fetching districts by municipality ID:', municipalityId);
    return this.handleRequest(
      this.client.get<District[]>(`${this.endpoint}/by-municipality`, {
        params: { municipalityId }
      })
    );
  }
}

// ===============================================
// SERVICIO HTTP GENÉRICO
// ===============================================

/**
 * Servicio HTTP genérico que implementa la interfaz HttpService
 */
export class GenericHttpService implements HttpService {
  constructor(private readonly client: AxiosInstance) {}

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }
}

// ===============================================
// FACTORY PARA CREAR SERVICIOS
// ===============================================

/**
 * Factory para crear instancias de servicios API
 */
export class ApiServiceFactory {
  private static client: ApiClient;
  private static municipalityService: MunicipalityService;
  private static districtService: DistrictService;
  private static httpService: GenericHttpService;

  /**
   * Inicializa la factory con la configuración
   */
  static initialize(config: ApiClientConfig): void {
    this.client = new ApiClient(config);
    const axiosInstance = this.client.getInstance();
    
    this.municipalityService = new MunicipalityService(axiosInstance);
    this.districtService = new DistrictService(axiosInstance);
    this.httpService = new GenericHttpService(axiosInstance);
  }

  /**
   * Obtiene el servicio de municipios
   */
  static getMunicipalityService(): MunicipalityService {
    if (!this.municipalityService) {
      throw new Error('ApiServiceFactory no ha sido inicializada');
    }
    return this.municipalityService;
  }

  /**
   * Obtiene el servicio de distritos
   */
  static getDistrictService(): DistrictService {
    if (!this.districtService) {
      throw new Error('ApiServiceFactory no ha sido inicializada');
    }
    return this.districtService;
  }

  /**
   * Obtiene el servicio HTTP genérico
   */
  static getHttpService(): GenericHttpService {
    if (!this.httpService) {
      throw new Error('ApiServiceFactory no ha sido inicializada');
    }
    return this.httpService;
  }

  /**
   * Obtiene el cliente API
   */
  static getClient(): ApiClient {
    if (!this.client) {
      throw new Error('ApiServiceFactory no ha sido inicializada');
    }
    return this.client;
  }

  /**
   * Verifica la salud de la API
   */
  static async checkApiHealth(): Promise<boolean> {
    return this.getClient().checkHealth();
  }
}

// ===============================================
// EXPORTACIONES
// ===============================================

// Configuración por defecto
export const defaultApiConfig: ApiClientConfig = {
  baseURL: 'https://localhost:7175/api',
  timeout: 10000, // 10 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
};

// Exportar tipos
export type { ApiClientConfig, RequestInterceptor, ResponseInterceptor };