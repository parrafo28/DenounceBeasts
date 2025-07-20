/**
 * Main Application Entry Point
 * TypeScript client for DenounceBeasts API
 */

import { 
  logger, 
  eventBus, 
  EVENT_TYPES, 
  validateMunicipality,
  validateSector,
  cache,
  formatDate,
  truncate,
  debounce
} from './utils';
import { serviceManager, services } from './services';
import config, { validateConfig } from './config/app.config';
import type { 
  Municipality, 
  Sector, 
  CreateMunicipalityDto, 
  UpdateMunicipalityDto,
  CreateSectorDto,
  UpdateSectorDto,
  ValidationResult 
} from './types';

/**
 * Main Application Class
 */
class DenounceBeatsApp {
  private initialized = false;
  private currentView = 'municipalities';
  private isLoading = false;
  private municipalities: Municipality[] = [];
  private sectors: Sector[] = [];
  private selectedMunicipality: Municipality | null = null;
  private selectedSector: Sector | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the application
   */
  private async init(): Promise<void> {
    try {
      // Validate configuration
      if (!validateConfig()) {
        throw new Error('Invalid application configuration');
      }

      // Initialize services
      await serviceManager.initialize();

      // Setup event listeners
      this.setupEventListeners();

      // Setup UI event handlers
      this.setupUIEventHandlers();

      // Load initial data
      await this.loadInitialData();

      this.initialized = true;
      this.showView('municipalities');

      logger.info('Application initialized successfully');
      eventBus.emitSync(EVENT_TYPES.APP_READY, { timestamp: new Date() });

    } catch (error) {
      logger.error('Failed to initialize application', { error });
      this.showError('Error al inicializar la aplicación');
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    // Data events
    eventBus.on(EVENT_TYPES.DATA_LOADED, (event) => {
      logger.debug('Data loaded event received', event.data);
    });

    eventBus.on(EVENT_TYPES.DATA_ERROR, (event) => {
      logger.error('Data error event received', event.data);
      this.showError('Error al cargar los datos');
    });

    // UI events
    eventBus.on(EVENT_TYPES.UI_LOADING, (event) => {
      this.setLoading(event.data.loading);
    });

    // Window events
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', { 
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', { reason: event.reason });
      event.preventDefault();
    });
  }

  /**
   * Setup UI event handlers
   */
  private setupUIEventHandlers(): void {
    // Navigation
    this.addEventListener('#nav-municipalities', 'click', () => {
      this.showView('municipalities');
    });

    this.addEventListener('#nav-sectors', 'click', () => {
      this.showView('sectors');
    });

    // Municipality events
    this.addEventListener('#btn-add-municipality', 'click', () => {
      this.showMunicipalityModal();
    });

    this.addEventListener('#municipality-form', 'submit', (e) => {
      e.preventDefault();
      this.handleMunicipalitySubmit();
    });

    this.addEventListener('#municipality-search', 'input', debounce((e) => {
      this.handleMunicipalitySearch((e.target as HTMLInputElement).value);
    }, config.ui.debounceDelay));

    // Sector events
    this.addEventListener('#btn-add-sector', 'click', () => {
      this.showSectorModal();
    });

    this.addEventListener('#sector-form', 'submit', (e) => {
      e.preventDefault();
      this.handleSectorSubmit();
    });

    this.addEventListener('#sector-search', 'input', debounce((e) => {
      this.handleSectorSearch((e.target as HTMLInputElement).value);
    }, config.ui.debounceDelay));

    this.addEventListener('#sector-municipality-filter', 'change', (e) => {
      this.handleSectorMunicipalityFilter(parseInt((e.target as HTMLSelectElement).value) || 0);
    });

    // Modal events
    this.addEventListener('.modal', 'hidden.bs.modal', () => {
      this.clearForms();
    });
  }

  /**
   * Helper to add event listener with error handling
   */
  private addEventListener(
    selector: string, 
    event: string, 
    handler: (e: Event) => void
  ): void {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, (e) => {
        try {
          handler(e);
        } catch (error) {
          logger.error('Error in event handler', { selector, event, error });
        }
      });
    }
  }

  /**
   * Load initial data
   */
  private async loadInitialData(): Promise<void> {
    this.setLoading(true);

    try {
      // Load municipalities and sectors in parallel
      const [municipalitiesResult, sectorsResult] = await Promise.all([
        services.municipality.getAll(),
        services.sector.getSectorsWithMunicipality()
      ]);

      if (municipalitiesResult.success) {
        this.municipalities = municipalitiesResult.data;
        logger.info('Municipalities loaded', { count: this.municipalities.length });
      } else {
        logger.error('Failed to load municipalities', { error: municipalitiesResult.error });
      }

      if (sectorsResult.success) {
        this.sectors = sectorsResult.data;
        logger.info('Sectors loaded', { count: this.sectors.length });
      } else {
        logger.error('Failed to load sectors', { error: sectorsResult.error });
      }

    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Show specific view
   */
  private showView(view: string): void {
    this.currentView = view;

    // Hide all views
    document.querySelectorAll('.view').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Show current view
    const currentViewEl = document.getElementById(`${view}-view`);
    if (currentViewEl) {
      currentViewEl.style.display = 'block';
    }

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.remove('active');
    });

    const activeNavEl = document.getElementById(`nav-${view}`);
    if (activeNavEl) {
      activeNavEl.classList.add('active');
    }

    // Render view data
    if (view === 'municipalities') {
      this.renderMunicipalities();
      this.populateSectorMunicipalityFilter();
    } else if (view === 'sectors') {
      this.renderSectors();
      this.populateSectorMunicipalityFilter();
    }

    logger.debug('View changed', { view });
  }

  /**
   * Render municipalities table
   */
  private renderMunicipalities(): void {
    const tbody = document.getElementById('municipalities-tbody');
    if (!tbody) return;

    const filteredMunicipalities = this.municipalities.filter(m => 
      this.matchesSearch(m.name + ' ' + m.code, this.getMunicipalitySearchValue())
    );

    tbody.innerHTML = filteredMunicipalities.map(municipality => `
      <tr>
        <td>${municipality.id}</td>
        <td>${municipality.name}</td>
        <td><code>${municipality.code}</code></td>
        <td>
          <span class="badge ${municipality.isActive ? 'bg-success' : 'bg-secondary'}">
            ${municipality.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td>${municipality.sectorsCount || 0}</td>
        <td>${formatDate(municipality.createdAt)}</td>
        <td>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-primary" 
                    onclick="app.editMunicipality(${municipality.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" 
                    onclick="app.deleteMunicipality(${municipality.id})">
              <i class="fas fa-trash"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-info" 
                    onclick="app.viewMunicipalitySectors(${municipality.id})">
              <i class="fas fa-map"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Update count
    const countEl = document.getElementById('municipalities-count');
    if (countEl) {
      countEl.textContent = filteredMunicipalities.length.toString();
    }
  }

  /**
   * Render sectors table
   */
  private renderSectors(): void {
    const tbody = document.getElementById('sectors-tbody');
    if (!tbody) return;

    let filteredSectors = this.sectors.filter(s => 
      this.matchesSearch(s.name + ' ' + s.code, this.getSectorSearchValue())
    );

    const municipalityFilter = this.getSectorMunicipalityFilter();
    if (municipalityFilter) {
      filteredSectors = filteredSectors.filter(s => s.municipalityId === municipalityFilter);
    }

    tbody.innerHTML = filteredSectors.map(sector => `
      <tr>
        <td>${sector.id}</td>
        <td>${sector.name}</td>
        <td><code>${sector.code}</code></td>
        <td>
          <span class="badge bg-info">${sector.municipalityName || 'N/A'}</span>
        </td>
        <td>
          <span class="badge ${sector.isActive ? 'bg-success' : 'bg-secondary'}">
            ${sector.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td>${sector.complaintsCount || 0}</td>
        <td>${formatDate(sector.createdAt)}</td>
        <td>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-primary" 
                    onclick="app.editSector(${sector.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" 
                    onclick="app.deleteSector(${sector.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Update count
    const countEl = document.getElementById('sectors-count');
    if (countEl) {
      countEl.textContent = filteredSectors.length.toString();
    }
  }

  /**
   * Show municipality modal for create/edit
   */
  private showMunicipalityModal(municipality?: Municipality): void {
    const modal = document.getElementById('municipalityModal');
    const form = document.getElementById('municipality-form') as HTMLFormElement;
    
    if (!modal || !form) return;

    // Reset form
    form.reset();
    this.clearValidationErrors(form);

    // Set form data if editing
    if (municipality) {
      (document.getElementById('municipality-id') as HTMLInputElement).value = municipality.id.toString();
      (document.getElementById('municipality-name') as HTMLInputElement).value = municipality.name;
      (document.getElementById('municipality-code') as HTMLInputElement).value = municipality.code;
      (document.getElementById('municipality-active') as HTMLInputElement).checked = municipality.isActive;
      
      document.getElementById('municipalityModalLabel')!.textContent = 'Editar Municipio';
    } else {
      document.getElementById('municipalityModalLabel')!.textContent = 'Nuevo Municipio';
    }

    // Show modal
    const bootstrapModal = new (window as any).bootstrap.Modal(modal);
    bootstrapModal.show();
  }

  /**
   * Show sector modal for create/edit
   */
  private showSectorModal(sector?: Sector): void {
    const modal = document.getElementById('sectorModal');
    const form = document.getElementById('sector-form') as HTMLFormElement;
    
    if (!modal || !form) return;

    // Reset form
    form.reset();
    this.clearValidationErrors(form);

    // Populate municipality select
    this.populateMunicipalitySelect();

    // Set form data if editing
    if (sector) {
      (document.getElementById('sector-id') as HTMLInputElement).value = sector.id.toString();
      (document.getElementById('sector-name') as HTMLInputElement).value = sector.name;
      (document.getElementById('sector-code') as HTMLInputElement).value = sector.code;
      (document.getElementById('sector-municipality') as HTMLSelectElement).value = sector.municipalityId.toString();
      (document.getElementById('sector-active') as HTMLInputElement).checked = sector.isActive;
      
      document.getElementById('sectorModalLabel')!.textContent = 'Editar Sector';
    } else {
      document.getElementById('sectorModalLabel')!.textContent = 'Nuevo Sector';
    }

    // Show modal
    const bootstrapModal = new (window as any).bootstrap.Modal(modal);
    bootstrapModal.show();
  }

  /**
   * Handle municipality form submission
   */
  private async handleMunicipalitySubmit(): Promise<void> {
    const form = document.getElementById('municipality-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const municipalityData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      isActive: formData.get('isActive') === 'on'
    };

    // Validate
    const validation = validateMunicipality(municipalityData);
    if (!validation.isValid) {
      this.showValidationErrors(form, validation);
      return;
    }

    this.setLoading(true);

    try {
      const municipalityId = formData.get('id') as string;
      let result;

      if (municipalityId) {
        // Update
        result = await services.municipality.update(parseInt(municipalityId), municipalityData);
        if (result.success) {
          this.showSuccess(config.messages.success.updated);
          this.updateMunicipalityInList(result.data);
        }
      } else {
        // Create
        result = await services.municipality.create(municipalityData);
        if (result.success) {
          this.showSuccess(config.messages.success.created);
          this.addMunicipalityToList(result.data);
        }
      }

      if (result.success) {
        this.hideMunicipalityModal();
        this.renderMunicipalities();
      } else {
        this.showError(result.error.message);
      }

    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle sector form submission
   */
  private async handleSectorSubmit(): Promise<void> {
    const form = document.getElementById('sector-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const sectorData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      municipalityId: parseInt(formData.get('municipalityId') as string),
      isActive: formData.get('isActive') === 'on'
    };

    // Validate
    const validation = validateSector(sectorData);
    if (!validation.isValid) {
      this.showValidationErrors(form, validation);
      return;
    }

    this.setLoading(true);

    try {
      const sectorId = formData.get('id') as string;
      let result;

      if (sectorId) {
        // Update
        result = await services.sector.update(parseInt(sectorId), sectorData);
        if (result.success) {
          this.showSuccess(config.messages.success.updated);
          this.updateSectorInList(result.data);
        }
      } else {
        // Create
        result = await services.sector.create(sectorData);
        if (result.success) {
          this.showSuccess(config.messages.success.created);
          this.addSectorToList(result.data);
        }
      }

      if (result.success) {
        this.hideSectorModal();
        this.renderSectors();
      } else {
        this.showError(result.error.message);
      }

    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Public methods for global access
   */
  editMunicipality(id: number): void {
    const municipality = this.municipalities.find(m => m.id === id);
    if (municipality) {
      this.showMunicipalityModal(municipality);
    }
  }

  async deleteMunicipality(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar este municipio?')) {
      return;
    }

    this.setLoading(true);

    try {
      const result = await services.municipality.delete(id);
      
      if (result.success) {
        this.showSuccess(config.messages.success.deleted);
        this.removeMunicipalityFromList(id);
        this.renderMunicipalities();
      } else {
        this.showError(result.error.message);
      }
    } finally {
      this.setLoading(false);
    }
  }

  editSector(id: number): void {
    const sector = this.sectors.find(s => s.id === id);
    if (sector) {
      this.showSectorModal(sector);
    }
  }

  async deleteSector(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar este sector?')) {
      return;
    }

    this.setLoading(true);

    try {
      const result = await services.sector.delete(id);
      
      if (result.success) {
        this.showSuccess(config.messages.success.deleted);
        this.removeSectorFromList(id);
        this.renderSectors();
      } else {
        this.showError(result.error.message);
      }
    } finally {
      this.setLoading(false);
    }
  }

  viewMunicipalitySectors(municipalityId: number): void {
    this.showView('sectors');
    const filterSelect = document.getElementById('sector-municipality-filter') as HTMLSelectElement;
    if (filterSelect) {
      filterSelect.value = municipalityId.toString();
      this.handleSectorMunicipalityFilter(municipalityId);
    }
  }

  // Helper methods
  private getMunicipalitySearchValue(): string {
    const input = document.getElementById('municipality-search') as HTMLInputElement;
    return input ? input.value.toLowerCase() : '';
  }

  private getSectorSearchValue(): string {
    const input = document.getElementById('sector-search') as HTMLInputElement;
    return input ? input.value.toLowerCase() : '';
  }

  private getSectorMunicipalityFilter(): number {
    const select = document.getElementById('sector-municipality-filter') as HTMLSelectElement;
    return select ? parseInt(select.value) || 0 : 0;
  }

  private matchesSearch(text: string, searchValue: string): boolean {
    return !searchValue || text.toLowerCase().includes(searchValue);
  }

  private handleMunicipalitySearch(query: string): void {
    this.renderMunicipalities();
  }

  private handleSectorSearch(query: string): void {
    this.renderSectors();
  }

  private handleSectorMunicipalityFilter(municipalityId: number): void {
    this.renderSectors();
  }

  private populateMunicipalitySelect(): void {
    const select = document.getElementById('sector-municipality') as HTMLSelectElement;
    if (!select) return;

    const activeMunicipalities = this.municipalities.filter(m => m.isActive);
    
    select.innerHTML = '<option value="">Seleccione un municipio</option>' +
      activeMunicipalities.map(m => 
        `<option value="${m.id}">${m.name}</option>`
      ).join('');
  }

  private populateSectorMunicipalityFilter(): void {
    const select = document.getElementById('sector-municipality-filter') as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = '<option value="">Todos los municipios</option>' +
      this.municipalities.map(m => 
        `<option value="${m.id}">${m.name}</option>`
      ).join('');
  }

  private addMunicipalityToList(municipality: Municipality): void {
    this.municipalities.push(municipality);
  }

  private updateMunicipalityInList(municipality: Municipality): void {
    const index = this.municipalities.findIndex(m => m.id === municipality.id);
    if (index !== -1) {
      this.municipalities[index] = municipality;
    }
  }

  private removeMunicipalityFromList(id: number): void {
    this.municipalities = this.municipalities.filter(m => m.id !== id);
  }

  private addSectorToList(sector: Sector): void {
    this.sectors.push(sector);
  }

  private updateSectorInList(sector: Sector): void {
    const index = this.sectors.findIndex(s => s.id === sector.id);
    if (index !== -1) {
      this.sectors[index] = sector;
    }
  }

  private removeSectorFromList(id: number): void {
    this.sectors = this.sectors.filter(s => s.id !== id);
  }

  private hideMunicipalityModal(): void {
    const modal = document.getElementById('municipalityModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      bootstrapModal?.hide();
    }
  }

  private hideSectorModal(): void {
    const modal = document.getElementById('sectorModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      bootstrapModal?.hide();
    }
  }

  private clearForms(): void {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.reset();
      this.clearValidationErrors(form);
    });
  }

  private showValidationErrors(form: HTMLFormElement, validation: ValidationResult): void {
    this.clearValidationErrors(form);

    Object.entries(validation.errors).forEach(([field, errors]) => {
      const input = form.querySelector(`[name="${field}"]`) as HTMLInputElement;
      if (input) {
        input.classList.add('is-invalid');
        
        const feedback = input.parentElement?.querySelector('.invalid-feedback');
        if (feedback) {
          feedback.textContent = errors[0];
        }
      }
    });
  }

  private clearValidationErrors(form: HTMLFormElement): void {
    const inputs = form.querySelectorAll('.is-invalid');
    inputs.forEach(input => {
      input.classList.remove('is-invalid');
    });

    const feedbacks = form.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(feedback => {
      feedback.textContent = '';
    });
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = loading ? 'block' : 'none';
    }

    eventBus.emitSync(EVENT_TYPES.UI_LOADING, { loading });
  }

  private showSuccess(message: string): void {
    this.showToast(message, 'success');
  }

  private showError(message: string): void {
    this.showToast(message, 'error');
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 4000);
  }

  /**
   * Destroy application and cleanup resources
   */
  destroy(): void {
    if (!this.initialized) {
      return;
    }

    serviceManager.destroy();
    cache.clear();
    eventBus.destroy();

    this.initialized = false;
    
    logger.info('Application destroyed');
    eventBus.emitSync(EVENT_TYPES.APP_DESTROY, { timestamp: new Date() });
  }

  /**
   * Get application statistics
   */
  getStats(): any {
    return {
      initialized: this.initialized,
      currentView: this.currentView,
      municipalities: this.municipalities.length,
      sectors: this.sectors.length,
      cacheStats: cache.getStats(),
      eventBusStats: eventBus.getStats()
    };
  }
}

// Initialize and expose app globally
const app = new DenounceBeatsApp();
(window as any).app = app;

// Export for module usage
export default app;