# Guía de Actualización de Clientes Frontend

Esta guía detalla todas las mejoras implementadas en `client-js` que deben replicarse en los demás clientes frontend para mantener consistencia en funcionalidad y seguridad.

## 🔐 Sistema de Autorización Basado en Roles

### Funciones de Verificación de Roles

Cada cliente debe implementar estas funciones para verificar permisos:

```javascript
// JavaScript/TypeScript
function hasRole(role) {
    return currentUser && currentUser.roles && currentUser.roles.includes(role);
}

function isAdmin() { return hasRole('Admin'); }
function isStaff() { return hasRole('Staff'); }
function isUser() { return hasRole('User'); }
function isAdminOrStaff() { return isAdmin() || isStaff(); }

// Permisos específicos
function canManageMunicipalities() { return isAdmin(); }
function canManageSectors() { return isAdmin(); }
function canManageComplaintTypes() { return isAdmin(); }
function canManageStatus() { return isAdmin(); }
function canViewReports() { return isAdminOrStaff(); }
function canModerateComplaints() { return isAdminOrStaff(); }
```

```csharp
// C# (MVC/Blazor/Razor)
public bool HasRole(string role) => GetCurrentUser()?.Roles?.Contains(role) ?? false;
public bool IsAdmin() => HasRole("Admin");
public bool IsStaff() => HasRole("Staff");
public bool IsUser() => HasRole("User");
public bool IsAdminOrStaff() => IsAdmin() || IsStaff();

public bool CanManageMunicipalities() => IsAdmin();
public bool CanManageSectors() => IsAdmin();
public bool CanManageComplaintTypes() => IsAdmin();
public bool CanManageStatus() => IsAdmin();
public bool CanViewReports() => IsAdminOrStaff();
public bool CanModerateComplaints() => IsAdminOrStaff();
```

```javascript
// Vue.js (Pinia Store) - YA IMPLEMENTADO
const isAdmin = computed(() => userRoles.value.includes('Admin'))
const isStaff = computed(() => userRoles.value.includes('Staff'))
const canManageMunicipalities = computed(() => isAdmin.value)
// etc.
```

## 🎯 Control de UI por Permisos

### Ocultar/Mostrar Elementos

Cada cliente debe implementar lógica para:

1. **Ocultar pestañas/menús** para usuarios sin permisos
2. **Ocultar botones de acción** (Agregar, Editar, Eliminar)
3. **Mostrar roles del usuario** con badges visuales

#### JavaScript/TypeScript:
```javascript
function updateUIPermissions() {
    // Ocultar pestañas según permisos
    const municipalitiesTab = document.getElementById('municipalities-tab');
    if (canManageMunicipalities()) {
        showElement(municipalitiesTab?.parentElement);
    } else {
        hideElement(municipalitiesTab?.parentElement);
    }
    
    // Ocultar botones según permisos
    const addMunicipalityBtn = document.getElementById('addMunicipalityBtn');
    if (canManageMunicipalities()) {
        showElement(addMunicipalityBtn);
    } else {
        hideElement(addMunicipalityBtn);
    }
}
```

#### Vue.js:
```vue
<template>
  <!-- Solo mostrar si tiene permisos -->
  <el-tab-pane v-if="authStore.canManageMunicipalities" label="Municipios">
    <button v-if="authStore.canManageMunicipalities" @click="addMunicipality">
      Agregar Municipio
    </button>
  </el-tab-pane>
</template>
```

#### C# Razor/Blazor:
```razor
@if (AuthService.CanManageMunicipalities())
{
    <button class="btn btn-success" onclick="addMunicipality()">
        Agregar Municipio
    </button>
}
```

#### C# MVC:
```html
@if (Model.CanManageMunicipalities)
{
    <button class="btn btn-success" onclick="addMunicipality()">
        Agregar Municipio
    </button>
}
```

## 📝 Campos de Denuncia Actualizados

### Objeto de Denuncia Completo

Todos los clientes deben enviar este objeto completo al crear/editar denuncias:

```javascript
const complaintData = {
    id: document.getElementById('complaintId').value || 0,
    title: document.getElementById('complaintTitle').value,
    description: document.getElementById('complaintDescription').value,
    detail: document.getElementById('complaintDetail').value || "", // NUEVO CAMPO
    complaintTypeId: parseInt(document.getElementById('complaintTypeId').value),
    municipalityId: parseInt(document.getElementById('complaintMunicipalityId').value),
    sectorId: document.getElementById('complaintSectorId').value ? 
               parseInt(document.getElementById('complaintSectorId').value) : null,
    address: document.getElementById('complaintAddress').value,
    latitude: document.getElementById('complaintLatitude').value ? 
              parseFloat(document.getElementById('complaintLatitude').value) : null,
    longitude: document.getElementById('complaintLongitude').value ? 
               parseFloat(document.getElementById('complaintLongitude').value) : null,
    image: "", // NUEVO CAMPO - por ahora vacío
    statusId: 1, // Estado inicial
    userId: currentUser ? currentUser.id : null // CAMPO REQUERIDO
};
```

### Formulario HTML Actualizado

Agregar el campo `detail` al formulario:

```html
<div class="mb-3">
    <label for="complaintDescription" class="form-label">Descripción *</label>
    <textarea class="form-control" id="complaintDescription" rows="3" required></textarea>
</div>
<!-- NUEVO CAMPO -->
<div class="mb-3">
    <label for="complaintDetail" class="form-label">Detalles adicionales</label>
    <textarea class="form-control" id="complaintDetail" rows="3" 
              placeholder="Información adicional sobre la denuncia (opcional)"></textarea>
</div>
```

### Validaciones Mejoradas

```javascript
// Validar usuario autenticado antes de crear denuncia
if (!currentUser || !currentUser.id) {
    showError('Debe estar autenticado para crear una denuncia');
    return;
}

// Validar campos requeridos
if (!data.title || !data.description || !data.complaintTypeId || !data.municipalityId) {
    showError('Por favor complete todos los campos requeridos');
    return;
}
```

## 🛡️ Funciones de Seguridad

### Wrapper Functions para Acciones

```javascript
function checkPermission(permissionFunction, actionName, callback) {
    if (permissionFunction()) {
        callback();
    } else {
        showError(`No tienes permisos para ${actionName}. Solo usuarios con rol de administrador pueden realizar esta acción.`);
    }
}

// Wrappers de seguridad
function secureEditMunicipality(id) {
    checkPermission(canManageMunicipalities, 'editar municipios', () => editMunicipality(id));
}

function secureDeleteMunicipality(id) {
    checkPermission(canManageMunicipalities, 'eliminar municipios', () => confirmDeleteMunicipality(id));
}
```

## 📋 Visualización de Roles

### Mostrar Roles del Usuario

```javascript
// JavaScript - En la información del usuario
const rolesBadges = currentUser.roles.map(role => 
    `<span class="badge bg-primary me-1">${role}</span>`
).join('');

userInfo.innerHTML = `
    <div class="user-welcome">
        <span>Bienvenido, ${currentUser.firstName} ${currentUser.lastName}</span>
        <div class="user-roles mt-1">${rolesBadges}</div>
        <button onclick="logout()" class="btn btn-secondary btn-sm mt-2">Cerrar Sesión</button>
    </div>
`;
```

```vue
<!-- Vue.js -->
<template>
  <div class="user-welcome">
    <span>Bienvenido, {{ authStore.user.firstName }} {{ authStore.user.lastName }}</span>
    <div class="user-roles mt-1">
      <span v-for="role in authStore.userRoles" :key="role" class="badge bg-primary me-1">
        {{ role }}
      </span>
    </div>
  </div>
</template>
```

```razor
@* Blazor/Razor *@
<div class="user-welcome">
    <span>Bienvenido, @CurrentUser.FirstName @CurrentUser.LastName</span>
    <div class="user-roles mt-1">
        @foreach (var role in CurrentUser.Roles)
        {
            <span class="badge bg-primary me-1">@role</span>
        }
    </div>
</div>
```

## 🔄 Actualización Automática de Permisos

### Llamar después de renderizado

```javascript
// JavaScript - Después de renderizar tablas
function renderMunicipalities() {
    // ... código de renderizado ...
    
    // IMPORTANTE: Actualizar permisos después de renderizar
    updateEditDeleteButtons();
}

function updateEditDeleteButtons() {
    document.querySelectorAll('[onclick*="editMunicipality"], [onclick*="deleteMunicipality"]')
        .forEach(btn => {
            if (canManageMunicipalities()) {
                showElement(btn);
            } else {
                hideElement(btn);
            }
        });
}
```

## 📁 Estado de Actualización por Cliente

- ✅ **client-js**: COMPLETADO - Implementación base
- ✅ **client-mvc**: COMPLETADO - AuthService actualizado con funciones de autorización
- ✅ **client-vue**: COMPLETADO - Store actualizado con computed properties de permisos
- ⏳ **client-razor**: PENDIENTE - Necesita AuthService similar a MVC
- ⏳ **client-blazor**: PENDIENTE - Necesita funciones de autorización en componentes
- ⏳ **client-ts**: PENDIENTE - Necesita interfaces TypeScript para permisos
- ⏳ **client-js-advance**: PENDIENTE - Necesita arquitectura modular de permisos

## 🚀 Próximos Pasos

1. Implementar estas mejoras en los clientes restantes
2. Probar funcionalidad de autorización en cada cliente
3. Verificar que los campos de denuncia funcionen correctamente
4. Asegurar consistencia visual entre todos los clientes

---

*Este documento debe actualizarse cuando se completen las implementaciones en cada cliente.*