<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <h1 class="text-xl font-bold text-blue-600">DenounceBeasts</h1>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-8">
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
import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'

const appStore = useAppStore()
const isLoading = computed(() => appStore.isLoading)
</script>

<style scoped>
.nav-link {
  @apply text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
}

.nav-link.active {
  @apply text-blue-600 bg-blue-50;
}
</style>