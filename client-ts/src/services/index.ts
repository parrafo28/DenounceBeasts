/**
 * Services Export Index
 * Centralized export of all services
 */

// Core services
export { ApiClient, apiClient } from './api-client';
export { BaseService } from './base-service';

// Entity services
export { MunicipalityService, municipalityService } from './municipality-service';
export { SectorService, sectorService } from './sector-service';

// Service factory and utilities
export class ServiceFactory {
  private static services: Map<string, any> = new Map();

  /**
   * Register a service
   */
  static register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a registered service
   */
  static get<T>(name: string): T | undefined {
    return this.services.get(name);
  }

  /**
   * Check if service is registered
   */
  static has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  static getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all registered services
   */
  static clear(): void {
    this.services.clear();
  }
}

// Register default services
ServiceFactory.register('municipality', municipalityService);
ServiceFactory.register('sector', sectorService);

// Service types for type safety
export interface Services {
  municipality: MunicipalityService;
  sector: SectorService;
}

/**
 * Get service with type safety
 */
export function getService<K extends keyof Services>(name: K): Services[K] {
  const service = ServiceFactory.get(name);
  if (!service) {
    throw new Error(`Service '${name}' is not registered`);
  }
  return service;
}

/**
 * Service manager for lifecycle management
 */
export class ServiceManager {
  private initialized = false;
  private services: Services;

  constructor() {
    this.services = {
      municipality: municipalityService,
      sector: sectorService
    };
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize services if they have initialization methods
      // For now, services don't require initialization
      
      this.initialized = true;
      console.log('Services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Get all services
   */
  getServices(): Services {
    return this.services;
  }

  /**
   * Get specific service
   */
  getService<K extends keyof Services>(name: K): Services[K] {
    return this.services[name];
  }

  /**
   * Check if services are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Destroy all services and cleanup resources
   */
  destroy(): void {
    // Cleanup services if they have destroy methods
    this.initialized = false;
    console.log('Services destroyed');
  }
}

// Create and export default service manager
export const serviceManager = new ServiceManager();

// Export service instances for direct access
export const services = {
  municipality: municipalityService,
  sector: sectorService
};

export default services;