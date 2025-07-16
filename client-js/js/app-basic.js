
// base url from api
const API_BASE_URL = 'https://localhost:7175';

// global variables
let municipalities = [];  
let districts = [];  
let currentMunicipalityPage = 1;  
let currentDistrictPage = 1;   
let itemsPerPage = 5;   
 
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

 
async function fetchMunicipalities() {
    try {
        showLoading();  
         
        const response = await fetch(`${API_BASE_URL}/api/municipalities`);
         
        if (!response.ok) {
            throw new Error('Error al obtener municipios');
        }
         
        const data = await response.json();
         
        //municipalities = data;
        
        hideLoading();  
        return data;
    } catch (error) {
        hideLoading();
        showError('No se pudieron cargar los municipios: ' + error.message);
        return [];
    }
}
 
async function fetchDistricts() {
    try {
        showLoading();
         
        const response = await fetch(`${API_BASE_URL}/api/districts/with-municipality`);
        
        if (!response.ok) {
            throw new Error('Error al obtener distritos');
        }
        
        const data = await response.json();
        districts = data;
        
        hideLoading();
        return data;
    } catch (error) {
        hideLoading();
        showError('No se pudieron cargar los distritos: ' + error.message);
        return [];
    }
}
 
async function createMunicipality(municipalityData) {
    try {
        showLoading();
         
        const response = await fetch(`${API_BASE_URL}/api/municipalities`, {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify(municipalityData)  
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
 
async function updateMunicipality(municipalityData) {
    try {
        showLoading();
         
        const response = await fetch(`${API_BASE_URL}/api/municipalities`, {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(municipalityData)
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
            method: 'DELETE'  
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
 
async function createDistrict(districtData) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/districts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(districtData)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear distrito');
        }
        
        hideLoading();
        showSuccess('Distrito creado exitosamente');
         
        await loadDistricts();
        
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo crear el distrito: ' + error.message);
        return false;
    }
}
 
async function updateDistrict(districtData) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/districts`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(districtData)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar distrito');
        }
        
        hideLoading();
        showSuccess('Distrito actualizado exitosamente');
        
        await loadDistricts();
        
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo actualizar el distrito: ' + error.message);
        return false;
    }
}
 
async function deleteDistrict(id) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/districts/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar distrito');
        }
        
        hideLoading();
        showSuccess('Distrito eliminado exitosamente');
        
        await loadDistricts();
        
        return true;
    } catch (error) {
        hideLoading();
        showError('No se pudo eliminar el distrito: ' + error.message);
        return false;
    }
}

 
async function loadMunicipalities() { 
    const data = await fetchMunicipalities();
     municipalities = data;  
    const filteredData = filterMunicipalities(data);
     
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentMunicipalityPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
     
    displayMunicipalities(pageData);
     
    updateMunicipalityPagination(totalPages);
}
 
function displayMunicipalities(data) { 
    const tableBody = document.getElementById('municipalitiesTableBody');
     
    tableBody.innerHTML = '';
     
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron municipios</td></tr>';
        return;
    }
     
    data.forEach(municipality => {
        const row = document.createElement('tr');  
         
        row.innerHTML = `
            <td>${municipality.id}</td>
            <td>${municipality.name}</td>
            <td>${municipality.code}</td>
            <td>
                <span class="badge ${municipality.isActive ? 'bg-success' : 'bg-danger'}">
                    ${municipality.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editMunicipality(${municipality.id})">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteMunicipality(${municipality.id})">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
         
        tableBody.appendChild(row);
    });
}
 
async function loadDistricts() {
    const data = await fetchDistricts();
    const filteredData = filterDistricts(data);
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentDistrictPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    displayDistricts(pageData);
    updateDistrictPagination(totalPages);
}

 
function displayDistricts(data) {
    const tableBody = document.getElementById('districtsTableBody');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron distritos</td></tr>';
        return;
    }
    
    data.forEach(district => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${district.id}</td>
            <td>${district.name}</td>
            <td>${district.code}</td>
            <td>${district.municipalityName || 'No asignado'}</td>
            <td>
                <span class="badge ${district.isActive ? 'bg-success' : 'bg-danger'}">
                    ${district.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editDistrict(${district.id})">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteDistrict(${district.id})">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

 
function filterMunicipalities(data) { 
    const searchText = document.getElementById('municipalitySearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('municipalityStatusFilter').value;
     
    return data.filter(municipality => { 
        const matchesSearch = municipality.name.toLowerCase().includes(searchText);
         
        const matchesStatus = statusFilter === '' || municipality.isActive.toString() === statusFilter;
         
        return matchesSearch && matchesStatus;
    });
}
 
function filterDistricts(data) {
    const searchText = document.getElementById('districtSearchInput').value.toLowerCase();
    const municipalityFilter = document.getElementById('districtMunicipalityFilter').value;
    const statusFilter = document.getElementById('districtStatusFilter').value;
    
    return data.filter(district => {
        const matchesSearch = district.name.toLowerCase().includes(searchText);
        const matchesMunicipality = municipalityFilter === '' || district.municipalityId.toString() === municipalityFilter;
        const matchesStatus = statusFilter === '' || district.isActive.toString() === statusFilter;
        
        return matchesSearch && matchesMunicipality && matchesStatus;
    });
}
 
function updateMunicipalityPagination(totalPages) {
    const pagination = document.getElementById('municipalityPagination');
    pagination.innerHTML = '';
     
    if (totalPages <= 1) return;
     
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentMunicipalityPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeMunicipalityPage(${currentMunicipalityPage - 1})">
            Anterior
        </a>
    `;
    pagination.appendChild(prevLi);
     
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentMunicipalityPage ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="changeMunicipalityPage(${i})">${i}</a>
        `;
        pagination.appendChild(li);
    }
     
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentMunicipalityPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeMunicipalityPage(${currentMunicipalityPage + 1})">
            Siguiente
        </a>
    `;
    pagination.appendChild(nextLi);
}
 
function changeMunicipalityPage(page) { 
    const filteredData = filterMunicipalities(municipalities);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
     
    currentMunicipalityPage = page;
    loadMunicipalities();
}
 
function updateDistrictPagination(totalPages) {
    const pagination = document.getElementById('districtPagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
     
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentDistrictPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeDistrictPage(${currentDistrictPage - 1})">
            Anterior
        </a>
    `;
    pagination.appendChild(prevLi);
     
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentDistrictPage ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="changeDistrictPage(${i})">${i}</a>
        `;
        pagination.appendChild(li);
    }
     
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentDistrictPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeDistrictPage(${currentDistrictPage + 1})">
            Siguiente
        </a>
    `;
    pagination.appendChild(nextLi);
}
 
function changeDistrictPage(page) {
    const filteredData = filterDistricts(districts);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentDistrictPage = page;
    loadDistricts();
}
 
function openAddMunicipalityModal() { 
    document.getElementById('municipalityForm').reset();
    document.getElementById('municipalityId').value = '';
     
    document.getElementById('municipalityModalTitle').innerHTML = 
        '<i class="bi bi-geo-alt"></i> Agregar Municipio';
     
    const modal = new bootstrap.Modal(document.getElementById('municipalityModal'));
    modal.show();
}
 
function editMunicipality(id) { 
    const municipality = municipalities.find(m => m.id === id);
    
    if (!municipality) {
        showError('Municipio no encontrado');
        return;
    }
     
    document.getElementById('municipalityId').value = municipality.id;
    document.getElementById('municipalityName').value = municipality.name;
    document.getElementById('municipalityCode').value = municipality.code;
    document.getElementById('municipalityIsActive').checked = municipality.isActive;
     
    document.getElementById('municipalityModalTitle').innerHTML = 
        '<i class="bi bi-geo-alt"></i> Editar Municipio';
     
    const modal = new bootstrap.Modal(document.getElementById('municipalityModal'));
    modal.show();
}
 
async function saveMunicipality() { 
    const id = document.getElementById('municipalityId').value;
    const name = document.getElementById('municipalityName').value.trim();
    const code = document.getElementById('municipalityCode').value.trim();
    const isActive = document.getElementById('municipalityIsActive').checked;
     
    if (!name || !code) {
        showError('Por favor complete todos los campos requeridos');
        return;
    }
     
    const municipalityData = {
        name: name,
        code: code,
        isActive: isActive
    };
     
    let success = false;
    if (id) {
        municipalityData.id = parseInt(id);
        success = await updateMunicipality(municipalityData);
    } else {
        success = await createMunicipality(municipalityData);
    }
     
    if (success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('municipalityModal'));
        modal.hide();
    }
}
 
function confirmDeleteMunicipality(id) { 
    const municipality = municipalities.find(m => m.id === id);
    
    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar el municipio "${municipality ? municipality.name : 'desconocido'}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => { 
        if (result.isConfirmed) {
            deleteMunicipality(id);
        }
    });
}
 
function openAddDistrictModal() {
    document.getElementById('districtForm').reset();
    document.getElementById('districtId').value = '';
    
    document.getElementById('districtModalTitle').innerHTML = 
        '<i class="bi bi-map"></i> Agregar Distrito';
     
    loadMunicipalityOptions();
    
    const modal = new bootstrap.Modal(document.getElementById('districtModal'));
    modal.show();
}
 
function loadMunicipalityOptions() {
    const select = document.getElementById('districtMunicipalityId');
    const filterSelect = document.getElementById('districtMunicipalityFilter');
     
    select.innerHTML = '<option value="">Seleccione un municipio</option>';
    filterSelect.innerHTML = '<option value="">Todos los municipios</option>';
     
    municipalities.forEach(municipality => {
        const option = document.createElement('option');
        option.value = municipality.id;
        option.textContent = municipality.name;
        select.appendChild(option);
         
        const filterOption = document.createElement('option');
        filterOption.value = municipality.id;
        filterOption.textContent = municipality.name;
        filterSelect.appendChild(filterOption);
    });
}
 
function editDistrict(id) {
    const district = districts.find(d => d.id === id);
    
    if (!district) {
        showError('Distrito no encontrado');
        return;
    }
    
    document.getElementById('districtId').value = district.id;
    document.getElementById('districtName').value = district.name;
    document.getElementById('districtCode').value = district.code;
    document.getElementById('districtMunicipalityId').value = district.municipalityId;
    document.getElementById('districtIsActive').checked = district.isActive;
    
    document.getElementById('districtModalTitle').innerHTML = 
        '<i class="bi bi-map"></i> Editar Distrito';
    
    loadMunicipalityOptions();
    
    const modal = new bootstrap.Modal(document.getElementById('districtModal'));
    modal.show();
}
 
async function saveDistrict() {
    const id = document.getElementById('districtId').value;
    const name = document.getElementById('districtName').value.trim();
    const code = document.getElementById('districtCode').value.trim();
    const municipalityId = document.getElementById('districtMunicipalityId').value;
    const isActive = document.getElementById('districtIsActive').checked;
    
    if (!name || !code || !municipalityId) {
        showError('Por favor complete todos los campos requeridos');
        return;
    }
    
    const districtData = {
        name: name,
        code: code,
        municipalityId: parseInt(municipalityId),
        isActive: isActive
    };
    
    let success = false;
    if (id) {
        districtData.id = parseInt(id);
        success = await updateDistrict(districtData);
    } else {
        success = await createDistrict(districtData);
    }
    
    if (success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('districtModal'));
        modal.hide();
    }
}
 
function confirmDeleteDistrict(id) {
    const district = districts.find(d => d.id === id);
    
    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar el distrito "${district ? district.name : 'desconocido'}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteDistrict(id);
        }
    });
}

 
function initializeBasicApp() { 
      
    loadMunicipalities();
    loadDistricts();
     
    setupEventListeners();
}
 
function setupEventListeners() { 
    document.getElementById('addMunicipalityBtn').addEventListener('click', openAddMunicipalityModal);
    document.getElementById('addDistrictBtn').addEventListener('click', openAddDistrictModal);
     
    document.getElementById('saveMunicipalityBtn').addEventListener('click', saveMunicipality);
    document.getElementById('saveDistrictBtn').addEventListener('click', saveDistrict);
     
    document.getElementById('municipalitySearchInput').addEventListener('input', function() {
        currentMunicipalityPage = 1;  
        loadMunicipalities();
    });
    
    document.getElementById('municipalityStatusFilter').addEventListener('change', function() {
        currentMunicipalityPage = 1;
        loadMunicipalities();
    });
     
    document.getElementById('clearMunicipalityFilters').addEventListener('click', function() {
        document.getElementById('municipalitySearchInput').value = '';
        document.getElementById('municipalityStatusFilter').value = '';
        currentMunicipalityPage = 1;
        loadMunicipalities();
    });
     
    document.getElementById('districtSearchInput').addEventListener('input', function() {
        currentDistrictPage = 1;
        loadDistricts();
    });
    
    document.getElementById('districtMunicipalityFilter').addEventListener('change', function() {
        currentDistrictPage = 1;
        loadDistricts();
    });
    
    document.getElementById('districtStatusFilter').addEventListener('change', function() {
        currentDistrictPage = 1;
        loadDistricts();
    });
     
    document.getElementById('clearDistrictFilters').addEventListener('click', function() {
        document.getElementById('districtSearchInput').value = '';
        document.getElementById('districtMunicipalityFilter').value = '';
        document.getElementById('districtStatusFilter').value = '';
        currentDistrictPage = 1;
        loadDistricts();
    });
     
    document.getElementById('districts-tab').addEventListener('shown.bs.tab', function() { 
        loadMunicipalityOptions();
    });
}

//global functions to be called from HTML   
window.editMunicipality = editMunicipality;
window.confirmDeleteMunicipality = confirmDeleteMunicipality;
window.editDistrict = editDistrict;
window.confirmDeleteDistrict = confirmDeleteDistrict;
window.changeMunicipalityPage = changeMunicipalityPage;
window.changeDistrictPage = changeDistrictPage;

//Initialize when DOM be rdy  
document.addEventListener('DOMContentLoaded', function() {
    
        initializeBasicApp();
    
});