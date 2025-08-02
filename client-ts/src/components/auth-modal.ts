/**
 * TypeScript Authentication Modal Component
 * Professional login/register modal with type safety and validation
 */

import { EventEmitter } from '../utils/event-emitter';
import { Logger } from '../utils/logger';
import { authService } from '../services/auth-service';
import { LoginDto, RegisterDto, AuthUser } from '../types/entities';
import { isValidEmail, showNotification } from '../utils/helpers';

export interface AuthModalConfig {
  modalId?: string;
  autoFocus?: boolean;
  enableRealTimeValidation?: boolean;
}

export interface AuthModalEvents {
  shown: void;
  hidden: void;
  loginSuccess: { user: AuthUser };
  loginError: { error: string };
  registerSuccess: { user: AuthUser };
  registerError: { error: string };
  modeChanged: { mode: 'login' | 'register' };
}

export class AuthModalComponent {
  private readonly logger: Logger;
  private readonly eventEmitter: EventEmitter;
  private readonly config: AuthModalConfig;

  private modalElement: HTMLElement | null = null;
  private loginForm: HTMLFormElement | null = null;
  private registerForm: HTMLFormElement | null = null;
  private isVisible: boolean = false;
  private mode: 'login' | 'register' = 'login';

  constructor(config: AuthModalConfig = {}) {
    this.config = {
      modalId: config.modalId || 'authModal',
      autoFocus: config.autoFocus !== false,
      enableRealTimeValidation: config.enableRealTimeValidation !== false
    };

    this.logger = new Logger('AuthModal');
    this.eventEmitter = new EventEmitter();

    this._createModal();
    this._bindEvents();
  }

  /**
   * Show modal in login mode
   */
  public showLogin(): void {
    this.mode = 'login';
    this._updateModal();
    this._showModal();
  }

  /**
   * Show modal in register mode
   */
  public showRegister(): void {
    this.mode = 'register';
    this._updateModal();
    this._showModal();
  }

  /**
   * Hide modal
   */
  public hide(): void {
    if (this.isVisible && this.modalElement) {
      const modal = (window as any).bootstrap?.Modal.getInstance(this.modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  /**
   * Get event emitter for subscribing to events
   */
  public get events(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Create modal HTML structure
   */
  private _createModal(): void {
    const modalHTML = `
      <div class="modal fade" id="${this.config.modalId}" tabindex="-1" aria-labelledby="${this.config.modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${this.config.modalId}Label">
                <i class="bi bi-person-lock me-2"></i>
                <span id="modalTitle">Iniciar Sesión</span>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Login Form -->
              <form id="loginForm" class="auth-form" style="display: block;">
                <div class="mb-3">
                  <label for="loginEmail" class="form-label">
                    <i class="bi bi-envelope me-1"></i>Email
                  </label>
                  <input type="email" class="form-control" id="loginEmail" name="email" required>
                  <div class="invalid-feedback"></div>
                </div>
                <div class="mb-3">
                  <label for="loginPassword" class="form-label">
                    <i class="bi bi-key me-1"></i>Contraseña
                  </label>
                  <div class="input-group">
                    <input type="password" class="form-control" id="loginPassword" name="password" required>
                    <button type="button" class="btn btn-outline-secondary password-toggle" data-target="loginPassword">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback"></div>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3">
                  <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Iniciar Sesión
                </button>
              </form>

              <!-- Register Form -->
              <form id="registerForm" class="auth-form" style="display: none;">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="registerFirstName" class="form-label">
                      <i class="bi bi-person me-1"></i>Nombre
                    </label>
                    <input type="text" class="form-control" id="registerFirstName" name="firstName" required>
                    <div class="invalid-feedback"></div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="registerLastName" class="form-label">
                      <i class="bi bi-person me-1"></i>Apellido
                    </label>
                    <input type="text" class="form-control" id="registerLastName" name="lastName" required>
                    <div class="invalid-feedback"></div>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="registerEmail" class="form-label">
                    <i class="bi bi-envelope me-1"></i>Email
                  </label>
                  <input type="email" class="form-control" id="registerEmail" name="email" required>
                  <div class="invalid-feedback"></div>
                </div>
                <div class="mb-3">
                  <label for="registerPhone" class="form-label">
                    <i class="bi bi-telephone me-1"></i>Teléfono
                  </label>
                  <input type="tel" class="form-control" id="registerPhone" name="phone">
                  <div class="invalid-feedback"></div>
                </div>
                <div class="mb-3">
                  <label for="registerAddress" class="form-label">
                    <i class="bi bi-geo-alt me-1"></i>Dirección
                  </label>
                  <input type="text" class="form-control" id="registerAddress" name="address">
                  <div class="invalid-feedback"></div>
                </div>
                <div class="mb-3">
                  <label for="registerPassword" class="form-label">
                    <i class="bi bi-key me-1"></i>Contraseña
                  </label>
                  <div class="input-group">
                    <input type="password" class="form-control" id="registerPassword" name="password" required>
                    <button type="button" class="btn btn-outline-secondary password-toggle" data-target="registerPassword">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback"></div>
                </div>
                <div class="mb-3">
                  <label for="registerConfirmPassword" class="form-label">
                    <i class="bi bi-key me-1"></i>Confirmar Contraseña
                  </label>
                  <div class="input-group">
                    <input type="password" class="form-control" id="registerConfirmPassword" name="confirmPassword" required>
                    <button type="button" class="btn btn-outline-secondary password-toggle" data-target="registerConfirmPassword">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback"></div>
                </div>
                <button type="submit" class="btn btn-success w-100 mb-3">
                  <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
                  <i class="bi bi-person-plus me-2"></i>
                  Registrarse
                </button>
              </form>

              <!-- Mode Toggle -->
              <div class="text-center">
                <hr>
                <p class="mb-0" id="modeToggleText">
                  ¿No tienes cuenta? 
                  <button type="button" class="btn btn-link p-0" id="modeToggleBtn">Regístrate aquí</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert modal into body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // Get references
    this.modalElement = document.getElementById(this.config.modalId!);
    this.loginForm = document.getElementById('loginForm') as HTMLFormElement;
    this.registerForm = document.getElementById('registerForm') as HTMLFormElement;
  }

  /**
   * Bind event listeners
   */
  private _bindEvents(): void {
    if (!this.modalElement || !this.loginForm || !this.registerForm) {
      this.logger.error('Modal elements not found');
      return;
    }

    // Modal events
    this.modalElement.addEventListener('shown.bs.modal', () => {
      this.isVisible = true;
      if (this.config.autoFocus) {
        this._focusFirstInput();
      }
      this.eventEmitter.emit('shown');
    });

    this.modalElement.addEventListener('hidden.bs.modal', () => {
      this.isVisible = false;
      this._resetForms();
      this.eventEmitter.emit('hidden');
    });

    // Form submissions
    this.loginForm.addEventListener('submit', (e) => this._handleLogin(e));
    this.registerForm.addEventListener('submit', (e) => this._handleRegister(e));

    // Mode toggle
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    if (modeToggleBtn) {
      modeToggleBtn.addEventListener('click', () => this._toggleMode());
    }

    // Password toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => this._togglePassword(e as MouseEvent));
    });

    // Real-time validation
    if (this.config.enableRealTimeValidation) {
      this._setupRealTimeValidation();
    }
  }

  /**
   * Handle login form submission
   */
  private async _handleLogin(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.loginForm) return;

    const formData = new FormData(this.loginForm);
    const button = this.loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    const spinner = button?.querySelector('.spinner-border');
    
    try {
      // Show loading state
      if (button) button.disabled = true;
      if (spinner) spinner.classList.remove('d-none');
      
      // Clear previous errors
      this._clearFormErrors(this.loginForm);
      
      // Get form data
      const loginData: LoginDto = {
        email: (formData.get('email') as string)?.trim() || '',
        password: formData.get('password') as string || ''
      };
      
      // Validate
      if (!this._validateLogin(loginData)) {
        return;
      }
      
      // Attempt login
      const user = await authService.login(loginData);
      
      this.logger.info('Login successful', { email: loginData.email });
      this.eventEmitter.emit('loginSuccess', { user });
      this.hide();
      
      showNotification('¡Bienvenido! Sesión iniciada correctamente.', 'success');
      
    } catch (error) {
      this.logger.error('Login failed', error);
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      this._showFormError(this.loginForm, message);
      this.eventEmitter.emit('loginError', { error: message });
      
    } finally {
      // Hide loading state
      if (button) button.disabled = false;
      if (spinner) spinner.classList.add('d-none');
    }
  }

  /**
   * Handle register form submission
   */
  private async _handleRegister(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.registerForm) return;

    const formData = new FormData(this.registerForm);
    const button = this.registerForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    const spinner = button?.querySelector('.spinner-border');
    
    try {
      // Show loading state
      if (button) button.disabled = true;
      if (spinner) spinner.classList.remove('d-none');
      
      // Clear previous errors
      this._clearFormErrors(this.registerForm);
      
      // Get form data
      const registerData: RegisterDto = {
        firstName: (formData.get('firstName') as string)?.trim() || '',
        lastName: (formData.get('lastName') as string)?.trim() || '',
        email: (formData.get('email') as string)?.trim() || '',
        phone: (formData.get('phone') as string)?.trim() || '',
        address: (formData.get('address') as string)?.trim() || '',
        password: formData.get('password') as string || '',
        confirmPassword: formData.get('confirmPassword') as string || ''
      };
      
      // Validate
      if (!this._validateRegister(registerData)) {
        return;
      }
      
      // Attempt registration
      const user = await authService.register(registerData);
      
      this.logger.info('Registration successful', { email: registerData.email });
      this.eventEmitter.emit('registerSuccess', { user });
      this.hide();
      
      showNotification('¡Registro exitoso! Bienvenido a DenounceBeasts.', 'success');
      
    } catch (error) {
      this.logger.error('Registration failed', error);
      const message = error instanceof Error ? error.message : 'Error en el registro';
      this._showFormError(this.registerForm, message);
      this.eventEmitter.emit('registerError', { error: message });
      
    } finally {
      // Hide loading state
      if (button) button.disabled = false;
      if (spinner) spinner.classList.add('d-none');
    }
  }

  /**
   * Toggle between login and register modes
   */
  private _toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this._updateModal();
    this.eventEmitter.emit('modeChanged', { mode: this.mode });
  }

  /**
   * Update modal content based on mode
   */
  private _updateModal(): void {
    const modalTitle = document.getElementById('modalTitle');
    const modeToggleText = document.getElementById('modeToggleText');
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    
    if (!modalTitle || !modeToggleText || !modeToggleBtn) return;
    
    if (this.mode === 'login') {
      modalTitle.textContent = 'Iniciar Sesión';
      if (this.loginForm) this.loginForm.style.display = 'block';
      if (this.registerForm) this.registerForm.style.display = 'none';
      modeToggleText.innerHTML = '¿No tienes cuenta? ';
      modeToggleBtn.textContent = 'Regístrate aquí';
    } else {
      modalTitle.textContent = 'Crear Cuenta';
      if (this.loginForm) this.loginForm.style.display = 'none';
      if (this.registerForm) this.registerForm.style.display = 'block';
      modeToggleText.innerHTML = '¿Ya tienes cuenta? ';
      modeToggleBtn.textContent = 'Inicia sesión aquí';
    }
  }

  /**
   * Show the modal
   */
  private _showModal(): void {
    if (this.modalElement && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(this.modalElement);
      modal.show();
    }
  }

  /**
   * Focus first input field
   */
  private _focusFirstInput(): void {
    setTimeout(() => {
      const firstInput = this.mode === 'login' 
        ? document.getElementById('loginEmail')
        : document.getElementById('registerFirstName');
      
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 300);
  }

  /**
   * Reset all forms
   */
  private _resetForms(): void {
    if (this.loginForm) {
      this.loginForm.reset();
      this._clearFormErrors(this.loginForm);
    }
    if (this.registerForm) {
      this.registerForm.reset();
      this._clearFormErrors(this.registerForm);
    }
  }

  /**
   * Toggle password visibility
   */
  private _togglePassword(event: MouseEvent): void {
    const button = event.target as HTMLElement;
    const targetId = button.closest('button')?.getAttribute('data-target');
    if (!targetId) return;
    
    const input = document.getElementById(targetId) as HTMLInputElement;
    const icon = button.querySelector('i');
    
    if (input && icon) {
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'bi bi-eye';
      }
    }
  }

  /**
   * Setup real-time validation
   */
  private _setupRealTimeValidation(): void {
    // Email validation for registration
    const registerEmailInput = document.getElementById('registerEmail') as HTMLInputElement;
    if (registerEmailInput) {
      registerEmailInput.addEventListener('blur', async () => {
        const email = registerEmailInput.value.trim();
        if (email && isValidEmail(email)) {
          try {
            const exists = await authService.checkEmailExists(email);
            if (exists) {
              this._setFieldError(registerEmailInput, 'Este email ya está registrado');
            } else {
              this._clearFieldError(registerEmailInput);
            }
          } catch (error) {
            this.logger.error('Email check failed', error);
          }
        }
      });
    }

    // Password confirmation validation
    const confirmPasswordInput = document.getElementById('registerConfirmPassword') as HTMLInputElement;
    const passwordInput = document.getElementById('registerPassword') as HTMLInputElement;
    if (confirmPasswordInput && passwordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
          this._setFieldError(confirmPasswordInput, 'Las contraseñas no coinciden');
        } else {
          this._clearFieldError(confirmPasswordInput);
        }
      });
    }
  }

  /**
   * Validate login form
   */
  private _validateLogin(data: LoginDto): boolean {
    let isValid = true;
    
    const emailInput = document.getElementById('loginEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
    
    if (!data.email) {
      this._setFieldError(emailInput, 'El email es requerido');
      isValid = false;
    } else if (!isValidEmail(data.email)) {
      this._setFieldError(emailInput, 'Email inválido');
      isValid = false;
    }
    
    if (!data.password) {
      this._setFieldError(passwordInput, 'La contraseña es requerida');
      isValid = false;
    } else if (data.password.length < 6) {
      this._setFieldError(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }
    
    return isValid;
  }

  /**
   * Validate register form
   */
  private _validateRegister(data: RegisterDto): boolean {
    let isValid = true;
    
    const firstNameInput = document.getElementById('registerFirstName') as HTMLInputElement;
    const lastNameInput = document.getElementById('registerLastName') as HTMLInputElement;
    const emailInput = document.getElementById('registerEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('registerPassword') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('registerConfirmPassword') as HTMLInputElement;
    
    if (!data.firstName) {
      this._setFieldError(firstNameInput, 'El nombre es requerido');
      isValid = false;
    }
    
    if (!data.lastName) {
      this._setFieldError(lastNameInput, 'El apellido es requerido');
      isValid = false;
    }
    
    if (!data.email) {
      this._setFieldError(emailInput, 'El email es requerido');
      isValid = false;
    } else if (!isValidEmail(data.email)) {
      this._setFieldError(emailInput, 'Email inválido');
      isValid = false;
    }
    
    if (!data.password) {
      this._setFieldError(passwordInput, 'La contraseña es requerida');
      isValid = false;
    } else if (data.password.length < 6) {
      this._setFieldError(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }
    
    if (data.password !== data.confirmPassword) {
      this._setFieldError(confirmPasswordInput, 'Las contraseñas no coinciden');
      isValid = false;
    }
    
    return isValid;
  }

  /**
   * Set field error
   */
  private _setFieldError(field: HTMLInputElement, message: string): void {
    field.classList.add('is-invalid');
    const feedback = field.parentNode?.parentNode?.querySelector('.invalid-feedback') || 
                    field.parentNode?.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = message;
    }
  }

  /**
   * Clear field error
   */
  private _clearFieldError(field: HTMLInputElement): void {
    field.classList.remove('is-invalid');
    const feedback = field.parentNode?.parentNode?.querySelector('.invalid-feedback') || 
                    field.parentNode?.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = '';
    }
  }

  /**
   * Clear all form errors
   */
  private _clearFormErrors(form: HTMLFormElement): void {
    const fields = form.querySelectorAll('.is-invalid') as NodeListOf<HTMLInputElement>;
    fields.forEach(field => this._clearFieldError(field));
  }

  /**
   * Show general form error
   */
  private _showFormError(form: HTMLFormElement, message: string): void {
    showNotification(message, 'error');
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    if (this.modalElement) {
      this.modalElement.remove();
    }
    this.eventEmitter.removeAllListeners();
  }
}