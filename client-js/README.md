# Cliente JavaScript Puro - Sistema de Denuncias Ciudadanas

Este es un cliente web desarrollado en JavaScript puro (vanilla) para consumir la API del sistema de denuncias ciudadanas. Está diseñado para ser simple y fácil de entender, ideal para desarrolladores principiantes.

## Características

- **Sin frameworks**: JavaScript puro para máxima simplicidad
- **Bootstrap 5**: Para estilos modernos y responsivos
- **SweetAlert2**: Para notificaciones elegantes
- **CRUD completo**: Para todas las entidades del sistema
- **Filtros y búsqueda**: En tiempo real
- **Paginación**: Para manejar grandes volúmenes de datos

## Estructura del Proyecto

```
client-js/
├── css/
│   └── site.css        # Estilos personalizados
├── js/
│   └── app.js          # Lógica de la aplicación
├── images/             # Carpeta para imágenes
├── index.html          # Página principal
└── README.md           # Este archivo
```

## Requisitos Previos

1. La API debe estar ejecutándose en `https://localhost:7175`
2. Un navegador web moderno (Chrome, Firefox, Edge, Safari)
3. Conexión a internet para cargar las librerías CDN

## Instalación

1. Clona o descarga este proyecto
2. No requiere instalación de dependencias
3. Abre el archivo `index.html` en tu navegador

## Uso

### Navegación

La aplicación está organizada en pestañas:
- **Denuncias**: Gestión principal de denuncias ciudadanas
- **Tipos de Denuncia**: Categorías de denuncias
- **Municipios**: Gestión de municipios
- **Sectores**: Gestión de sectores por municipio
- **Estados**: Estados de las denuncias

### Funcionalidades por Módulo

#### Denuncias
- Vista en tarjetas con información resumida
- Filtros por tipo, estado y municipio
- Búsqueda por título o descripción
- Soporte para coordenadas GPS
- Carga de imágenes (preview)

#### Municipios y Sectores
- Tabla con acciones CRUD
- Filtros y búsqueda
- Relación municipio-sector
- Activación/desactivación

#### Tipos de Denuncia
- Gestión de categorías
- Descripción opcional
- Estado activo/inactivo

#### Estados
- Gestión de estados del flujo
- Colores personalizables
- Descripción del estado

## Código Explicado

### Estructura del JavaScript

```javascript
// 1. Configuración base
const API_BASE_URL = 'https://localhost:7175';

// 2. Variables globales para almacenar datos
let municipalities = [];
let sectors = [];
// ... más variables

// 3. Funciones de utilidad
function showLoading() { }
function hideLoading() { }
function showError(message) { }
function showSuccess(message) { }

// 4. Funciones de API (fetch)
async function fetchMunicipalities() { }
async function createMunicipality(data) { }
// ... más funciones CRUD

// 5. Funciones de renderizado
function renderMunicipalities() { }
function renderSectors() { }
// ... más funciones de render

// 6. Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicialización
});
```

### Patrón de Comunicación con API

```javascript
// GET - Obtener datos
async function fetchData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/endpoint`);
        if (!response.ok) throw new Error('Error');
        return await response.json();
    } catch (error) {
        showError(error.message);
    }
}

// POST - Crear
async function createData(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        // ... manejo de respuesta
    } catch (error) {
        showError(error.message);
    }
}
```

## Personalización

### Cambiar URL de la API
Modifica la variable `API_BASE_URL` en `js/app.js`:
```javascript
const API_BASE_URL = 'https://tu-api-url.com';
```

### Modificar Estilos
Edita el archivo `css/site.css` para personalizar:
- Colores (variables CSS)
- Espaciados
- Tamaños de fuente
- Efectos hover

### Agregar Nuevas Funcionalidades
1. Añade el HTML necesario en `index.html`
2. Crea las funciones de API en `js/app.js`
3. Añade los event listeners correspondientes

## Mejores Prácticas Implementadas

1. **Async/Await**: Para manejo asíncrono moderno
2. **Try/Catch**: Para manejo de errores
3. **Funciones Reutilizables**: DRY (Don't Repeat Yourself)
4. **Separación de Responsabilidades**: UI vs Lógica vs API
5. **Validación Básica**: En formularios antes de enviar

## Problemas Comunes

### CORS
Si encuentras errores de CORS, asegúrate de que la API tenga configurado CORS correctamente.

### HTTPS
El navegador puede bloquear peticiones HTTPS con certificados autofirmados. Acepta el certificado visitando primero la URL de la API.

### Datos no se Cargan
1. Verifica que la API esté ejecutándose
2. Revisa la consola del navegador para errores
3. Confirma que la URL de la API sea correcta

## Próximos Pasos

Este es un cliente básico. Para proyectos más complejos considera:
- Usar un framework (React, Vue, Angular)
- Implementar autenticación
- Añadir validación más robusta
- Implementar caché local
- Usar un bundler (Webpack, Vite)

## Licencia

Este proyecto es parte del sistema DenounceBeasts y está bajo la misma licencia del proyecto principal.