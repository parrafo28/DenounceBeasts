/**
 * Authentication Modal Component
 * Provides a professional login/register modal interface
 */

class AuthModalComponent {
    constructor() {
        this.isVisible = false;
        this.mode = 'login'; // 'login' or 'register'
        this.eventEmitter = eventBus.namespace('authModal');
        this.logger = logger.child('AuthModal');
        
        this.modalElement = null;
        this.loginForm = null;
        this.registerForm = null;
        
        this._createModal();
        this._bindEvents();
    }

    /**
     * Create modal HTML structure
     */
    _createModal() {
        const modalHTML = `
            <div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="authModalLabel">
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
                                    <input type="email" class="form-control" id="loginEmail" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="loginPassword" class="form-label">
                                        <i class="bi bi-key me-1"></i>Contraseña
                                    </label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="loginPassword" required>
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
                                        <input type="text" class="form-control" id="registerFirstName" required>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="registerLastName" class="form-label">
                                            <i class="bi bi-person me-1"></i>Apellido
                                        </label>
                                        <input type="text" class="form-control" id="registerLastName" required>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="registerEmail" class="form-label">
                                        <i class="bi bi-envelope me-1"></i>Email
                                    </label>
                                    <input type="email" class="form-control" id="registerEmail" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="registerPhone" class="form-label">
                                        <i class="bi bi-telephone me-1"></i>Teléfono
                                    </label>
                                    <input type="tel" class="form-control" id="registerPhone">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="registerAddress" class="form-label">
                                        <i class="bi bi-geo-alt me-1"></i>Dirección
                                    </label>
                                    <input type="text" class="form-control" id="registerAddress">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="registerPassword" class="form-label">
                                        <i class="bi bi-key me-1"></i>Contraseña
                                    </label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="registerPassword" required>
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
                                        <input type="password" class="form-control" id="registerConfirmPassword" required>
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
        this.modalElement = document.getElementById('authModal');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
    }

    /**
     * Bind event listeners
     */
    _bindEvents() {
        // Modal events
        this.modalElement.addEventListener('shown.bs.modal', () => {
            this.isVisible = true;
            this._focusFirstInput();
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
        document.getElementById('modeToggleBtn').addEventListener('click', () => {
            this._toggleMode();
        });

        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => this._togglePassword(e));
        });

        // Real-time validation
        this._setupRealTimeValidation();
    }

    /**
     * Show modal in login mode
     */
    showLogin() {
        this.mode = 'login';
        this._updateModal();
        this._showModal();
    }

    /**
     * Show modal in register mode
     */
    showRegister() {
        this.mode = 'register';
        this._updateModal();
        this._showModal();
    }

    /**
     * Hide modal
     */
    hide() {
        if (this.isVisible) {
            const modal = bootstrap.Modal.getInstance(this.modalElement);
            modal.hide();
        }
    }

    /**
     * Handle login form submission
     */
    async _handleLogin(event) {
        event.preventDefault();
        
        const button = event.target.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.spinner-border');
        
        try {
            // Show loading state
            button.disabled = true;
            spinner.classList.remove('d-none');
            
            // Clear previous errors
            this._clearErrors(this.loginForm);
            
            // Get form data
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            // Validate
            if (!this._validateLogin(email, password)) {
                return;
            }
            
            // Attempt login
            const result = await authService.login(email, password);
            
            if (result.success) {
                this.logger.info('Login successful', { email });
                this.eventEmitter.emit('loginSuccess', result);
                this.hide();
                
                // Show success message
                Utils.showNotification('¡Bienvenido! Sesión iniciada correctamente.', 'success');
            }
            
        } catch (error) {
            this.logger.error('Login failed', error);
            this._showError(this.loginForm, error.message);
            this.eventEmitter.emit('loginError', { error: error.message });
            
        } finally {
            // Hide loading state
            button.disabled = false;
            spinner.classList.add('d-none');
        }
    }

    /**
     * Handle register form submission
     */
    async _handleRegister(event) {
        event.preventDefault();
        
        const button = event.target.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.spinner-border');
        
        try {
            // Show loading state
            button.disabled = true;
            spinner.classList.remove('d-none');
            
            // Clear previous errors
            this._clearErrors(this.registerForm);
            
            // Get form data
            const userData = {
                firstName: document.getElementById('registerFirstName').value.trim(),
                lastName: document.getElementById('registerLastName').value.trim(),
                email: document.getElementById('registerEmail').value.trim(),
                phone: document.getElementById('registerPhone').value.trim(),
                address: document.getElementById('registerAddress').value.trim(),
                password: document.getElementById('registerPassword').value,
                confirmPassword: document.getElementById('registerConfirmPassword').value
            };
            
            // Validate
            if (!this._validateRegister(userData)) {
                return;
            }
            
            // Attempt registration
            const result = await authService.register(userData);
            
            if (result.success) {
                this.logger.info('Registration successful', { email: userData.email });
                this.eventEmitter.emit('registerSuccess', result);
                this.hide();
                
                // Show success message
                Utils.showNotification('¡Registro exitoso! Bienvenido a DenounceBeasts.', 'success');
            }
            
        } catch (error) {
            this.logger.error('Registration failed', error);
            this._showError(this.registerForm, error.message);
            this.eventEmitter.emit('registerError', { error: error.message });
            
        } finally {
            // Hide loading state
            button.disabled = false;
            spinner.classList.add('d-none');
        }
    }

    /**
     * Toggle between login and register modes
     */
    _toggleMode() {
        this.mode = this.mode === 'login' ? 'register' : 'login';
        this._updateModal();
    }

    /**
     * Update modal content based on mode
     */
    _updateModal() {
        const modalTitle = document.getElementById('modalTitle');
        const modeToggleText = document.getElementById('modeToggleText');
        const modeToggleBtn = document.getElementById('modeToggleBtn');
        
        if (this.mode === 'login') {
            modalTitle.textContent = 'Iniciar Sesión';
            this.loginForm.style.display = 'block';
            this.registerForm.style.display = 'none';
            modeToggleText.innerHTML = '¿No tienes cuenta? ';
            modeToggleBtn.textContent = 'Regístrate aquí';
        } else {
            modalTitle.textContent = 'Crear Cuenta';
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
            modeToggleText.innerHTML = '¿Ya tienes cuenta? ';
            modeToggleBtn.textContent = 'Inicia sesión aquí';
        }
    }

    /**
     * Show the modal
     */
    _showModal() {
        const modal = new bootstrap.Modal(this.modalElement);
        modal.show();
    }

    /**
     * Focus first input field
     */
    _focusFirstInput() {
        setTimeout(() => {
            const firstInput = this.mode === 'login' 
                ? document.getElementById('loginEmail')
                : document.getElementById('registerFirstName');
            
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }

    /**
     * Reset all forms
     */
    _resetForms() {
        this.loginForm.reset();
        this.registerForm.reset();
        this._clearErrors(this.loginForm);
        this._clearErrors(this.registerForm);
    }

    /**
     * Toggle password visibility
     */
    _togglePassword(event) {
        const button = event.target.closest('button');
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'bi bi-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'bi bi-eye';
        }
    }

    /**
     * Setup real-time validation
     */
    _setupRealTimeValidation() {
        // Email validation
        document.getElementById('registerEmail').addEventListener('blur', async (e) => {
            const email = e.target.value.trim();
            if (email && Utils.isValidEmail(email)) {
                try {
                    const exists = await authService.checkEmailExists(email);
                    if (exists) {
                        this._setFieldError(e.target, 'Este email ya está registrado');
                    } else {
                        this._clearFieldError(e.target);
                    }
                } catch (error) {
                    this.logger.error('Email check failed', error);
                }
            }
        });

        // Password confirmation
        document.getElementById('registerConfirmPassword').addEventListener('input', (e) => {
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = e.target.value;
            
            if (confirmPassword && password !== confirmPassword) {
                this._setFieldError(e.target, 'Las contraseñas no coinciden');
            } else {
                this._clearFieldError(e.target);
            }
        });
    }

    /**
     * Validate login form
     */
    _validateLogin(email, password) {
        let isValid = true;
        
        if (!email) {
            this._setFieldError(document.getElementById('loginEmail'), 'El email es requerido');
            isValid = false;
        } else if (!Utils.isValidEmail(email)) {
            this._setFieldError(document.getElementById('loginEmail'), 'Email inválido');
            isValid = false;
        }
        
        if (!password) {
            this._setFieldError(document.getElementById('loginPassword'), 'La contraseña es requerida');
            isValid = false;
        } else if (password.length < 6) {
            this._setFieldError(document.getElementById('loginPassword'), 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Validate register form
     */
    _validateRegister(userData) {
        let isValid = true;
        
        if (!userData.firstName) {
            this._setFieldError(document.getElementById('registerFirstName'), 'El nombre es requerido');
            isValid = false;
        }
        
        if (!userData.lastName) {
            this._setFieldError(document.getElementById('registerLastName'), 'El apellido es requerido');
            isValid = false;
        }
        
        if (!userData.email) {
            this._setFieldError(document.getElementById('registerEmail'), 'El email es requerido');
            isValid = false;
        } else if (!Utils.isValidEmail(userData.email)) {
            this._setFieldError(document.getElementById('registerEmail'), 'Email inválido');
            isValid = false;
        }
        
        if (!userData.password) {
            this._setFieldError(document.getElementById('registerPassword'), 'La contraseña es requerida');
            isValid = false;
        } else if (userData.password.length < 6) {
            this._setFieldError(document.getElementById('registerPassword'), 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }
        
        if (userData.password !== userData.confirmPassword) {
            this._setFieldError(document.getElementById('registerConfirmPassword'), 'Las contraseñas no coinciden');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Set field error
     */
    _setFieldError(field, message) {
        field.classList.add('is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback') || 
                        field.nextElementSibling.querySelector?.('.invalid-feedback');
        if (feedback) {
            feedback.textContent = message;
        }
    }

    /**
     * Clear field error
     */
    _clearFieldError(field) {
        field.classList.remove('is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback') || 
                        field.nextElementSibling.querySelector?.('.invalid-feedback');
        if (feedback) {
            feedback.textContent = '';
        }
    }

    /**
     * Clear all form errors
     */
    _clearErrors(form) {
        const fields = form.querySelectorAll('.is-invalid');
        fields.forEach(field => this._clearFieldError(field));
    }

    /**
     * Show general form error
     */
    _showError(form, message) {
        Utils.showNotification(message, 'error');
    }

    /**
     * Destroy the component
     */
    destroy() {
        if (this.modalElement) {
            this.modalElement.remove();
        }
        this.eventEmitter.removeAllListeners();
    }
}

// Create and export singleton instance
const authModal = new AuthModalComponent();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthModalComponent, authModal };
} else {
    window.AuthModalComponent = AuthModalComponent;
    window.authModal = authModal;
}