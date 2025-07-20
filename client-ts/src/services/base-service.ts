/**
 * Base Service Class
 * Generic CRUD service with type safety and error handling
 */

import type { 
  BaseEntity, 
  CreateDto, 
  UpdateDto, 
  Result, 
  PromiseResult,
  SearchOptions,
  PaginatedResponse 
} from '@/types';
import { apiClient } from './api-client';
import { logger, validateInput, eventBus, EVENT_TYPES } from '@/utils';
import config from '@/config/app.config';

export abstract class BaseService<
  TEntity extends BaseEntity,
  TCreateDto extends CreateDto,
  TUpdateDto extends UpdateDto
> {
  protected readonly endpoint: string;
  protected readonly entityName: string;

  constructor(endpoint: string, entityName: string) {
    this.endpoint = endpoint;
    this.entityName = entityName;
  }

  /**
   * Get all entities
   */
  async getAll(): PromiseResult<TEntity[]> {
    const startTime = performance.now();
    
    try {
      logger.info(`Fetching all ${this.entityName}s`);
      eventBus.emitSync(EVENT_TYPES.DATA_LOADED, { entityName: this.entityName, operation: 'getAll' });

      const result = await apiClient.get<TEntity[]>(this.endpoint);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully fetched ${result.data.length} ${this.entityName}s`, { 
          count: result.data.length,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_LOADED, { 
          entityName: this.entityName, 
          operation: 'getAll',
          count: result.data.length,
          data: result.data
        });
      } else {
        logger.error(`Failed to fetch ${this.entityName}s`, { error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'getAll',
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error fetching ${this.entityName}s`, { error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'getAll',
        error
      });

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
   * Get entity by ID
   */
  async getById(id: number): PromiseResult<TEntity> {
    const startTime = performance.now();
    
    try {
      logger.info(`Fetching ${this.entityName} by ID`, { id });
      
      const result = await apiClient.get<TEntity>(`${this.endpoint}/${id}`);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully fetched ${this.entityName}`, { 
          id,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_LOADED, { 
          entityName: this.entityName, 
          operation: 'getById',
          id,
          data: result.data
        });
      } else {
        logger.error(`Failed to fetch ${this.entityName}`, { id, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'getById',
          id,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error fetching ${this.entityName}`, { id, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'getById',
        id,
        error
      });

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
   * Create new entity
   */
  async create(data: TCreateDto): PromiseResult<TEntity> {
    const startTime = performance.now();
    
    try {
      logger.info(`Creating new ${this.entityName}`, { data });
      
      const result = await apiClient.post<TEntity>(this.endpoint, data);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully created ${this.entityName}`, { 
          id: result.data.id,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_UPDATED, { 
          entityName: this.entityName, 
          operation: 'create',
          data: result.data
        });
      } else {
        logger.error(`Failed to create ${this.entityName}`, { data, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'create',
          data,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error creating ${this.entityName}`, { data, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'create',
        data,
        error
      });

      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'CREATE_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Update existing entity
   */
  async update(id: number, data: Partial<TUpdateDto>): PromiseResult<TEntity> {
    const startTime = performance.now();
    
    try {
      logger.info(`Updating ${this.entityName}`, { id, data });
      
      const result = await apiClient.put<TEntity>(`${this.endpoint}/${id}`, data);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully updated ${this.entityName}`, { 
          id,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_UPDATED, { 
          entityName: this.entityName, 
          operation: 'update',
          id,
          data: result.data
        });
      } else {
        logger.error(`Failed to update ${this.entityName}`, { id, data, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'update',
          id,
          data,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error updating ${this.entityName}`, { id, data, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'update',
        id,
        data,
        error
      });

      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'UPDATE_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Delete entity
   */
  async delete(id: number): PromiseResult<boolean> {
    const startTime = performance.now();
    
    try {
      logger.info(`Deleting ${this.entityName}`, { id });
      
      const result = await apiClient.delete<void>(`${this.endpoint}/${id}`);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully deleted ${this.entityName}`, { 
          id,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_DELETED, { 
          entityName: this.entityName, 
          operation: 'delete',
          id
        });
        
        return { success: true, data: true };
      } else {
        logger.error(`Failed to delete ${this.entityName}`, { id, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'delete',
          id,
          error: result.error
        });
        
        return result as any;
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error deleting ${this.entityName}`, { id, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'delete',
        id,
        error
      });

      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'DELETE_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Search entities with filters and pagination
   */
  async search(options: SearchOptions = {}): PromiseResult<PaginatedResponse<TEntity>> {
    const startTime = performance.now();
    
    try {
      logger.info(`Searching ${this.entityName}s`, { options });
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (options.query) {
        queryParams.append('query', options.query);
      }
      
      if (options.page) {
        queryParams.append('page', options.page.toString());
      }
      
      if (options.pageSize) {
        queryParams.append('pageSize', options.pageSize.toString());
      }
      
      if (options.sortBy) {
        queryParams.append('sortBy', options.sortBy);
      }
      
      if (options.sortOrder) {
        queryParams.append('sortOrder', options.sortOrder);
      }
      
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(`filter.${key}`, String(value));
          }
        });
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
      
      const result = await apiClient.get<PaginatedResponse<TEntity>>(endpoint);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully searched ${this.entityName}s`, { 
          total: result.data.total,
          page: result.data.page,
          pageSize: result.data.pageSize,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_LOADED, { 
          entityName: this.entityName, 
          operation: 'search',
          options,
          result: result.data
        });
      } else {
        logger.error(`Failed to search ${this.entityName}s`, { options, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'search',
          options,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error searching ${this.entityName}s`, { options, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'search',
        options,
        error
      });

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
   * Bulk create entities
   */
  async bulkCreate(items: TCreateDto[]): PromiseResult<TEntity[]> {
    const startTime = performance.now();
    
    try {
      logger.info(`Bulk creating ${this.entityName}s`, { count: items.length });
      
      const result = await apiClient.post<TEntity[]>(`${this.endpoint}/bulk`, items);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully bulk created ${this.entityName}s`, { 
          count: result.data.length,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_UPDATED, { 
          entityName: this.entityName, 
          operation: 'bulkCreate',
          count: result.data.length,
          data: result.data
        });
      } else {
        logger.error(`Failed to bulk create ${this.entityName}s`, { items, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'bulkCreate',
          items,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error bulk creating ${this.entityName}s`, { items, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'bulkCreate',
        items,
        error
      });

      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'BULK_CREATE_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Bulk update entities
   */
  async bulkUpdate(updates: Array<{ id: number; data: Partial<TUpdateDto> }>): PromiseResult<TEntity[]> {
    const startTime = performance.now();
    
    try {
      logger.info(`Bulk updating ${this.entityName}s`, { count: updates.length });
      
      const result = await apiClient.put<TEntity[]>(`${this.endpoint}/bulk`, updates);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully bulk updated ${this.entityName}s`, { 
          count: result.data.length,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_UPDATED, { 
          entityName: this.entityName, 
          operation: 'bulkUpdate',
          count: result.data.length,
          data: result.data
        });
      } else {
        logger.error(`Failed to bulk update ${this.entityName}s`, { updates, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'bulkUpdate',
          updates,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error bulk updating ${this.entityName}s`, { updates, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'bulkUpdate',
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

  /**
   * Bulk delete entities
   */
  async bulkDelete(ids: number[]): PromiseResult<boolean> {
    const startTime = performance.now();
    
    try {
      logger.info(`Bulk deleting ${this.entityName}s`, { count: ids.length, ids });
      
      const result = await apiClient.delete<void>(`${this.endpoint}/bulk`, {
        body: { ids }
      });
      
      if (result.success) {
        const duration = performance.now() - startTime;
        logger.info(`Successfully bulk deleted ${this.entityName}s`, { 
          count: ids.length,
          duration: `${duration.toFixed(2)}ms`
        });
        
        eventBus.emitSync(EVENT_TYPES.DATA_DELETED, { 
          entityName: this.entityName, 
          operation: 'bulkDelete',
          count: ids.length,
          ids
        });
        
        return { success: true, data: true };
      } else {
        logger.error(`Failed to bulk delete ${this.entityName}s`, { ids, error: result.error });
        eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
          entityName: this.entityName, 
          operation: 'bulkDelete',
          ids,
          error: result.error
        });
        
        return result as any;
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error bulk deleting ${this.entityName}s`, { ids, error, duration: `${duration.toFixed(2)}ms` });
      
      eventBus.emitSync(EVENT_TYPES.DATA_ERROR, { 
        entityName: this.entityName, 
        operation: 'bulkDelete',
        ids,
        error
      });

      return {
        success: false,
        error: {
          message: config.messages.errors.general,
          code: 'BULK_DELETE_ERROR',
          status: 0,
          timestamp: new Date().toISOString(),
          data: error
        }
      };
    }
  }

  /**
   * Get active entities only
   */
  async getActive(): PromiseResult<TEntity[]> {
    return this.search({ filters: { isActive: true } }).then(result => {
      if (result.success) {
        return { success: true, data: result.data.data };
      }
      return result as any;
    });
  }

  /**
   * Activate/Deactivate entity
   */
  async toggleActive(id: number, isActive: boolean): PromiseResult<TEntity> {
    return this.update(id, { isActive } as Partial<TUpdateDto>);
  }

  /**
   * Export entities to JSON
   */
  async exportToJson(filters?: SearchOptions): PromiseResult<string> {
    try {
      const result = await this.search(filters);
      
      if (result.success) {
        const jsonData = JSON.stringify(result.data.data, null, 2);
        
        // Trigger download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.entityName}s-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        logger.info(`${this.entityName}s exported to JSON`, { count: result.data.data.length });
        
        return { success: true, data: jsonData };
      }
      
      return result as any;
    } catch (error) {
      logger.error(`Error exporting ${this.entityName}s to JSON`, { error });
      
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
   * Get entity statistics
   */
  async getStats(): PromiseResult<{
    total: number;
    active: number;
    inactive: number;
    recentlyCreated: number;
    recentlyUpdated: number;
  }> {
    try {
      const [allResult, activeResult] = await Promise.all([
        this.getAll(),
        this.getActive()
      ]);

      if (!allResult.success) {
        return allResult as any;
      }

      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentlyCreated = allResult.data.filter(item => 
        new Date(item.createdAt) >= last30Days
      ).length;

      const recentlyUpdated = allResult.data.filter(item => 
        item.updatedAt && new Date(item.updatedAt) >= last30Days
      ).length;

      const stats = {
        total: allResult.data.length,
        active: activeResult.success ? activeResult.data.length : 0,
        inactive: allResult.data.length - (activeResult.success ? activeResult.data.length : 0),
        recentlyCreated,
        recentlyUpdated
      };

      logger.info(`${this.entityName} statistics calculated`, stats);
      
      return { success: true, data: stats };
    } catch (error) {
      logger.error(`Error calculating ${this.entityName} statistics`, { error });
      
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
}

export default BaseService;