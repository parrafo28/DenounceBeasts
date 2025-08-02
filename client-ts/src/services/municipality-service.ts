/**
 * Municipality Service
 * Specialized service for municipality operations
 */

import type { 
  Municipality, 
  CreateMunicipalityDto, 
  UpdateMunicipalityDto,
  Sector,
  PromiseResult 
} from '@/types';
import { BaseService } from './base-service';
import { apiClient } from './api-client';
import { logger, validateInput, cached } from '@/utils';
import config from '@/config/app.config';

export class MunicipalityService extends BaseService<
  Municipality,
  CreateMunicipalityDto,
  UpdateMunicipalityDto
> {
  constructor() {
    super(config.api.endpoints.municipalities, 'municipality');
  }

  /**
   * Get municipalities with their sectors
   */
  @cached(5 * 60 * 1000) // 5 minutes cache
  async getMunicipalitiesWithSectors(): PromiseResult<Municipality[]> {
    try {
      logger.info('Fetching municipalities with sectors');
      
      const result = await apiClient.get<Municipality[]>(`${this.endpoint}/with-sectors`);
      
      if (result.success) {
        logger.info('Successfully fetched municipalities with sectors', { 
          count: result.data.length 
        });
      } else {
        logger.error('Failed to fetch municipalities with sectors', { error: result.error });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching municipalities with sectors', { error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'FETCH_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Get sectors for a specific municipality
   */
  @cached(3 * 60 * 1000) // 3 minutes cache
  async getSectorsByMunicipality(municipalityId: number): PromiseResult<Sector[]> {
    try {
      logger.info('Fetching sectors by municipality', { municipalityId });
      
      const result = await apiClient.get<Sector[]>(`${this.endpoint}/${municipalityId}/sectors`);
      
      if (result.success) {
        logger.info('Successfully fetched municipality sectors', { 
          municipalityId,
          count: result.data.length 
        });
      } else {
        logger.error('Failed to fetch municipality sectors', { 
          municipalityId, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching municipality sectors', { municipalityId, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'FETCH_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Get active sectors for a specific municipality
   */
  @cached(3 * 60 * 1000) // 3 minutes cache
  async getActiveSectorsByMunicipality(municipalityId: number): PromiseResult<Sector[]> {
    try {
      logger.info('Fetching active sectors by municipality', { municipalityId });
      
      const result = await apiClient.get<Sector[]>(`${this.endpoint}/${municipalityId}/sectors/active`);
      
      if (result.success) {
        logger.info('Successfully fetched active municipality sectors', { 
          municipalityId,
          count: result.data.length 
        });
      } else {
        logger.error('Failed to fetch active municipality sectors', { 
          municipalityId, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching active municipality sectors', { municipalityId, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'FETCH_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Search municipalities by name or code
   */
  async searchByNameOrCode(query: string): PromiseResult<Municipality[]> {
    try {
      logger.info('Searching municipalities by name or code', { query });
      
      const result = await this.search({
        query,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      if (result.success) {
        return { success: true, data: result.data.data };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error searching municipalities', { query, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'SEARCH_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Check if municipality code is unique
   */
  async isCodeUnique(code: string, excludeId?: number): PromiseResult<boolean> {
    try {
      logger.info('Checking municipality code uniqueness', { code, excludeId });
      
      const result = await apiClient.get<{ unique: boolean }>(
        `${this.endpoint}/check-code/${encodeURIComponent(code)}${excludeId ? `?excludeId=${excludeId}` : ''}`
      );
      
      if (result.success) {
        logger.info('Municipality code uniqueness checked', { 
          code, 
          excludeId,
          unique: result.data.unique 
        });
        
        return { success: true, data: result.data.unique };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error checking municipality code uniqueness', { code, excludeId, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'VALIDATION_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Get municipality statistics including sector count, complaint count, etc.
   */
  async getMunicipalityStats(municipalityId: number): PromiseResult<{
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    sectorsCount: number;
    activeSectorsCount: number;
    complaintsCount: number;
    recentComplaintsCount: number;
    createdAt: Date;
    updatedAt?: Date;
  }> {
    try {
      logger.info('Fetching municipality statistics', { municipalityId });
      
      const result = await apiClient.get<any>(`${this.endpoint}/${municipalityId}/stats`);
      
      if (result.success) {
        logger.info('Successfully fetched municipality statistics', { 
          municipalityId,
          stats: result.data 
        });
      } else {
        logger.error('Failed to fetch municipality statistics', { 
          municipalityId, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching municipality statistics', { municipalityId, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'STATS_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Get municipalities ordered by complaint count
   */
  @cached(10 * 60 * 1000) // 10 minutes cache
  async getMunicipalitiesByComplaintCount(limit = 10): PromiseResult<Array<{
    id: number;
    name: string;
    code: string;
    complaintsCount: number;
  }>> {
    try {
      logger.info('Fetching municipalities by complaint count', { limit });
      
      const result = await apiClient.get<any[]>(
        `${this.endpoint}/by-complaint-count?limit=${limit}`
      );
      
      if (result.success) {
        logger.info('Successfully fetched municipalities by complaint count', { 
          limit,
          count: result.data.length 
        });
      } else {
        logger.error('Failed to fetch municipalities by complaint count', { 
          limit, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching municipalities by complaint count', { limit, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'FETCH_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Create municipality with validation
   */
  @validateInput('municipality')
  async create(data: CreateMunicipalityDto): PromiseResult<Municipality> {
    // Check code uniqueness before creating
    const uniqueResult = await this.isCodeUnique(data.code);
    
    if (!uniqueResult.success) {
      return uniqueResult as any;
    }
    
    if (!uniqueResult.data) {
      return {
        success: false,
        error: {
          message: 'El código del municipio ya existe',
          code: 'DUPLICATE_CODE',
          status: 400,
          timestamp: new Date().toISOString()
        }
      };
    }

    return super.create(data);
  }

  /**
   * Update municipality with validation
   */
  @validateInput('municipality')
  async update(id: number, data: Partial<UpdateMunicipalityDto>): PromiseResult<Municipality> {
    // Check code uniqueness if code is being updated
    if (data.code) {
      const uniqueResult = await this.isCodeUnique(data.code, id);
      
      if (!uniqueResult.success) {
        return uniqueResult as any;
      }
      
      if (!uniqueResult.data) {
        return {
          success: false,
          error: {
            message: 'El código del municipio ya existe',
            code: 'DUPLICATE_CODE',
            status: 400,
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    return super.update(id, data);
  }

  /**
   * Import municipalities from CSV
   */
  async importFromCsv(file: File): PromiseResult<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    try {
      logger.info('Importing municipalities from CSV', { fileName: file.name });
      
      const result = await apiClient.upload<any>(`${this.endpoint}/import-csv`, file);
      
      if (result.success) {
        logger.info('Successfully imported municipalities from CSV', { 
          fileName: file.name,
          result: result.data 
        });
      } else {
        logger.error('Failed to import municipalities from CSV', { 
          fileName: file.name, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error importing municipalities from CSV', { fileName: file.name, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'IMPORT_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Export municipalities to CSV
   */
  async exportToCsv(includeInactive = false): PromiseResult<string> {
    try {
      logger.info('Exporting municipalities to CSV', { includeInactive });
      
      const result = await apiClient.download(
        `${this.endpoint}/export-csv?includeInactive=${includeInactive}`,
        `municipios-${new Date().toISOString().split('T')[0]}.csv`
      );
      
      if (result.success) {
        logger.info('Successfully exported municipalities to CSV', { includeInactive });
        return { success: true, data: 'CSV exported successfully' };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error exporting municipalities to CSV', { includeInactive, error });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'EXPORT_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }
}

// Create and export service instance
export const municipalityService = new MunicipalityService();

export default municipalityService;