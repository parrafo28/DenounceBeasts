<template>
  <div id="app">
    <!-- Navbar principal -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-vue-primary">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <i class="bi bi-building"></i> DenounceBeasts Vue
        </router-link>
        
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">
                <i class="bi bi-house-door"></i> Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/municipalities" class="nav-link">
                <i class="bi bi-geo-alt"></i> Municipios
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/districts" class="nav-link">
                <i class="bi bi-map"></i> Distritos
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link">
                <i class="bi bi-info-circle"></i> Acerca de
              </router-link>
            </li>
            <li class="nav-item">
              <button 
                class="btn btn-outline-light btn-sm ms-2" 
                @click="toggleTheme"
                :title="isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
              >
                <i :class="isDarkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="main-content">
      <div class="container-fluid py-4">
        <!-- Indicador de loading global -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando...</p>
          </div>
        </div>

        <!-- Vista actual -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer bg-light border-top mt-5">
      <div class="container">
        <div class="row py-4">
          <div class="col-md-8">
            <h5 class="text-vue-primary">
              <i class="bi bi-building"></i> DenounceBeasts Vue 3
            </h5>
            <p class="text-muted mb-0">
              Sistema de gestión territorial desarrollado con Vue 3, TypeScript y Composition API.
              Experiencia de usuario moderna con reactividad avanzada.
            </p>
          </div>
          <div class="col-md-4 text-end">
            <p class="text-muted mb-0">
              <i class="bi bi-calendar3"></i> {{ currentYear }}
            </p>
            <p class="text-muted mb-0">
              <i class="bi bi-code-slash"></i> Proyecto educativo ITLA
            </p>
            <p class="text-muted mb-0">
              <i class="bi bi-lightning"></i> Vue 3 + Composition API
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

// Composables y stores
const router = useRouter()
const appStore = useAppStore()
const { isLoading, isDarkMode } = storeToRefs(appStore)

// Estado reactivo local
const currentYear = computed(() => new Date().getFullYear())

// Métodos
const toggleTheme = () => {
  appStore.toggleTheme()
}

// Aplicar tema guardado al montar
onMounted(() => {
  appStore.initializeTheme()
  console.log('🎨 Tema inicializado:', isDarkMode.value ? 'oscuro' : 'claro')
})

// Observar cambios en el tema
watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark-theme')
  } else {
    document.documentElement.classList.remove('dark-theme')
  }
}, { immediate: true })

// Manejo de errores de navegación
router.onError((error) => {
  console.error('Error de navegación:', error)
  appStore.showNotification('Error de navegación', 'error')
})
</script>

<style scoped>
/* Estilos específicos del componente App */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background-color: var(--bs-gray-50);
  min-height: calc(100vh - 200px);
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.3rem;
  text-decoration: none;
}

.navbar-brand:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}

.nav-link {
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}

.nav-link.router-link-active {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.footer {
  margin-top: auto;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-brand {
    font-size: 1.1rem;
  }
  
  .main-content {
    padding: 1rem 0;
  }
}

/* Tema oscuro */
.dark-theme .main-content {
  background-color: var(--bs-dark);
  color: var(--bs-light);
}

.dark-theme .footer {
  background-color: var(--bs-dark) !important;
  border-top-color: var(--bs-gray-700) !important;
}

.dark-theme .loading-overlay {
  background-color: rgba(33, 37, 41, 0.9);
}
</style>

<style>
/* Estilos globales para toda la aplicación */
:root {
  --vue-primary: #4fc08d;
  --vue-secondary: #34495e;
  --vue-success: #42b883;
  --vue-danger: #e74c3c;
  --vue-warning: #f39c12;
  --vue-info: #3498db;
}

.bg-vue-primary {
  background: linear-gradient(135deg, #4fc08d 0%, #42b883 100%) !important;
}

.text-vue-primary {
  color: var(--vue-primary) !important;
}

.btn-vue-primary {
  background-color: var(--vue-primary);
  border-color: var(--vue-primary);
  color: white;
}

.btn-vue-primary:hover {
  background-color: #42b883;
  border-color: #42b883;
}

/* Mejoras de accesibilidad */
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
</style>