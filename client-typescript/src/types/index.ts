/**
 * Definiciones de tipos TypeScript para DenounceBeasts
 * Este archivo contiene todas las interfaces y tipos utilizados en la aplicación
 */

// ===============================================
// ENTIDADES BASE
// ===============================================

/**
 * Interfaz base para todas las entidades que tienen ID
 */
export interface BaseEntity {
  readonly id: number;
  readonly createdAt?: Date | string;
  readonly updatedAt?: Date | string;
}

/**
 * Interfaz para metadatos de auditoria
 */
export interface AuditableEntity extends BaseEntity {
  readonly createdBy?: string;
  readonly updatedBy?: string;
}

// ===============================================
// ENTIDADES PRINCIPALES
// ===============================================

/**
 * Interfaz que representa un Municipio
 */
export interface Municipality extends BaseEntity {
  name: string;
  code: string;
  isActive: boolean;
}

/**
 * Interfaz que representa un Distrito
 */
export interface District extends BaseEntity {
  name: string;
  code: string;
  municipalityId: number;
  municipalityName?: string;
  isActive: boolean;
}

// ===============================================
// DTOs PARA OPERACIONES CRUD
// ===============================================

/**
 * DTO para crear un nuevo municipio
 */
export interface CreateMunicipalityDto {
  name: string;
  code: string;
  isActive: boolean;
}

/**
 * DTO para actualizar un municipio existente
 */
export interface UpdateMunicipalityDto extends CreateMunicipalityDto {
  id: number;
}

/**
 * DTO para crear un nuevo distrito
 */
export interface CreateDistrictDto {
  name: string;
  code: string;
  municipalityId: number;
  isActive: boolean;
}

/**
 * DTO para actualizar un distrito existente
 */
export interface UpdateDistrictDto extends CreateDistrictDto {
  id: number;
}

// ===============================================
// RESPUESTAS DE API
// ===============================================

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp?: string;
}

/**
 * Resultado de operaciones CRUD
 */
export interface CrudResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

/**
 * Respuesta con datos paginados
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Información de paginación
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===============================================
// FILTROS Y BÚSQUEDA
// ===============================================

/**
 * Filtros base para búsquedas
 */
export interface BaseFilter {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filtros específicos para municipios
 */
export interface MunicipalityFilter extends BaseFilter {
  isActive?: boolean | null;
  codePrefix?: string;
}

/**
 * Filtros específicos para distritos
 */
export interface DistrictFilter extends BaseFilter {
  municipalityId?: number | null;
  isActive?: boolean | null;
  codePrefix?: string;
}

// ===============================================
// CONFIGURACIÓN DE UI
// ===============================================

/**
 * Configuración de columnas para tablas
 */
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, item: T) => string;
  cellClass?: string;
  headerClass?: string;
}

/**
 * Configuración de acciones para tablas
 */
export interface TableAction<T = any> {
  label: string;
  icon: string;
  color: string;
  handler: (item: T) => void | Promise<void>;
  show?: (item: T) => boolean;
  disabled?: (item: T) => boolean;
  tooltip?: string;
}

/**
 * Opciones para modales
 */
export interface ModalOptions {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  centered?: boolean;
  scrollable?: boolean;
}

// ===============================================
// NOTIFICACIONES Y ALERTAS
// ===============================================

/**
 * Tipos de notificación
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Opciones para notificaciones
 */
export interface NotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
  showCloseButton?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  persistent?: boolean;
}

/**
 * Opciones para confirmaciones
 */
export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'question' | 'info';
  dangerMode?: boolean;
}

// ===============================================
// VALIDACIÓN DE FORMULARIOS
// ===============================================

/**
 * Regla de validación
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
  custom?: (value: any) => boolean | string;
  message: string;
}

/**
 * Campo de formulario con validación
 */
export interface FormField<T = any> {
  value: T;
  rules: ValidationRule[];
  error?: string;
  touched: boolean;
  valid: boolean;
}

/**
 * Estado de validación de formulario
 */
export interface FormValidation {
  valid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// ===============================================
// ESTADO DE LA APLICACIÓN
// ===============================================

/**
 * Estado global de la aplicación
 */
export interface AppState {
  isLoading: boolean;
  isDarkMode: boolean;
  currentUser?: User;
  notifications: NotificationOptions[];
  connectionStatus: 'online' | 'offline';
  lastSync?: Date;
}

/**
 * Estado para manejo de datos
 */
export interface DataState<T> {
  items: T[];
  loading: boolean;
  error?: string;
  lastFetch?: Date;
  filters?: any;
  pagination?: PaginationInfo;
}

// ===============================================
// USUARIO Y AUTENTICACIÓN
// ===============================================

/**
 * Interfaz para usuario (futuras implementaciones)
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  lastLogin?: Date;
  permissions: string[];
}

/**
 * Información de sesión
 */
export interface SessionInfo {
  user: User;
  token: string;
  expiresAt: Date;
  refreshToken?: string;
}

// ===============================================
// CONFIGURACIÓN
// ===============================================

/**
 * Configuración de la aplicación
 */
export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  features: {
    darkMode: boolean;
    notifications: boolean;
    offlineMode: boolean;
    analytics: boolean;
  };
  ui: {
    defaultPageSize: number;
    maxPageSize: number;
    animationDuration: number;
    debounceDelay: number;
  };
}

/**
 * Configuración de tema
 */
export interface ThemeConfig {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  light: string;
  dark: string;
  fontFamily: string;
  fontSize: string;
}

// ===============================================
// EVENTOS Y OBSERVADORES
// ===============================================

/**
 * Evento de la aplicación
 */
export interface AppEvent<T = any> {
  type: string;
  payload?: T;
  timestamp: Date;
  source?: string;
}

/**
 * Interfaz para observadores de eventos
 */
export interface EventObserver<T = any> {
  handle(event: AppEvent<T>): void | Promise<void>;
}

/**
 * Manejador de eventos
 */
export type EventHandler<T = any> = (event: AppEvent<T>) => void | Promise<void>;

// ===============================================
// SERVICIOS
// ===============================================

/**
 * Interfaz para servicios HTTP
 */
export interface HttpService {
  get<T>(url: string, params?: any): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
  patch<T>(url: string, data?: any): Promise<T>;
}

/**
 * Interfaz para servicios de storage
 */
export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

/**
 * Interfaz para servicios de cache
 */
export interface CacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  isExpired(key: string): boolean;
}

// ===============================================
// COMPONENTES
// ===============================================

/**
 * Interfaz base para componentes
 */
export interface Component {
  readonly element: HTMLElement;
  render(): void;
  destroy(): void;
  update?(data?: any): void;
}

/**
 * Propiedades base para componentes
 */
export interface ComponentProps {
  className?: string;
  id?: string;
  styles?: Partial<CSSStyleDeclaration>;
  attributes?: Record<string, string>;
}

/**
 * Opciones para crear componentes
 */
export interface ComponentOptions extends ComponentProps {
  parent?: HTMLElement;
  template?: string;
  data?: any;
  events?: Record<string, EventListener>;
}

// ===============================================
// TIPOS UTILITARIOS
// ===============================================

/**
 * Hacer todas las propiedades opcionales recursivamente
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Hacer ciertas propiedades requeridas
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Hacer ciertas propiedades opcionales
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Omitir propiedades readonly
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Extraer tipo de valor de una promesa
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Función de predicado
 */
export type Predicate<T> = (value: T, index?: number, array?: T[]) => boolean;

/**
 * Función de mapeo
 */
export type Mapper<T, U> = (value: T, index?: number, array?: T[]) => U;

/**
 * Función de reducción
 */
export type Reducer<T, U> = (accumulator: U, current: T, index?: number, array?: T[]) => U;

/**
 * Función de comparación para ordenamiento
 */
export type Comparator<T> = (a: T, b: T) => number;

// ===============================================
// CONSTANTES DE TIPOS
// ===============================================

/**
 * Códigos de estado HTTP
 */
export const enum HttpStatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

/**
 * Métodos HTTP
 */
export const enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

/**
 * Tipos de almacenamiento
 */
export const enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
  MEMORY = 'memory',
}

/**
 * Niveles de log
 */
export const enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}