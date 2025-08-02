<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <router-link to="/municipalities" class="btn-secondary">
          ← Volver
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEdit ? 'Editar Municipio' : 'Crear Municipio' }}
          </h1>
          <p class="text-sm text-gray-600">
            {{ isEdit ? 'Modifica los datos del municipio' : 'Completa la información del nuevo municipio' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="bg-white shadow rounded-lg">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="Ejemplo: SD-01"
              @blur="validateCode"
            />
            <p v-if="errors.code" class="mt-1 text-sm text-red-600">
              {{ errors.code }}
            </p>
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
              placeholder="Nombre del municipio"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">
              {{ errors.name }}
            </p>
          </div>
        </div>

        <!-- Estado -->
        <div>
          <label class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
            />
            <span class="ml-2 text-sm text-gray-700">Municipio activo</span>
          </label>
        </div>

        <!-- Botones -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <router-link to="/municipalities" class="btn-secondary">
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
import { useMunicipalityStore } from '@/stores/useMunicipalityStore'

const route = useRoute()
const router = useRouter()
const municipalityStore = useMunicipalityStore()

// Referencias reactivas
const form = ref({
  code: '',
  name: '',
  isActive: true
})

const errors = ref({})
const loading = computed(() => municipalityStore.loading)

// Computed properties
const isEdit = computed(() => route.name === 'MunicipalityEdit')
const municipalityId = computed(() => route.params.id)

const isFormValid = computed(() => {
  return form.value.code.trim() && 
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

  try {
    const excludeId = isEdit.value ? municipalityId.value : null
    const isUnique = await municipalityStore.checkCodeUnique(form.value.code, excludeId)
    
    if (!isUnique) {
      errors.value.code = 'Este código ya está en uso'
    } else {
      delete errors.value.code
    }
  } catch (error) {
    console.error('Error validating code:', error)
  }
}

function validateForm() {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
  } else if (form.value.name.length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  }

  validateCode()
}

// Método de envío
async function handleSubmit() {
  validateForm()
  
  if (!isFormValid.value) return

  try {
    const municipalityData = {
      code: form.value.code.trim(),
      name: form.value.name.trim(),
      isActive: form.value.isActive
    }

    if (isEdit.value) {
      await municipalityStore.updateMunicipality(municipalityId.value, municipalityData)
    } else {
      await municipalityStore.createMunicipality(municipalityData)
    }

    router.push('/municipalities')
  } catch (error) {
    console.error('Error saving municipality:', error)
  }
}

// Cargar datos para edición
async function loadMunicipality() {
  if (!isEdit.value) return

  try {
    const municipality = await municipalityStore.fetchMunicipality(municipalityId.value)
    if (municipality) {
      form.value = {
        code: municipality.code,
        name: municipality.name,
        isActive: municipality.isActive
      }
    }
  } catch (error) {
    console.error('Error loading municipality:', error)
    router.push('/municipalities')
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
onMounted(() => {
  if (isEdit.value) {
    loadMunicipality()
  }
})
</script>