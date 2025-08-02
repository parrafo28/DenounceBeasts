<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <router-link to="/municipalities" class="btn-secondary">
            ← Volver
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Detalle del Municipio
            </h1>
            <p class="text-sm text-gray-600">
              Información completa del municipio
            </p>
          </div>
        </div>
        
        <div v-if="municipality" class="flex space-x-3">
          <router-link
            :to="`/municipalities/${municipality.id}/edit`"
            class="btn-primary"
          >
            Editar
          </router-link>
          <button
            @click="confirmDelete"
            class="btn-danger"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Cargando información...</p>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="municipality" class="space-y-6">
      <!-- Información básica -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Información Básica
          </h3>
        </div>
        <div class="px-6 py-4">
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt class="text-sm font-medium text-gray-500">Código</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ municipality.code }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Nombre</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ municipality.name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Estado</dt>
              <dd class="mt-1">
                <span
                  :class="municipality.isActive ? 'badge-success' : 'badge-danger'"
                >
                  {{ municipality.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Sectores</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ municipality.sectorsCount || 0 }} sectores registrados
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Creación</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(municipality.createdAt) }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Última Actualización</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(municipality.updatedAt) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Sectores del municipio -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">
            Sectores del Municipio
          </h3>
          <router-link
            to="/sectors/create"
            class="btn-sm btn-primary"
          >
            Agregar Sector
          </router-link>
        </div>
        
        <div v-if="loadingSectors" class="p-6 text-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Cargando sectores...</p>
        </div>

        <div v-else-if="sectors.length === 0" class="p-6 text-center">
          <p class="text-gray-500">Este municipio no tiene sectores registrados</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="sector in sectors"
            :key="sector.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-medium text-gray-900">
                    {{ sector.code }}
                  </span>
                  <span class="text-sm text-gray-700">
                    {{ sector.name }}
                  </span>
                  <span
                    :class="sector.isActive ? 'badge-success' : 'badge-danger'"
                  >
                    {{ sector.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">No se pudo cargar la información del municipio</p>
      <router-link to="/municipalities" class="btn-primary mt-4">
        Volver a la lista
      </router-link>
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
              <strong>{{ municipality?.name }}</strong>?
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
import { useRoute, useRouter } from 'vue-router'
import { useMunicipalityStore } from '@/stores/useMunicipalityStore'
import sectorService from '@/services/sectorService'

const route = useRoute()
const router = useRouter()
const municipalityStore = useMunicipalityStore()

// Referencias reactivas
const sectors = ref([])
const loadingSectors = ref(false)
const showDeleteModal = ref(false)

// Computed properties
const municipalityId = computed(() => route.params.id)
const loading = computed(() => municipalityStore.loading)
const municipality = computed(() => municipalityStore.currentMunicipality)

// Métodos
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadSectors() {
  loadingSectors.value = true
  try {
    sectors.value = await sectorService.getByMunicipality(municipalityId.value)
  } catch (error) {
    console.error('Error loading sectors:', error)
    sectors.value = []
  } finally {
    loadingSectors.value = false
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
}

async function deleteMunicipality() {
  try {
    await municipalityStore.deleteMunicipality(municipalityId.value)
    router.push('/municipalities')
  } catch (error) {
    console.error('Error deleting municipality:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await municipalityStore.fetchMunicipality(municipalityId.value)
  await loadSectors()
})
</script>