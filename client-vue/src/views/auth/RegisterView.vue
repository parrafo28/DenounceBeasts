<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <UserPlusIcon class="h-8 w-8 text-green-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear Cuenta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Únete a DenounceBeasts y ayuda a tu comunidad
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <div class="mt-1">
              <input
                id="firstName"
                v-model="form.firstName"
                name="firstName"
                type="text"
                autocomplete="given-name"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.firstName }"
                placeholder="Tu nombre"
              />
              <p v-if="errors.firstName" class="mt-2 text-sm text-red-600">
                {{ errors.firstName }}
              </p>
            </div>
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Apellido *
            </label>
            <div class="mt-1">
              <input
                id="lastName"
                v-model="form.lastName"
                name="lastName"
                type="text"
                autocomplete="family-name"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.lastName }"
                placeholder="Tu apellido"
              />
              <p v-if="errors.lastName" class="mt-2 text-sm text-red-600">
                {{ errors.lastName }}
              </p>
            </div>
          </div>

          <!-- Email -->
          <div class="md:col-span-2">
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.email }"
                placeholder="tu@email.com"
                @input="checkEmailAvailability"
              />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600">
                {{ errors.email }}
              </p>
              <p v-else-if="emailStatus.message" class="mt-2 text-sm" :class="emailStatus.available ? 'text-green-600' : 'text-red-600'">
                {{ emailStatus.message }}
              </p>
            </div>
          </div>

          <!-- Phone (Optional) -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Teléfono
              <span class="text-gray-500">(opcional)</span>
            </label>
            <div class="mt-1">
              <input
                id="phone"
                v-model="form.phone"
                name="phone"
                type="tel"
                autocomplete="tel"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="(809) 123-4567"
              />
            </div>
          </div>

          <!-- Address (Optional) -->
          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">
              Dirección
              <span class="text-gray-500">(opcional)</span>
            </label>
            <div class="mt-1">
              <input
                id="address"
                v-model="form.address"
                name="address"
                type="text"
                autocomplete="street-address"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Tu dirección"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña *
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.password }"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
              <p v-if="errors.password" class="mt-2 text-sm text-red-600">
                {{ errors.password }}
              </p>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmar Contraseña *
            </label>
            <div class="mt-1 relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': errors.confirmPassword }"
                placeholder="Repite tu contraseña"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
              <p v-if="errors.confirmPassword" class="mt-2 text-sm text-red-600">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading || !emailStatus.available"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserPlusIcon class="h-5 w-5 text-green-500 group-hover:text-green-400" />
            </span>
            <span v-if="!authStore.isLoading">Crear Cuenta</span>
            <div v-else class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creando cuenta...
            </div>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            ¿Ya tienes cuenta?
            <router-link
              to="/auth/login"
              class="font-medium text-green-600 hover:text-green-500"
            >
              Inicia sesión aquí
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/useAuthStore.js'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()

// State
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const emailCheckTimeout = ref(null)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const emailStatus = reactive({
  available: null,
  message: '',
  checking: false
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

  if (!form.firstName.trim()) {
    errors.firstName = 'El nombre es requerido'
    isValid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'El apellido es requerido'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email no es válido'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Debes confirmar la contraseña'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

async function checkEmailAvailability() {
  if (emailCheckTimeout.value) {
    clearTimeout(emailCheckTimeout.value)
  }

  const email = form.email.trim()
  
  if (!email || !email.includes('@')) {
    emailStatus.available = null
    emailStatus.message = ''
    return
  }

  emailCheckTimeout.value = setTimeout(async () => {
    try {
      emailStatus.checking = true
      const available = await authStore.checkEmailAvailability(email)
      
      emailStatus.available = available
      emailStatus.message = available 
        ? '✓ Email disponible' 
        : '✗ Este email ya está registrado'
    } catch (error) {
      emailStatus.available = null
      emailStatus.message = 'Error al verificar email'
    } finally {
      emailStatus.checking = false
    }
  }, 500)
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  if (!emailStatus.available) {
    errors.email = 'Debes usar un email disponible'
    return
  }

  try {
    await authStore.register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null
    })

    // Redirect to home
    router.push('/')
  } catch (error) {
    console.error('Registration failed:', error)
    // Error is already shown via toast in the store
  }
}

// Lifecycle
onMounted(() => {
  // If already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    router.push('/')
  }
  
  // Focus first name input
  document.getElementById('firstName')?.focus()
})
</script>