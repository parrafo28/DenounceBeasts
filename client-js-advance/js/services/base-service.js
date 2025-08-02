/**
 * Base Service Class
 * Provides common CRUD operations for all entity services
 */

class BaseService {
    constructor(entityName, endpoint, apiClient) {
        this.entityName = entityName;
        this.endpoint = endpoint;
        this.api = apiClient;
        this.logger = logger.child(`${entityName}Service`);
        this.eventEmitter = eventBus.namespace(entityName.toLowerCase());
        this.validator = new Validator();
    }

    /**
     * Get all entities
     */
    async getAll(options = {}) {
        const cacheKey = `${this.entityName.toLowerCase()}:all`;
        
        try {
            this.eventEmitter.emit('loading', { operation: 'getAll' });
            
            const entities = await this.api.cachedRequest(
                cacheKey,
                this.endpoint,
                { cache: options.cache }
            );

            this.logger.info(`Retrieved ${entities.length} ${this.entityName.toLowerCase()}s`);
            this.eventEmitter.emit('loaded', { data: entities, operation: 'getAll' });

            return entities;
        } catch (error) {
            this.logger.error(`Failed to get ${this.entityName.toLowerCase()}s`, error);
            this.eventEmitter.emit('error', { error, operation: 'getAll' });
            throw error;
        }
    }

    /**
     * Get entity by ID
     */
    async getById(id, options = {}) {
        if (!id || id <= 0) {
            throw new Error(`Valid ${this.entityName.toLowerCase()} ID is required`);
        }

        const cacheKey = `${this.entityName.toLowerCase()}:${id}`;
        
        try {
            this.eventEmitter.emit('loading', { operation: 'getById', id });

            const entity = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}/${id}`,
                { cache: options.cache }
            );

            this.logger.debug(`Retrieved ${this.entityName.toLowerCase()}: ${entity.name || entity.title || id} (ID: ${id})`);
            this.eventEmitter.emit('loaded', { data: entity, operation: 'getById', id });

            return entity;
        } catch (error) {
            this.logger.error(`Failed to get ${this.entityName.toLowerCase()} ${id}`, error);
            this.eventEmitter.emit('error', { error, operation: 'getById', id });
            throw error;
        }
    }

    /**
     * Create new entity
     */
    async create(entityData, options = {}) {
        // Validate data if validation schema exists
        if (this.validator.rules[this.entityName.toLowerCase()]) {
            const validation = this.validator.validateEntity(this.entityName.toLowerCase(), entityData);
            
            if (!validation.isValid) {
                const error = new Error('Validation failed');
                error.validationErrors = validation.errors;
                throw error;
            }
        }

        try {
            this.eventEmitter.emit('creating', { data: entityData });

            const response = await this.api.post(this.endpoint, entityData);
            const createdEntity = response.data;

            this.logger.info(`Created ${this.entityName.toLowerCase()}: ${entityData.name || entityData.title}`, { 
                id: createdEntity.id || 'unknown' 
            });

            // Invalidate cache
            this._invalidateCache();

            this.eventEmitter.emit('created', { 
                data: createdEntity, 
                originalData: entityData 
            });

            // Emit global data event
            eventBus.emit(AppEvents.DATA_CREATED, {
                entity: this.entityName.toLowerCase(),
                data: createdEntity
            });

            return createdEntity;
        } catch (error) {
            this.logger.error(`Failed to create ${this.entityName.toLowerCase()}`, error);
            this.eventEmitter.emit('error', { error, operation: 'create', data: entityData });
            throw error;
        }
    }

    /**
     * Update entity
     */
    async update(id, entityData, options = {}) {
        if (!id || id <= 0) {
            throw new Error(`Valid ${this.entityName.toLowerCase()} ID is required`);
        }

        // Ensure ID is in the data
        const dataWithId = { ...entityData, id };

        // Validate data if validation schema exists
        if (this.validator.rules[this.entityName.toLowerCase()]) {
            const validation = this.validator.validateEntity(this.entityName.toLowerCase(), dataWithId);
            
            if (!validation.isValid) {
                const error = new Error('Validation failed');
                error.validationErrors = validation.errors;
                throw error;
            }
        }

        try {
            this.eventEmitter.emit('updating', { id, data: dataWithId });

            await this.api.put(`${this.endpoint}/${id}`, dataWithId);
            
            this.logger.info(`Updated ${this.entityName.toLowerCase()}: ${dataWithId.name || dataWithId.title} (ID: ${id})`);

            // Invalidate cache
            this._invalidateCache(id);

            // Get updated data
            const updatedEntity = await this.getById(id, { cache: { ttl: 0 } });

            this.eventEmitter.emit('updated', { 
                id, 
                data: updatedEntity, 
                originalData: dataWithId 
            });

            // Emit global data event
            eventBus.emit(AppEvents.DATA_UPDATED, {
                entity: this.entityName.toLowerCase(),
                id,
                data: updatedEntity
            });

            return updatedEntity;
        } catch (error) {
            this.logger.error(`Failed to update ${this.entityName.toLowerCase()} ${id}`, error);
            this.eventEmitter.emit('error', { error, operation: 'update', id, data: dataWithId });
            throw error;
        }
    }

    /**
     * Delete entity
     */
    async delete(id, options = {}) {
        if (!id || id <= 0) {
            throw new Error(`Valid ${this.entityName.toLowerCase()} ID is required`);
        }

        try {
            // Get entity data before deletion for event
            const entity = await this.getById(id, { cache: { ttl: 0 } });

            this.eventEmitter.emit('deleting', { id, data: entity });

            await this.api.delete(`${this.endpoint}/${id}`);

            this.logger.info(`Deleted ${this.entityName.toLowerCase()}: ${entity.name || entity.title} (ID: ${id})`);

            // Invalidate cache
            this._invalidateCache(id);

            this.eventEmitter.emit('deleted', { id, data: entity });

            // Emit global data event
            eventBus.emit(AppEvents.DATA_DELETED, {
                entity: this.entityName.toLowerCase(),
                id,
                data: entity
            });

            return true;
        } catch (error) {
            this.logger.error(`Failed to delete ${this.entityName.toLowerCase()} ${id}`, error);
            this.eventEmitter.emit('error', { error, operation: 'delete', id });
            throw error;
        }
    }

    /**
     * Get entities with pagination
     */
    async getPaginated(page = 1, pageSize = AppConfig.ui.itemsPerPage, filters = {}) {
        const queryParams = {
            page,
            pageSize,
            ...filters
        };

        const queryString = Utils.buildQueryString(queryParams);
        const cacheKey = `${this.entityName.toLowerCase()}:paginated:${queryString}`;

        try {
            this.eventEmitter.emit('loading', { operation: 'getPaginated', page, pageSize, filters });

            const result = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}?${queryString}`
            );

            this.logger.debug(`Retrieved paginated ${this.entityName.toLowerCase()}s: page ${page}, size ${pageSize}`);
            this.eventEmitter.emit('loaded', { 
                data: result, 
                operation: 'getPaginated', 
                page, 
                pageSize, 
                filters 
            });

            return result;
        } catch (error) {
            this.logger.error(`Failed to get paginated ${this.entityName.toLowerCase()}s`, error);
            this.eventEmitter.emit('error', { error, operation: 'getPaginated', page, pageSize, filters });
            throw error;
        }
    }

    /**
     * Search entities
     */
    async search(query, options = {}) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchParams = {
            q: query.trim(),
            ...options
        };

        const queryString = Utils.buildQueryString(searchParams);
        const cacheKey = `${this.entityName.toLowerCase()}:search:${queryString}`;

        try {
            this.eventEmitter.emit('searching', { query, options });

            const results = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}/search?${queryString}`,
                { cache: { ttl: 60000 } } // 1 minute cache for searches
            );

            this.logger.debug(`Search results for "${query}": ${results.length} ${this.entityName.toLowerCase()}s`);
            this.eventEmitter.emit('searchResults', { query, results, options });

            return results;
        } catch (error) {
            this.logger.error(`Failed to search ${this.entityName.toLowerCase()}s for "${query}"`, error);
            this.eventEmitter.emit('error', { error, operation: 'search', query, options });
            throw error;
        }
    }

    /**
     * Get active entities only
     */
    async getActive(options = {}) {
        try {
            const allEntities = await this.getAll(options);
            const activeEntities = allEntities.filter(e => e.isActive !== false);

            this.logger.debug(`Retrieved ${activeEntities.length} active ${this.entityName.toLowerCase()}s`);

            return activeEntities;
        } catch (error) {
            this.logger.error(`Failed to get active ${this.entityName.toLowerCase()}s`, error);
            throw error;
        }
    }

    /**
     * Bulk operations
     */
    async bulkUpdate(updates, options = {}) {
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error('Updates array is required');
        }

        try {
            this.eventEmitter.emit('bulkUpdating', { updates });

            const results = await this.api.batch(
                updates.map(update => ({
                    key: update.id,
                    url: `${this.endpoint}/${update.id}`,
                    options: { method: 'PUT', body: update }
                }))
            );

            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            this.logger.info(`Bulk update completed: ${successful.length} successful, ${failed.length} failed`);

            // Invalidate cache
            this._invalidateCache();

            this.eventEmitter.emit('bulkUpdated', { successful, failed, total: updates.length });

            return { successful, failed, total: updates.length };
        } catch (error) {
            this.logger.error(`Failed to perform bulk update on ${this.entityName.toLowerCase()}s`, error);
            this.eventEmitter.emit('error', { error, operation: 'bulkUpdate', updates });
            throw error;
        }
    }

    /**
     * Export entities data
     */
    async export(format = 'json', options = {}) {
        try {
            this.eventEmitter.emit('exporting', { format, options });

            const entities = await this.getAll();
            let exportData;
            let filename;
            let mimeType;

            switch (format.toLowerCase()) {
                case 'json':
                    exportData = JSON.stringify(entities, null, 2);
                    filename = `${this.entityName.toLowerCase()}s-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;

                case 'csv':
                    exportData = this._convertToCSV(entities);
                    filename = `${this.entityName.toLowerCase()}s-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            if (options.download !== false) {
                Utils.downloadAsFile(exportData, filename, mimeType);
            }

            this.logger.info(`Exported ${entities.length} ${this.entityName.toLowerCase()}s as ${format}`);
            this.eventEmitter.emit('exported', { format, count: entities.length, filename });

            return { data: exportData, filename, mimeType };
        } catch (error) {
            this.logger.error(`Failed to export ${this.entityName.toLowerCase()}s as ${format}`, error);
            this.eventEmitter.emit('error', { error, operation: 'export', format, options });
            throw error;
        }
    }

    /**
     * Protected methods for subclasses
     */

    /**
     * Invalidate related cache entries
     */
    _invalidateCache(id = null) {
        if (id) {
            cache.delete(`${this.entityName.toLowerCase()}:${id}`);
        }
        
        cache.invalidatePattern(`${this.entityName.toLowerCase()}:.*`);
    }

    /**
     * Convert data to CSV format - can be overridden by subclasses
     */
    _convertToCSV(data) {
        if (!data || data.length === 0) return '';

        // Default CSV conversion - subclasses can override for custom fields
        const headers = ['ID', 'Nombre', 'Activo', 'Fecha Creación'];
        const rows = data.map(item => [
            item.id,
            `"${item.name || item.title || ''}"`,
            item.isActive !== false ? 'Sí' : 'No',
            Utils.formatDate(item.createdAt)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    /**
     * Add custom validation rule
     */
    addValidationRule(fieldName, validator, message) {
        this.validator.addRule(`${this.entityName.toLowerCase()}_${fieldName}`, validator, message);
    }

    /**
     * Set up real-time updates (WebSocket, SSE, etc.)
     */
    enableRealTimeUpdates(options = {}) {
        // This would be implemented based on your real-time strategy
        // For now, we'll use polling as a fallback
        if (options.polling !== false) {
            const interval = options.interval || 30000; // 30 seconds
            
            setInterval(async () => {
                try {
                    await this.getAll({ cache: { ttl: 0 } }); // Force refresh
                } catch (error) {
                    this.logger.debug('Real-time update failed', error);
                }
            }, interval);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseService;
} else {
    window.BaseService = BaseService;
}