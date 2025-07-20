/**
 * Application Configuration
 * Type-safe configuration for the DenounceBeasts TypeScript client
 */

import type { AppConfig } from '@/types';

const config: AppConfig = {
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
      complaints: '/api/complaints',
      users: '/api/users',
      comments: '/api/comments',
      votes: '/api/votes',
      attachments: '/api/attachments',
      notifications: '/api/notifications'
    }
  },

  // UI Configuration
  ui: {
    itemsPerPage: 10,
    maxItemsPerPage: 100,
    debounceDelay: 300,
    animationDuration: 250,
    toastDuration: 4000,
    modalTransition: 200
  },

  // Cache Configuration
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    enabled: true,
    prefix: 'denouncebeasts_ts_'
  },

  // Validation Rules
  validation: {
    municipality: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        type: 'string'
      },
      code: {
        required: true,
        minLength: 2,
        maxLength: 10,
        pattern: /^[A-Z0-9-]+$/,
        type: 'string'
      }
    },
    sector: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        type: 'string'
      },
      code: {
        required: true,
        minLength: 2,
        maxLength: 10,
        pattern: /^[A-Z0-9-]+$/,
        type: 'string'
      },
      municipalityId: {
        required: true,
        type: 'number',
        min: 1
      }
    },
    complaint: {
      title: {
        required: true,
        minLength: 5,
        maxLength: 200,
        type: 'string'
      },
      description: {
        required: true,
        minLength: 10,
        maxLength: 2000,
        type: 'string'
      },
      complaintTypeId: {
        required: true,
        type: 'number',
        min: 1
      },
      municipalityId: {
        required: true,
        type: 'number',
        min: 1
      },
      address: {
        maxLength: 500,
        type: 'string'
      },
      latitude: {
        type: 'number',
        min: -90,
        max: 90
      },
      longitude: {
        type: 'number',
        min: -180,
        max: 180
      }
    },
    complaintType: {
      name: {
        required: true,
        minLength: 3,
        maxLength: 100,
        type: 'string'
      },
      description: {
        maxLength: 500,
        type: 'string'
      }
    },
    status: {
      name: {
        required: true,
        minLength: 3,
        maxLength: 50,
        type: 'string'
      },
      description: {
        maxLength: 500,
        type: 'string'
      },
      color: {
        required: true,
        pattern: /^#[0-9A-Fa-f]{6}$/,
        type: 'string'
      }
    },
    user: {
      fullName: {
        required: true,
        minLength: 2,
        maxLength: 100,
        type: 'string'
      },
      nickName: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_-]+$/,
        type: 'string'
      },
      email: {
        required: true,
        email: true,
        maxLength: 255,
        type: 'email'
      }
    },
    comment: {
      content: {
        required: true,
        minLength: 1,
        maxLength: 1000,
        type: 'string'
      },
      complaintId: {
        required: true,
        type: 'number',
        min: 1
      },
      userId: {
        required: true,
        type: 'number',
        min: 1
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

  // Development Configuration
  development: {
    enableLogging: true,
    enableDebugMode: true,
    mockData: false,
    logLevel: 'debug'
  },

  // Error Messages
  messages: {
    errors: {
      network: 'Error de conexión. Verifique su conexión a internet.',
      server: 'Error del servidor. Intente nuevamente más tarde.',
      notFound: 'El recurso solicitado no fue encontrado.',
      unauthorized: 'No tiene permisos para realizar esta acción.',
      forbidden: 'Acceso denegado.',
      validation: 'Por favor corrija los errores en el formulario.',
      timeout: 'La operación tardó demasiado tiempo. Intente nuevamente.',
      general: 'Ha ocurrido un error inesperado.',
      required: 'Este campo es requerido.',
      minLength: 'Debe tener al menos {min} caracteres.',
      maxLength: 'No puede tener más de {max} caracteres.',
      email: 'Debe ser un email válido.',
      pattern: 'El formato no es válido.',
      min: 'El valor debe ser mayor o igual a {min}.',
      max: 'El valor debe ser menor o igual a {max}.',
      fileSize: 'El archivo es demasiado grande.',
      fileType: 'Tipo de archivo no permitido.'
    },
    success: {
      created: 'Registro creado exitosamente.',
      updated: 'Registro actualizado exitosamente.',
      deleted: 'Registro eliminado exitosamente.',
      saved: 'Cambios guardados exitosamente.',
      uploaded: 'Archivo subido exitosamente.',
      exported: 'Datos exportados exitosamente.',
      imported: 'Datos importados exitosamente.',
      copied: 'Copiado al portapapeles.',
      emailSent: 'Email enviado exitosamente.'
    },
    info: {
      loading: 'Cargando datos...',
      processing: 'Procesando...',
      saving: 'Guardando...',
      deleting: 'Eliminando...',
      uploading: 'Subiendo archivo...',
      noData: 'No se encontraron registros.',
      noResults: 'No se encontraron resultados para su búsqueda.',
      selectItem: 'Seleccione un elemento.',
      confirmAction: '¿Está seguro de realizar esta acción?',
      unsavedChanges: 'Tiene cambios sin guardar.',
      offline: 'Sin conexión a internet.',
      online: 'Conexión restablecida.'
    }
  },

  // Theme Configuration
  themes: {
    default: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      success: '#198754',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#0dcaf0',
      light: '#f8f9fa',
      dark: '#212529'
    }
  }
} as const;

// Freeze configuration to prevent modifications
export default Object.freeze(config);

// Type-safe environment check
export const isDevelopment = (): boolean => {
  return config.development.enableDebugMode;
};

export const isProduction = (): boolean => {
  return !isDevelopment();
};

// Configuration validation
export const validateConfig = (): boolean => {
  try {
    // Check required API configuration
    if (!config.api.baseURL) {
      console.error('API baseURL is required');
      return false;
    }

    // Check API endpoints
    const requiredEndpoints = ['municipalities', 'sectors', 'complaintTypes', 'status', 'complaints'];
    for (const endpoint of requiredEndpoints) {
      if (!config.api.endpoints[endpoint]) {
        console.error(`API endpoint '${endpoint}' is missing`);
        return false;
      }
    }

    // Check cache configuration
    if (config.cache.enabled && config.cache.ttl <= 0) {
      console.error('Cache TTL must be greater than 0 when cache is enabled');
      return false;
    }

    // Check UI configuration
    if (config.ui.itemsPerPage <= 0 || config.ui.itemsPerPage > config.ui.maxItemsPerPage) {
      console.error('Invalid itemsPerPage configuration');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Configuration validation error:', error);
    return false;
  }
};

// Environment-specific configuration overrides
export const getEnvironmentConfig = (): Partial<AppConfig> => {
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return {
      development: {
        ...config.development,
        enableLogging: true,
        enableDebugMode: true,
        logLevel: 'debug'
      }
    };
  }
  
  // Staging environment
  if (hostname.includes('staging')) {
    return {
      development: {
        ...config.development,
        enableLogging: true,
        enableDebugMode: false,
        logLevel: 'info'
      }
    };
  }
  
  // Production environment
  return {
    development: {
      ...config.development,
      enableLogging: false,
      enableDebugMode: false,
      logLevel: 'error'
    }
  };
};

// Merge environment-specific configuration
export const getConfig = (): AppConfig => {
  const envConfig = getEnvironmentConfig();
  return {
    ...config,
    ...envConfig,
    development: {
      ...config.development,
      ...envConfig.development
    }
  };
};