/**
 * Punto de entrada principal de la aplicación DenounceBeasts TypeScript
 * Este archivo inicializa la aplicación y configura todos los servicios necesarios
 */

import '@/styles/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap';

import { AppConfig } from '@/types';
import { App } from '@/components/App';
import { Logger } from '@/utils/Logger';
import { StorageService } from '@/services/StorageService';
import { ThemeService } from '@/services/ThemeService';
import { NotificationService } from '@/services/NotificationService';

// ===============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ===============================================

/**
 * Configuración principal de la aplicación
 */
const config: AppConfig = {
  apiBaseUrl: 'https://localhost:7175/api',
  appName: 'DenounceBeasts TypeScript',
  version: '1.0.0',
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
  features: {
    darkMode: true,
    notifications: true,
    offlineMode: true,
    analytics: false,
  },
  ui: {
    defaultPageSize: 10,
    maxPageSize: 100,
    animationDuration: 300,
    debounceDelay: 300,
  },
};

// ===============================================
// INICIALIZACIÓN DE SERVICIOS
// ===============================================

/**
 * Logger para la aplicación
 */
const logger = new Logger('App', config.environment === 'development');

/**
 * Servicio de almacenamiento
 */
const storageService = new StorageService();

/**
 * Servicio de temas
 */
const themeService = new ThemeService(storageService);

/**
 * Servicio de notificaciones
 */
const notificationService = new NotificationService();

// ===============================================
// FUNCIONES DE INICIALIZACIÓN
// ===============================================

/**
 * Configura el manejo global de errores
 */
function setupErrorHandling(): void {
  // Manejo de errores no capturados
  window.addEventListener('error', (event) => {
    logger.error('Error no capturado:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });

    if (config.environment === 'production') {
      notificationService.error('Ha ocurrido un error inesperado. Por favor, recarga la página.');
    }
  });

  // Manejo de promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Promesa rechazada no manejada:', event.reason);

    if (config.environment === 'production') {
      notificationService.error('Error de conexión. Verifique su conexión a internet.');
    }

    // Prevenir que el error aparezca en la consola del navegador
    event.preventDefault();
  });
}

/**
 * Configura el monitoreo de conexión
 */
function setupConnectionMonitoring(): void {
  window.addEventListener('online', () => {
    logger.info('Conexión restaurada');
    notificationService.success('Conexión a internet restaurada');
  });

  window.addEventListener('offline', () => {
    logger.warn('Sin conexión a internet');
    notificationService.warning('Sin conexión a internet. Algunas funciones pueden no estar disponibles.');
  });
}

/**
 * Configura el monitoreo de performance
 */
function setupPerformanceMonitoring(): void {
  if (!('performance' in window)) {
    logger.warn('Performance API no disponible');
    return;
  }

  window.addEventListener('load', () => {
    // Usar setTimeout para asegurar que las métricas estén disponibles
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        const metrics = {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          totalLoadTime: Math.round(perfData.loadEventEnd - perfData.navigationStart),
          ttfb: Math.round(perfData.responseStart - perfData.navigationStart), // Time to First Byte
        };

        logger.info('Métricas de performance:', metrics);

        // Alertar si el tiempo de carga es muy lento (más de 3 segundos)
        if (metrics.totalLoadTime > 3000) {
          logger.warn(`Tiempo de carga lento: ${metrics.totalLoadTime}ms`);
        }
      }
    }, 0);
  });
}

/**
 * Inicializa los servicios de la aplicación
 */
function initializeServices(): void {
  logger.info('Inicializando servicios...');

  // Inicializar tema
  themeService.initialize();
  logger.info('Servicio de temas inicializado');

  // Inicializar notificaciones
  notificationService.initialize();
  logger.info('Servicio de notificaciones inicializado');

  logger.info('Todos los servicios inicializados correctamente');
}

/**
 * Función principal de inicialización de la aplicación
 */
async function initializeApp(): Promise<void> {
  try {
    logger.info(`Iniciando ${config.appName} v${config.version} en modo ${config.environment}`);

    // Configurar manejo de errores
    setupErrorHandling();
    logger.info('Manejo de errores configurado');

    // Configurar monitoreo de conexión
    setupConnectionMonitoring();
    logger.info('Monitoreo de conexión configurado');

    // Configurar monitoreo de performance
    if (config.environment === 'development') {
      setupPerformanceMonitoring();
      logger.info('Monitoreo de performance configurado');
    }

    // Inicializar servicios
    initializeServices();

    // Obtener contenedor de la aplicación
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('Contenedor de aplicación (#app) no encontrado');
    }

    // Crear e inicializar la aplicación principal
    const app = new App(appContainer, {
      config,
      services: {
        logger,
        storage: storageService,
        theme: themeService,
        notification: notificationService,
      },
    });

    // Renderizar la aplicación
    await app.initialize();
    logger.info('Aplicación inicializada correctamente');

    // Ocultar pantalla de carga
    if (typeof window.hideLoadingScreen === 'function') {
      window.hideLoadingScreen();
    }

    // Mostrar notificación de bienvenida en desarrollo
    if (config.environment === 'development') {
      setTimeout(() => {
        notificationService.info('¡Bienvenido a DenounceBeasts TypeScript!');
      }, 1000);
    }

    // Registrar la aplicación globalmente para debugging
    if (config.environment === 'development') {
      (window as any).__APP__ = app;
      (window as any).__CONFIG__ = config;
      logger.info('Variables de debugging registradas: window.__APP__, window.__CONFIG__');
    }

  } catch (error) {
    logger.error('Error crítico al inicializar la aplicación:', error);
    
    // Mostrar error de fallback
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="container mt-5">
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error de Inicialización</h4>
                <p>La aplicación no pudo inicializarse correctamente.</p>
                <hr>
                <p class="mb-0">
                  Por favor, recarga la página. Si el problema persiste, contacta al administrador.
                </p>
                <button class="btn btn-outline-danger mt-3" onclick="window.location.reload()">
                  Recargar Página
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Ocultar pantalla de carga incluso en caso de error
    if (typeof window.hideLoadingScreen === 'function') {
      window.hideLoadingScreen();
    }
  }
}

// ===============================================
// PUNTO DE ENTRADA
// ===============================================

/**
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // El DOM ya está listo
  initializeApp();
}

// ===============================================
// EXPORTACIONES PARA DEBUGGING
// ===============================================

// Exportar configuración y servicios para debugging en desarrollo
export {
  config,
  logger,
  storageService,
  themeService,
  notificationService,
};