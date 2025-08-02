<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Municipios</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gestión de municipios del sistema
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <router-link
          to="/municipalities/create"
          class="btn-primary"
        >
          Agregar Municipio
        </router-link>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

    <!-- Lista de municipios -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando municipios...</p>
      </div>

      <div v-else-if="filteredMunicipalities.length === 0" class="p-8 text-center">
        <p class="text-gray-500">No se encontraron municipios</p>
      </div>

      <div v-else>
        <!-- Header de tabla -->
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div class="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="col-span-2">Código</div>
            <div class="col-span-4">Nombre</div>
            <div class="col-span-2">Sectores</div>
            <div class="col-span-2">Estado</div>
            <div class="col-span-2">Acciones</div>
          </div>
        </div>

        <!-- Filas -->
        <div class="bg-white divide-y divide-gray-200">
          <div
            v-for="municipality in filteredMunicipalities"
            :key="municipality.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="grid grid-cols-12 gap-4 items-center">
              <div class="col-span-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ municipality.code }}
                </span>
              </div>
              
              <div class="col-span-4">
                <span class="text-sm text-gray-900">
                  {{ municipality.name }}
                </span>
              </div>
              
              <div class="col-span-2">
                <span class="text-sm text-gray-500">
                  {{ municipality.sectorsCount || 0 }} sectores
                </span>
              </div>
              
              <div class="col-span-2">
                <span
                  :class="municipality.isActive ? 'badge-success' : 'badge-danger'"
                >
                  {{ municipality.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              
              <div class="col-span-2">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/municipalities/${municipality.id}`"
                    class="btn-sm btn-outline"
                  >
                    Ver
                  </router-link>
                  <router-link
                    :to="`/municipalities/${municipality.id}/edit`"
                    class="btn-sm btn-primary"
                  >
                    Editar
                  </router-link>
                  <button
                    @click="confirmDelete(municipality)"
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
              ¿Está seguro que desea eliminar el municipio
              <strong>{{ municipalityToDelete?.name }}</strong>?
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
              @click="deleteMunicipality"
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
import { useMunicipalityStore } from '@/stores/useMunicipalityStore'

const municipalityStore = useMunicipalityStore()

// Referencias reactivas
const searchQuery = ref('')
const statusFilter = ref('')
const showDeleteModal = ref(false)
const municipalityToDelete = ref(null)

// Computed properties
const loading = computed(() => municipalityStore.loading)

const filteredMunicipalities = computed(() => {
  let filtered = municipalityStore.municipalities

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query)
    )
  }

  // Filtro por estado
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(m => m.isActive)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(m => !m.isActive)
  }

  return filtered
})

// Métodos
function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
}

function confirmDelete(municipality) {
  municipalityToDelete.value = municipality
  showDeleteModal.value = true
}

function cancelDelete() {
  municipalityToDelete.value = null
  showDeleteModal.value = false
}

async function deleteMunicipality() {
  if (!municipalityToDelete.value) return

  try {
    await municipalityStore.deleteMunicipality(municipalityToDelete.value.id)
    cancelDelete()
  } catch (error) {
    console.error('Error deleting municipality:', error)
  }
}

// Lifecycle
onMounted(() => {
  municipalityStore.fetchMunicipalities()
})
</script>