<template>
  <div class="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="text-center mb-6">
            <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100">
              <ShieldCheckIcon class="h-8 w-8 text-yellow-600" />
            </div>
            <h2 class="mt-4 text-2xl font-bold text-gray-900">
              Cambiar Contraseña
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              Actualiza tu contraseña para mantener tu cuenta segura
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Current Password -->
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">
                Contraseña Actual *
              </label>
              <div class="mt-1 relative">
                <input
                  id="currentPassword"
                  v-model="form.currentPassword"
                  name="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.currentPassword }"
                  placeholder="Tu contraseña actual"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5 text-gray-400" />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.currentPassword" class="mt-2 text-sm text-red-600">
                {{ errors.currentPassword }}
              </p>
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">
                Nueva Contraseña *
              </label>
              <div class="mt-1 relative">
                <input
                  id="newPassword"
                  v-model="form.newPassword"
                  name="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.newPassword }"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showNewPassword = !showNewPassword"
                >
                  <EyeIcon v-if="!showNewPassword" class="h-5 w-5 text-gray-400" />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.newPassword" class="mt-2 text-sm text-red-600">
                {{ errors.newPassword }}
              </p>
              <!-- Password strength indicator -->
              <div v-if="form.newPassword" class="mt-2">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all duration-300"
                      :class="passwordStrengthColor"
                      :style="{ width: passwordStrengthPercentage + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium" :class="passwordStrengthTextColor">
                    {{ passwordStrengthText }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">
                Confirmar Nueva Contraseña *
              </label>
              <div class="mt-1 relative">
                <input
                  id="confirmNewPassword"
                  v-model="form.confirmNewPassword"
                  name="confirmNewPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.confirmNewPassword }"
                  placeholder="Repite tu nueva contraseña"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.confirmNewPassword" class="mt-2 text-sm text-red-600">
                {{ errors.confirmNewPassword }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                :disabled="authStore.isLoading"
                class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheckIcon class="h-4 w-4 mr-2" />
                <span v-if="!authStore.isLoading">Cambiar Contraseña</span>
                <div v-else class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cambiando...
                </div>
              </button>
              
              <router-link
                to="/auth/profile"
                class="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Volver al Perfil
              </router-link>
            </div>
          </form>
        </div>
      </div>

      <!-- Security Tips -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-blue-800 mb-2">
          💡 Consejos de Seguridad
        </h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• Usa una combinación de letras, números y símbolos</li>
          <li>• Evita usar información personal fácil de adivinar</li>
          <li>• No reutilices contraseñas de otras cuentas</li>
          <li>• Cambia tu contraseña regularmente</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowLeftIcon 
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/useAuthStore.js'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()

// State
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

// Computed
const passwordStrength = computed(() => {
  const password = form.newPassword
  let strength = 0

  if (password.length >= 6) strength += 1
  if (password.length >= 8) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1

  return Math.min(strength, 4)
})

const passwordStrengthPercentage = computed(() => {
  return (passwordStrength.value / 4) * 100
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'bg-red-500'
  if (strength === 2) return 'bg-yellow-500'
  if (strength === 3) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthTextColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'text-red-600'
  if (strength === 2) return 'text-yellow-600'
  if (strength === 3) return 'text-blue-600'
  return 'text-green-600'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'Débil'
  if (strength === 2) return 'Regular'
  if (strength === 3) return 'Buena'
  return 'Fuerte'
})

// Methods
function clearErrors() {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

function validateForm() {
  clearErrors()
  let isValid = true

  if (!form.currentPassword) {
    errors.currentPassword = 'La contraseña actual es requerida'
    isValid = false
  }

  if (!form.newPassword) {
    errors.newPassword = 'La nueva contraseña es requerida'
    isValid = false
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres'
    isValid = false
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'La nueva contraseña debe ser diferente a la actual'
    isValid = false
  }

  if (!form.confirmNewPassword) {
    errors.confirmNewPassword = 'Debes confirmar la nueva contraseña'
    isValid = false
  } else if (form.newPassword !== form.confirmNewPassword) {
    errors.confirmNewPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  try {
    await authStore.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmNewPassword: form.confirmNewPassword
    })

    // Clear form
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmNewPassword = ''

    // Redirect to profile
    router.push('/auth/profile')
  } catch (error) {
    console.error('Change password failed:', error)
    // Error is already shown via toast in the store
  }
}

// Lifecycle
onMounted(() => {
  // Focus current password input
  document.getElementById('currentPassword')?.focus()
})
</script>