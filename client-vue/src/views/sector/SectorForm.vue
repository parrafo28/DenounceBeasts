<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <router-link to="/sectors" class="btn-secondary">
          ← Volver
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEdit ? 'Editar Sector' : 'Crear Sector' }}
          </h1>
          <p class="text-sm text-gray-600">
            {{ isEdit ? 'Modifica los datos del sector' : 'Completa la información del nuevo sector' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="bg-white shadow rounded-lg">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Municipio -->
          <div>
            <label for="municipalityId" class="block text-sm font-medium text-gray-700 mb-1">
              Municipio *
            </label>
            <select
              id="municipalityId"
              v-model="form.municipalityId"
              required
              :class="[
                'input-field',
                errors.municipalityId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
              ]"
              @change="onMunicipalityChange"
            >
              <option value="">Seleccionar municipio</option>
              <option 
                v-for="municipality in municipalities" 
                :key="municipality.id" 
                :value="municipality.id"
              >
                {{ municipality.name }}
              </option>
            </select>
            <p v-if="errors.municipalityId" class="mt-1 text-sm text-red-600">
              {{ errors.municipalityId }}
            </p>
          </div>

          <!-- Código -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
              Código *
            </label>
            <input
              id="code"
              v-model="form.code"
              type="text"
              required
              :class="[
                'input-field',
                errors.code ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
              ]"
              placeholder="Ejemplo: SEC-01"
              @blur="validateCode"
            />
            <p v-if="errors.code" class="mt-1 text-sm text-red-600">
              {{ errors.code }}
            </p>
          </div>
        </div>

        <!-- Nombre -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            :class="[
              'input-field',
              errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
            ]"
            placeholder="Nombre del sector"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">
            {{ errors.name }}
          </p>
        </div>

        <!-- Estado -->
        <div>
          <label class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
            />
            <span class="ml-2 text-sm text-gray-700">Sector activo</span>
          </label>
        </div>

        <!-- Botones -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <router-link to="/sectors" class="btn-secondary">
            Cancelar
          </router-link>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="btn-primary"
          >
            {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSectorStore } from '@/stores/useSectorStore'
import { useMunicipalityStore } from '@/stores/useMunicipalityStore'

const route = useRoute()
const router = useRouter()
const sectorStore = useSectorStore()
const municipalityStore = useMunicipalityStore()

// Referencias reactivas
const form = ref({
  municipalityId: '',
  code: '',
  name: '',
  isActive: true
})

const errors = ref({})

// Computed properties
const isEdit = computed(() => route.name === 'SectorEdit')
const sectorId = computed(() => route.params.id)
const loading = computed(() => sectorStore.loading)
const municipalities = computed(() => municipalityStore.activeMunicipalities)

const isFormValid = computed(() => {
  return form.value.municipalityId && 
         form.value.code.trim() && 
         form.value.name.trim() && 
         Object.keys(errors.value).length === 0
})

// Métodos de validación
async function validateCode() {
  if (!form.value.code.trim()) {
    errors.value.code = 'El código es requerido'
    return
  }

  if (form.value.code.length < 2) {
    errors.value.code = 'El código debe tener al menos 2 caracteres'
    return
  }

  if (!form.value.municipalityId) {
    errors.value.code = 'Selecciona un municipio primero'
    return
  }

  try {
    const excludeId = isEdit.value ? sectorId.value : null
    const isUnique = await sectorStore.checkCodeUniqueInMunicipality(
      form.value.code, 
      form.value.municipalityId, 
      excludeId
    )
    
    if (!isUnique) {
      errors.value.code = 'Este código ya está en uso en el municipio seleccionado'
    } else {
      delete errors.value.code
    }
  } catch (error) {
    console.error('Error validating code:', error)
  }
}

function validateForm() {
  errors.value = {}

  if (!form.value.municipalityId) {
    errors.value.municipalityId = 'El municipio es requerido'
  }

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
  } else if (form.value.name.length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  }

  validateCode()
}

function onMunicipalityChange() {
  // Limpiar error de municipio si había
  if (errors.value.municipalityId) {
    delete errors.value.municipalityId
  }
  
  // Re-validar código si existe (porque ahora es en contexto de nuevo municipio)
  if (form.value.code.trim()) {
    validateCode()
  }
}

// Método de envío
async function handleSubmit() {
  validateForm()
  
  if (!isFormValid.value) return

  try {
    const sectorData = {
      municipalityId: form.value.municipalityId,
      code: form.value.code.trim(),
      name: form.value.name.trim(),
      isActive: form.value.isActive
    }

    if (isEdit.value) {
      await sectorStore.updateSector(sectorId.value, sectorData)
    } else {
      await sectorStore.createSector(sectorData)
    }

    router.push('/sectors')
  } catch (error) {
    console.error('Error saving sector:', error)
  }
}

// Cargar datos para edición
async function loadSector() {
  if (!isEdit.value) return

  try {
    const sector = await sectorStore.fetchSector(sectorId.value)
    if (sector) {
      form.value = {
        municipalityId: sector.municipalityId,
        code: sector.code,
        name: sector.name,
        isActive: sector.isActive
      }
    }
  } catch (error) {
    console.error('Error loading sector:', error)
    router.push('/sectors')
  }
}

// Watchers
watch(() => form.value.code, () => {
  if (errors.value.code) {
    delete errors.value.code
  }
})

watch(() => form.value.name, () => {
  if (errors.value.name) {
    delete errors.value.name
  }
})

// Lifecycle
onMounted(async () => {
  await municipalityStore.fetchMunicipalities()
  
  if (isEdit.value) {
    await loadSector()
  }
})
</script>