// Base URL de la API
const API_BASE_URL = 'https://localhost:7175';

// Variables globales
let municipalities = [];
let sectors = [];
let complaintTypes = [];
let statuses = [];
let complaints = [];

// Authentication variables
let currentUser = null;
let authToken = null;

// Paginación
let currentPage = {
    complaints: 1,
    municipalities: 1,
    sectors: 1
};

const itemsPerPage = 10;

// Funciones de utilidad
function showLoading() {
    console.log('Cargando datos...');
}

function hideLoading() {
    console.log('Datos cargados');
}

function showError(message) {
    console.error('Error:', message);
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
    });
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: message,
        timer: 2000,
        showConfirmButton: false
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Authentication functions
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
}

function saveAuthData(token, user) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function loadAuthData() {
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        currentUser = JSON.parse(userStr);
    }
}

function clearAuthData() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

function isAuthenticated() {
    return authToken && currentUser;
}

// Authorization functions
function hasRole(role) {
    return currentUser && currentUser.roles && currentUser.roles.includes(role);
}

function isAdmin() {
    return hasRole('Admin');
}

function isStaff() {
    return hasRole('Staff');
}

function isUser() {
    return hasRole('User');
}

function isAdminOrStaff() {
    return isAdmin() || isStaff();
}

function canManageMunicipalities() {
    return isAdmin(); // Solo admins pueden gestionar municipios
}

function canManageSectors() {
    return isAdmin(); // Solo admins pueden gestionar sectores
}

function canManageComplaintTypes() {
    return isAdmin(); // Solo admins pueden gestionar tipos de denuncia
}

function canManageStatus() {
    return isAdmin(); // Solo admins pueden gestionar estados
}

function canViewReports() {
    return isAdminOrStaff(); // Admins y staff pueden ver reportes
}

function canModerateComplaints() {
    return isAdminOrStaff(); // Admins y staff pueden moderar denuncias
}

// Function to check permissions before executing actions
function checkPermission(permissionFunction, actionName, callback) {
    if (permissionFunction()) {
        callback();
    } else {
        showError(`No tienes permisos para ${actionName}. Solo usuarios con rol de administrador pueden realizar esta acción.`);
    }
}

// Security wrapper functions for actions
function secureEditMunicipality(id) {
    checkPermission(canManageMunicipalities, 'editar municipios', () => editMunicipality(id));
}

function secureDeleteMunicipality(id) {
    checkPermission(canManageMunicipalities, 'eliminar municipios', () => confirmDeleteMunicipality(id));
}

function secureEditSector(id) {
    checkPermission(canManageSectors, 'editar sectores', () => editSector(id));
}

function secureDeleteSector(id) {
    checkPermission(canManageSectors, 'eliminar sectores', () => confirmDeleteSector(id));
}

async function login(email, password) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al iniciar sesión');
        }

        const authData = await response.json();
        saveAuthData(authData.token, authData.user);
        
        hideLoading();
        showSuccess('Sesión iniciada correctamente');
        updateUI();
        return true;
    } catch (error) {
        hideLoading();
        showError('Error al iniciar sesión: ' + error.message);
        return false;
    }
}

async function logout() {
    clearAuthData();
    updateUI();
    showSuccess('Sesión cerrada correctamente');
}

function updateUI() {
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const userInfo = document.getElementById('user-info');
    
    if (isAuthenticated()) {
        if (loginSection) loginSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        if (userInfo) {
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
        }
        
        // Update UI based on user permissions
        updateUIPermissions();
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';
        if (userInfo) userInfo.innerHTML = '';
    }
}

function updateUIPermissions() {
    // Control tab visibility based on permissions
    const complaintsTab = document.getElementById('complaints-tab');
    const complaintTypesTab = document.getElementById('complaint-types-tab');
    const municipalitiesTab = document.getElementById('municipalities-tab');
    const sectorsTab = document.getElementById('sectors-tab');
    const statusTab = document.getElementById('status-tab');
    
    // Todos pueden ver denuncias
    showElement(complaintsTab?.parentElement);
    
    // Solo admins pueden gestionar tipos de denuncia, municipios, sectores y estados
    if (canManageComplaintTypes()) {
        showElement(complaintTypesTab?.parentElement);
    } else {
        hideElement(complaintTypesTab?.parentElement);
    }
    
    if (canManageMunicipalities()) {
        showElement(municipalitiesTab?.parentElement);
    } else {
        hideElement(municipalitiesTab?.parentElement);
    }
    
    if (canManageSectors()) {
        showElement(sectorsTab?.parentElement);
    } else {
        hideElement(sectorsTab?.parentElement);
    }
    
    if (canManageStatus()) {
        showElement(statusTab?.parentElement);
    } else {
        hideElement(statusTab?.parentElement);
    }
    
    // Control botones de acción dentro de cada sección
    updateActionButtonsPermissions();
}

function updateActionButtonsPermissions() {
    // Botones para crear/agregar elementos - usar los IDs correctos del HTML
    const addComplaintBtn = document.getElementById('addComplaintBtn');
    const addComplaintTypeBtn = document.getElementById('addComplaintTypeBtn');
    const addMunicipalityBtn = document.getElementById('addMunicipalityBtn');
    const addSectorBtn = document.getElementById('addSectorBtn');
    const addStatusBtn = document.getElementById('addStatusBtn');
    
    // Todos pueden crear denuncias
    if (addComplaintBtn) showElement(addComplaintBtn);
    
    // Solo admins pueden crear tipos de denuncia
    if (addComplaintTypeBtn) {
        if (canManageComplaintTypes()) {
            showElement(addComplaintTypeBtn);
        } else {
            hideElement(addComplaintTypeBtn);
        }
    }
    
    // Solo admins pueden crear municipios
    if (addMunicipalityBtn) {
        if (canManageMunicipalities()) {
            showElement(addMunicipalityBtn);
        } else {
            hideElement(addMunicipalityBtn);
        }
    }
    
    // Solo admins pueden crear sectores
    if (addSectorBtn) {
        if (canManageSectors()) {
            showElement(addSectorBtn);
        } else {
            hideElement(addSectorBtn);
        }
    }
    
    // Solo admins pueden crear estados
    if (addStatusBtn) {
        if (canManageStatus()) {
            showElement(addStatusBtn);
        } else {
            hideElement(addStatusBtn);
        }
    }
    
    // Ocultar botones de editar/eliminar según permisos
    updateEditDeleteButtons();
}

function updateEditDeleteButtons() {
    // Ocultar botones de editar/eliminar municipios para usuarios sin permisos
    document.querySelectorAll('[onclick*="editMunicipality"], [onclick*="deleteMunicipality"]').forEach(btn => {
        if (canManageMunicipalities()) {
            showElement(btn);
        } else {
            hideElement(btn);
        }
    });
    
    // Ocultar botones de editar/eliminar sectores para usuarios sin permisos
    document.querySelectorAll('[onclick*="editSector"], [onclick*="deleteSector"]').forEach(btn => {
        if (canManageSectors()) {
            showElement(btn);
        } else {
            hideElement(btn);
        }
    });
}

function showElement(element) {
    if (element) {
        element.style.display = '';
        element.style.visibility = 'visible';
    }
}

function hideElement(element) {
    if (element) {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
    }
}

// Funciones de API - Municipalities
async function fetchMunicipalities() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/municipalities`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener municipios');
        }
        
        municipalities = await response.json();
        hideLoading();
        return municipalities;
    } catch (error) {
        hideLoading();
        showError('No se pudieron cargar los municipios: ' + error.message);
        return [];
    }
}

async function createMunicipality(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/municipalities`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear municipio');
        }
        
        hideLoading();
        showSuccess('Municipio creado exitosamente');
        await loadMunicipalities();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo crear el municipio: ' + error.message);
        return false;
    }
}

async function updateMunicipality(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/municipalities/${data.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar municipio');
        }
        
        hideLoading();
        showSuccess('Municipio actualizado exitosamente');
        await loadMunicipalities();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo actualizar el municipio: ' + error.message);
        return false;
    }
}

async function deleteMunicipality(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/municipalities/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar municipio');
        }
        
        hideLoading();
        showSuccess('Municipio eliminado exitosamente');
        await loadMunicipalities();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo eliminar el municipio: ' + error.message);
        return false;
    }
}

// Funciones de API - Sectors
async function fetchSectors() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/sectors`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener sectores');
        }
        
        sectors = await response.json();
        hideLoading();
        return sectors;
    } catch (error) {
        hideLoading();
        showError('No se pudieron cargar los sectores: ' + error.message);
        return [];
    }
}

async function createSector(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/sectors`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear sector');
        }
        
        hideLoading();
        showSuccess('Sector creado exitosamente');
        await loadSectors();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo crear el sector: ' + error.message);
        return false;
    }
}

async function updateSector(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/sectors/${data.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar sector');
        }
        
        hideLoading();
        showSuccess('Sector actualizado exitosamente');
        await loadSectors();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo actualizar el sector: ' + error.message);
        return false;
    }
}

async function deleteSector(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/sectors/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar sector');
        }
        
        hideLoading();
        showSuccess('Sector eliminado exitosamente');
        await loadSectors();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo eliminar el sector: ' + error.message);
        return false;
    }
}

// Funciones de API - Complaint Types
async function fetchComplaintTypes() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complainttypes`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener tipos de denuncia');
        }
        
        complaintTypes = await response.json();
        hideLoading();
        return complaintTypes;
    } catch (error) {
        hideLoading();
        showError('No se pudieron cargar los tipos de denuncia: ' + error.message);
        return [];
    }
}

async function createComplaintType(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complainttypes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear tipo de denuncia');
        }
        
        hideLoading();
        showSuccess('Tipo de denuncia creado exitosamente');
        await loadComplaintTypes();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo crear el tipo de denuncia: ' + error.message);
        return false;
    }
}

async function updateComplaintType(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complainttypes/${data.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar tipo de denuncia');
        }
        
        hideLoading();
        showSuccess('Tipo de denuncia actualizado exitosamente');
        await loadComplaintTypes();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo actualizar el tipo de denuncia: ' + error.message);
        return false;
    }
}

async function deleteComplaintType(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complainttypes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar tipo de denuncia');
        }
        
        hideLoading();
        showSuccess('Tipo de denuncia eliminado exitosamente');
        await loadComplaintTypes();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo eliminar el tipo de denuncia: ' + error.message);
        return false;
    }
}

// Funciones de API - Status
async function fetchStatuses() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/status`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener estados');
        }
        
        statuses = await response.json();
        hideLoading();
        return statuses;
    } catch (error) {
        hideLoading();
        showError('No se pudieron cargar los estados: ' + error.message);
        return [];
    }
}

async function createStatus(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/status`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear estado');
        }
        
        hideLoading();
        showSuccess('Estado creado exitosamente');
        await loadStatuses();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo crear el estado: ' + error.message);
        return false;
    }
}

async function updateStatus(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/status/${data.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar estado');
        }
        
        hideLoading();
        showSuccess('Estado actualizado exitosamente');
        await loadStatuses();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo actualizar el estado: ' + error.message);
        return false;
    }
}

async function deleteStatus(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/status/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar estado');
        }
        
        hideLoading();
        showSuccess('Estado eliminado exitosamente');
        await loadStatuses();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo eliminar el estado: ' + error.message);
        return false;
    }
}

// Funciones de API - Complaints
async function fetchComplaints() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complaints`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener denuncias');
        }
        
        complaints = await response.json();
        hideLoading();
        return complaints;
    } catch (error) {
        hideLoading();
        showError('No se pudieron cargar las denuncias: ' + error.message);
        return [];
    }
}

async function createComplaint(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complaints`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear denuncia');
        }
        
        hideLoading();
        showSuccess('Denuncia creada exitosamente');
        await loadComplaints();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo crear la denuncia: ' + error.message);
        return false;
    }
}

async function updateComplaint(data) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complaints/${data.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar denuncia');
        }
        
        hideLoading();
        showSuccess('Denuncia actualizada exitosamente');
        await loadComplaints();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo actualizar la denuncia: ' + error.message);
        return false;
    }
}

async function deleteComplaint(id) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/complaints/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar denuncia');
        }
        
        hideLoading();
        showSuccess('Denuncia eliminada exitosamente');
        await loadComplaints();
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo eliminar la denuncia: ' + error.message);
        return false;
    }
}

// Funciones de renderizado
function renderMunicipalities() {
    const tbody = document.getElementById('municipalitiesTableBody');
    const searchInput = document.getElementById('municipalitySearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('municipalityStatusFilter').value;
    
    let filtered = municipalities.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(searchInput) || 
                          m.code.toLowerCase().includes(searchInput);
        const matchStatus = statusFilter === '' || m.isActive.toString() === statusFilter;
        return matchSearch && matchStatus;
    });
    
    const start = (currentPage.municipalities - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filtered.slice(start, end);
    
    tbody.innerHTML = paginated.map(municipality => `
        <tr>
            <td>${municipality.id}</td>
            <td>${municipality.name}</td>
            <td>${municipality.code}</td>
            <td>
                <span class="badge ${municipality.isActive ? 'bg-success' : 'bg-danger'}">
                    ${municipality.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editMunicipality(${municipality.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmDeleteMunicipality(${municipality.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('municipalityPagination', filtered.length, currentPage.municipalities, 'municipalities');
    
    // Update button permissions after rendering
    updateEditDeleteButtons();
}

function renderSectors() {
    const tbody = document.getElementById('sectorsTableBody');
    const searchInput = document.getElementById('sectorSearchInput').value.toLowerCase();
    const municipalityFilter = document.getElementById('sectorMunicipalityFilter').value;
    const statusFilter = document.getElementById('sectorStatusFilter').value;
    
    let filtered = sectors.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchInput) || 
                          s.code.toLowerCase().includes(searchInput);
        const matchMunicipality = municipalityFilter === '' || s.municipalityId == municipalityFilter;
        const matchStatus = statusFilter === '' || s.isActive.toString() === statusFilter;
        return matchSearch && matchMunicipality && matchStatus;
    });
    
    const start = (currentPage.sectors - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filtered.slice(start, end);
    
    tbody.innerHTML = paginated.map(sector => {
        const municipality = municipalities.find(m => m.id === sector.municipalityId);
        return `
            <tr>
                <td>${sector.id}</td>
                <td>${sector.name}</td>
                <td>${sector.code}</td>
                <td>${municipality ? municipality.name : 'N/A'}</td>
                <td>
                    <span class="badge ${sector.isActive ? 'bg-success' : 'bg-danger'}">
                        ${sector.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editSector(${sector.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="confirmDeleteSector(${sector.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    renderPagination('sectorPagination', filtered.length, currentPage.sectors, 'sectors');
    
    // Update button permissions after rendering
    updateEditDeleteButtons();
}

function renderComplaintTypes() {
    const tbody = document.getElementById('complaintTypesTableBody');
    
    tbody.innerHTML = complaintTypes.map(type => `
        <tr>
            <td>${type.id}</td>
            <td>${type.name}</td>
            <td>${type.description || 'N/A'}</td>
            <td>
                <span class="badge ${type.isActive ? 'bg-success' : 'bg-danger'}">
                    ${type.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editComplaintType(${type.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmDeleteComplaintType(${type.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderStatuses() {
    const tbody = document.getElementById('statusTableBody');
    
    tbody.innerHTML = statuses.map(status => `
        <tr>
            <td>${status.id}</td>
            <td>${status.name}</td>
            <td>${status.description || 'N/A'}</td>
            <td>
                <span class="badge" style="background-color: ${status.color || '#007bff'}">
                    ${status.color || '#007bff'}
                </span>
            </td>
            <td>
                <span class="badge ${status.isActive ? 'bg-success' : 'bg-danger'}">
                    ${status.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editStatus(${status.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action" onclick="confirmDeleteStatus(${status.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderComplaints() {
    const grid = document.getElementById('complaintsGrid');
    const searchInput = document.getElementById('complaintSearchInput').value.toLowerCase();
    const typeFilter = document.getElementById('complaintTypeFilter').value;
    const statusFilter = document.getElementById('complaintStatusFilter').value;
    const municipalityFilter = document.getElementById('complaintMunicipalityFilter').value;
    
    let filtered = complaints.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(searchInput) || 
                          c.description.toLowerCase().includes(searchInput);
        const matchType = typeFilter === '' || c.complaintTypeId == typeFilter;
        const matchStatus = statusFilter === '' || c.statusId == statusFilter;
        const matchMunicipality = municipalityFilter === '' || c.municipalityId == municipalityFilter;
        return matchSearch && matchType && matchStatus && matchMunicipality;
    });
    
    const start = (currentPage.complaints - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filtered.slice(start, end);
    
    grid.innerHTML = paginated.map(complaint => {
        const complaintType = complaintTypes.find(t => t.id === complaint.complaintTypeId);
        const municipality = municipalities.find(m => m.id === complaint.municipalityId);
        const sector = sectors.find(s => s.id === complaint.sectorId);
        const status = statuses.find(s => s.id === complaint.statusId);
        
        return `
            <div class="col-md-6 mb-3">
                <div class="card complaint-card ${getPriorityClass(complaint.priority)}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${complaint.title}</h6>
                            <span class="badge status-badge" style="background-color: ${status?.color || '#007bff'}">
                                ${status?.name || 'Pendiente'}
                            </span>
                        </div>
                        <p class="card-text small text-muted mb-2">
                            <i class="bi bi-tags"></i> ${complaintType?.name || 'N/A'} | 
                            <i class="bi bi-geo-alt"></i> ${municipality?.name || 'N/A'} - ${sector?.name || 'N/A'}
                        </p>
                        <p class="card-text">${complaint.description.substring(0, 150)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="bi bi-calendar"></i> ${formatDate(complaint.createdAt)}
                            </small>
                            <div>
                                <button class="btn btn-sm btn-primary btn-action" onclick="editComplaint(${complaint.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger btn-action" onclick="confirmDeleteComplaint(${complaint.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination('complaintPagination', filtered.length, currentPage.complaints, 'complaints');
}

function getPriorityClass(priority) {
    switch(priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return '';
    }
}

function renderPagination(elementId, totalItems, currentPageNum, type) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById(elementId);
    
    let html = '';
    
    if (currentPageNum > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage('${type}', ${currentPageNum - 1})">Anterior</a>
        </li>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPageNum - 2 && i <= currentPageNum + 2)) {
            html += `<li class="page-item ${i === currentPageNum ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage('${type}', ${i})">${i}</a>
            </li>`;
        } else if (i === currentPageNum - 3 || i === currentPageNum + 3) {
            html += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }
    }
    
    if (currentPageNum < totalPages) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage('${type}', ${currentPageNum + 1})">Siguiente</a>
        </li>`;
    }
    
    pagination.innerHTML = html;
}

function changePage(type, page) {
    currentPage[type] = page;
    switch(type) {
        case 'municipalities':
            renderMunicipalities();
            break;
        case 'sectors':
            renderSectors();
            break;
        case 'complaints':
            renderComplaints();
            break;
    }
}

// Funciones de edición
function editMunicipality(id) {
    const municipality = municipalities.find(m => m.id === id);
    if (!municipality) return;
    
    document.getElementById('municipalityId').value = municipality.id;
    document.getElementById('municipalityName').value = municipality.name;
    document.getElementById('municipalityCode').value = municipality.code;
    document.getElementById('municipalityIsActive').checked = municipality.isActive;
    
    document.getElementById('municipalityModalTitle').innerHTML = '<i class="bi bi-geo-alt"></i> Editar Municipio';
    
    const modal = new bootstrap.Modal(document.getElementById('municipalityModal'));
    modal.show();
}

function editSector(id) {
    const sector = sectors.find(s => s.id === id);
    if (!sector) return;
    
    document.getElementById('sectorId').value = sector.id;
    document.getElementById('sectorName').value = sector.name;
    document.getElementById('sectorCode').value = sector.code;
    document.getElementById('sectorMunicipalityId').value = sector.municipalityId;
    document.getElementById('sectorIsActive').checked = sector.isActive;
    
    document.getElementById('sectorModalTitle').innerHTML = '<i class="bi bi-map"></i> Editar Sector';
    
    const modal = new bootstrap.Modal(document.getElementById('sectorModal'));
    modal.show();
}

function editComplaintType(id) {
    const type = complaintTypes.find(t => t.id === id);
    if (!type) return;
    
    document.getElementById('complaintTypeId').value = type.id;
    document.getElementById('complaintTypeName').value = type.name;
    document.getElementById('complaintTypeDescription').value = type.description || '';
    document.getElementById('complaintTypeIsActive').checked = type.isActive;
    
    document.getElementById('complaintTypeModalTitle').innerHTML = '<i class="bi bi-tags"></i> Editar Tipo de Denuncia';
    
    const modal = new bootstrap.Modal(document.getElementById('complaintTypeModal'));
    modal.show();
}

function editStatus(id) {
    const status = statuses.find(s => s.id === id);
    if (!status) return;
    
    document.getElementById('statusId').value = status.id;
    document.getElementById('statusName').value = status.name;
    document.getElementById('statusDescription').value = status.description || '';
    document.getElementById('statusColor').value = status.color || '#007bff';
    document.getElementById('statusIsActive').checked = status.isActive;
    
    document.getElementById('statusModalTitle').innerHTML = '<i class="bi bi-flag"></i> Editar Estado';
    
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
}

function editComplaint(id) {
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return;
    
    document.getElementById('complaintId').value = complaint.id;
    document.getElementById('complaintTitle').value = complaint.title;
    document.getElementById('complaintDescription').value = complaint.description;
    document.getElementById('complaintDetail').value = complaint.detail || '';
    document.getElementById('complaintTypeId').value = complaint.complaintTypeId;
    document.getElementById('complaintMunicipalityId').value = complaint.municipalityId;
    
    // Cargar sectores del municipio seleccionado
    updateSectorOptions(complaint.municipalityId);
    setTimeout(() => {
        document.getElementById('complaintSectorId').value = complaint.sectorId || '';
    }, 100);
    
    document.getElementById('complaintAddress').value = complaint.address || '';
    document.getElementById('complaintLatitude').value = complaint.latitude || '';
    document.getElementById('complaintLongitude').value = complaint.longitude || '';
    
    document.getElementById('complaintModalTitle').innerHTML = '<i class="bi bi-exclamation-triangle"></i> Editar Denuncia';
    
    const modal = new bootstrap.Modal(document.getElementById('complaintModal'));
    modal.show();
}

// Funciones de confirmación de eliminación
function confirmDeleteMunicipality(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteMunicipality(id);
        }
    });
}

function confirmDeleteSector(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteSector(id);
        }
    });
}

function confirmDeleteComplaintType(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteComplaintType(id);
        }
    });
}

function confirmDeleteStatus(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteStatus(id);
        }
    });
}

function confirmDeleteComplaint(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteComplaint(id);
        }
    });
}

// Funciones de carga de datos
async function loadMunicipalities() {
    await fetchMunicipalities();
    renderMunicipalities();
    updateMunicipalitySelects();
}

async function loadSectors() {
    await fetchSectors();
    renderSectors();
    updateSectorFilters();
}

async function loadComplaintTypes() {
    await fetchComplaintTypes();
    renderComplaintTypes();
    updateComplaintTypeSelects();
}

async function loadStatuses() {
    await fetchStatuses();
    renderStatuses();
    updateStatusSelects();
}

async function loadComplaints() {
    await fetchComplaints();
    renderComplaints();
}

// Funciones de actualización de selects
function updateMunicipalitySelects() {
    const selects = ['sectorMunicipalityId', 'sectorMunicipalityFilter', 'complaintMunicipalityId', 'complaintMunicipalityFilter'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const currentValue = select.value;
        const defaultOption = select.querySelector('option[value=""]');
        
        select.innerHTML = defaultOption ? defaultOption.outerHTML : '<option value="">Seleccione...</option>';
        
        municipalities
            .filter(m => m.isActive)
            .forEach(municipality => {
                const option = document.createElement('option');
                option.value = municipality.id;
                option.textContent = municipality.name;
                select.appendChild(option);
            });
        
        select.value = currentValue;
    });
}

function updateSectorFilters() {
    updateSectorOptions();
}

function updateSectorOptions(municipalityId = null) {
    const select = document.getElementById('complaintSectorId');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione un sector</option>';
    
    const filteredSectors = municipalityId 
        ? sectors.filter(s => s.municipalityId == municipalityId && s.isActive)
        : sectors.filter(s => s.isActive);
    
    filteredSectors.forEach(sector => {
        const option = document.createElement('option');
        option.value = sector.id;
        option.textContent = sector.name;
        select.appendChild(option);
    });
}

function updateComplaintTypeSelects() {
    const selects = ['complaintTypeId', 'complaintTypeFilter'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const currentValue = select.value;
        const defaultOption = select.querySelector('option[value=""]');
        
        select.innerHTML = defaultOption ? defaultOption.outerHTML : '<option value="">Seleccione...</option>';
        
        complaintTypes
            .filter(t => t.isActive)
            .forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                select.appendChild(option);
            });
        
        select.value = currentValue;
    });
}

function updateStatusSelects() {
    const selects = ['complaintStatusFilter'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const currentValue = select.value;
        const defaultOption = select.querySelector('option[value=""]');
        
        select.innerHTML = defaultOption ? defaultOption.outerHTML : '<option value="">Seleccione...</option>';
        
        statuses
            .filter(s => s.isActive)
            .forEach(status => {
                const option = document.createElement('option');
                option.value = status.id;
                option.textContent = status.name;
                select.appendChild(option);
            });
        
        select.value = currentValue;
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar fecha actual
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Cargar datos iniciales
    await Promise.all([
        loadMunicipalities(),
        loadSectors(),
        loadComplaintTypes(),
        loadStatuses(),
        loadComplaints()
    ]);
    
    // Municipality Events
    document.getElementById('addMunicipalityBtn').addEventListener('click', function() {
        document.getElementById('municipalityForm').reset();
        document.getElementById('municipalityId').value = '';
        document.getElementById('municipalityModalTitle').innerHTML = '<i class="bi bi-geo-alt"></i> Agregar Municipio';
        const modal = new bootstrap.Modal(document.getElementById('municipalityModal'));
        modal.show();
    });
    
    document.getElementById('saveMunicipalityBtn').addEventListener('click', async function() {
        const data = {
            id: document.getElementById('municipalityId').value || 0,
            name: document.getElementById('municipalityName').value,
            code: document.getElementById('municipalityCode').value,
            isActive: document.getElementById('municipalityIsActive').checked
        };
        
        if (!data.name || !data.code) {
            showError('Por favor complete todos los campos requeridos');
            return;
        }
        
        const success = data.id ? await updateMunicipality(data) : await createMunicipality(data);
        
        if (success) {
            bootstrap.Modal.getInstance(document.getElementById('municipalityModal')).hide();
        }
    });
    
    document.getElementById('municipalitySearchInput').addEventListener('input', renderMunicipalities);
    document.getElementById('municipalityStatusFilter').addEventListener('change', renderMunicipalities);
    document.getElementById('clearMunicipalityFilters').addEventListener('click', function() {
        document.getElementById('municipalitySearchInput').value = '';
        document.getElementById('municipalityStatusFilter').value = '';
        renderMunicipalities();
    });
    
    // Sector Events
    document.getElementById('addSectorBtn').addEventListener('click', function() {
        document.getElementById('sectorForm').reset();
        document.getElementById('sectorId').value = '';
        document.getElementById('sectorModalTitle').innerHTML = '<i class="bi bi-map"></i> Agregar Sector';
        const modal = new bootstrap.Modal(document.getElementById('sectorModal'));
        modal.show();
    });
    
    document.getElementById('saveSectorBtn').addEventListener('click', async function() {
        const data = {
            id: document.getElementById('sectorId').value || 0,
            name: document.getElementById('sectorName').value,
            code: document.getElementById('sectorCode').value,
            municipalityId: parseInt(document.getElementById('sectorMunicipalityId').value),
            isActive: document.getElementById('sectorIsActive').checked
        };
        
        if (!data.name || !data.code || !data.municipalityId) {
            showError('Por favor complete todos los campos requeridos');
            return;
        }
        
        const success = data.id ? await updateSector(data) : await createSector(data);
        
        if (success) {
            bootstrap.Modal.getInstance(document.getElementById('sectorModal')).hide();
        }
    });
    
    document.getElementById('sectorSearchInput').addEventListener('input', renderSectors);
    document.getElementById('sectorMunicipalityFilter').addEventListener('change', renderSectors);
    document.getElementById('sectorStatusFilter').addEventListener('change', renderSectors);
    document.getElementById('clearSectorFilters').addEventListener('click', function() {
        document.getElementById('sectorSearchInput').value = '';
        document.getElementById('sectorMunicipalityFilter').value = '';
        document.getElementById('sectorStatusFilter').value = '';
        renderSectors();
    });
    
    // Complaint Type Events
    document.getElementById('addComplaintTypeBtn').addEventListener('click', function() {
        document.getElementById('complaintTypeForm').reset();
        document.getElementById('complaintTypeId').value = '';
        document.getElementById('complaintTypeModalTitle').innerHTML = '<i class="bi bi-tags"></i> Agregar Tipo de Denuncia';
        const modal = new bootstrap.Modal(document.getElementById('complaintTypeModal'));
        modal.show();
    });
    
    document.getElementById('saveComplaintTypeBtn').addEventListener('click', async function() {
        const data = {
            id: document.getElementById('complaintTypeId').value || 0,
            name: document.getElementById('complaintTypeName').value,
            description: document.getElementById('complaintTypeDescription').value,
            isActive: document.getElementById('complaintTypeIsActive').checked
        };
        
        if (!data.name) {
            showError('Por favor complete todos los campos requeridos');
            return;
        }
        
        const success = data.id ? await updateComplaintType(data) : await createComplaintType(data);
        
        if (success) {
            bootstrap.Modal.getInstance(document.getElementById('complaintTypeModal')).hide();
        }
    });
    
    // Status Events
    document.getElementById('addStatusBtn').addEventListener('click', function() {
        document.getElementById('statusForm').reset();
        document.getElementById('statusId').value = '';
        document.getElementById('statusModalTitle').innerHTML = '<i class="bi bi-flag"></i> Agregar Estado';
        const modal = new bootstrap.Modal(document.getElementById('statusModal'));
        modal.show();
    });
    
    document.getElementById('saveStatusBtn').addEventListener('click', async function() {
        const data = {
            id: document.getElementById('statusId').value || 0,
            name: document.getElementById('statusName').value,
            description: document.getElementById('statusDescription').value,
            color: document.getElementById('statusColor').value,
            isActive: document.getElementById('statusIsActive').checked
        };
        
        if (!data.name) {
            showError('Por favor complete todos los campos requeridos');
            return;
        }
        
        const success = data.id ? await updateStatus(data) : await createStatus(data);
        
        if (success) {
            bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
        }
    });
    
    // Complaint Events
    document.getElementById('addComplaintBtn').addEventListener('click', function() {
        document.getElementById('complaintForm').reset();
        document.getElementById('complaintId').value = '';
        document.getElementById('complaintModalTitle').innerHTML = '<i class="bi bi-exclamation-triangle"></i> Nueva Denuncia';
        document.getElementById('imagePreview').innerHTML = '';
        const modal = new bootstrap.Modal(document.getElementById('complaintModal'));
        modal.show();
    });
    
    document.getElementById('saveComplaintBtn').addEventListener('click', async function() {
        const data = {
            id: document.getElementById('complaintId').value || 0,
            title: document.getElementById('complaintTitle').value,
            description: document.getElementById('complaintDescription').value,
            detail: document.getElementById('complaintDetail') ? document.getElementById('complaintDetail').value : "", // Campo opcional
            complaintTypeId: parseInt(document.getElementById('complaintTypeId').value),
            municipalityId: parseInt(document.getElementById('complaintMunicipalityId').value),
            sectorId: document.getElementById('complaintSectorId').value ? parseInt(document.getElementById('complaintSectorId').value) : null,
            address: document.getElementById('complaintAddress').value,
            latitude: document.getElementById('complaintLatitude').value ? parseFloat(document.getElementById('complaintLatitude').value) : null,
            longitude: document.getElementById('complaintLongitude').value ? parseFloat(document.getElementById('complaintLongitude').value) : null,
            image: "", // Por ahora vacío, puede implementarse subida de archivos después
            statusId: 1, // Estado inicial
            userId: currentUser ? currentUser.id : null // ID del usuario autenticado
        };
        
        if (!data.title || !data.description || !data.complaintTypeId || !data.municipalityId) {
            showError('Por favor complete todos los campos requeridos');
            return;
        }
        
        if (!currentUser || !currentUser.id) {
            showError('Debe estar autenticado para crear una denuncia');
            return;
        }
        
        const success = data.id ? await updateComplaint(data) : await createComplaint(data);
        
        if (success) {
            bootstrap.Modal.getInstance(document.getElementById('complaintModal')).hide();
        }
    });
    
    // Actualizar sectores cuando cambie el municipio
    document.getElementById('complaintMunicipalityId').addEventListener('change', function() {
        updateSectorOptions(this.value);
    });
    
    // Filtros de denuncias
    document.getElementById('complaintSearchInput').addEventListener('input', renderComplaints);
    document.getElementById('complaintTypeFilter').addEventListener('change', renderComplaints);
    document.getElementById('complaintStatusFilter').addEventListener('change', renderComplaints);
    document.getElementById('complaintMunicipalityFilter').addEventListener('change', renderComplaints);
    document.getElementById('clearComplaintFilters').addEventListener('click', function() {
        document.getElementById('complaintSearchInput').value = '';
        document.getElementById('complaintTypeFilter').value = '';
        document.getElementById('complaintStatusFilter').value = '';
        document.getElementById('complaintMunicipalityFilter').value = '';
        renderComplaints();
    });
    
    // Preview de imágenes
    document.getElementById('complaintImages').addEventListener('change', function(e) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'image-preview';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        }
    });
});