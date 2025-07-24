<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <h1 class="text-xl font-bold text-blue-600">DenounceBeasts</h1>
              <span class="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Vue</span>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Navigation Links (only show if authenticated) -->
            <template v-if="authStore.isAuthenticated">
              <router-link 
                to="/municipalities" 
                class="nav-link"
                :class="{ 'active': $route.path.includes('/municipalities') }"
              >
                Municipios
              </router-link>
              <router-link 
                to="/sectors" 
                class="nav-link"
                :class="{ 'active': $route.path.includes('/sectors') }"
              >
                Sectores
              </router-link>
              
              <!-- User Dropdown -->
              <div class="relative" ref="userDropdown">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  :class="{ 'bg-gray-100': showUserMenu }"
                >
                  <UserIcon class="h-5 w-5" />
                  <span>{{ authStore.user?.firstName }}</span>
                  <ChevronDownIcon class="h-4 w-4" />
                </button>
                
                <!-- Dropdown Menu -->
                <div
                  v-show="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border"
                >
                  <router-link
                    to="/auth/profile"
                    class="dropdown-item"
                    @click="showUserMenu = false"
                  >
                    <UserIcon class="h-4 w-4 mr-2" />
                    Mi Perfil
                  </router-link>
                  <router-link
                    to="/auth/change-password"
                    class="dropdown-item"
                    @click="showUserMenu = false"
                  >
                    <KeyIcon class="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </router-link>
                  <hr class="my-1">
                  <button
                    @click="handleLogout"
                    class="dropdown-item text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <ArrowRightOnRectangleIcon class="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </template>
            
            <!-- Auth Links (only show if not authenticated) -->
            <template v-else>
              <router-link 
                to="/auth/login"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Iniciar Sesión
              </router-link>
              <router-link 
                to="/auth/register"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Registrarse
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Loading overlay -->
    <div 
      v-if="isLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span>Cargando...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  UserIcon, 
  KeyIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon 
} from '@heroicons/vue/24/outline'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'

// Stores
const appStore = useAppStore()
const authStore = useAuthStore()

// Router
const router = useRouter()

// State
const showUserMenu = ref(false)
const userDropdown = ref(null)

// Computed
const isLoading = computed(() => appStore.isLoading)

// Methods
async function handleLogout() {
  showUserMenu.value = false
  
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    await authStore.logout()
    router.push('/auth/login')
  }
}

function handleClickOutside(event) {
  if (userDropdown.value && !userDropdown.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Initialize auth store
  authStore.init()
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-link {
  @apply text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
}

.nav-link.active {
  @apply text-blue-600 bg-blue-50;
}

.dropdown-item {
  @apply flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200;
}
</style>