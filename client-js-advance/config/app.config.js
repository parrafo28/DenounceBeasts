/**
 * Application Configuration
 * Centralized configuration for the DenounceBeasts application
 */

const AppConfig = {
    // API Configuration
    api: {
        baseURL: 'https://localhost:7175',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        endpoints: {
            municipalities: '/api/municipalities',
            sectors: '/api/sectors',
            complaintTypes: '/api/complainttypes',
            status: '/api/status',
            complaints: '/api/complaints'
        }
    },

    // UI Configuration
    ui: {
        itemsPerPage: 10,
        maxItemsPerPage: 100,
        debounceDelay: 300,
        animationDuration: 250,
        toastDuration: 3000,
        modalTransition: 200
    },

    // Cache Configuration
    cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        enabled: true,
        prefix: 'denouncebeasts_'
    },

    // Validation Rules
    validation: {
        municipality: {
            name: {
                required: true,
                minLength: 2,
                maxLength: 100
            },
            code: {
                required: true,
                minLength: 2,
                maxLength: 10,
                pattern: /^[A-Z0-9-]+$/
            }
        },
        sector: {
            name: {
                required: true,
                minLength: 2,
                maxLength: 100
            },
            code: {
                required: true,
                minLength: 2,
                maxLength: 10,
                pattern: /^[A-Z0-9-]+$/
            },
            municipalityId: {
                required: true,
                type: 'number'
            }
        },
        complaint: {
            title: {
                required: true,
                minLength: 5,
                maxLength: 200
            },
            description: {
                required: true,
                minLength: 10,
                maxLength: 2000
            },
            complaintTypeId: {
                required: true,
                type: 'number'
            },
            municipalityId: {
                required: true,
                type: 'number'
            }
        },
        complaintType: {
            name: {
                required: true,
                minLength: 3,
                maxLength: 100
            },
            description: {
                maxLength: 500
            }
        },
        status: {
            name: {
                required: true,
                minLength: 3,
                maxLength: 50
            },
            color: {
                required: true,
                pattern: /^#[0-9A-Fa-f]{6}$/
            }
        }
    },

    // Feature Flags
    features: {
        enableCache: true,
        enableOfflineMode: false,
        enablePushNotifications: false,
        enableBulkOperations: true,
        enableAdvancedFilters: true,
        enableExport: true,
        enableImageUpload: true,
        enableGeolocation: true
    },

    // Error Messages
    messages: {
        errors: {
            network: 'Error de conexión. Verifique su conexión a internet.',
            server: 'Error del servidor. Intente nuevamente más tarde.',
            notFound: 'El recurso solicitado no fue encontrado.',
            unauthorized: 'No tiene permisos para realizar esta acción.',
            validation: 'Por favor corrija los errores en el formulario.',
            timeout: 'La operación tardó demasiado tiempo. Intente nuevamente.',
            general: 'Ha ocurrido un error inesperado.'
        },
        success: {
            created: 'Registro creado exitosamente.',
            updated: 'Registro actualizado exitosamente.',
            deleted: 'Registro eliminado exitosamente.',
            saved: 'Cambios guardados exitosamente.'
        },
        info: {
            loading: 'Cargando datos...',
            noData: 'No se encontraron registros.',
            processing: 'Procesando...'
        }
    },

    // Themes
    themes: {
        default: {
            primary: '#007bff',
            secondary: '#6c757d',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        }
    },

    // Development Configuration
    development: {
        enableLogging: true,
        enableDebugMode: true,
        mockData: false,
        logLevel: 'debug' // debug, info, warn, error
    }
};

// Freeze configuration to prevent modifications
Object.freeze(AppConfig);

// Export for module systems or global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
} else {
    window.AppConfig = AppConfig;
}