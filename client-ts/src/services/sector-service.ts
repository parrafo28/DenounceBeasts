/**
 * Sector Service
 * Specialized service for sector operations
 */

import type { 
  Sector, 
  CreateSectorDto, 
  UpdateSectorDto,
  Municipality,
  PromiseResult 
} from '@/types';
import { BaseService } from './base-service';
import { apiClient } from './api-client';
import { logger, validateInput, cached } from '@/utils';
import config from '@/config/app.config';

export class SectorService extends BaseService<
  Sector,
  CreateSectorDto,
  UpdateSectorDto
> {
  constructor() {
    super(config.api.endpoints.sectors, 'sector');
  }

  /**
   * Get sectors with their municipality information
   */
  @cached(5 * 60 * 1000) // 5 minutes cache
  async getSectorsWithMunicipality(): PromiseResult<Sector[]> {
    try {
      logger.info('Fetching sectors with municipality');
      
      const result = await apiClient.get<Sector[]>(`${this.endpoint}/with-municipality`);
      
      if (result.success) {
        logger.info('Successfully fetched sectors with municipality', { 
          count: result.data.length 
        });
      } else {
        logger.error('Failed to fetch sectors with municipality', { error: result.error });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching sectors with municipality', { error });
      
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
   * Get sectors by municipality ID
   */
  @cached(3 * 60 * 1000) // 3 minutes cache
  async getByMunicipality(municipalityId: number): PromiseResult<Sector[]> {
    try {
      logger.info('Fetching sectors by municipality', { municipalityId });
      
      const result = await this.search({
        filters: { municipalityId },
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      if (result.success) {
        logger.info('Successfully fetched sectors by municipality', { 
          municipalityId,
          count: result.data.data.length 
        });
        
        return { success: true, data: result.data.data };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error fetching sectors by municipality', { municipalityId, error });
      
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
   * Get active sectors by municipality ID
   */
  @cached(3 * 60 * 1000) // 3 minutes cache
  async getActiveByMunicipality(municipalityId: number): PromiseResult<Sector[]> {
    try {
      logger.info('Fetching active sectors by municipality', { municipalityId });
      
      const result = await this.search({
        filters: { 
          municipalityId,
          isActive: true 
        },
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      if (result.success) {
        logger.info('Successfully fetched active sectors by municipality', { 
          municipalityId,
          count: result.data.data.length 
        });
        
        return { success: true, data: result.data.data };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error fetching active sectors by municipality', { municipalityId, error });
      
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
   * Search sectors by name or code
   */
  async searchByNameOrCode(query: string, municipalityId?: number): PromiseResult<Sector[]> {
    try {
      logger.info('Searching sectors by name or code', { query, municipalityId });
      
      const filters: any = {};
      if (municipalityId) {
        filters.municipalityId = municipalityId;
      }
      
      const result = await this.search({
        query,
        filters,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      if (result.success) {
        return { success: true, data: result.data.data };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error searching sectors', { query, municipalityId, error });
      
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
   * Check if sector code is unique within a municipality
   */
  async isCodeUniqueInMunicipality(
    code: string, 
    municipalityId: number, 
    excludeId?: number
  ): PromiseResult<boolean> {
    try {
      logger.info('Checking sector code uniqueness in municipality', { 
        code, 
        municipalityId, 
        excludeId 
      });
      
      const params = new URLSearchParams({
        municipalityId: municipalityId.toString()
      });
      
      if (excludeId) {
        params.append('excludeId', excludeId.toString());
      }
      
      const result = await apiClient.get<{ unique: boolean }>(
        `${this.endpoint}/check-code/${encodeURIComponent(code)}?${params.toString()}`
      );
      
      if (result.success) {
        logger.info('Sector code uniqueness checked', { 
          code, 
          municipalityId,
          excludeId,
          unique: result.data.unique 
        });
        
        return { success: true, data: result.data.unique };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error checking sector code uniqueness', { 
        code, 
        municipalityId, 
        excludeId, 
        error 
      });
      
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
   * Get sector statistics
   */
  async getSectorStats(sectorId: number): PromiseResult<{
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    municipalityId: number;
    municipalityName: string;
    complaintsCount: number;
    recentComplaintsCount: number;
    createdAt: Date;
    updatedAt?: Date;
  }> {
    try {
      logger.info('Fetching sector statistics', { sectorId });
      
      const result = await apiClient.get<any>(`${this.endpoint}/${sectorId}/stats`);
      
      if (result.success) {
        logger.info('Successfully fetched sector statistics', { 
          sectorId,
          stats: result.data 
        });
      } else {
        logger.error('Failed to fetch sector statistics', { 
          sectorId, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching sector statistics', { sectorId, error });
      
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
   * Get sectors ordered by complaint count
   */
  @cached(10 * 60 * 1000) // 10 minutes cache
  async getSectorsByComplaintCount(limit = 10): PromiseResult<Array<{
    id: number;
    name: string;
    code: string;
    municipalityName: string;
    complaintsCount: number;
  }>> {
    try {
      logger.info('Fetching sectors by complaint count', { limit });
      
      const result = await apiClient.get<any[]>(
        `${this.endpoint}/by-complaint-count?limit=${limit}`
      );
      
      if (result.success) {
        logger.info('Successfully fetched sectors by complaint count', { 
          limit,
          count: result.data.length 
        });
      } else {
        logger.error('Failed to fetch sectors by complaint count', { 
          limit, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error fetching sectors by complaint count', { limit, error });
      
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
   * Get municipality for options/dropdowns
   */
  @cached(10 * 60 * 1000) // 10 minutes cache
  async getMunicipalityOptions(): PromiseResult<Array<{
    value: number;
    label: string;
    code: string;
  }>> {
    try {
      logger.info('Fetching municipality options for sectors');
      
      const result = await apiClient.get<Municipality[]>(config.api.endpoints.municipalities);
      
      if (result.success) {
        const options = result.data
          .filter(m => m.isActive)
          .map(m => ({
            value: m.id,
            label: m.name,
            code: m.code
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
          
        logger.info('Successfully fetched municipality options', { count: options.length });
        
        return { success: true, data: options };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error fetching municipality options', { error });
      
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
   * Create sector with validation
   */
  @validateInput('sector')
  async create(data: CreateSectorDto): PromiseResult<Sector> {
    // Check code uniqueness within municipality before creating
    const uniqueResult = await this.isCodeUniqueInMunicipality(data.code, data.municipalityId);
    
    if (!uniqueResult.success) {
      return uniqueResult as any;
    }
    
    if (!uniqueResult.data) {
      return {
        success: false,
        error: {
          message: 'El código del sector ya existe en este municipio',
          code: 'DUPLICATE_CODE',
          status: 400,
          timestamp: new Date().toISOString()
        }
      };
    }

    return super.create(data);
  }

  /**
   * Update sector with validation
   */
  @validateInput('sector')
  async update(id: number, data: Partial<UpdateSectorDto>): PromiseResult<Sector> {
    // Check code uniqueness if code or municipality is being updated
    if (data.code || data.municipalityId) {
      // Get current sector to check municipality
      const currentResult = await this.getById(id);
      if (!currentResult.success) {
        return currentResult;
      }
      
      const municipalityId = data.municipalityId || currentResult.data.municipalityId;
      const code = data.code || currentResult.data.code;
      
      const uniqueResult = await this.isCodeUniqueInMunicipality(code, municipalityId, id);
      
      if (!uniqueResult.success) {
        return uniqueResult as any;
      }
      
      if (!uniqueResult.data) {
        return {
          success: false,
          error: {
            message: 'El código del sector ya existe en este municipio',
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
   * Import sectors from CSV
   */
  async importFromCsv(file: File): PromiseResult<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    try {
      logger.info('Importing sectors from CSV', { fileName: file.name });
      
      const result = await apiClient.upload<any>(`${this.endpoint}/import-csv`, file);
      
      if (result.success) {
        logger.info('Successfully imported sectors from CSV', { 
          fileName: file.name,
          result: result.data 
        });
      } else {
        logger.error('Failed to import sectors from CSV', { 
          fileName: file.name, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error importing sectors from CSV', { fileName: file.name, error });
      
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
   * Export sectors to CSV
   */
  async exportToCsv(municipalityId?: number, includeInactive = false): PromiseResult<string> {
    try {
      logger.info('Exporting sectors to CSV', { municipalityId, includeInactive });
      
      const params = new URLSearchParams();
      if (municipalityId) {
        params.append('municipalityId', municipalityId.toString());
      }
      params.append('includeInactive', includeInactive.toString());
      
      const result = await apiClient.download(
        `${this.endpoint}/export-csv?${params.toString()}`,
        `sectores-${new Date().toISOString().split('T')[0]}.csv`
      );
      
      if (result.success) {
        logger.info('Successfully exported sectors to CSV', { municipalityId, includeInactive });
        return { success: true, data: 'CSV exported successfully' };
      }
      
      return result as any;
    } catch (error) {
      logger.error('Error exporting sectors to CSV', { municipalityId, includeInactive, error });
      
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

  /**
   * Bulk update sectors within a municipality
   */
  async bulkUpdateByMunicipality(
    municipalityId: number, 
    updates: Array<{ id: number; data: Partial<UpdateSectorDto> }>
  ): PromiseResult<Sector[]> {
    try {
      logger.info('Bulk updating sectors by municipality', { municipalityId, count: updates.length });
      
      const result = await apiClient.put<Sector[]>(
        `${this.endpoint}/bulk-update-by-municipality/${municipalityId}`, 
        updates
      );
      
      if (result.success) {
        logger.info('Successfully bulk updated sectors by municipality', { 
          municipalityId,
          count: result.data.length 
        });
      } else {
        logger.error('Failed to bulk update sectors by municipality', { 
          municipalityId, 
          updates, 
          error: result.error 
        });
      }

      return result;
    } catch (error) {
      logger.error('Error bulk updating sectors by municipality', { 
        municipalityId, 
        updates, 
        error 
      });
      
      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'BULK_UPDATE_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }
}

// Create and export service instance
export const sectorService = new SectorService();

export default sectorService;