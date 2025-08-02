/**
 * Authentication Navbar Component
 * Manages the navbar authentication state and user menu
 */

class AuthNavbarComponent {
    constructor() {
        this.eventEmitter = eventBus.namespace('authNavbar');
        this.logger = logger.child('AuthNavbar');
        
        this.navbarContainer = null;
        this.userMenuDropdown = null;
        
        this._initialize();
        this._bindEvents();
    }

    /**
     * Initialize the component
     */
    _initialize() {
        this._createNavbarAuth();
        this._updateAuthState();
        
        // Listen for auth changes
        authService.eventEmitter.on('login', () => this._updateAuthState());
        authService.eventEmitter.on('logout', () => this._updateAuthState());
        authService.eventEmitter.on('register', () => this._updateAuthState());
    }

    /**
     * Create authentication section in navbar
     */
    _createNavbarAuth() {
        // Find navbar or create one
        let navbar = document.querySelector('.navbar');
        if (!navbar) {
            // Create a simple navbar if none exists
            const navbarHTML = `
                <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div class="container">
                        <a class="navbar-brand" href="#">
                            <i class="bi bi-megaphone me-2"></i>
                            DenounceBeasts
                        </a>
                        <div class="navbar-nav ms-auto" id="authNavbarContainer">
                            <!-- Auth content will be inserted here -->
                        </div>
                    </div>
                </nav>
            `;
            
            document.body.insertAdjacentHTML('afterbegin', navbarHTML);
            navbar = document.querySelector('.navbar');
        }

        // Find or create auth container
        this.navbarContainer = document.getElementById('authNavbarContainer');
        if (!this.navbarContainer) {
            const navbarNav = navbar.querySelector('.navbar-nav') || navbar.querySelector('.navbar-collapse .navbar-nav');
            if (navbarNav) {
                navbarNav.insertAdjacentHTML('beforeend', '<div id="authNavbarContainer" class="navbar-nav ms-auto"></div>');
                this.navbarContainer = document.getElementById('authNavbarContainer');
            }
        }

        if (!this.navbarContainer) {
            this.logger.error('Could not create auth navbar container');
            return;
        }
    }

    /**
     * Update authentication state in navbar
     */
    _updateAuthState() {
        if (!this.navbarContainer) return;

        if (authService.isAuthenticated()) {
            this._showAuthenticatedState();
        } else {
            this._showUnauthenticatedState();
        }
    }

    /**
     * Show authenticated user state
     */
    _showAuthenticatedState() {
        const user = authService.getCurrentUser();
        
        const authenticatedHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" 
                        id="userMenuDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-2"></i>
                    <span class="d-none d-md-inline">${user.firstName} ${user.lastName}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuDropdown">
                    <li>
                        <div class="dropdown-header">
                            <div class="fw-bold">${user.firstName} ${user.lastName}</div>
                            <small class="text-muted">${user.email}</small>
                            <div class="mt-1">
                                ${user.roles.map(role => `<span class="badge bg-secondary me-1">${role}</span>`).join('')}
                            </div>
                        </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <button class="dropdown-item" type="button" id="profileBtn">
                            <i class="bi bi-person me-2"></i>Mi Perfil
                        </button>
                    </li>
                    <li>
                        <button class="dropdown-item" type="button" id="changePasswordBtn">
                            <i class="bi bi-key me-2"></i>Cambiar Contraseña
                        </button>
                    </li>
                    ${user.roles.includes('Administrador') ? `
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <button class="dropdown-item" type="button" id="adminPanelBtn">
                            <i class="bi bi-gear me-2"></i>Panel Admin
                        </button>
                    </li>
                    ` : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <button class="dropdown-item text-danger" type="button" id="logoutBtn">
                            <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </div>
        `;

        this.navbarContainer.innerHTML = authenticatedHTML;
        
        // Bind dropdown events
        this._bindAuthenticatedEvents();
    }

    /**
     * Show unauthenticated state
     */
    _showUnauthenticatedState() {
        const unauthenticatedHTML = `
            <div class="d-flex gap-2">
                <button class="btn btn-outline-light" type="button" id="loginBtn">
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    <span class="d-none d-sm-inline">Iniciar Sesión</span>
                </button>
                <button class="btn btn-light" type="button" id="registerBtn">
                    <i class="bi bi-person-plus me-2"></i>
                    <span class="d-none d-sm-inline">Registrarse</span>
                </button>
            </div>
        `;

        this.navbarContainer.innerHTML = unauthenticatedHTML;
        
        // Bind unauthenticated events
        this._bindUnauthenticatedEvents();
    }

    /**
     * Bind events for authenticated state
     */
    _bindAuthenticatedEvents() {
        // Profile button
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this._showProfile();
            });
        }

        // Change password button
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this._showChangePassword();
            });
        }

        // Admin panel button
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        if (adminPanelBtn) {
            adminPanelBtn.addEventListener('click', () => {
                this._showAdminPanel();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this._handleLogout();
            });
        }
    }

    /**
     * Bind events for unauthenticated state
     */
    _bindUnauthenticatedEvents() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                authModal.showLogin();
            });
        }

        // Register button
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                authModal.showRegister();
            });
        }
    }

    /**
     * Bind global events
     */
    _bindEvents() {
        // Listen for successful auth modal actions
        authModal.eventEmitter.on('loginSuccess', () => {
            this.logger.info('Login successful, updating navbar');
        });

        authModal.eventEmitter.on('registerSuccess', () => {
            this.logger.info('Registration successful, updating navbar');
        });
    }

    /**
     * Show user profile modal/page
     */
    _showProfile() {
        const user = authService.getCurrentUser();
        
        Utils.showNotification(`
            <strong>Perfil de Usuario</strong><br>
            <strong>Nombre:</strong> ${user.firstName} ${user.lastName}<br>
            <strong>Email:</strong> ${user.email}<br>
            <strong>Teléfono:</strong> ${user.phone || 'No especificado'}<br>
            <strong>Dirección:</strong> ${user.address || 'No especificada'}<br>
            <strong>Roles:</strong> ${user.roles.join(', ')}
        `, 'info', 5000);
        
        this.eventEmitter.emit('profileViewed', { user });
    }

    /**
     * Show change password modal
     */
    async _showChangePassword() {
        try {
            const result = await Swal.fire({
                title: 'Cambiar Contraseña',
                html: `
                    <div class="text-start">
                        <div class="mb-3">
                            <label for="currentPassword" class="form-label">Contraseña Actual</label>
                            <input type="password" class="form-control" id="currentPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="newPassword" class="form-label">Nueva Contraseña</label>
                            <input type="password" class="form-control" id="newPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="confirmNewPassword" class="form-label">Confirmar Nueva Contraseña</label>
                            <input type="password" class="form-control" id="confirmNewPassword" required>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Cambiar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const currentPassword = document.getElementById('currentPassword').value;
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                    
                    if (!currentPassword || !newPassword || !confirmNewPassword) {
                        Swal.showValidationMessage('Todos los campos son requeridos');
                        return false;
                    }
                    
                    if (newPassword.length < 6) {
                        Swal.showValidationMessage('La nueva contraseña debe tener al menos 6 caracteres');
                        return false;
                    }
                    
                    if (newPassword !== confirmNewPassword) {
                        Swal.showValidationMessage('Las contraseñas no coinciden');
                        return false;
                    }
                    
                    return { currentPassword, newPassword };
                }
            });

            if (result.isConfirmed) {
                const { currentPassword, newPassword } = result.value;
                
                await authService.changePassword(currentPassword, newPassword);
                Utils.showNotification('Contraseña cambiada exitosamente', 'success');
                
                this.eventEmitter.emit('passwordChanged');
            }
            
        } catch (error) {
            this.logger.error('Change password failed', error);
            Utils.showNotification('Error al cambiar contraseña: ' + error.message, 'error');
        }
    }

    /**
     * Show admin panel (placeholder)
     */
    _showAdminPanel() {
        Utils.showNotification('Panel de administración - Funcionalidad en desarrollo', 'info');
        this.eventEmitter.emit('adminPanelRequested');
    }

    /**
     * Handle logout
     */
    async _handleLogout() {
        try {
            const result = await Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que quieres cerrar tu sesión?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                authService.logout();
                Utils.showNotification('Sesión cerrada correctamente', 'success');
                
                this.eventEmitter.emit('logoutCompleted');
            }
            
        } catch (error) {
            this.logger.error('Logout error', error);
            Utils.showNotification('Error al cerrar sesión', 'error');
        }
    }

    /**
     * Get current authentication state
     */
    isAuthenticated() {
        return authService.isAuthenticated();
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return authService.getCurrentUser();
    }

    /**
     * Force update of auth state
     */
    forceUpdate() {
        this._updateAuthState();
    }

    /**
     * Destroy the component
     */
    destroy() {
        if (this.navbarContainer) {
            this.navbarContainer.innerHTML = '';
        }
        this.eventEmitter.removeAllListeners();
    }
}

// Create and export singleton instance
const authNavbar = new AuthNavbarComponent();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthNavbarComponent, authNavbar };
} else {
    window.AuthNavbarComponent = AuthNavbarComponent;
    window.authNavbar = authNavbar;
}