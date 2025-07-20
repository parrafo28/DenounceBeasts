/**
 * Municipality Service
 * Handles all municipality-related API operations
 */

class MunicipalityService {
    constructor(apiClient) {
        this.api = apiClient;
        this.endpoint = AppConfig.api.endpoints.municipalities;
        this.logger = logger.child('MunicipalityService');
        this.eventEmitter = eventBus.namespace('municipality');
    }

    /**
     * Get all municipalities
     */
    async getAll(options = {}) {
        const cacheKey = 'municipalities:all';
        
        try {
            this.eventEmitter.emit('loading', { operation: 'getAll' });
            
            const municipalities = await this.api.cachedRequest(
                cacheKey,
                this.endpoint,
                { cache: options.cache }
            );

            this.logger.info(`Retrieved ${municipalities.length} municipalities`);
            this.eventEmitter.emit('loaded', { data: municipalities, operation: 'getAll' });

            return municipalities;
        } catch (error) {
            this.logger.error('Failed to get municipalities', error);
            this.eventEmitter.emit('error', { error, operation: 'getAll' });
            throw error;
        }
    }

    /**
     * Get municipality by ID
     */
    async getById(id, options = {}) {
        if (!id || id <= 0) {
            throw new Error('Valid municipality ID is required');
        }

        const cacheKey = `municipalities:${id}`;
        
        try {
            this.eventEmitter.emit('loading', { operation: 'getById', id });

            const municipality = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}/${id}`,
                { cache: options.cache }
            );

            this.logger.debug(`Retrieved municipality: ${municipality.name} (ID: ${id})`);
            this.eventEmitter.emit('loaded', { data: municipality, operation: 'getById', id });

            return municipality;
        } catch (error) {
            this.logger.error(`Failed to get municipality ${id}`, error);
            this.eventEmitter.emit('error', { error, operation: 'getById', id });
            throw error;
        }
    }

    /**
     * Create new municipality
     */
    async create(municipalityData, options = {}) {
        // Validate data
        const validator = new Validator();
        const validation = validator.validateEntity('municipality', municipalityData);
        
        if (!validation.isValid) {
            const error = new Error('Validation failed');
            error.validationErrors = validation.errors;
            throw error;
        }

        try {
            this.eventEmitter.emit('creating', { data: municipalityData });

            const response = await this.api.post(this.endpoint, municipalityData);
            const createdMunicipality = response.data;

            this.logger.info(`Created municipality: ${municipalityData.name}`, { id: createdMunicipality.id });

            // Invalidate cache
            this._invalidateCache();

            this.eventEmitter.emit('created', { 
                data: createdMunicipality, 
                originalData: municipalityData 
            });

            // Emit global data event
            eventBus.emit(AppEvents.DATA_CREATED, {
                entity: 'municipality',
                data: createdMunicipality
            });

            return createdMunicipality;
        } catch (error) {
            this.logger.error('Failed to create municipality', error);
            this.eventEmitter.emit('error', { error, operation: 'create', data: municipalityData });
            throw error;
        }
    }

    /**
     * Update municipality
     */
    async update(id, municipalityData, options = {}) {
        if (!id || id <= 0) {
            throw new Error('Valid municipality ID is required');
        }

        // Ensure ID is in the data
        const dataWithId = { ...municipalityData, id };

        // Validate data
        const validator = new Validator();
        const validation = validator.validateEntity('municipality', dataWithId);
        
        if (!validation.isValid) {
            const error = new Error('Validation failed');
            error.validationErrors = validation.errors;
            throw error;
        }

        try {
            this.eventEmitter.emit('updating', { id, data: dataWithId });

            const response = await this.api.put(`${this.endpoint}/${id}`, dataWithId);
            
            this.logger.info(`Updated municipality: ${dataWithId.name} (ID: ${id})`);

            // Invalidate cache
            this._invalidateCache(id);

            // Get updated data
            const updatedMunicipality = await this.getById(id, { cache: { ttl: 0 } });

            this.eventEmitter.emit('updated', { 
                id, 
                data: updatedMunicipality, 
                originalData: dataWithId 
            });

            // Emit global data event
            eventBus.emit(AppEvents.DATA_UPDATED, {
                entity: 'municipality',
                id,
                data: updatedMunicipality
            });

            return updatedMunicipality;
        } catch (error) {
            this.logger.error(`Failed to update municipality ${id}`, error);
            this.eventEmitter.emit('error', { error, operation: 'update', id, data: dataWithId });
            throw error;
        }
    }

    /**
     * Delete municipality
     */
    async delete(id, options = {}) {
        if (!id || id <= 0) {
            throw new Error('Valid municipality ID is required');
        }

        try {
            // Get municipality data before deletion for event
            const municipality = await this.getById(id, { cache: { ttl: 0 } });

            this.eventEmitter.emit('deleting', { id, data: municipality });

            await this.api.delete(`${this.endpoint}/${id}`);

            this.logger.info(`Deleted municipality: ${municipality.name} (ID: ${id})`);

            // Invalidate cache
            this._invalidateCache(id);

            this.eventEmitter.emit('deleted', { id, data: municipality });

            // Emit global data event
            eventBus.emit(AppEvents.DATA_DELETED, {
                entity: 'municipality',
                id,
                data: municipality
            });

            return true;
        } catch (error) {
            this.logger.error(`Failed to delete municipality ${id}`, error);
            this.eventEmitter.emit('error', { error, operation: 'delete', id });
            throw error;
        }
    }

    /**
     * Get municipalities with pagination
     */
    async getPaginated(page = 1, pageSize = AppConfig.ui.itemsPerPage, filters = {}) {
        const queryParams = {
            page,
            pageSize,
            ...filters
        };

        const queryString = Utils.buildQueryString(queryParams);
        const cacheKey = `municipalities:paginated:${queryString}`;

        try {
            this.eventEmitter.emit('loading', { operation: 'getPaginated', page, pageSize, filters });

            const result = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}?${queryString}`
            );

            this.logger.debug(`Retrieved paginated municipalities: page ${page}, size ${pageSize}`);
            this.eventEmitter.emit('loaded', { 
                data: result, 
                operation: 'getPaginated', 
                page, 
                pageSize, 
                filters 
            });

            return result;
        } catch (error) {
            this.logger.error('Failed to get paginated municipalities', error);
            this.eventEmitter.emit('error', { error, operation: 'getPaginated', page, pageSize, filters });
            throw error;
        }
    }

    /**
     * Search municipalities
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
        const cacheKey = `municipalities:search:${queryString}`;

        try {
            this.eventEmitter.emit('searching', { query, options });

            const results = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}/search?${queryString}`,
                { cache: { ttl: 60000 } } // 1 minute cache for searches
            );

            this.logger.debug(`Search results for "${query}": ${results.length} municipalities`);
            this.eventEmitter.emit('searchResults', { query, results, options });

            return results;
        } catch (error) {
            this.logger.error(`Failed to search municipalities for "${query}"`, error);
            this.eventEmitter.emit('error', { error, operation: 'search', query, options });
            throw error;
        }
    }

    /**
     * Get municipalities with their sectors
     */
    async getWithSectors(options = {}) {
        const cacheKey = 'municipalities:withSectors';

        try {
            this.eventEmitter.emit('loading', { operation: 'getWithSectors' });

            const municipalities = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}?include=sectors`,
                { cache: options.cache }
            );

            this.logger.info(`Retrieved ${municipalities.length} municipalities with sectors`);
            this.eventEmitter.emit('loaded', { data: municipalities, operation: 'getWithSectors' });

            return municipalities;
        } catch (error) {
            this.logger.error('Failed to get municipalities with sectors', error);
            this.eventEmitter.emit('error', { error, operation: 'getWithSectors' });
            throw error;
        }
    }

    /**
     * Get active municipalities only
     */
    async getActive(options = {}) {
        const cacheKey = 'municipalities:active';

        try {
            const allMunicipalities = await this.getAll(options);
            const activeMunicipalities = allMunicipalities.filter(m => m.isActive);

            this.logger.debug(`Retrieved ${activeMunicipalities.length} active municipalities`);

            return activeMunicipalities;
        } catch (error) {
            this.logger.error('Failed to get active municipalities', error);
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
            this.logger.error('Failed to perform bulk update', error);
            this.eventEmitter.emit('error', { error, operation: 'bulkUpdate', updates });
            throw error;
        }
    }

    /**
     * Export municipalities data
     */
    async export(format = 'json', options = {}) {
        try {
            this.eventEmitter.emit('exporting', { format, options });

            const municipalities = await this.getAll();
            let exportData;
            let filename;
            let mimeType;

            switch (format.toLowerCase()) {
                case 'json':
                    exportData = JSON.stringify(municipalities, null, 2);
                    filename = `municipalities-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;

                case 'csv':
                    exportData = this._convertToCSV(municipalities);
                    filename = `municipalities-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            if (options.download !== false) {
                Utils.downloadAsFile(exportData, filename, mimeType);
            }

            this.logger.info(`Exported ${municipalities.length} municipalities as ${format}`);
            this.eventEmitter.emit('exported', { format, count: municipalities.length, filename });

            return { data: exportData, filename, mimeType };
        } catch (error) {
            this.logger.error(`Failed to export municipalities as ${format}`, error);
            this.eventEmitter.emit('error', { error, operation: 'export', format, options });
            throw error;
        }
    }

    /**
     * Private methods
     */

    /**
     * Invalidate related cache entries
     */
    _invalidateCache(id = null) {
        if (id) {
            cache.delete(`municipalities:${id}`);
        }
        
        cache.invalidatePattern('municipalities:.*');
        
        // Also invalidate sectors cache as they depend on municipalities
        cache.invalidatePattern('sectors:.*');
    }

    /**
     * Convert data to CSV format
     */
    _convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = ['ID', 'Nombre', 'Código', 'Activo', 'Fecha Creación', 'Fecha Actualización'];
        const rows = data.map(item => [
            item.id,
            `"${item.name}"`,
            `"${item.code}"`,
            item.isActive ? 'Sí' : 'No',
            Utils.formatDate(item.createdAt),
            Utils.formatDate(item.updatedAt)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MunicipalityService;
} else {
    window.MunicipalityService = MunicipalityService;
}