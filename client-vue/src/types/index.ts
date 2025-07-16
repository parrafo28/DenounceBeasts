/**
 * Definiciones de tipos TypeScript para la aplicación Vue
 * Estas interfaces definen la estructura de datos que maneja la aplicación
 */

// Tipo base para entidades que tienen ID
export interface BaseEntity {
  id: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

// Interfaz para Municipio
export interface Municipality extends BaseEntity {
  name: string
  code: string
  isActive: boolean
}

// Interfaz para Distrito
export interface District extends BaseEntity {
  name: string
  code: string
  municipalityId: number
  municipalityName?: string
  isActive: boolean
}

// DTOs para creación (sin ID)
export interface CreateMunicipalityDto {
  name: string
  code: string
  isActive: boolean
}

export interface CreateDistrictDto {
  name: string
  code: string
  municipalityId: number
  isActive: boolean
}

// DTOs para actualización (con ID)
export interface UpdateMunicipalityDto extends CreateMunicipalityDto {
  id: number
}

export interface UpdateDistrictDto extends CreateDistrictDto {
  id: number
}

// Interfaz para respuestas de la API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

// Tipo para el resultado de operaciones CRUD
export interface CrudResult {
  success: boolean
  message: string
  data?: any
}

// Interfaces para filtros
export interface MunicipalityFilter {
  search?: string
  isActive?: boolean | null
  page?: number
  pageSize?: number
}

export interface DistrictFilter {
  search?: string
  municipalityId?: number | null
  isActive?: boolean | null
  page?: number
  pageSize?: number
}

// Interfaz para paginación
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Interfaz para datos paginados
export interface PaginatedResult<T> {
  data: T[]
  pagination: PaginationInfo
}

// Tipos para notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationOptions {
  title?: string
  message: string
  type: NotificationType
  duration?: number
  showCloseButton?: boolean
}

// Tipos para el estado de la aplicación
export interface AppState {
  isLoading: boolean
  isDarkMode: boolean
  notifications: NotificationOptions[]
  user?: User
}

// Interfaz para usuario (para futuras implementaciones)
export interface User {
  id: number
  name: string
  email: string
  role: string
  isActive: boolean
}

// Tipos para validación de formularios
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message: string
}

export interface FormField {
  value: any
  rules: ValidationRule[]
  error?: string
  touched: boolean
}

// Tipos para configuración de tabla
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any) => string
}

// Tipos para acciones de tabla
export interface TableAction {
  label: string
  icon: string
  color: string
  handler: (item: any) => void
  show?: (item: any) => boolean
}

// Tipos para modales
export interface ModalOptions {
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  backdrop?: boolean | 'static'
  keyboard?: boolean
}

// Tipos para breadcrumbs
export interface BreadcrumbItem {
  label: string
  to?: string
  active?: boolean
}

// Tipos para configuración de rutas
export interface RouteConfig {
  path: string
  name: string
  component: any
  meta?: {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
    breadcrumbs?: BreadcrumbItem[]
  }
}

// Tipos para configuración de la aplicación
export interface AppConfig {
  apiBaseUrl: string
  appName: string
  version: string
  environment: 'development' | 'production' | 'test'
  features: {
    darkMode: boolean
    notifications: boolean
    breadcrumbs: boolean
  }
}

// Tipos para eventos
export interface AppEvent {
  type: string
  payload?: any
  timestamp: Date
}

// Tipos para storage
export interface StorageService {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}

// Tipos para servicios HTTP
export interface HttpService {
  get<T>(url: string, params?: any): Promise<T>
  post<T>(url: string, data?: any): Promise<T>
  put<T>(url: string, data?: any): Promise<T>
  delete<T>(url: string): Promise<T>
}

// Tipos para exportación de datos
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  filename?: string
  columns?: string[]
  data: any[]
}

// Tipos para configuración de gráficos (para futuras implementaciones)
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  data: any[]
  options?: any
  responsive?: boolean
}

// Tipos para logs de auditoría
export interface AuditLog {
  id: number
  userId: number
  action: string
  entity: string
  entityId: number
  oldValues?: any
  newValues?: any
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

// Tipos para configuración de tema
export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  successColor: string
  dangerColor: string
  warningColor: string
  infoColor: string
  lightColor: string
  darkColor: string
}

// Tipos para utilitarios
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Tipos para funciones utilitarias
export type Predicate<T> = (value: T) => boolean
export type Mapper<T, U> = (value: T) => U
export type Reducer<T, U> = (accumulator: U, current: T) => U