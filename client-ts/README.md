# DenounceBeasts TypeScript Client

Un cliente web moderno y profesional desarrollado en TypeScript para el sistema de denuncias ciudadanas DenounceBeasts.

## 🚀 Características

### Arquitectura Avanzada
- **TypeScript puro** con tipado estricto y validación en tiempo de compilación
- **Arquitectura modular** con separación clara de responsabilidades
- **Patrón de servicios** para la gestión de APIs
- **Sistema de eventos** para comunicación entre componentes
- **Manejo de estado** local optimizado

### Funcionalidades Técnicas
- **Cache inteligente** con TTL y gestión de memoria
- **Validación en tiempo real** con esquemas configurables
- **Manejo de errores** robusto con reintentos automáticos
- **Logging avanzado** con múltiples niveles y exportación
- **Interceptores HTTP** para request/response/error
- **Sistema de eventos** tipo-seguro con prioridades

### UI/UX Moderna
- **Diseño responsivo** con Bootstrap 5
- **Interfaz intuitiva** con navegación fluida
- **Validación visual** en tiempo real
- **Feedback inmediato** con toasts y estados de carga
- **Accesibilidad** mejorada con ARIA labels

## 📋 Requisitos

- Node.js 16+ 
- npm 8+
- Navegador moderno con soporte ES2020+

## 🛠️ Instalación

```bash
# Clonar e instalar dependencias
cd client-ts
npm install

# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Servir build de producción
npm run serve
```

## 🏗️ Estructura del Proyecto

```
client-ts/
├── src/
│   ├── types/           # Definiciones de tipos TypeScript
│   │   ├── entities.ts  # Entidades del dominio
│   │   ├── common.ts    # Tipos comunes y utilidades
│   │   └── index.ts     # Exportaciones centralizadas
│   ├── config/          # Configuración de la aplicación
│   │   └── app.config.ts # Configuración tipo-segura
│   ├── utils/           # Utilidades y helpers
│   │   ├── logger.ts    # Sistema de logging avanzado
│   │   ├── helpers.ts   # Funciones de ayuda
│   │   ├── validator.ts # Sistema de validación
│   │   ├── cache.ts     # Gestión de cache
│   │   ├── event-emitter.ts # Sistema de eventos
│   │   └── index.ts     # Exportaciones
│   ├── services/        # Servicios de API
│   │   ├── api-client.ts # Cliente HTTP avanzado
│   │   ├── base-service.ts # Servicio base CRUD
│   │   ├── municipality-service.ts # Servicio de municipios
│   │   ├── sector-service.ts # Servicio de sectores
│   │   └── index.ts     # Exportaciones y factory
│   └── app.ts          # Punto de entrada principal
├── index.html          # Página principal
├── package.json        # Dependencias y scripts
├── tsconfig.json       # Configuración TypeScript
├── webpack.config.js   # Configuración Webpack
└── README.md          # Documentación
```

## ⚙️ Configuración

### API Configuration
```typescript
// src/config/app.config.ts
const config = {
  api: {
    baseURL: 'https://localhost:7175',
    timeout: 30000,
    retryAttempts: 3,
    // ...
  }
};
```

### Validación
```typescript
// Esquemas de validación configurables
validation: {
  municipality: {
    name: { required: true, minLength: 2, maxLength: 100 },
    code: { required: true, pattern: /^[A-Z0-9-]+$/ }
  }
}
```

### Cache
```typescript
// Cache con TTL y límites de tamaño
cache: {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100,
  enabled: true
}
```

## 🔧 Uso

### Servicios API
```typescript
import { services } from './services';

// CRUD operations
const result = await services.municipality.getAll();
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Validación
```typescript
import { validateMunicipality } from './utils';

const data = { name: 'Test', code: 'TEST' };
const validation = validateMunicipality(data);

if (!validation.isValid) {
  console.log(validation.errors);
}
```

### Cache
```typescript
import { cache } from './utils';

// Almacenar en cache
cache.set('key', data, { ttl: 60000 });

// Recuperar de cache
const cached = cache.get('key');
```

### Eventos
```typescript
import { eventBus, EVENT_TYPES } from './utils';

// Escuchar eventos
eventBus.on(EVENT_TYPES.DATA_LOADED, (event) => {
  console.log('Data loaded:', event.data);
});

// Emitir eventos
eventBus.emitSync(EVENT_TYPES.DATA_UPDATED, { entity: 'municipality' });
```

## 🎯 Funcionalidades Principales

### Gestión de Municipios
- ✅ Listar todos los municipios
- ✅ Crear nuevo municipio
- ✅ Editar municipio existente
- ✅ Eliminar municipio
- ✅ Buscar municipios
- ✅ Validación de códigos únicos
- ✅ Ver sectores por municipio

### Gestión de Sectores
- ✅ Listar todos los sectores
- ✅ Crear nuevo sector
- ✅ Editar sector existente
- ✅ Eliminar sector
- ✅ Buscar sectores
- ✅ Filtrar por municipio
- ✅ Validación de códigos únicos por municipio

### Características Técnicas
- ✅ Validación en tiempo real
- ✅ Cache inteligente
- ✅ Manejo de errores robusto
- ✅ Logging comprehensivo
- ✅ Reintentos automáticos
- ✅ Estados de carga
- ✅ Feedback visual

## 🔍 Debugging

### Consola del Navegador
```javascript
// Ver estadísticas de la aplicación
app.getStats()

// Ver logs del sistema
logger.getLogs()

// Ver estadísticas del cache
cache.getStats()

// Ver estadísticas del event bus
eventBus.getStats()
```

### Logging
```typescript
// Diferentes niveles de log
logger.debug('Debug message', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error message', data);

// Logs con contexto
const apiLogger = logger.child('API');
apiLogger.info('Request completed', { url, status });
```

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

### Variables de Entorno
```typescript
// Configuración por ambiente
const config = getEnvironmentConfig();
```

## 🧪 Testing

El proyecto incluye validación TypeScript estricta y manejo de errores robusto:

```bash
# Verificar tipos
npm run type-check

# Linting
npm run lint
```

## 📚 Documentación Técnica

### Tipos Principales
- `Municipality` - Entidad municipio
- `Sector` - Entidad sector  
- `ApiResponse<T>` - Respuesta de API tipo-segura
- `ValidationResult` - Resultado de validación
- `CacheEntry<T>` - Entrada de cache

### Servicios
- `MunicipalityService` - Operaciones de municipios
- `SectorService` - Operaciones de sectores
- `ApiClient` - Cliente HTTP avanzado
- `CacheManager` - Gestión de cache
- `EventEmitter` - Sistema de eventos

### Utilidades
- `Logger` - Sistema de logging
- `Validator` - Validación de datos
- `helpers` - Funciones de ayuda
- `formatters` - Formateo de datos

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es parte del sistema DenounceBeasts y está licenciado bajo los términos especificados en el proyecto principal.

## 🔗 Enlaces

- [API Documentation](../DenounceBeasts.API/)
- [JavaScript Client](../client-js/)
- [Advanced JavaScript Client](../client-js-advance/)
- [Main Project](../)

---

🤖 **Generated with [Claude Code](https://claude.ai/code)**

Co-Authored-By: Claude <noreply@anthropic.com>