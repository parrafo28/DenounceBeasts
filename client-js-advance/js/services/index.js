/**
 * Services Index
 * Creates and exports all service instances
 */

// Sector Service
class SectorService extends BaseService {
    constructor(apiClient) {
        super('Sector', AppConfig.api.endpoints.sectors, apiClient);
    }

    /**
     * Get sectors by municipality
     */
    async getByMunicipality(municipalityId, options = {}) {
        if (!municipalityId || municipalityId <= 0) {
            throw new Error('Valid municipality ID is required');
        }

        const cacheKey = `sectors:municipality:${municipalityId}`;

        try {
            this.eventEmitter.emit('loading', { operation: 'getByMunicipality', municipalityId });

            const sectors = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}/by-municipality?municipalityId=${municipalityId}`,
                { cache: options.cache }
            );

            this.logger.debug(`Retrieved ${sectors.length} sectors for municipality ${municipalityId}`);
            this.eventEmitter.emit('loaded', { 
                data: sectors, 
                operation: 'getByMunicipality', 
                municipalityId 
            });

            return sectors;
        } catch (error) {
            this.logger.error(`Failed to get sectors for municipality ${municipalityId}`, error);
            this.eventEmitter.emit('error', { error, operation: 'getByMunicipality', municipalityId });
            throw error;
        }
    }

    /**
     * Get sectors with municipality information
     */
    async getWithMunicipality(options = {}) {
        const cacheKey = 'sectors:withMunicipality';

        try {
            this.eventEmitter.emit('loading', { operation: 'getWithMunicipality' });

            const sectors = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}/with-municipality`,
                { cache: options.cache }
            );

            this.logger.info(`Retrieved ${sectors.length} sectors with municipality data`);
            this.eventEmitter.emit('loaded', { data: sectors, operation: 'getWithMunicipality' });

            return sectors;
        } catch (error) {
            this.logger.error('Failed to get sectors with municipality', error);
            this.eventEmitter.emit('error', { error, operation: 'getWithMunicipality' });
            throw error;
        }
    }

    _convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = ['ID', 'Nombre', 'Código', 'Municipio', 'Activo', 'Fecha Creación'];
        const rows = data.map(item => [
            item.id,
            `"${item.name}"`,
            `"${item.code}"`,
            `"${item.municipalityName || ''}"`,
            item.isActive ? 'Sí' : 'No',
            Utils.formatDate(item.createdAt)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Complaint Type Service
class ComplaintTypeService extends BaseService {
    constructor(apiClient) {
        super('ComplaintType', AppConfig.api.endpoints.complaintTypes, apiClient);
    }

    _convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = ['ID', 'Nombre', 'Descripción', 'Activo', 'Fecha Creación'];
        const rows = data.map(item => [
            item.id,
            `"${item.name}"`,
            `"${item.description || ''}"`,
            item.isActive ? 'Sí' : 'No',
            Utils.formatDate(item.createdAt)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Status Service
class StatusService extends BaseService {
    constructor(apiClient) {
        super('Status', AppConfig.api.endpoints.status, apiClient);
    }

    _convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = ['ID', 'Nombre', 'Descripción', 'Color', 'Activo', 'Fecha Creación'];
        const rows = data.map(item => [
            item.id,
            `"${item.name}"`,
            `"${item.description || ''}"`,
            item.color || '',
            item.isActive ? 'Sí' : 'No',
            Utils.formatDate(item.createdAt)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Complaint Service
class ComplaintService extends BaseService {
    constructor(apiClient) {
        super('Complaint', AppConfig.api.endpoints.complaints, apiClient);
    }

    /**
     * Get complaints by status
     */
    async getByStatus(statusId, options = {}) {
        if (!statusId || statusId <= 0) {
            throw new Error('Valid status ID is required');
        }

        const cacheKey = `complaints:status:${statusId}`;

        try {
            this.eventEmitter.emit('loading', { operation: 'getByStatus', statusId });

            const complaints = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}?statusId=${statusId}`,
                { cache: options.cache }
            );

            this.logger.debug(`Retrieved ${complaints.length} complaints for status ${statusId}`);
            this.eventEmitter.emit('loaded', { 
                data: complaints, 
                operation: 'getByStatus', 
                statusId 
            });

            return complaints;
        } catch (error) {
            this.logger.error(`Failed to get complaints for status ${statusId}`, error);
            this.eventEmitter.emit('error', { error, operation: 'getByStatus', statusId });
            throw error;
        }
    }

    /**
     * Get complaints by municipality
     */
    async getByMunicipality(municipalityId, options = {}) {
        if (!municipalityId || municipalityId <= 0) {
            throw new Error('Valid municipality ID is required');
        }

        const cacheKey = `complaints:municipality:${municipalityId}`;

        try {
            this.eventEmitter.emit('loading', { operation: 'getByMunicipality', municipalityId });

            const complaints = await this.api.cachedRequest(
                cacheKey,
                `${this.endpoint}?municipalityId=${municipalityId}`,
                { cache: options.cache }
            );

            this.logger.debug(`Retrieved ${complaints.length} complaints for municipality ${municipalityId}`);
            this.eventEmitter.emit('loaded', { 
                data: complaints, 
                operation: 'getByMunicipality', 
                municipalityId 
            });

            return complaints;
        } catch (error) {
            this.logger.error(`Failed to get complaints for municipality ${municipalityId}`, error);
            this.eventEmitter.emit('error', { error, operation: 'getByMunicipality', municipalityId });
            throw error;
        }
    }

    /**
     * Upload complaint images
     */
    async uploadImages(complaintId, files, options = {}) {
        if (!complaintId || complaintId <= 0) {
            throw new Error('Valid complaint ID is required');
        }

        if (!files || files.length === 0) {
            throw new Error('At least one file is required');
        }

        try {
            this.eventEmitter.emit('uploading', { complaintId, fileCount: files.length });

            const uploadPromises = Array.from(files).map(file => 
                this.api.upload(`${this.endpoint}/${complaintId}/images`, file, {
                    fieldName: 'image',
                    fields: { complaintId }
                })
            );

            const results = await Promise.all(uploadPromises);

            this.logger.info(`Uploaded ${results.length} images for complaint ${complaintId}`);
            this.eventEmitter.emit('uploaded', { complaintId, results });

            return results;
        } catch (error) {
            this.logger.error(`Failed to upload images for complaint ${complaintId}`, error);
            this.eventEmitter.emit('error', { error, operation: 'uploadImages', complaintId });
            throw error;
        }
    }

    _convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = ['ID', 'Título', 'Descripción', 'Tipo', 'Estado', 'Municipio', 'Fecha Creación'];
        const rows = data.map(item => [
            item.id,
            `"${item.title}"`,
            `"${Utils.truncateText(item.description, 100)}"`,
            `"${item.complaintTypeName || ''}"`,
            `"${item.statusName || ''}"`,
            `"${item.municipalityName || ''}"`,
            Utils.formatDate(item.createdAt)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Service Factory
class ServiceFactory {
    constructor() {
        this.services = new Map();
        this.apiClient = apiClient; // Use global API client
    }

    /**
     * Get or create service instance
     */
    getService(serviceName) {
        if (this.services.has(serviceName)) {
            return this.services.get(serviceName);
        }

        let service;
        switch (serviceName.toLowerCase()) {
            case 'municipality':
                service = new MunicipalityService(this.apiClient);
                break;
            case 'sector':
                service = new SectorService(this.apiClient);
                break;
            case 'complainttype':
                service = new ComplaintTypeService(this.apiClient);
                break;
            case 'status':
                service = new StatusService(this.apiClient);
                break;
            case 'complaint':
                service = new ComplaintService(this.apiClient);
                break;
            default:
                throw new Error(`Unknown service: ${serviceName}`);
        }

        this.services.set(serviceName, service);
        return service;
    }

    /**
     * Create service with custom API client
     */
    createService(serviceName, customApiClient) {
        switch (serviceName.toLowerCase()) {
            case 'municipality':
                return new MunicipalityService(customApiClient);
            case 'sector':
                return new SectorService(customApiClient);
            case 'complainttype':
                return new ComplaintTypeService(customApiClient);
            case 'status':
                return new StatusService(customApiClient);
            case 'complaint':
                return new ComplaintService(customApiClient);
            default:
                throw new Error(`Unknown service: ${serviceName}`);
        }
    }

    /**
     * Get all available service names
     */
    getServiceNames() {
        return ['municipality', 'sector', 'complainttype', 'status', 'complaint'];
    }
}

// Create service instances
const serviceFactory = new ServiceFactory();

// Export individual services for convenience
const municipalityService = serviceFactory.getService('municipality');
const sectorService = serviceFactory.getService('sector');
const complaintTypeService = serviceFactory.getService('complainttype');
const statusService = serviceFactory.getService('status');
const complaintService = serviceFactory.getService('complaint');

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseService,
        MunicipalityService,
        SectorService,
        ComplaintTypeService,
        StatusService,
        ComplaintService,
        ServiceFactory,
        serviceFactory,
        municipalityService,
        sectorService,
        complaintTypeService,
        statusService,
        complaintService
    };
} else {
    window.BaseService = BaseService;
    window.MunicipalityService = MunicipalityService;
    window.SectorService = SectorService;
    window.ComplaintTypeService = ComplaintTypeService;
    window.StatusService = StatusService;
    window.ComplaintService = ComplaintService;
    window.ServiceFactory = ServiceFactory;
    window.serviceFactory = serviceFactory;
    window.municipalityService = municipalityService;
    window.sectorService = sectorService;
    window.complaintTypeService = complaintTypeService;
    window.statusService = statusService;
    window.complaintService = complaintService;
}