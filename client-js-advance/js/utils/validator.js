/**
 * Advanced Validation System
 * Provides comprehensive validation for forms and data
 */

class Validator {
    constructor() {
        this.rules = AppConfig.validation;
        this.customRules = new Map();
        this.errors = new Map();
    }

    /**
     * Add custom validation rule
     */
    addRule(name, validator, message) {
        this.customRules.set(name, { validator, message });
    }

    /**
     * Validate a single field
     */
    validateField(fieldName, value, rules) {
        const errors = [];

        if (!rules) return errors;

        // Required validation
        if (rules.required && this.isEmpty(value)) {
            errors.push(`${this.getFieldLabel(fieldName)} es requerido`);
            return errors; // Skip other validations if required fails
        }

        // Skip other validations if value is empty and not required
        if (this.isEmpty(value)) {
            return errors;
        }

        // Type validation
        if (rules.type && !this.validateType(value, rules.type)) {
            errors.push(`${this.getFieldLabel(fieldName)} debe ser de tipo ${rules.type}`);
        }

        // Min length validation
        if (rules.minLength && value.toString().length < rules.minLength) {
            errors.push(`${this.getFieldLabel(fieldName)} debe tener al menos ${rules.minLength} caracteres`);
        }

        // Max length validation
        if (rules.maxLength && value.toString().length > rules.maxLength) {
            errors.push(`${this.getFieldLabel(fieldName)} no puede tener más de ${rules.maxLength} caracteres`);
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${this.getFieldLabel(fieldName)} tiene un formato inválido`);
        }

        // Min value validation
        if (rules.min !== undefined && Number(value) < rules.min) {
            errors.push(`${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${rules.min}`);
        }

        // Max value validation
        if (rules.max !== undefined && Number(value) > rules.max) {
            errors.push(`${this.getFieldLabel(fieldName)} debe ser menor o igual a ${rules.max}`);
        }

        // Email validation
        if (rules.email && !this.isValidEmail(value)) {
            errors.push(`${this.getFieldLabel(fieldName)} debe ser un email válido`);
        }

        // URL validation
        if (rules.url && !this.isValidUrl(value)) {
            errors.push(`${this.getFieldLabel(fieldName)} debe ser una URL válida`);
        }

        // Custom validation
        if (rules.custom && this.customRules.has(rules.custom)) {
            const customRule = this.customRules.get(rules.custom);
            if (!customRule.validator(value)) {
                errors.push(customRule.message);
            }
        }

        return errors;
    }

    /**
     * Validate an entire object
     */
    validate(data, schema) {
        this.errors.clear();
        const allErrors = {};

        for (const [fieldName, rules] of Object.entries(schema)) {
            const value = this.getNestedValue(data, fieldName);
            const fieldErrors = this.validateField(fieldName, value, rules);
            
            if (fieldErrors.length > 0) {
                allErrors[fieldName] = fieldErrors;
                this.errors.set(fieldName, fieldErrors);
            }
        }

        return {
            isValid: Object.keys(allErrors).length === 0,
            errors: allErrors
        };
    }

    /**
     * Validate entity based on predefined rules
     */
    validateEntity(entityType, data) {
        const schema = this.rules[entityType];
        if (!schema) {
            throw new Error(`Validation schema not found for entity: ${entityType}`);
        }
        return this.validate(data, schema);
    }

    /**
     * Validate form element
     */
    validateForm(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Determine entity type from form data-entity attribute
        const entityType = formElement.dataset.entity;
        if (!entityType) {
            throw new Error('Form must have data-entity attribute');
        }

        const result = this.validateEntity(entityType, data);
        
        // Update UI with validation results
        this.updateFormUI(formElement, result.errors);
        
        return result;
    }

    /**
     * Update form UI with validation errors
     */
    updateFormUI(formElement, errors) {
        // Clear previous errors
        const errorElements = formElement.querySelectorAll('.validation-error');
        errorElements.forEach(el => el.remove());

        const invalidElements = formElement.querySelectorAll('.is-invalid');
        invalidElements.forEach(el => el.classList.remove('is-invalid'));

        // Add new errors
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('is-invalid');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'validation-error invalid-feedback';
                errorDiv.textContent = fieldErrors[0]; // Show first error
                
                field.parentNode.appendChild(errorDiv);
            }
        }
    }

    /**
     * Real-time validation setup for form
     */
    setupRealTimeValidation(formElement) {
        const entityType = formElement.dataset.entity;
        if (!entityType) return;

        const schema = this.rules[entityType];
        if (!schema) return;

        // Add event listeners for real-time validation
        for (const fieldName of Object.keys(schema)) {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const validateField = Utils.debounce(() => {
                    const value = field.value;
                    const rules = schema[fieldName];
                    const fieldErrors = this.validateField(fieldName, value, rules);
                    
                    // Update field UI
                    field.classList.remove('is-invalid', 'is-valid');
                    const existingError = field.parentNode.querySelector('.validation-error');
                    if (existingError) existingError.remove();
                    
                    if (fieldErrors.length > 0) {
                        field.classList.add('is-invalid');
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'validation-error invalid-feedback';
                        errorDiv.textContent = fieldErrors[0];
                        field.parentNode.appendChild(errorDiv);
                    } else if (value.trim() !== '') {
                        field.classList.add('is-valid');
                    }
                }, AppConfig.ui.debounceDelay);

                field.addEventListener('blur', validateField);
                field.addEventListener('input', validateField);
            }
        }
    }

    /**
     * Helper methods
     */
    isEmpty(value) {
        return value === null || value === undefined || value === '';
    }

    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return !isNaN(Number(value)) && isFinite(Number(value));
            case 'boolean':
                return typeof value === 'boolean' || value === 'true' || value === 'false';
            case 'email':
                return this.isValidEmail(value);
            case 'url':
                return this.isValidUrl(value);
            default:
                return true;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    getFieldLabel(fieldName) {
        // Convert camelCase to readable format
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Get errors for specific field
     */
    getFieldErrors(fieldName) {
        return this.errors.get(fieldName) || [];
    }

    /**
     * Check if field has errors
     */
    hasFieldErrors(fieldName) {
        return this.errors.has(fieldName);
    }

    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors.clear();
    }

    /**
     * Clear errors for specific field
     */
    clearFieldErrors(fieldName) {
        this.errors.delete(fieldName);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validator;
} else {
    window.Validator = Validator;
}