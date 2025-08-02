/**
 * Utilities Export Index
 * Centralized export of all utility functions and classes
 */

// Logger utilities
export { Logger, logger, createLogger, performanceLogger, errorLogger, apiLogger, uiLogger } from './logger';

// Helper functions
export * from './helpers';

// Validation utilities
export { 
  Validator, 
  RealTimeValidator,
  createValidator,
  validateMunicipality,
  validateSector,
  validateComplaint,
  validateComplaintType,
  validateStatus,
  validateUser,
  validateComment,
  validateInput
} from './validator';

// Cache utilities
export { 
  CacheManager, 
  cache, 
  cached, 
  invalidateCache, 
  memoize 
} from './cache';

// Event system
export { 
  EventEmitter, 
  eventBus, 
  EVENT_TYPES, 
  withEventEmitter,
  type EventType 
} from './event-emitter';

// Re-export commonly used types
export type {
  ValidationResult,
  ValidationRule,
  ValidationSchema,
  CacheEntry,
  CacheStats,
  CacheOptions,
  AppEvent,
  EventListener,
  EventEmitterOptions,
  LogLevel,
  LogEntry,
  LoggerOptions
} from '@/types';

// Utility constants
export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 500;
export const DEFAULT_TIMEOUT = 30000;
export const RETRY_ATTEMPTS = 3;
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Common validation schemas for quick access
export const VALIDATION_SCHEMAS = {
  municipality: 'municipality',
  sector: 'sector',
  complaint: 'complaint',
  complaintType: 'complaintType',
  status: 'status',
  user: 'user',
  comment: 'comment'
} as const;