import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Importar estilos
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/assets/css/main.css'

// Importar Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

/**
 * Configuración principal de la aplicación Vue 3
 * Este archivo inicializa la aplicación con Pinia, Vue Router y estilos
 */

const app = createApp(App)

// Configurar Pinia para gestión de estado
app.use(createPinia())

// Configurar Vue Router para navegación
app.use(router)

// Configuraciones globales
app.config.globalProperties.$appName = 'DenounceBeasts Vue'
app.config.globalProperties.$version = '1.0.0'

// Configurar manejo de errores global
app.config.errorHandler = (error, instance, info) => {
  console.error('Error global capturado:', error)
  console.error('Información del componente:', info)
  
  // En producción, podrías enviar este error a un servicio de logging
  if (process.env.NODE_ENV === 'production') {
    // Aquí podrías integrar con servicios como Sentry, LogRocket, etc.
    console.log('Error enviado a servicio de logging')
  }
}

// Montar la aplicación
app.mount('#app')

// Logging para desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 DenounceBeasts Vue 3 iniciado en modo desarrollo')
  console.log('📝 Pinia store configurado')
  console.log('🛣️ Vue Router configurado')
  console.log('🎨 Bootstrap 5 cargado')
  console.log('🔔 SweetAlert2 disponible')
}