
const CONFIG = {
    API_BASE_URL: 'https://localhost:7175/api',
    ITEMS_PER_PAGE: 5,
    DEFAULT_PAGE: 1
};

class Municipality {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.code = data.code || '';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length === 0) {
            errors.push('El nombre es requerido');
        }
        
        if (!this.code || this.code.trim().length === 0) {
            errors.push('El código es requerido');
        }
        
        if (this.name && this.name.length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres');
        }
        
        return errors;
    }

    toJSON() {
        const obj = {
            name: this.name,
            code: this.code,
            isActive: this.isActive
        };
        
        if (this.id) {
            obj.id = this.id;
        }
        
        return obj;
    }
}

class District {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.code = data.code || '';
        this.municipalityId = data.municipalityId || null;
        this.municipalityName = data.municipalityName || '';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length === 0) {
            errors.push('El nombre es requerido');
        }
        
        if (!this.code || this.code.trim().length === 0) {
            errors.push('El código es requerido');
        }
        
        if (!this.municipalityId || this.municipalityId <= 0) {
            errors.push('Debe seleccionar un municipio');
        }
        
        return errors;
    }

    toJSON() {
        const obj = {
            name: this.name,
            code: this.code,
            municipalityId: this.municipalityId,
            isActive: this.isActive
        };
        
        if (this.id) {
            obj.id = this.id;
        }
        
        return obj;
    }
}



class NotificationService {
    static showLoading(message = 'Procesando...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    static hideLoading() {
        Swal.close();
    }

    static showSuccess(message, timer = 2000) {
        return Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: message,
            timer: timer,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    static showError(message) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonText: 'Entendido'
        });
    }

    static async confirmDelete(itemName, itemType = 'elemento') {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar ${itemType} "${itemName}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });
        
        return result.isConfirmed;
    }

    static showInfo(message) {
        return Swal.fire({
            icon: 'info',
            title: 'Información',
            text: message
        });
    }

    static showWarning(message) {
        return Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: message
        });
    }

    static async showConfirmForm(title, text, confirmText = 'Confirmar') {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: 'Cancelar'
        });
        
        return result.isConfirmed;
    }
}

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}/${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getMunicipalities() {
        return await this.makeRequest('municipalities');
    }

    async getMunicipalityById(id) {
        return await this.makeRequest(`municipalities/${id}`);
    }

    async createMunicipality(municipality) {
        return await this.makeRequest('municipalities', {
            method: 'POST',
            body: JSON.stringify(municipality.toJSON())
        });
    }

    async updateMunicipality(municipality) {
        return await this.makeRequest('municipalities', {
            method: 'PUT',
            body: JSON.stringify(municipality.toJSON())
        });
    }

    async deleteMunicipality(id) {
        return await this.makeRequest(`municipalities/${id}`, {
            method: 'DELETE'
        });
    }

    async getDistricts() {
        return await this.makeRequest('districts/with-municipality');
    }

    async getDistrictById(id) {
        return await this.makeRequest(`districts/${id}`);
    }

    async createDistrict(district) {
        return await this.makeRequest('districts', {
            method: 'POST',
            body: JSON.stringify(district.toJSON())
        });
    }

    async updateDistrict(district) {
        return await this.makeRequest('districts', {
            method: 'PUT',
            body: JSON.stringify(district.toJSON())
        });
    }

    async deleteDistrict(id) {
        return await this.makeRequest(`districts/${id}`, {
            method: 'DELETE'
        });
    }
}

class PaginationManager {
    constructor(containerId, onPageChange) {
        this.container = document.getElementById(containerId);
        this.onPageChange = onPageChange;
        this.currentPage = CONFIG.DEFAULT_PAGE;
        this.totalPages = 1;
    }

    update(currentPage, totalPages) {
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        if (this.totalPages <= 1) return;

        this.addButton('Anterior', this.currentPage - 1, this.currentPage === 1);
        
        this.addPageButtons();
        
        this.addButton('Siguiente', this.currentPage + 1, this.currentPage === this.totalPages);
    }

    addButton(text, page, disabled = false) {
        const li = document.createElement('li');
        li.className = `page-item ${disabled ? 'disabled' : ''}`;
        
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = text;
        
        if (!disabled) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePage(page);
            });
        }
        
        li.appendChild(a);
        this.container.appendChild(li);
    }

    addPageButtons() {
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = i;
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePage(i);
            });
            
            li.appendChild(a);
            this.container.appendChild(li);
        }
    }

    changePage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        
        this.currentPage = page;
        this.onPageChange(page);
    }
}


class FilterManager {
    constructor(filters = {}) {
        this.filters = filters;
        this.callbacks = [];
    }

    onFilterChange(callback) {
        this.callbacks.push(callback);
    }

    updateFilter(name, value) {
        this.filters[name] = value;
        this.notifyChange();
    }

    clearAll() {
        Object.keys(this.filters).forEach(key => {
            this.filters[key] = '';
        });
        this.notifyChange();
    }

    getActiveFilters() {
        return { ...this.filters };
    }

    notifyChange() {
        this.callbacks.forEach(callback => callback(this.filters));
    }

    applyFilters(data, filterFunctions) {
        return data.filter(item => {
            return Object.keys(filterFunctions).every(key => {
                const filterValue = this.filters[key];
                if (!filterValue) return true;
                return filterFunctions[key](item, filterValue);
            });
        });
    }
}

class MunicipalityController {
    constructor(apiService) {
        this.apiService = apiService;
        this.municipalities = [];
        this.filteredData = [];
        this.currentPage = CONFIG.DEFAULT_PAGE;
        
        this.paginationManager = new PaginationManager('municipalityPagination', 
            (page) => this.loadPage(page));
        
        this.filterManager = new FilterManager({
            search: '',
            status: ''
        });
        
        this.setupFilterCallbacks();
        this.setupEventListeners();
    }

    setupFilterCallbacks() {
        this.filterManager.onFilterChange(() => {
            this.currentPage = CONFIG.DEFAULT_PAGE;
            this.applyFiltersAndRender();
        });
    }

    setupEventListeners() {
        document.getElementById('addMunicipalityBtn')?.addEventListener('click', 
            () => this.showAddModal());
        
        document.getElementById('saveMunicipalityBtn')?.addEventListener('click', 
            () => this.saveMunicipality());
        
        document.getElementById('municipalitySearchInput')?.addEventListener('input', 
            (e) => this.filterManager.updateFilter('search', e.target.value));
        
        document.getElementById('municipalityStatusFilter')?.addEventListener('change', 
            (e) => this.filterManager.updateFilter('status', e.target.value));
        
        document.getElementById('clearMunicipalityFilters')?.addEventListener('click', 
            () => this.clearFilters());
    }

    async loadMunicipalities() {
        try {
            NotificationService.showLoading('Cargando municipios...');
            
            const data = await this.apiService.getMunicipalities();
            this.municipalities = data.map(item => new Municipality(item));
            
            this.applyFiltersAndRender();
            NotificationService.hideLoading();
            
        } catch (error) {
            NotificationService.hideLoading();
            await NotificationService.showError('Error al cargar municipios: ' + error.message);
        }
    }

    applyFiltersAndRender() {
        const filterFunctions = {
            search: (item, value) => 
                item.name.toLowerCase().includes(value.toLowerCase()),
            status: (item, value) => 
                value === '' || item.isActive.toString() === value
        };
        
        this.filteredData = this.filterManager.applyFilters(this.municipalities, filterFunctions);
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        const totalPages = Math.ceil(this.filteredData.length / CONFIG.ITEMS_PER_PAGE);
        const startIndex = (this.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
        const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        this.renderTable(pageData);
        this.paginationManager.update(this.currentPage, totalPages);
    }

    renderTable(data) {
        const tbody = document.getElementById('municipalitiesTableBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron municipios</td></tr>';
            return;
        }
        
        data.forEach(municipality => {
            const row = this.createTableRow(municipality);
            tbody.appendChild(row);
        });
    }

    createTableRow(municipality) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${municipality.id}</td>
            <td>${municipality.name}</td>
            <td>${municipality.code}</td>
            <td>
                <span class="badge ${municipality.isActive ? 'bg-success' : 'bg-danger'}">
                    ${municipality.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-2" data-action="edit" data-id="${municipality.id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${municipality.id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        row.querySelector('[data-action="edit"]').addEventListener('click', 
            () => this.showEditModal(municipality.id));
        row.querySelector('[data-action="delete"]').addEventListener('click', 
            () => this.deleteMunicipality(municipality.id));
        
        return row;
    }

    loadPage(page) {
        this.currentPage = page;
        this.renderCurrentPage();
    }

    showAddModal() {
        this.clearForm();
        document.getElementById('municipalityModalTitle').innerHTML = 
            '<i class="bi bi-geo-alt"></i> Agregar Municipio';
        
        const modal = new bootstrap.Modal(document.getElementById('municipalityModal'));
        modal.show();
    }

    showEditModal(id) {
        const municipality = this.municipalities.find(m => m.id === id);
        if (!municipality) {
            NotificationService.showError('Municipio no encontrado');
            return;
        }
        
        this.fillForm(municipality);
        document.getElementById('municipalityModalTitle').innerHTML = 
            '<i class="bi bi-geo-alt"></i> Editar Municipio';
        
        const modal = new bootstrap.Modal(document.getElementById('municipalityModal'));
        modal.show();
    }

    fillForm(municipality) {
        document.getElementById('municipalityId').value = municipality.id || '';
        document.getElementById('municipalityName').value = municipality.name;
        document.getElementById('municipalityCode').value = municipality.code;
        document.getElementById('municipalityIsActive').checked = municipality.isActive;
    }

    clearForm() {
        document.getElementById('municipalityForm').reset();
        document.getElementById('municipalityId').value = '';
    }

    async saveMunicipality() {
        try {
            const formData = this.getFormData();
            const municipality = new Municipality(formData);
            
            const errors = municipality.validate();
            if (errors.length > 0) {
                await NotificationService.showError(errors.join('\n'));
                return;
            }
            
            NotificationService.showLoading(
                municipality.id ? 'Actualizando municipio...' : 'Creando municipio...'
            );
            
            if (municipality.id) {
                await this.apiService.updateMunicipality(municipality);
                await NotificationService.showSuccess('Municipio actualizado exitosamente');
            } else {
                await this.apiService.createMunicipality(municipality);
                await NotificationService.showSuccess('Municipio creado exitosamente');
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('municipalityModal'));
            modal.hide();
            
            await this.loadMunicipalities();
            
        } catch (error) {
            NotificationService.hideLoading();
            await NotificationService.showError('Error al guardar municipio: ' + error.message);
        }
    }

    getFormData() {
        return {
            id: document.getElementById('municipalityId').value || null,
            name: document.getElementById('municipalityName').value.trim(),
            code: document.getElementById('municipalityCode').value.trim(),
            isActive: document.getElementById('municipalityIsActive').checked
        };
    }

    async deleteMunicipality(id) {
        const municipality = this.municipalities.find(m => m.id === id);
        if (!municipality) {
            await NotificationService.showError('Municipio no encontrado');
            return;
        }
        
        const confirmed = await NotificationService.confirmDelete(municipality.name, 'el municipio');
        if (!confirmed) return;
        
        try {
            NotificationService.showLoading('Eliminando municipio...');
            
            await this.apiService.deleteMunicipality(id);
            await NotificationService.showSuccess('Municipio eliminado exitosamente');
            await this.loadMunicipalities();
            
        } catch (error) {
            NotificationService.hideLoading();
            await NotificationService.showError('Error al eliminar municipio: ' + error.message);
        }
    }

    clearFilters() {
        document.getElementById('municipalitySearchInput').value = '';
        document.getElementById('municipalityStatusFilter').value = '';
        this.filterManager.clearAll();
    }

    getMunicipalities() {
        return this.municipalities;
    }
}

class DistrictController {
    constructor(apiService, municipalityController) {
        this.apiService = apiService;
        this.municipalityController = municipalityController;
        this.districts = [];
        this.filteredData = [];
        this.currentPage = CONFIG.DEFAULT_PAGE;
        
        this.paginationManager = new PaginationManager('districtPagination', 
            (page) => this.loadPage(page));
        
        this.filterManager = new FilterManager({
            search: '',
            municipality: '',
            status: ''
        });
        
        this.setupFilterCallbacks();
        this.setupEventListeners();
    }

    setupFilterCallbacks() {
        this.filterManager.onFilterChange(() => {
            this.currentPage = CONFIG.DEFAULT_PAGE;
            this.applyFiltersAndRender();
        });
    }

    setupEventListeners() {
        document.getElementById('addDistrictBtn')?.addEventListener('click', 
            () => this.showAddModal());
        
        document.getElementById('saveDistrictBtn')?.addEventListener('click', 
            () => this.saveDistrict());
        
        document.getElementById('districtSearchInput')?.addEventListener('input', 
            (e) => this.filterManager.updateFilter('search', e.target.value));
        
        document.getElementById('districtMunicipalityFilter')?.addEventListener('change', 
            (e) => this.filterManager.updateFilter('municipality', e.target.value));
        
        document.getElementById('districtStatusFilter')?.addEventListener('change', 
            (e) => this.filterManager.updateFilter('status', e.target.value));
        
        document.getElementById('clearDistrictFilters')?.addEventListener('click', 
            () => this.clearFilters());
    }

    async loadDistricts() {
        try {
            NotificationService.showLoading('Cargando distritos...');
            
            const data = await this.apiService.getDistricts();
            this.districts = data.map(item => new District(item));
            
            this.loadMunicipalityOptions();
            this.applyFiltersAndRender();
            NotificationService.hideLoading();
            
        } catch (error) {
            NotificationService.hideLoading();
            await NotificationService.showError('Error al cargar distritos: ' + error.message);
        }
    }

    loadMunicipalityOptions() {
        const municipalities = this.municipalityController.getMunicipalities();
        
        const formSelect = document.getElementById('districtMunicipalityId');
        formSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
        
        const filterSelect = document.getElementById('districtMunicipalityFilter');
        filterSelect.innerHTML = '<option value="">Todos los municipios</option>';
        
        municipalities.forEach(municipality => {
            const option1 = new Option(municipality.name, municipality.id);
            const option2 = new Option(municipality.name, municipality.id);
            
            formSelect.appendChild(option1);
            filterSelect.appendChild(option2);
        });
    }

    applyFiltersAndRender() {
        const filterFunctions = {
            search: (item, value) => 
                item.name.toLowerCase().includes(value.toLowerCase()),
            municipality: (item, value) => 
                value === '' || item.municipalityId.toString() === value,
            status: (item, value) => 
                value === '' || item.isActive.toString() === value
        };
        
        this.filteredData = this.filterManager.applyFilters(this.districts, filterFunctions);
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        const totalPages = Math.ceil(this.filteredData.length / CONFIG.ITEMS_PER_PAGE);
        const startIndex = (this.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
        const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        this.renderTable(pageData);
        this.paginationManager.update(this.currentPage, totalPages);
    }

    renderTable(data) {
        const tbody = document.getElementById('districtsTableBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron distritos</td></tr>';
            return;
        }
        
        data.forEach(district => {
            const row = this.createTableRow(district);
            tbody.appendChild(row);
        });
    }

    createTableRow(district) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${district.id}</td>
            <td>${district.name}</td>
            <td>${district.code}</td>
            <td>${district.municipalityName || 'No asignado'}</td>
            <td>
                <span class="badge ${district.isActive ? 'bg-success' : 'bg-danger'}">
                    ${district.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-2" data-action="edit" data-id="${district.id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${district.id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        row.querySelector('[data-action="edit"]').addEventListener('click', 
            () => this.showEditModal(district.id));
        row.querySelector('[data-action="delete"]').addEventListener('click', 
            () => this.deleteDistrict(district.id));
        
        return row;
    }

    loadPage(page) {
        this.currentPage = page;
        this.renderCurrentPage();
    }

    showAddModal() {
        this.clearForm();
        this.loadMunicipalityOptions();
        document.getElementById('districtModalTitle').innerHTML = 
            '<i class="bi bi-map"></i> Agregar Distrito';
        
        const modal = new bootstrap.Modal(document.getElementById('districtModal'));
        modal.show();
    }

    showEditModal(id) {
        const district = this.districts.find(d => d.id === id);
        if (!district) {
            NotificationService.showError('Distrito no encontrado');
            return;
        }
        
        this.loadMunicipalityOptions();
        this.fillForm(district);
        document.getElementById('districtModalTitle').innerHTML = 
            '<i class="bi bi-map"></i> Editar Distrito';
        
        const modal = new bootstrap.Modal(document.getElementById('districtModal'));
        modal.show();
    }

    fillForm(district) {
        document.getElementById('districtId').value = district.id || '';
        document.getElementById('districtName').value = district.name;
        document.getElementById('districtCode').value = district.code;
        document.getElementById('districtMunicipalityId').value = district.municipalityId;
        document.getElementById('districtIsActive').checked = district.isActive;
    }

    clearForm() {
        document.getElementById('districtForm').reset();
        document.getElementById('districtId').value = '';
    }

    async saveDistrict() {
        try {
            const formData = this.getFormData();
            const district = new District(formData);
            
            const errors = district.validate();
            if (errors.length > 0) {
                await NotificationService.showError(errors.join('\n'));
                return;
            }
            
            NotificationService.showLoading(
                district.id ? 'Actualizando distrito...' : 'Creando distrito...'
            );
            
            if (district.id) {
                await this.apiService.updateDistrict(district);
                await NotificationService.showSuccess('Distrito actualizado exitosamente');
            } else {
                await this.apiService.createDistrict(district);
                await NotificationService.showSuccess('Distrito creado exitosamente');
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('districtModal'));
            modal.hide();
            
            await this.loadDistricts();
            
        } catch (error) {
            NotificationService.hideLoading();
            await NotificationService.showError('Error al guardar distrito: ' + error.message);
        }
    }

    getFormData() {
        return {
            id: document.getElementById('districtId').value || null,
            name: document.getElementById('districtName').value.trim(),
            code: document.getElementById('districtCode').value.trim(),
            municipalityId: parseInt(document.getElementById('districtMunicipalityId').value),
            isActive: document.getElementById('districtIsActive').checked
        };
    }

    async deleteDistrict(id) {
        const district = this.districts.find(d => d.id === id);
        if (!district) {
            await NotificationService.showError('Distrito no encontrado');
            return;
        }
        
        const confirmed = await NotificationService.confirmDelete(district.name, 'el distrito');
        if (!confirmed) return;
        
        try {
            NotificationService.showLoading('Eliminando distrito...');
            
            await this.apiService.deleteDistrict(id);
            await NotificationService.showSuccess('Distrito eliminado exitosamente');
            await this.loadDistricts();
            
        } catch (error) {
            NotificationService.hideLoading();
            await NotificationService.showError('Error al eliminar distrito: ' + error.message);
        }
    }

    clearFilters() {
        document.getElementById('districtSearchInput').value = '';
        document.getElementById('districtMunicipalityFilter').value = '';
        document.getElementById('districtStatusFilter').value = '';
        this.filterManager.clearAll();
    }
}

class App {
    constructor() {
        this.apiService = new ApiService(CONFIG.API_BASE_URL);
        this.municipalityController = null;
        this.districtController = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('Inicializando aplicación versión profesional...');
            
            this.municipalityController = new MunicipalityController(this.apiService);
            this.districtController = new DistrictController(this.apiService, this.municipalityController);
            
            await Promise.all([
                this.municipalityController.loadMunicipalities(),
                this.districtController.loadDistricts()
            ]);
            
            this.setupTabEvents();
            this.isInitialized = true;
            
            await NotificationService.showSuccess('Aplicación cargada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar aplicación:', error);
            await NotificationService.showError('Error al inicializar la aplicación: ' + error.message);
        }
    }

    setupTabEvents() {
        document.getElementById('districts-tab')?.addEventListener('shown.bs.tab', () => {
            this.districtController.loadMunicipalityOptions();
        });
    }

    cleanup() {
        this.isInitialized = false;
        console.log('Limpiando aplicación profesional...');
    }
}


let app = null;

function initializeApp() {
    if (!app) {
        app = new App();
    }
    return app.initialize();
}

function cleanupApp() {
    if (app) {
        app.cleanup();
    }
}

window.App = App;
window.initializeApp = initializeApp;
window.cleanupApp = cleanupApp;