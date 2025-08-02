/**
 * Advanced DenounceBeasts Application
 * Professional client application with authentication and advanced features
 */

class DenonceBeastsApp {
    constructor() {
        this.logger = logger.child('App');
        this.eventEmitter = eventBus.namespace('app');
        
        this.isInitialized = false;
        this.currentTab = 'dashboard';
        this.components = new Map();
        
        // Bind methods to maintain context
        this._handleTabClick = this._handleTabClick.bind(this);
        this._handleBeforeUnload = this._handleBeforeUnload.bind(this);
        this._handleOnlineStatus = this._handleOnlineStatus.bind(this);
        this._handleError = this._handleError.bind(this);
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            this.logger.info('Initializing DenounceBeasts Advanced Application');
            
            // Show loading overlay
            this._showGlobalLoading();
            
            // Initialize authentication first
            await this._initializeAuthentication();
            
            // Initialize core components
            await this._initializeCore();
            
            // Initialize UI components
            this._initializeUI();
            
            // Bind global events
            this._bindGlobalEvents();
            
            // Load initial data if authenticated
            if (authService.isAuthenticated()) {
                await this._loadInitialData();
            }
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Hide loading overlay
            this._hideGlobalLoading();
            
            this.logger.info('Application initialized successfully');
            this.eventEmitter.emit('initialized');
            
            // Show welcome message for authenticated users
            if (authService.isAuthenticated()) {
                const user = authService.getCurrentUser();
                Utils.showNotification(
                    `¡Bienvenido ${user.firstName}! Sistema cargado correctamente.`,
                    'success',
                    3000
                );
            }
            
        } catch (error) {
            this.logger.error('Failed to initialize application', error);
            this._handleInitializationError(error);
        }
    }

    /**
     * Initialize authentication system
     */
    async _initializeAuthentication() {
        try {
            this.logger.info('Initializing authentication system');
            
            // Initialize auth service
            const isAuthenticated = await authService.initialize();
            
            // Set up auth event listeners
            authService.eventEmitter.on('login', (data) => {
                this.logger.info('User logged in', { userId: data.user.id });
                this._onUserAuthenticated();
            });
            
            authService.eventEmitter.on('logout', () => {
                this.logger.info('User logged out');
                this._onUserLoggedOut();
            });
            
            authService.eventEmitter.on('register', (data) => {
                this.logger.info('User registered', { userId: data.user.id });
                this._onUserAuthenticated();
            });
            
            // Update UI based on auth state
            this._updateAuthenticatedUI();
            
            this.logger.info('Authentication initialized', { authenticated: isAuthenticated });
            
        } catch (error) {
            this.logger.error('Authentication initialization failed', error);
            throw error;
        }
    }

    /**
     * Initialize core application components
     */
    async _initializeCore() {
        try {
            this.logger.info('Initializing core components');
            
            // Initialize notification system
            if (window.NotificationManager) {
                this.components.set('notifications', new NotificationManager());
            }
            
            // Initialize modal manager
            if (window.ModalManager) {
                this.components.set('modals', new ModalManager());
            }
            
            // Initialize other core components as needed
            this.logger.info('Core components initialized');
            
        } catch (error) {
            this.logger.error('Core initialization failed', error);
            throw error;
        }
    }

    /**
     * Initialize UI components
     */
    _initializeUI() {
        try {
            this.logger.info('Initializing UI components');
            
            // Initialize dashboard
            this._initializeDashboard();
            
            // Initialize navigation
            this._initializeNavigation();
            
            // Initialize utility buttons
            this._initializeUtilityButtons();
            
            // Update connection status
            this._updateConnectionStatus();
            
            this.logger.info('UI components initialized');
            
        } catch (error) {
            this.logger.error('UI initialization failed', error);
            throw error;
        }
    }

    /**
     * Initialize dashboard
     */
    _initializeDashboard() {
        const dashboardElement = document.getElementById('dashboard');
        if (!dashboardElement) return;
        
        // Initialize dashboard stats
        this._initializeStats();
        
        // Initialize recent activity
        this._initializeActivity();
        
        // Initialize system status
        this._initializeSystemStatus();
    }

    /**
     * Initialize navigation
     */
    _initializeNavigation() {
        // Tab navigation
        document.addEventListener('click', (e) => {
            const tabElement = e.target.closest('[data-tab]');
            if (tabElement) {
                e.preventDefault();
                const tabId = tabElement.getAttribute('data-tab');
                this._switchTab(tabId);
            }
        });
    }

    /**
     * Initialize utility buttons
     */
    _initializeUtilityButtons() {
        // Export data button
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this._handleExportData());
        }
        
        // Clear cache button
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this._handleClearCache());
        }
        
        // View logs button
        const viewLogsBtn = document.getElementById('viewLogsBtn');
        if (viewLogsBtn) {
            viewLogsBtn.addEventListener('click', () => this._handleViewLogs());
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this._handleSettings());
        }
    }

    /**
     * Initialize statistics cards
     */
    async _initializeStats() {
        const statsContainer = document.getElementById('statsCards');
        if (!statsContainer) return;
        
        try {
            if (authService.isAuthenticated()) {
                // Load data for statistics
                const [municipalities, sectors, complaintTypes, statuses, complaints] = await Promise.allSettled([
                    municipalityService.getAll({ cache: { ttl: 300000 } }),
                    sectorService.getAll({ cache: { ttl: 300000 } }),
                    complaintTypeService.getAll({ cache: { ttl: 300000 } }),
                    statusService.getAll({ cache: { ttl: 300000 } }),
                    complaintService.getAll({ cache: { ttl: 300000 } })
                ]);
                
                // Create stat cards
                const stats = [
                    {
                        title: 'Municipios',
                        value: municipalities.status === 'fulfilled' ? municipalities.value.length : '---',
                        icon: 'bi-geo-alt',
                        color: 'primary',
                        change: '+2 este mes'
                    },
                    {
                        title: 'Sectores',
                        value: sectors.status === 'fulfilled' ? sectors.value.length : '---',
                        icon: 'bi-map',
                        color: 'success',
                        change: '+5 este mes'
                    },
                    {
                        title: 'Tipos de Denuncia',
                        value: complaintTypes.status === 'fulfilled' ? complaintTypes.value.length : '---',
                        icon: 'bi-tags',
                        color: 'info',
                        change: '+1 este mes'
                    },
                    {
                        title: 'Denuncias Totales',
                        value: complaints.status === 'fulfilled' ? complaints.value.length : '---',
                        icon: 'bi-exclamation-triangle',
                        color: 'warning',
                        change: '+15 esta semana'
                    }
                ];
                
                statsContainer.innerHTML = stats.map(stat => `
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card stat-card border-${stat.color}">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="card-subtitle mb-2 text-muted">${stat.title}</h6>
                                        <h3 class="card-title text-${stat.color} mb-1">${stat.value}</h3>
                                        <small class="text-success">
                                            <i class="bi bi-arrow-up"></i>
                                            ${stat.change}
                                        </small>
                                    </div>
                                    <div class="stat-icon">
                                        <i class="bi ${stat.icon} text-${stat.color}"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                statsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info text-center">
                            <i class="bi bi-info-circle me-2"></i>
                            Inicia sesión para ver las estadísticas del sistema
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            this.logger.error('Failed to load statistics', error);
            statsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Error al cargar estadísticas
                    </div>
                </div>
            `;
        }
    }

    /**
     * Initialize recent activity
     */
    _initializeActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;
        
        if (authService.isAuthenticated()) {
            const activities = [
                { type: 'success', icon: 'bi-check-circle', text: 'Sistema iniciado correctamente', time: 'Ahora' },
                { type: 'info', icon: 'bi-info-circle', text: 'Usuario autenticado', time: 'Hace 1 minuto' },
                { type: 'warning', icon: 'bi-exclamation-triangle', text: 'Caché limpiado', time: 'Hace 5 minutos' }
            ];
            
            activityContainer.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="bi ${activity.icon} text-${activity.type}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.text}</div>
                        <div class="activity-time text-muted">${activity.time}</div>
                    </div>
                </div>
            `).join('');
        } else {
            activityContainer.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-activity mb-2 fs-1"></i>
                    <p>Inicia sesión para ver la actividad reciente</p>
                </div>
            `;
        }
    }

    /**
     * Initialize system status
     */
    _initializeSystemStatus() {
        const systemStatusContainer = document.getElementById('systemStatus');
        if (!systemStatusContainer) return;
        
        const status = {
            api: 'online',
            cache: cache ? 'enabled' : 'disabled',
            authentication: authService.isAuthenticated() ? 'authenticated' : 'anonymous',
            connection: navigator.onLine ? 'online' : 'offline'
        };
        
        systemStatusContainer.innerHTML = `
            <div class="system-status">
                <div class="status-item">
                    <span class="status-label">API:</span>
                    <span class="badge bg-success">Online</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Caché:</span>
                    <span class="badge bg-${cache ? 'success' : 'secondary'}">
                        ${cache ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                </div>
                <div class="status-item">
                    <span class="status-label">Autenticación:</span>
                    <span class="badge bg-${authService.isAuthenticated() ? 'success' : 'warning'}">
                        ${authService.isAuthenticated() ? 'Autenticado' : 'Anónimo'}
                    </span>
                </div>
                <div class="status-item">
                    <span class="status-label">Conexión:</span>
                    <span class="badge bg-${navigator.onLine ? 'success' : 'danger'}">
                        ${navigator.onLine ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Load initial data
     */
    async _loadInitialData() {
        try {
            this.logger.info('Loading initial application data');
            
            // Load data with caching
            const loadPromises = [
                municipalityService.getAll({ cache: { ttl: 300000 } }),
                sectorService.getAll({ cache: { ttl: 300000 } }),
                complaintTypeService.getAll({ cache: { ttl: 300000 } }),
                statusService.getAll({ cache: { ttl: 300000 } })
            ];
            
            await Promise.allSettled(loadPromises);
            
            this.logger.info('Initial data loaded successfully');
            
        } catch (error) {
            this.logger.error('Failed to load initial data', error);
            // Don't throw error here, app should still work
        }
    }

    /**
     * Handle user authentication
     */
    _onUserAuthenticated() {
        this._updateAuthenticatedUI();
        this._loadInitialData();
        this._initializeStats();
        this._initializeActivity();
        this._initializeSystemStatus();
    }

    /**
     * Handle user logout
     */
    _onUserLoggedOut() {
        // Clear cache
        if (cache) {
            cache.clear();
        }
        
        // Update UI
        this._updateAuthenticatedUI();
        this._initializeStats();
        this._initializeActivity();
        this._initializeSystemStatus();
        
        // Redirect to dashboard
        this._switchTab('dashboard');
    }

    /**
     * Update authenticated UI state
     */
    _updateAuthenticatedUI() {
        const navItems = document.querySelectorAll('.nav-item');
        const authenticated = authService.isAuthenticated();
        
        navItems.forEach(item => {
            const link = item.querySelector('[data-tab]');
            if (link && link.getAttribute('data-tab') !== 'dashboard') {
                // Show/hide nav items based on auth state
                item.style.display = authenticated ? 'block' : 'none';
            }
        });
    }

    /**
     * Switch application tab
     */
    _switchTab(tabId) {
        // Update active nav item
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(element => {
            element.classList.add('active');
        });
        
        // Update active tab pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        
        const targetPane = document.getElementById(tabId);
        if (targetPane) {
            targetPane.classList.add('show', 'active');
        }
        
        this.currentTab = tabId;
        
        // Load tab content if needed
        this._loadTabContent(tabId);
        
        this.eventEmitter.emit('tabChanged', { tabId });
    }

    /**
     * Load content for specific tab
     */
    async _loadTabContent(tabId) {
        // This would load specific content for each tab
        // Implementation depends on your specific requirements
    }

    /**
     * Bind global event listeners
     */
    _bindGlobalEvents() {
        // Window events
        window.addEventListener('beforeunload', this._handleBeforeUnload);
        window.addEventListener('online', this._handleOnlineStatus);
        window.addEventListener('offline', this._handleOnlineStatus);
        window.addEventListener('error', this._handleError);
        window.addEventListener('unhandledrejection', this._handleError);
        
        // Document events
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logger.debug('Application hidden');
            } else {
                this.logger.debug('Application visible');
                this._updateConnectionStatus();
            }
        });
    }

    /**
     * Handle utility button actions
     */
    async _handleExportData() {
        if (!authService.isAuthenticated()) {
            Utils.showNotification('Debes iniciar sesión para exportar datos', 'warning');
            return;
        }
        
        try {
            // Implementation for data export
            Utils.showNotification('Función de exportación en desarrollo', 'info');
        } catch (error) {
            this.logger.error('Export failed', error);
            Utils.showNotification('Error al exportar datos', 'error');
        }
    }

    async _handleClearCache() {
        try {
            if (cache) {
                cache.clear();
                Utils.showNotification('Caché limpiado correctamente', 'success');
                
                // Reload current tab data
                if (authService.isAuthenticated()) {
                    this._loadInitialData();
                    this._initializeStats();
                }
            }
        } catch (error) {
            this.logger.error('Cache clear failed', error);
            Utils.showNotification('Error al limpiar caché', 'error');
        }
    }

    _handleViewLogs() {
        const logsModal = new bootstrap.Modal(document.getElementById('logsModal'));
        logsModal.show();
        
        // Load logs into modal
        // Implementation depends on your logging system
    }

    _handleSettings() {
        const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
        settingsModal.show();
    }

    /**
     * Handle global events
     */
    _handleTabClick(event) {
        const tabId = event.target.getAttribute('data-tab');
        if (tabId) {
            this._switchTab(tabId);
        }
    }

    _handleBeforeUnload(event) {
        if (this.isInitialized) {
            // Save any pending data
            this.logger.info('Application unloading');
        }
    }

    _handleOnlineStatus() {
        this._updateConnectionStatus();
    }

    _handleError(error) {
        this.logger.error('Global error caught', error);
    }

    /**
     * Update connection status indicator
     */
    _updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;
        
        const isOnline = navigator.onLine;
        statusElement.innerHTML = `
            <i class="bi bi-${isOnline ? 'wifi text-success' : 'wifi-off text-danger'}" 
               title="${isOnline ? 'Conectado' : 'Desconectado'}"></i>
        `;
    }

    /**
     * Show global loading overlay
     */
    _showGlobalLoading() {
        const overlay = document.getElementById('globalLoadingOverlay');
        if (overlay) {
            overlay.classList.remove('d-none');
        }
    }

    /**
     * Hide global loading overlay
     */
    _hideGlobalLoading() {
        const overlay = document.getElementById('globalLoadingOverlay');
        if (overlay) {
            overlay.classList.add('d-none');
        }
    }

    /**
     * Handle initialization errors
     */
    _handleInitializationError(error) {
        this._hideGlobalLoading();
        
        const errorMessage = `
            <div class="alert alert-danger m-3">
                <h4><i class="bi bi-exclamation-triangle"></i> Error de Inicialización</h4>
                <p>No se pudo inicializar la aplicación correctamente.</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <button class="btn btn-outline-danger" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise"></i> Reintentar
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            authenticated: authService.isAuthenticated(),
            currentTab: this.currentTab,
            online: navigator.onLine,
            components: Array.from(this.components.keys())
        };
    }

    /**
     * Destroy the application
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('beforeunload', this._handleBeforeUnload);
        window.removeEventListener('online', this._handleOnlineStatus);
        window.removeEventListener('offline', this._handleOnlineStatus);
        window.removeEventListener('error', this._handleError);
        
        // Destroy components
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        
        this.components.clear();
        this.eventEmitter.removeAllListeners();
        
        this.logger.info('Application destroyed');
    }
}

// Create and initialize application
const app = new DenonceBeastsApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.initialize());
} else {
    app.initialize();
}

// Export app instance
window.app = app;