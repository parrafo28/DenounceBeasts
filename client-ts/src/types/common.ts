/**
 * Common Types and Interfaces
 * Shared types used across the application
 */

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  data?: unknown;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request Configuration
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retryAttempts?: number;
  cache?: CacheOptions;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Cache Types
export interface CacheOptions {
  ttl?: number;
  persist?: boolean;
  key?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  enabled: boolean;
  memorySize: number;
  storageSize: number;
  maxSize: number;
  ttl: number;
}

// Event Types
export interface AppEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  target: unknown;
  preventDefault: boolean;
  stopPropagation: boolean;
}

export interface EventListener<T = unknown> {
  (event: AppEvent<T>): void | Promise<void>;
}

export interface EventEmitterOptions {
  once?: boolean;
  priority?: number;
  context?: unknown;
  id?: string;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  type?: ValidationType;
  email?: boolean;
  url?: boolean;
  custom?: string;
}

export type ValidationType = 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

// Logger Types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

export interface LoggerOptions {
  context?: string;
  enableLogging?: boolean;
  logLevel?: LogLevel;
}

// Component Types
export interface ComponentOptions {
  container: HTMLElement;
  data?: unknown;
  events?: Record<string, EventListener>;
  template?: string;
  autoRender?: boolean;
}

export interface DataTableColumn<T = unknown> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => string;
}

export interface DataTableOptions<T = unknown> {
  columns: DataTableColumn<T>[];
  data: T[];
  pagination?: boolean;
  pageSize?: number;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
  actions?: TableAction<T>[];
  className?: string;
  emptyMessage?: string;
}

export interface TableAction<T = unknown> {
  name: string;
  icon?: string;
  label: string;
  className?: string;
  handler: (row: T) => void | Promise<void>;
  visible?: (row: T) => boolean;
}

// Form Types
export interface FormField {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FormOption[];
  validation?: ValidationRule;
  defaultValue?: unknown;
  disabled?: boolean;
  readonly?: boolean;
  helpText?: string;
  className?: string;
}

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'date' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'color' 
  | 'hidden';

export interface FormOption {
  value: string | number;
  label: string;
  selected?: boolean;
  disabled?: boolean;
}

export interface FormData {
  [fieldName: string]: unknown;
}

// Modal Types
export interface ModalOptions {
  title?: string;
  size?: ModalSize;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  focus?: boolean;
  show?: boolean;
  className?: string;
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

// Notification Types
export interface NotificationOptions {
  type?: NotificationLevel;
  title?: string;
  message: string;
  duration?: number;
  position?: NotificationPosition;
  closable?: boolean;
  actions?: NotificationAction[];
}

export type NotificationLevel = 'success' | 'info' | 'warning' | 'error';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface NotificationAction {
  label: string;
  handler: () => void;
  className?: string;
}

// Search and Filter Types
export interface SearchOptions {
  query?: string;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export type SortOrder = 'asc' | 'desc';

export interface FilterOption {
  key: string;
  label: string;
  type: FilterType;
  options?: { value: unknown; label: string }[];
  placeholder?: string;
}

export type FilterType = 'text' | 'select' | 'date' | 'number' | 'boolean';

// File Upload Types
export interface FileUploadOptions {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
  autoUpload?: boolean;
  preview?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

// Application Configuration Types
export interface AppConfig {
  api: ApiConfig;
  ui: UiConfig;
  cache: CacheConfig;
  validation: ValidationConfig;
  features: FeatureFlags;
  development: DevelopmentConfig;
  messages: MessagesConfig;
  themes: ThemeConfig;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  endpoints: Record<string, string>;
}

export interface UiConfig {
  itemsPerPage: number;
  maxItemsPerPage: number;
  debounceDelay: number;
  animationDuration: number;
  toastDuration: number;
  modalTransition: number;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  enabled: boolean;
  prefix: string;
}

export interface ValidationConfig {
  [entityName: string]: ValidationSchema;
}

export interface FeatureFlags {
  enableCache: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableBulkOperations: boolean;
  enableAdvancedFilters: boolean;
  enableExport: boolean;
  enableImageUpload: boolean;
  enableGeolocation: boolean;
}

export interface DevelopmentConfig {
  enableLogging: boolean;
  enableDebugMode: boolean;
  mockData: boolean;
  logLevel: LogLevel;
}

export interface MessagesConfig {
  errors: Record<string, string>;
  success: Record<string, string>;
  info: Record<string, string>;
}

export interface ThemeConfig {
  default: Record<string, string>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type AsyncFunction<T = void> = (...args: unknown[]) => Promise<T>;

export type SyncFunction<T = void> = (...args: unknown[]) => T;

export type Constructor<T = object> = new (...args: unknown[]) => T;

// Type Helpers
export type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type NonEmptyArray<T> = [T, ...T[]];

// Branded Types for IDs
export type MunicipalityId = number & { readonly brand: unique symbol };
export type SectorId = number & { readonly brand: unique symbol };
export type ComplaintId = number & { readonly brand: unique symbol };
export type UserId = number & { readonly brand: unique symbol };

// Result Type for Error Handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Promise Wrapper Types
export type PromiseResult<T> = Promise<Result<T, ApiError>>;

// State Management Types
export interface AppState {
  loading: boolean;
  error: string | null;
  user: User | null;
  municipalities: Municipality[];
  sectors: Sector[];
  complaintTypes: ComplaintType[];
  statuses: Status[];
  complaints: Complaint[];
  currentPage: Record<string, number>;
  filters: Record<string, SearchOptions>;
}

export type StateKey = keyof AppState;

export interface StateUpdate<T = unknown> {
  key: StateKey;
  value: T;
  timestamp: number;
}