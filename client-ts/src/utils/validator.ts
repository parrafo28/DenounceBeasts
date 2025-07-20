/**
 * Advanced Validation System
 * Type-safe validation with comprehensive error handling
 */

import type { 
  ValidationRule, 
  ValidationResult, 
  ValidationSchema, 
  ValidationType 
} from '@/types';
import config from '@/config/app.config';
import { logger } from './logger';
import { isValidEmail, isValidUrl } from './helpers';

export class Validator {
  private schema: ValidationSchema;
  private messages: Record<string, string>;

  constructor(schema: ValidationSchema) {
    this.schema = schema;
    this.messages = config.messages.errors;
  }

  /**
   * Validate a single value against a rule
   */
  private validateValue(
    value: unknown, 
    rule: ValidationRule, 
    fieldName: string
  ): string[] {
    const errors: string[] = [];

    // Required validation
    if (rule.required && this.isEmpty(value)) {
      errors.push(this.formatMessage('required', fieldName));
      return errors; // Skip other validations if required field is empty
    }

    // Skip other validations if value is empty and not required
    if (this.isEmpty(value) && !rule.required) {
      return errors;
    }

    // Type validation
    if (rule.type && !this.validateType(value, rule.type)) {
      errors.push(this.formatMessage('type', fieldName, { type: rule.type }));
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(this.formatMessage('minLength', fieldName, { min: rule.minLength }));
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(this.formatMessage('maxLength', fieldName, { max: rule.maxLength }));
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(this.formatMessage('pattern', fieldName));
      }

      if (rule.email && !isValidEmail(value)) {
        errors.push(this.formatMessage('email', fieldName));
      }

      if (rule.url && !isValidUrl(value)) {
        errors.push(this.formatMessage('url', fieldName));
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(this.formatMessage('min', fieldName, { min: rule.min }));
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push(this.formatMessage('max', fieldName, { max: rule.max }));
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = this.validateCustom(value, rule.custom, fieldName);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors;
  }

  /**
   * Check if value is empty
   */
  private isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    return false;
  }

  /**
   * Validate value type
   */
  private validateType(value: unknown, type: ValidationType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      
      case 'boolean':
        return typeof value === 'boolean';
      
      case 'email':
        return typeof value === 'string' && isValidEmail(value);
      
      case 'url':
        return typeof value === 'string' && isValidUrl(value);
      
      case 'date':
        if (value instanceof Date) {
          return !isNaN(value.getTime());
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }
        return false;
      
      default:
        return true;
    }
  }

  /**
   * Custom validation handler
   */
  private validateCustom(value: unknown, custom: string, fieldName: string): string | null {
    try {
      // In a real implementation, you might have a registry of custom validators
      // For now, we'll handle some common custom validations
      switch (custom) {
        case 'uniqueCode':
          return this.validateUniqueCode(value as string, fieldName);
        
        case 'strongPassword':
          return this.validateStrongPassword(value as string, fieldName);
        
        case 'phoneNumber':
          return this.validatePhoneNumber(value as string, fieldName);
        
        case 'coordinates':
          return this.validateCoordinates(value as { lat: number; lng: number }, fieldName);
        
        default:
          logger.warn('Unknown custom validation', { custom, fieldName });
          return null;
      }
    } catch (error) {
      logger.error('Error in custom validation', { custom, fieldName, error });
      return this.formatMessage('general', fieldName);
    }
  }

  /**
   * Validate unique code format
   */
  private validateUniqueCode(value: string, fieldName: string): string | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    // Code should be alphanumeric with optional hyphens, 2-10 characters
    const codeRegex = /^[A-Z0-9-]{2,10}$/;
    if (!codeRegex.test(value)) {
      return `El código debe contener solo letras mayúsculas, números y guiones (2-10 caracteres)`;
    }

    return null;
  }

  /**
   * Validate strong password
   */
  private validateStrongPassword(value: string, fieldName: string): string | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (value.length < minLength) {
      return `La contraseña debe tener al menos ${minLength} caracteres`;
    }

    if (!hasUpperCase) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }

    if (!hasLowerCase) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }

    if (!hasNumbers) {
      return 'La contraseña debe contener al menos un número';
    }

    if (!hasSpecialChar) {
      return 'La contraseña debe contener al menos un carácter especial';
    }

    return null;
  }

  /**
   * Validate phone number format
   */
  private validatePhoneNumber(value: string, fieldName: string): string | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    // Dominican Republic phone number format
    const phoneRegex = /^(\+1)?[-.\s]?\(?809|829|849\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    if (!phoneRegex.test(value)) {
      return 'El número de teléfono debe tener un formato válido (809-xxx-xxxx)';
    }

    return null;
  }

  /**
   * Validate coordinates
   */
  private validateCoordinates(value: { lat: number; lng: number }, fieldName: string): string | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const { lat, lng } = value;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return 'Las coordenadas deben ser números válidos';
    }

    if (lat < -90 || lat > 90) {
      return 'La latitud debe estar entre -90 y 90 grados';
    }

    if (lng < -180 || lng > 180) {
      return 'La longitud debe estar entre -180 y 180 grados';
    }

    return null;
  }

  /**
   * Format validation message with placeholders
   */
  private formatMessage(
    messageKey: string, 
    fieldName: string, 
    params: Record<string, unknown> = {}
  ): string {
    let message = this.messages[messageKey] || this.messages.general;
    
    // Replace placeholders
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });

    return message;
  }

  /**
   * Validate an object against the schema
   */
  validate(data: Record<string, unknown>): ValidationResult {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    // Validate each field in the schema
    Object.entries(this.schema).forEach(([fieldName, rule]) => {
      const value = data[fieldName];
      const fieldErrors = this.validateValue(value, rule, fieldName);

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        isValid = false;
      }
    });

    // Check for unexpected fields (not in schema)
    Object.keys(data).forEach(fieldName => {
      if (!this.schema[fieldName]) {
        logger.warn('Unexpected field in validation data', { fieldName, value: data[fieldName] });
      }
    });

    return { isValid, errors };
  }

  /**
   * Validate a single field
   */
  validateField(fieldName: string, value: unknown): ValidationResult {
    const rule = this.schema[fieldName];
    
    if (!rule) {
      logger.warn('Field not found in validation schema', { fieldName });
      return { isValid: true, errors: {} };
    }

    const fieldErrors = this.validateValue(value, rule, fieldName);
    const isValid = fieldErrors.length === 0;

    return {
      isValid,
      errors: isValid ? {} : { [fieldName]: fieldErrors }
    };
  }

  /**
   * Add or update a validation rule
   */
  addRule(fieldName: string, rule: ValidationRule): void {
    this.schema[fieldName] = rule;
  }

  /**
   * Remove a validation rule
   */
  removeRule(fieldName: string): void {
    delete this.schema[fieldName];
  }

  /**
   * Get validation rule for a field
   */
  getRule(fieldName: string): ValidationRule | undefined {
    return this.schema[fieldName];
  }

  /**
   * Check if field is required
   */
  isRequired(fieldName: string): boolean {
    const rule = this.schema[fieldName];
    return rule?.required ?? false;
  }

  /**
   * Get field type
   */
  getFieldType(fieldName: string): ValidationType | undefined {
    const rule = this.schema[fieldName];
    return rule?.type;
  }
}

/**
 * Create validator for specific entity
 */
export const createValidator = (entityName: string): Validator => {
  const schema = config.validation[entityName];
  
  if (!schema) {
    logger.warn('Validation schema not found for entity', { entityName });
    return new Validator({});
  }

  return new Validator(schema);
};

/**
 * Validate municipality data
 */
export const validateMunicipality = (data: Record<string, unknown>): ValidationResult => {
  const validator = createValidator('municipality');
  return validator.validate(data);
};

/**
 * Validate sector data
 */
export const validateSector = (data: Record<string, unknown>): ValidationResult => {
  const validator = createValidator('sector');
  return validator.validate(data);
};

/**
 * Validate complaint data
 */
export const validateComplaint = (data: Record<string, unknown>): ValidationResult => {
  const validator = createValidator('complaint');
  return validator.validate(data);
};

/**
 * Validate complaint type data
 */
export const validateComplaintType = (data: Record<string, unknown>): ValidationResult => {
  const validator = createValidator('complaintType');
  return validator.validate(data);
};

/**
 * Validate status data
 */
export const validateStatus = (data: Record<string, unknown>): ValidationResult => {
  const validator = createValidator('status');
  return validator.validate(data);
};

/**
 * Validate user data
 */
export const validateUser = (data: Record<string, unknown>): ValidationResult => {
  const validator = createValidator('user');
  return validator.validate(data);
};

/**
 * Validate comment data
 */
export const validateComment = (data: Record<string, unknown>): ValidationResult => {
  const validator = createValidator('comment');
  return validator.validate(data);
};

/**
 * Real-time validation helper
 */
export class RealTimeValidator {
  private validator: Validator;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private validationCallbacks: Map<string, (result: ValidationResult) => void> = new Map();

  constructor(validator: Validator) {
    this.validator = validator;
  }

  /**
   * Setup real-time validation for a field
   */
  setupFieldValidation(
    fieldName: string,
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    callback: (result: ValidationResult) => void,
    debounceMs = 300
  ): void {
    this.validationCallbacks.set(fieldName, callback);

    const validateField = (): void => {
      const value = this.getElementValue(element);
      const result = this.validator.validateField(fieldName, value);
      callback(result);
    };

    const debouncedValidate = (): void => {
      const existingTimer = this.debounceTimers.get(fieldName);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(validateField, debounceMs);
      this.debounceTimers.set(fieldName, timer);
    };

    // Add event listeners
    element.addEventListener('input', debouncedValidate);
    element.addEventListener('blur', validateField);
    element.addEventListener('change', validateField);
  }

  /**
   * Get value from form element
   */
  private getElementValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): unknown {
    switch (element.type) {
      case 'checkbox':
        return (element as HTMLInputElement).checked;
      
      case 'number':
        const numValue = parseFloat((element as HTMLInputElement).value);
        return isNaN(numValue) ? undefined : numValue;
      
      case 'date':
        const dateValue = (element as HTMLInputElement).value;
        return dateValue ? new Date(dateValue) : undefined;
      
      default:
        return element.value;
    }
  }

  /**
   * Validate all fields
   */
  validateAll(data: Record<string, unknown>): ValidationResult {
    return this.validator.validate(data);
  }

  /**
   * Clear all timers
   */
  cleanup(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.validationCallbacks.clear();
  }
}

/**
 * Validation decorator for methods
 */
export const validateInput = (entityName: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const data = args[0];
      
      if (data && typeof data === 'object') {
        const validator = createValidator(entityName);
        const result = validator.validate(data);
        
        if (!result.isValid) {
          const errorMessage = Object.values(result.errors)
            .flat()
            .join(', ');
          
          throw new Error(`Validation failed: ${errorMessage}`);
        }
      }

      return method.apply(this, args);
    };
  };
};

export default Validator;