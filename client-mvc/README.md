# DenounceBeasts MVC Client

Cliente web profesional desarrollado con ASP.NET Core MVC para el sistema de denuncias ciudadanas DenounceBeasts.

## 🚀 Características

### Arquitectura Empresarial
- **ASP.NET Core 8.0** con patrón MVC clásico
- **Dependency Injection** nativo de .NET
- **Logging estructurado** con Serilog
- **Polly** para resiliencia en llamadas HTTP
- **AutoMapper** para mapeo de objetos
- **FluentValidation** para validación de modelos

### Funcionalidades Empresariales
- **Cache en memoria** con expiración configurable
- **Reintentos automáticos** con backoff exponencial
- **Validación del lado cliente y servidor**
- **Manejo de errores** comprehensivo
- **Logging detallado** de todas las operaciones
- **Configuración por ambiente**

### UI/UX Profesional
- **Bootstrap 5** con diseño personalizado
- **Font Awesome** para iconografía
- **Responsive design** adaptable
- **Validación visual** en tiempo real
- **Alertas y notificaciones** contextuales
- **Breadcrumbs** y navegación intuitiva

## 📋 Requisitos

- .NET 8.0 SDK
- Visual Studio 2022 / VS Code / JetBrains Rider
- API DenounceBeasts en ejecución

## 🛠️ Instalación y Configuración

### 1. Clonar e Instalar

```bash
cd client-mvc
dotnet restore
```

### 2. Configurar API Settings

```json
// appsettings.json
{
  "ApiSettings": {
    "BaseUrl": "https://localhost:7175",
    "Timeout": 30,
    "RetryAttempts": 3,
    "CacheTimeout": 300
  }
}
```

### 3. Ejecutar la Aplicación

```bash
# Desarrollo
dotnet run

# Con hot reload
dotnet watch run

# Compilar para producción
dotnet publish -c Release -o ./publish
```

## 🏗️ Estructura del Proyecto

```
client-mvc/
├── Controllers/         # Controladores MVC
│   ├── HomeController.cs
│   ├── MunicipalitiesController.cs
│   └── SectorsController.cs
├── Models/             # Modelos y ViewModels
│   ├── Domain/         # Entidades del dominio
│   ├── ViewModels/     # ViewModels para vistas
│   └── Configuration/  # Configuración
├── Services/           # Servicios de negocio
│   ├── IApiService.cs  # Cliente HTTP
│   ├── IMunicipalityService.cs
│   └── ISectorService.cs
├── Views/              # Vistas Razor
│   ├── Shared/         # Layout y parciales
│   ├── Home/          # Dashboard
│   ├── Municipalities/ # Gestión de municipios
│   └── Sectors/       # Gestión de sectores
├── Program.cs          # Configuración y startup
└── appsettings.json   # Configuración
```

## ⚙️ Configuración Avanzada

### Logging con Serilog
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

### Políticas de Resiliencia
```csharp
// Configurado en Program.cs
var retryPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: retryAttempt => 
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
    );
```

### Cache Configuration
```json
{
  "Cache": {
    "DefaultExpiration": 300,
    "SlidingExpiration": 60
  }
}
```

## 🔧 Servicios y Funcionalidades

### ApiService
```csharp
public interface IApiService
{
    Task<T?> GetAsync<T>(string endpoint);
    Task<T?> PostAsync<T>(string endpoint, object data);
    Task<T?> PutAsync<T>(string endpoint, object data);
    Task<bool> DeleteAsync(string endpoint);
}
```

### MunicipalityService
```csharp
public interface IMunicipalityService
{
    Task<IEnumerable<Municipality>> GetAllAsync();
    Task<Municipality?> GetByIdAsync(int id);
    Task<Municipality?> CreateAsync(Municipality municipality);
    Task<Municipality?> UpdateAsync(int id, Municipality municipality);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}
```

## 📱 Características de la UI

### Dashboard Interactivo
- **Estadísticas en tiempo real** de municipios, sectores y denuncias
- **Acciones rápidas** para operaciones comunes
- **Denuncias recientes** con navegación directa
- **Indicadores visuales** con colores contextuales

### Gestión de Municipios
- ✅ **CRUD completo** con validación
- ✅ **Búsqueda en tiempo real**
- ✅ **Validación de códigos únicos**
- ✅ **Vista de sectores asociados**
- ✅ **Estados activo/inactivo**

### Gestión de Sectores
- ✅ **CRUD completo** con relaciones
- ✅ **Filtrado por municipio**
- ✅ **Validación de códigos únicos por municipio**
- ✅ **Búsqueda combinada**
- ✅ **Contadores de denuncias**

### Validación Avanzada
- **Cliente**: jQuery Validation + Unobtrusive
- **Servidor**: FluentValidation + Data Annotations
- **Tiempo real**: AJAX para unicidad de códigos
- **Visual**: Bootstrap classes para feedback

## 🎨 Personalización de Estilos

### Variables CSS Personalizadas
```css
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    --success-color: #198754;
    --danger-color: #dc3545;
}
```

### Componentes Reutilizables
- **Cards con hover effects**
- **Botones con animaciones**
- **Tables responsive con estilos**
- **Forms con validación visual**
- **Badges y estados**

## 🔒 Manejo de Errores

### Estrategia de Errores
```csharp
try
{
    var result = await _municipalityService.CreateAsync(municipality);
    if (result != null)
    {
        TempData["SuccessMessage"] = "Municipio creado exitosamente";
        return RedirectToAction(nameof(Index));
    }
    else
    {
        TempData["ErrorMessage"] = "Error al crear el municipio";
        return View(viewModel);
    }
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error creating municipality");
    TempData["ErrorMessage"] = "Error al crear el municipio";
    return View(viewModel);
}
```

### Tipos de Alertas
- **Success**: Operaciones exitosas
- **Error**: Errores de operación
- **Warning**: Advertencias importantes
- **Info**: Información general

## 📊 Logging y Monitoreo

### Structured Logging
```csharp
_logger.LogInformation("Retrieved {Count} municipalities from API", 
    municipalities.Count());

_logger.LogError(ex, "Error creating municipality {Name}", 
    municipality.Name);
```

### Archivos de Log
- `logs/denouncebeasts-webclient-{date}.log`
- Rotación diaria automática
- Niveles configurables por ambiente

## 🚀 Deployment

### Development
```bash
dotnet run --environment Development
```

### Production
```bash
dotnet publish -c Release -o ./publish
cd publish
dotnet DenounceBeasts.WebClient.dll
```

### Docker (Opcional)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY publish/ .
EXPOSE 80
ENTRYPOINT ["dotnet", "DenounceBeasts.WebClient.dll"]
```

## 🔧 Configuración por Ambiente

### appsettings.Development.json
```json
{
  "DetailedErrors": true,
  "ApiSettings": {
    "BaseUrl": "https://localhost:7175",
    "Timeout": 60,
    "RetryAttempts": 3
  }
}
```

### appsettings.Production.json
```json
{
  "ApiSettings": {
    "BaseUrl": "https://api.denouncebeasts.com",
    "Timeout": 30,
    "RetryAttempts": 5
  }
}
```

## 🧪 Testing

### Pruebas Manuales
1. **Dashboard**: Verificar estadísticas y navegación
2. **Municipios**: CRUD completo y validaciones
3. **Sectores**: Relaciones y filtros
4. **Responsividad**: Diferentes resoluciones
5. **Errores**: Manejo de fallos de API

### Herramientas de Debug
- **Serilog Dashboard** (desarrollo)
- **Network tab** para llamadas API
- **Console logs** para JavaScript
- **Validation summary** para errores

## 📚 Tecnologías Utilizadas

### Backend
- **ASP.NET Core 8.0** - Framework web
- **Serilog** - Logging estructurado
- **Polly** - Resiliencia y reintentos
- **AutoMapper** - Mapeo de objetos
- **FluentValidation** - Validación avanzada

### Frontend
- **Bootstrap 5** - Framework CSS
- **Font Awesome 6** - Iconografía
- **jQuery 3.7** - JavaScript utilities
- **jQuery Validation** - Validación cliente

### Herramientas
- **Visual Studio 2022** - IDE principal
- **Postman** - Testing de API
- **Browser DevTools** - Debug frontend

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es parte del sistema DenounceBeasts y está licenciado bajo los términos especificados en el proyecto principal.

## 🔗 Enlaces Relacionados

- [API Documentation](../DenounceBeasts.API/)
- [JavaScript Client](../client-js/)
- [TypeScript Client](../client-ts/)
- [Advanced JavaScript Client](../client-js-advance/)
- [Main Project](../)

---

🤖 **Generated with [Claude Code](https://claude.ai/code)**

Co-Authored-By: Claude <noreply@anthropic.com>