<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon class="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ authStore.fullName }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                  <div class="mt-2">
                    <span
                      v-for="role in authStore.userRoles"
                      :key="role"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                    >
                      {{ role }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 space-y-3">
                <router-link
                  to="/auth/change-password"
                  class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <KeyIcon class="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </router-link>
                
                <button
                  @click="handleLogout"
                  :disabled="authStore.isLoading"
                  class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <ArrowRightOnRectangleIcon class="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Details -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información Personal
              </h3>
              
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.firstName }}</dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Apellido</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.lastName }}</dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.email }}</dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ authStore.user?.phone || 'No especificado' }}
                  </dd>
                </div>
                
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">Dirección</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ authStore.user?.address || 'No especificada' }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Account Information -->
          <div class="bg-white shadow rounded-lg mt-6">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información de Cuenta
              </h3>
              
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">ID de Usuario</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono">{{ authStore.user?.id }}</dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Estado</dt>
                  <dd class="mt-1">
                    <span
                      :class="authStore.user?.isActive 
                        ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                        : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'"
                    >
                      {{ authStore.user?.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva' }}
                    </span>
                  </dd>
                </div>
                
                <div class="sm:col-span-2" v-if="authStore.userRoles.length > 0">
                  <dt class="text-sm font-medium text-gray-500">Roles</dt>
                  <dd class="mt-1">
                    <span
                      v-for="role in authStore.userRoles"
                      :key="role"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2"
                    >
                      {{ role }}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  UserIcon, 
  KeyIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/useAuthStore.js'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()

// Methods
async function handleLogout() {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    await authStore.logout()
    router.push('/auth/login')
  }
}

async function refreshProfile() {
  try {
    await authStore.fetchProfile()
  } catch (error) {
    console.error('Error refreshing profile:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Ensure we have fresh profile data
  refreshProfile()
})
</script>