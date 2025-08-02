# DenounceBeasts - Sistema de Gestión de Denuncias Ciudadanas

## 📋 Resumen Ejecutivo

DenounceBeasts es un sistema completo de gestión de denuncias ciudadanas desarrollado para el curso ITLA 2025 C2 Saturdays. El proyecto implementa una arquitectura multicapa con múltiples clientes frontend que consumen una API REST centralizada, diseñado para demostrar diferentes tecnologías y patrones de desarrollo.

## 🏗️ Arquitectura del Sistema

### Backend (API)
- **Framework**: ASP.NET Core 8.0 Web API
- **Patrón**: Clean Architecture con capas separadas
- **Base de Datos**: Entity Framework Core con SQL Server
- **Autenticación**: JWT (JSON Web Tokens) con BCrypt para hash de contraseñas

### Estructura de Capas del Backend:
```
DenounceBeasts.API/          # Controladores y configuración
DenounceBeasts.Application/  # Lógica de negocio y DTOs
DenounceBeasts.Domain/       # Entidades del dominio
DenounceBeasts.Infrastructure/ # Repositorios y UoW
DenounceBeasts.Persistence/  # DbContext y migraciones
```

### Clientes Frontend (8 implementaciones):
1. **client-js** - Vanilla JavaScript
2. **client-js-advance** - JavaScript avanzado con arquitectura modular
3. **client-ts** - TypeScript con tipado fuerte
4. **client-mvc** - ASP.NET Core MVC
5. **client-vue** - Vue 3 + Pinia + Tailwind
6. **client-razor** - Razor Pages
7. **client-blazor** - Blazor Server
8. **client-wasm** - Blazor WebAssembly (si se implementó)

## 🔐 Sistema de Autenticación y Autorización

### JWT Implementation
- **Token Storage**: Varía por cliente (localStorage, sessionStorage, session)
- **Token Expiration**: Manejo automático con buffer de 5 minutos
- **Roles**: Administrador, Moderador, Usuario
- **Endpoints Protegidos**: Basados en roles y permisos

### Flujo de Autenticación:
1. **Login**: POST `/api/auth/login` → Retorna token JWT
2. **Register**: POST `/api/auth/register` → Auto-login tras registro
3. **Profile**: GET `/api/auth/profile` → Datos del usuario actual
4. **Change Password**: POST `/api/auth/change-password`
5. **Email Validation**: GET `/api/auth/check-email`
6. **Token Validation**: GET `/api/auth/verify-token`

### Características de Seguridad:
- ✅ BCrypt para hash de contraseñas
- ✅ Token expiration automático
- ✅ Role-based authorization
- ✅ Email uniqueness validation
- ✅ Password strength validation
- ✅ Protected routes/endpoints

## 📊 Modelo de Datos

### Entidades Principales:
```csharp
User (Usuarios del sistema)
├── Id, FirstName, LastName, Email, Phone, Address
├── Roles (Many-to-Many con Role)
└── IsActive (soft delete)

Municipality (Municipios)
├── Id, Name, Code, Description
├── Sectors (One-to-Many)
└── IsActive

Sector (Sectores de municipios)
├── Id, Name, Code, Description
├── MunicipalityId (FK)
└── IsActive

Complaint (Denuncias - estructura preparada)
├── Id, Title, Description, Status
├── UserId (FK), SectorId (FK)
├── Attachments, Comments, Votes
└── CreatedAt, UpdatedAt

ComplaintType, Status, Role (Entidades de catálogo)
```

### Relaciones:
- **User** ↔ **Role**: Many-to-Many
- **Municipality** → **Sector**: One-to-Many
- **User** → **Complaint**: One-to-Many
- **Sector** → **Complaint**: One-to-Many

## 🛠️ Patrones y Prácticas Implementadas

### Backend Patterns:
- **Repository Pattern**: Abstracción de acceso a datos
- **Unit of Work**: Gestión transaccional
- **Dependency Injection**: IoC nativo de .NET
- **AutoMapper**: Mapeo entre DTOs y entidades
- **Serilog**: Logging estructurado
- **Polly**: Resilience patterns para HTTP clients

### Frontend Patterns:
- **Service Layer**: Abstracción de API calls
- **State Management**: Varía por tecnología (Pinia, Session, etc.)
- **Component Architecture**: Reutilización y modularidad
- **Error Handling**: Toast notifications y user feedback
- **Loading States**: UX mejorada con spinners y disable states

### Security Best Practices:
- **Input Validation**: Client-side y server-side
- **SQL Injection Prevention**: Entity Framework parameterized queries
- **XSS Prevention**: Output encoding automático
- **CSRF Protection**: AntiForgery tokens donde aplica
- **Password Security**: BCrypt + minimum strength requirements

## 🚀 Mejoras y Evoluciones Implementadas

### Fase 1: Estructura Base
- Implementación de Clean Architecture
- Setup de Entity Framework con migraciones
- Creación de entidades básicas (Municipality, Sector)
- Controllers básicos con CRUD operations

### Fase 2: Múltiples Clientes Frontend
- **client-js**: Implementación vanilla con fetch API
- **client-mvc**: Server-side rendering completo
- **client-vue**: SPA moderno con Vue 3 + Composition API
- **client-ts**: Tipado fuerte y interfaces TypeScript
- **client-razor**: Razor Pages con server-side logic
- **client-blazor**: Interactive server components

### Fase 3: Sistema de Autenticación JWT (MAYOR ACTUALIZACIÓN)
- ✅ **API**: JWT token generation, validation, role-based auth
- ✅ **Backend**: AuthController, password hashing, user management
- ✅ **client-js**: Basic auth service con localStorage
- ✅ **client-js-advance**: Professional auth con event emitters
- ✅ **client-ts**: Fully typed auth service con generics
- ✅ **client-mvc**: Session-based auth con server-side validation
- ✅ **client-vue**: Pinia store + Vue Router guards
- ✅ **client-razor**: Session-based con Razor Pages
- ✅ **client-blazor**: Blazored.LocalStorage + AuthGuard component

### Características Auth por Cliente:
| Cliente | Token Storage | State Management | Navigation Guards | UI Framework |
|---------|---------------|------------------|-------------------|--------------|
| client-js | localStorage | Manual events | Manual checks | Vanilla CSS |
| client-js-advance | localStorage | Event emitters | Interceptors | Bootstrap |
| client-ts | localStorage | TypeScript interfaces | Type-safe guards | Tailwind |
| client-mvc | Session | Server-side | Authorize attributes | Bootstrap |
| client-vue | localStorage | Pinia store | Vue Router | Tailwind |
| client-razor | Session | Server-side | Page models | Bootstrap |
| client-blazor | localStorage | Blazor state | AuthGuard component | Bootstrap |

## 🔧 Configuración y Setup

### Prerrequisitos:
- .NET 8.0 SDK
- SQL Server (LocalDB o instancia completa)
- Node.js 18+ (para clientes SPA)
- Visual Studio 2022 o VS Code

### Variables de Entorno Importantes:
```json
// API appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DenounceBeasts;..."
  },
  "JwtSettings": {
    "SecretKey": "DenounceBeasts2025SuperSecretKeyForJWT!@#$%^&*()_+",
    "Issuer": "DenounceBeasts",
    "Audience": "DenounceBeasts-Users"
  },
  "ApiSettings": {
    "BaseUrl": "https://localhost:7156/"
  }
}
```

### Comandos de Desarrollo:
```bash
# API
cd DenounceBeasts.API
dotnet run

# Migraciones (si es necesario)
dotnet ef database update

# Clientes .NET
cd client-mvc && dotnet run
cd client-razor && dotnet run  
cd client-blazor && dotnet run

# Clientes Node.js
cd client-vue && npm run dev
```

## 📝 Flujo de Trabajo de Desarrollo

### Estructura de Trabajo:
1. **API-First**: Siempre se desarrolla el endpoint en la API primero
2. **DTO Consistency**: Los DTOs se mantienen consistentes entre capas
3. **Client Parity**: Todas las funcionalidades se implementan en todos los clientes
4. **Testing Flow**: Se prueba en client-js básico primero, luego se replica

### Orden de Implementación de Features:
1. **Domain Entity** (si es nueva)
2. **Repository & UoW** (si aplica)  
3. **Service Layer** (Application)
4. **API Controller** + DTOs
5. **client-js** (implementación base)
6. **client-mvc** (server-side)
7. **client-vue** (SPA moderno)
8. **client-ts** (tipado fuerte)
9. **client-razor** (Razor Pages)
10. **client-blazor** (componentes interactivos)

### Prácticas de Código:
- **Error Handling**: Siempre usar try-catch y logging
- **User Feedback**: Toast notifications para acciones importantes
- **Loading States**: Spinner/disable durante API calls
- **Validation**: Client-side + server-side validation
- **Security**: Nunca exponer secrets en frontend
- **Responsive**: Todos los clientes son mobile-friendly

## 🔍 Debugging y Troubleshooting

### Problemas Comunes:

#### CORS Issues:
```csharp
// Program.cs - API
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

#### JWT Token Issues:
- Verificar que el token esté en formato Bearer
- Confirmar que el SecretKey sea igual en todos los ambientes
- Revisar que el token no haya expirado

#### Database Issues:
- Ejecutar `dotnet ef database update`
- Verificar connection string
- Revisar que SQL Server esté corriendo

#### Client-specific Issues:
- **Vue/TS**: Verificar que las dependencias estén instaladas
- **MVC/Razor**: Confirmar que session esté habilitada
- **Blazor**: Verificar que los servicios estén registrados

### Logs Importantes:
- **API**: `logs/log-[fecha].txt` (Serilog)
- **Browser**: Console para clientes SPA
- **Network**: DevTools para ver requests/responses

## 🎯 Funcionalidades Implementadas

### Core Features:
- ✅ **CRUD Municipios**: Create, Read, Update, Delete
- ✅ **CRUD Sectores**: Con relación a municipios
- ✅ **User Management**: Registration, profile, roles
- ✅ **Authentication**: JWT completo en todos los clientes
- ✅ **Authorization**: Role-based access control

### UI/UX Features:
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Toast Notifications**: User feedback consistente
- ✅ **Loading States**: Spinners y disabled states
- ✅ **Form Validation**: Real-time validation
- ✅ **Password Visibility**: Toggle para campos password
- ✅ **Search & Filters**: En listados de datos
- ✅ **Confirmation Modals**: Para acciones destructivas

### Technical Features:
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Logging**: Structured logging con Serilog
- ✅ **Retry Policies**: Polly para resilience
- ✅ **Auto-refresh**: Token management automático
- ✅ **State Persistence**: Según tecnología del cliente

## 🚀 Próximas Mejoras Sugeridas

### Backend:
- [ ] **Complaint System**: Implementar CRUD completo de denuncias
- [ ] **File Upload**: Para attachments de denuncias
- [ ] **Email Service**: Notifications y confirmaciones
- [ ] **Admin Dashboard**: Métricas y reportes
- [ ] **API Versioning**: Para evolución de endpoints

### Frontend:
- [ ] **client-wasm**: Implementar Blazor WebAssembly
- [ ] **Mobile App**: React Native o Flutter
- [ ] **PWA Features**: Offline capabilities
- [ ] **Real-time**: SignalR para notifications
- [ ] **Advanced UI**: Charts, dashboards, maps

### DevOps:
- [ ] **Docker**: Containerización completa
- [ ] **CI/CD**: GitHub Actions o Azure DevOps  
- [ ] **Testing**: Unit tests y integration tests
- [ ] **Monitoring**: Application Insights
- [ ] **Security**: Penetration testing

## 💡 Notas para IAs Futuras

### Context Loading:
Si eres una IA trabajando en este proyecto:
1. **Lee este documento completo** para entender el contexto
2. **Revisa la estructura de carpetas** para ubicarte
3. **Verifica el último commit** para ver el estado actual
4. **Identifica qué cliente necesitas** según la tecnología requerida
5. **Sigue los patrones establecidos** en implementaciones existentes

### Approach Patterns:
- **Para nuevas features**: Implementar primero en API, luego en client-js, después replicar
- **Para bugs**: Identificar si es frontend, backend, o ambos
- **Para mejoras**: Mantener consistencia entre todos los clientes
- **Para refactoring**: Hacer cambios incrementales, probar cada cliente

### Key Files to Check:
- `DenounceBeasts.API/Program.cs` - Configuración principal
- `*/appsettings.json` - Variables de configuración
- `*/Services/AuthService.*` - Lógica de autenticación
- `*/Controllers/*Controller.cs` - Endpoints disponibles
- `DOCUMENTATION.md` - Este documento (siempre actualizar)

---

## 📞 Información del Proyecto

- **Curso**: ITLA 2025 C2 Saturdays
- **Arquitectura**: Clean Architecture + Multi-client Frontend
- **Estado**: JWT Authentication completamente implementado
- **Última Actualización**: Enero 2025
- **Generated with**: 🤖 Claude Code

---

*Este documento debe ser actualizado cada vez que se implementen nuevas funcionalidades o cambios arquitectónicos importantes.*