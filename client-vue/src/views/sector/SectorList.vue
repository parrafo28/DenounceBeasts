<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Sectores</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gestión de sectores del sistema
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <router-link
          to="/sectors/create"
          class="btn-primary"
        >
          Agregar Sector
        </router-link>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nombre o código..."
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Municipio
          </label>
          <select v-model="municipalityFilter" class="input-field">
            <option value="">Todos los municipios</option>
            <option 
              v-for="municipality in municipalities" 
              :key="municipality.id" 
              :value="municipality.id"
            >
              {{ municipality.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select v-model="statusFilter" class="input-field">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="btn-secondary"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de sectores -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando sectores...</p>
      </div>

      <div v-else-if="filteredSectors.length === 0" class="p-8 text-center">
        <p class="text-gray-500">No se encontraron sectores</p>
      </div>

      <div v-else>
        <!-- Header de tabla -->
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div class="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="col-span-2">Código</div>
            <div class="col-span-3">Nombre</div>
            <div class="col-span-3">Municipio</div>
            <div class="col-span-2">Estado</div>
            <div class="col-span-2">Acciones</div>
          </div>
        </div>

        <!-- Filas -->
        <div class="bg-white divide-y divide-gray-200">
          <div
            v-for="sector in filteredSectors"
            :key="sector.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="grid grid-cols-12 gap-4 items-center">
              <div class="col-span-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ sector.code }}
                </span>
              </div>
              
              <div class="col-span-3">
                <span class="text-sm text-gray-900">
                  {{ sector.name }}
                </span>
              </div>
              
              <div class="col-span-3">
                <span class="text-sm text-gray-500">
                  {{ getMunicipalityName(sector.municipalityId) }}
                </span>
              </div>
              
              <div class="col-span-2">
                <span
                  :class="sector.isActive ? 'badge-success' : 'badge-danger'"
                >
                  {{ sector.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              
              <div class="col-span-2">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/sectors/${sector.id}`"
                    class="btn-sm btn-outline"
                  >
                    Ver
                  </router-link>
                  <router-link
                    :to="`/sectors/${sector.id}/edit`"
                    class="btn-sm btn-primary"
                  >
                    Editar
                  </router-link>
                  <button
                    @click="confirmDelete(sector)"
                    class="btn-sm btn-danger"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">
            Confirmar Eliminación
          </h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              ¿Está seguro que desea eliminar el sector
              <strong>{{ sectorToDelete?.name }}</strong>?
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="flex justify-center space-x-3 mt-4">
            <button
              @click="cancelDelete"
              class="btn-secondary"
            >
              Cancelar
            </button>
            <button
              @click="deleteSector"
              :disabled="loading"
              class="btn-danger"
            >
              {{ loading ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSectorStore } from '@/stores/useSectorStore'
import { useMunicipalityStore } from '@/stores/useMunicipalityStore'

const sectorStore = useSectorStore()
const municipalityStore = useMunicipalityStore()

// Referencias reactivas
const searchQuery = ref('')
const municipalityFilter = ref('')
const statusFilter = ref('')
const showDeleteModal = ref(false)
const sectorToDelete = ref(null)

// Computed properties
const loading = computed(() => sectorStore.loading)
const municipalities = computed(() => municipalityStore.activeMunicipalities)

const filteredSectors = computed(() => {
  let filtered = sectorStore.sectors

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query)
    )
  }

  // Filtro por municipio
  if (municipalityFilter.value) {
    filtered = filtered.filter(s => s.municipalityId === municipalityFilter.value)
  }

  // Filtro por estado
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(s => s.isActive)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(s => !s.isActive)
  }

  return filtered
})

// Métodos
function getMunicipalityName(municipalityId) {
  const municipality = municipalities.value.find(m => m.id === municipalityId)
  return municipality ? municipality.name : 'N/A'
}

function clearFilters() {
  searchQuery.value = ''
  municipalityFilter.value = ''
  statusFilter.value = ''
}

function confirmDelete(sector) {
  sectorToDelete.value = sector
  showDeleteModal.value = true
}

function cancelDelete() {
  sectorToDelete.value = null
  showDeleteModal.value = false
}

async function deleteSector() {
  if (!sectorToDelete.value) return

  try {
    await sectorStore.deleteSector(sectorToDelete.value.id)
    cancelDelete()
  } catch (error) {
    console.error('Error deleting sector:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    sectorStore.fetchSectors(),
    municipalityStore.fetchMunicipalities()
  ])
})
</script>