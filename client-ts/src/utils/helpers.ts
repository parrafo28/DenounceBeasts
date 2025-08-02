/**
 * Utility Helper Functions
 * Common helper functions used throughout the application
 */

import type { EntityName, Priority, VoteType, NotificationType } from '@/types';
import { logger } from './logger';

/**
 * Debounce function to limit the rate at which a function can fire
 */
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
): ((...args: T) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: T): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle function to limit the rate at which a function can fire
 */
export const throttle = <T extends unknown[]>(
  func: (...args: T) => void,
  limit: number
): ((...args: T) => void) => {
  let inThrottle = false;
  
  return (...args: T): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Format date to locale string
 */
export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString('es-ES', defaultOptions);
  } catch (error) {
    logger.error('Error formatting date', { date, error });
    return 'Error de formato';
  }
};

/**
 * Format datetime to locale string
 */
export const formatDateTime = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return formatDate(date, defaultOptions);
};

/**
 * Get relative time string (e.g., "hace 2 horas")
 */
export const getRelativeTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `hace ${years} año${years > 1 ? 's' : ''}`;
    if (months > 0) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
    if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (seconds > 10) return `hace ${seconds} segundo${seconds > 1 ? 's' : ''}`;
    
    return 'ahora mismo';
  } catch (error) {
    logger.error('Error calculating relative time', { date, error });
    return 'tiempo desconocido';
  }
};

/**
 * Format file size to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Generate a random UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a random string of specified length
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
};

/**
 * Check if two objects are deeply equal
 */
export const deepEqual = (obj1: unknown, obj2: unknown): boolean => {
  if (obj1 === obj2) {
    return true;
  }
  
  if (obj1 == null || obj2 == null) {
    return obj1 === obj2;
  }
  
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1 as object);
  const keys2 = Object.keys(obj2 as object);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    
    if (!deepEqual((obj1 as any)[key], (obj2 as any)[key])) {
      return false;
    }
  }
  
  return true;
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str: string, length: number, suffix = '...'): string => {
  if (str.length <= length) {
    return str;
  }
  
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Escape HTML special characters
 */
export const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Strip HTML tags from string
 */
export const stripHtml = (str: string): string => {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || div.innerText || '';
};

/**
 * Get priority label in Spanish
 */
export const getPriorityLabel = (priority: Priority): string => {
  const labels: Record<Priority, string> = {
    [Priority.LOW]: 'Baja',
    [Priority.MEDIUM]: 'Media',
    [Priority.HIGH]: 'Alta',
    [Priority.CRITICAL]: 'Crítica'
  };
  
  return labels[priority] || priority;
};

/**
 * Get priority CSS class
 */
export const getPriorityClass = (priority: Priority): string => {
  const classes: Record<Priority, string> = {
    [Priority.LOW]: 'badge-success',
    [Priority.MEDIUM]: 'badge-warning',
    [Priority.HIGH]: 'badge-danger',
    [Priority.CRITICAL]: 'badge-dark'
  };
  
  return classes[priority] || 'badge-secondary';
};

/**
 * Get vote type label in Spanish
 */
export const getVoteTypeLabel = (voteType: VoteType): string => {
  const labels: Record<VoteType, string> = {
    [VoteType.UP]: 'A favor',
    [VoteType.DOWN]: 'En contra'
  };
  
  return labels[voteType] || voteType;
};

/**
 * Get notification type label in Spanish
 */
export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    [NotificationType.INFO]: 'Información',
    [NotificationType.SUCCESS]: 'Éxito',
    [NotificationType.WARNING]: 'Advertencia',
    [NotificationType.ERROR]: 'Error'
  };
  
  return labels[type] || type;
};

/**
 * Get notification type CSS class
 */
export const getNotificationTypeClass = (type: NotificationType): string => {
  const classes: Record<NotificationType, string> = {
    [NotificationType.INFO]: 'alert-info',
    [NotificationType.SUCCESS]: 'alert-success',
    [NotificationType.WARNING]: 'alert-warning',
    [NotificationType.ERROR]: 'alert-danger'
  };
  
  return classes[type] || 'alert-secondary';
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES').format(num);
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency = 'DOP'): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Parse query string parameters
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlParams = new URLSearchParams(queryString);
  
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};

/**
 * Build query string from object
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      urlParams.append(key, String(value));
    }
  });
  
  return urlParams.toString();
};

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

/**
 * Check if device is tablet
 */
export const isTablet = (): boolean => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

/**
 * Check if device is desktop
 */
export const isDesktop = (): boolean => {
  return window.innerWidth > 1024;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    logger.error('Error copying to clipboard', { text, error });
    return false;
  }
};

/**
 * Download data as file
 */
export const downloadFile = (
  data: string | Blob,
  filename: string,
  type = 'text/plain'
): void => {
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Error downloading file', { filename, error });
  }
};

/**
 * Get contrast color (black or white) for a given background color
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Remove # if present
  const color = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get entity display name in Spanish
 */
export const getEntityDisplayName = (entityName: EntityName): string => {
  const names: Record<EntityName, string> = {
    municipality: 'Municipio',
    sector: 'Sector',
    complaintType: 'Tipo de Denuncia',
    status: 'Estado',
    complaint: 'Denuncia',
    user: 'Usuario',
    comment: 'Comentario',
    vote: 'Voto',
    attachment: 'Adjunto',
    role: 'Rol',
    userProfile: 'Perfil de Usuario',
    notification: 'Notificación',
    complaintHistory: 'Historial de Denuncia'
  };
  
  return names[entityName] || entityName;
};

/**
 * Sleep utility for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry async operation with exponential backoff
 */
export const retry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

/**
 * Create a cancelable promise
 */
export const createCancelablePromise = <T>(
  promise: Promise<T>
): { promise: Promise<T>; cancel: () => void } => {
  let isCanceled = false;
  
  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then(value => {
        if (!isCanceled) {
          resolve(value);
        }
      })
      .catch(error => {
        if (!isCanceled) {
          reject(error);
        }
      });
  });
  
  return {
    promise: wrappedPromise,
    cancel: () => {
      isCanceled = true;
    }
  };
};