/**
 * Types Export Index
 * Centralized export of all types and interfaces
 */

// Entity Types
export * from './entities';

// Common Types
export * from './common';

// Re-export commonly used types with aliases
export type {
  Municipality as MunicipalityType,
  Sector as SectorType,
  Complaint as ComplaintType,
  ComplaintType as ComplaintCategory,
  Status as StatusType,
  User as UserType
} from './entities';

export type {
  ApiResponse,
  ApiError,
  ValidationResult,
  LogEntry,
  AppConfig
} from './common';