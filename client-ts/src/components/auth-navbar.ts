/**
 * TypeScript Authentication Navbar Component
 * Professional navbar with authentication state management
 */

import { EventEmitter } from '../utils/event-emitter';
import { Logger } from '../utils/logger';
import { authService } from '../services/auth-service';
import { AuthUser, ChangePasswordDto } from '../types/entities';
import { showNotification } from '../utils/helpers';

export interface AuthNavbarConfig {
  containerId?: string;
  showUserMenu?: boolean;
  showAdminPanel?: boolean;
}

export interface AuthNavbarEvents {
  profileViewed: { user: AuthUser };
  passwordChanged: void;
  adminPanelRequested: void;
  logoutCompleted: void;
}

export class AuthNavbarComponent {
  private readonly logger: Logger;
  private readonly eventEmitter: EventEmitter;
  private readonly config: AuthNavbarConfig;

  private navbarContainer: HTMLElement | null = null;
  private userMenuDropdown: HTMLElement | null = null;

  constructor(config: AuthNavbarConfig = {}) {
    this.config = {
      containerId: config.containerId || 'authNavbarContainer',
      showUserMenu: config.showUserMenu !== false,
      showAdminPanel: config.showAdminPanel !== false
    };

    this.logger = new Logger('AuthNavbar');
    this.eventEmitter = new EventEmitter();

    this._initialize();
    this._bindEvents();
  }

  /**
   * Get event emitter for subscribing to events
   */
  public get events(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Update authentication state
   */
  public updateAuthState(): void {
    this._updateAuthState();
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  /**
   * Get current user
   */
  public getCurrentUser(): AuthUser | null {
    return authService.getCurrentUser();
  }

  /**
   * Force update of auth state
   */
  public forceUpdate(): void {
    this._updateAuthState();
  }

  /**
   * Initialize the component
   */
  private _initialize(): void {
    this._createNavbarAuth();
    this._updateAuthState();

    // Listen for auth changes
    authService.events.on('login', () => this._updateAuthState());
    authService.events.on('logout', () => this._updateAuthState());
    authService.events.on('register', () => this._updateAuthState());
  }

  /**
   * Create authentication section in navbar
   */
  private _createNavbarAuth(): void {
    // Find navbar or create one
    let navbar = document.querySelector('.navbar') as HTMLElement;
    if (!navbar) {
      // Create a simple navbar if none exists
      const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
          <div class="container">
            <a class="navbar-brand" href="#">
              <i class="bi bi-megaphone me-2"></i>
              DenounceBeasts
            </a>
            <div class="navbar-nav ms-auto" id="${this.config.containerId}">
              <!-- Auth content will be inserted here -->
            </div>
          </div>
        </nav>
      `;

      document.body.insertAdjacentHTML('afterbegin', navbarHTML);
      navbar = document.querySelector('.navbar') as HTMLElement;
    }

    // Find or create auth container
    this.navbarContainer = document.getElementById(this.config.containerId!);
    if (!this.navbarContainer) {
      const navbarNav = navbar.querySelector('.navbar-nav') || 
                       navbar.querySelector('.navbar-collapse .navbar-nav');
      if (navbarNav) {
        navbarNav.insertAdjacentHTML('beforeend', 
          `<div id="${this.config.containerId}" class="navbar-nav ms-auto"></div>`);
        this.navbarContainer = document.getElementById(this.config.containerId!);
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
  private _updateAuthState(): void {
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
  private _showAuthenticatedState(): void {
    const user = authService.getCurrentUser();
    if (!user || !this.navbarContainer) return;

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
          ${this.config.showUserMenu ? `
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
          ` : ''}
          ${user.roles.includes('Administrador') && this.config.showAdminPanel ? `
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
    this._bindAuthenticatedEvents();
  }

  /**
   * Show unauthenticated state
   */
  private _showUnauthenticatedState(): void {
    if (!this.navbarContainer) return;

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
    this._bindUnauthenticatedEvents();
  }

  /**
   * Bind events for authenticated state
   */
  private _bindAuthenticatedEvents(): void {
    // Profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => this._showProfile());
    }

    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => this._showChangePassword());
    }

    // Admin panel button
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    if (adminPanelBtn) {
      adminPanelBtn.addEventListener('click', () => this._showAdminPanel());
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this._handleLogout());
    }
  }

  /**
   * Bind events for unauthenticated state
   */
  private _bindUnauthenticatedEvents(): void {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        // Emit event for external auth modal
        this.eventEmitter.emit('loginRequested');
      });
    }

    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        // Emit event for external auth modal
        this.eventEmitter.emit('registerRequested');
      });
    }
  }

  /**
   * Bind global events
   */
  private _bindEvents(): void {
    // Listen for auth service events
    authService.events.on('login', () => {
      this.logger.info('User logged in, updating navbar');
    });

    authService.events.on('logout', () => {
      this.logger.info('User logged out, updating navbar');
    });
  }

  /**
   * Show user profile
   */
  private _showProfile(): void {
    const user = authService.getCurrentUser();
    if (!user) return;

    showNotification(`
      <div class="text-start">
        <strong>Perfil de Usuario</strong><br>
        <strong>Nombre:</strong> ${user.firstName} ${user.lastName}<br>
        <strong>Email:</strong> ${user.email}<br>
        <strong>Teléfono:</strong> ${user.phone || 'No especificado'}<br>
        <strong>Dirección:</strong> ${user.address || 'No especificada'}<br>
        <strong>Roles:</strong> ${user.roles.join(', ')}
      </div>
    `, 'info', 5000);

    this.eventEmitter.emit('profileViewed', { user });
  }

  /**
   * Show change password modal
   */
  private async _showChangePassword(): Promise<void> {
    try {
      const Swal = (window as any).Swal;
      if (!Swal) {
        showNotification('SweetAlert2 no está disponible', 'error');
        return;
      }

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
        preConfirm: (): ChangePasswordDto | false => {
          const currentPasswordInput = document.getElementById('currentPassword') as HTMLInputElement;
          const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
          const confirmNewPasswordInput = document.getElementById('confirmNewPassword') as HTMLInputElement;
          
          const currentPassword = currentPasswordInput?.value || '';
          const newPassword = newPasswordInput?.value || '';
          const confirmNewPassword = confirmNewPasswordInput?.value || '';

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

          return {
            currentPassword,
            newPassword,
            confirmNewPassword
          };
        }
      });

      if (result.isConfirmed) {
        const changePasswordData = result.value as ChangePasswordDto;

        await authService.changePassword(changePasswordData);
        showNotification('Contraseña cambiada exitosamente', 'success');

        this.eventEmitter.emit('passwordChanged');
      }

    } catch (error) {
      this.logger.error('Change password failed', error);
      const message = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      showNotification(`Error al cambiar contraseña: ${message}`, 'error');
    }
  }

  /**
   * Show admin panel
   */
  private _showAdminPanel(): void {
    showNotification('Panel de administración - Funcionalidad en desarrollo', 'info');
    this.eventEmitter.emit('adminPanelRequested');
  }

  /**
   * Handle logout
   */
  private async _handleLogout(): Promise<void> {
    try {
      const Swal = (window as any).Swal;
      if (!Swal) {
        // Fallback if SweetAlert2 is not available
        if (confirm('¿Estás seguro de que quieres cerrar tu sesión?')) {
          authService.logout();
          showNotification('Sesión cerrada correctamente', 'success');
          this.eventEmitter.emit('logoutCompleted');
        }
        return;
      }

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
        showNotification('Sesión cerrada correctamente', 'success');
        this.eventEmitter.emit('logoutCompleted');
      }

    } catch (error) {
      this.logger.error('Logout error', error);
      showNotification('Error al cerrar sesión', 'error');
    }
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    if (this.navbarContainer) {
      this.navbarContainer.innerHTML = '';
    }
    this.eventEmitter.removeAllListeners();
    this.logger.info('AuthNavbar component destroyed');
  }
}