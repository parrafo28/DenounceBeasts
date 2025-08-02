import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import App from './App.vue'

// Estilos
import './style.css'
import 'vue-toastification/dist/index.css'

// Crear la aplicación Vue
const app = createApp(App)

// Configurar Pinia (store)
const pinia = createPinia()
app.use(pinia)

// Configurar Vue Router
app.use(router)

// Configurar Toast notifications
app.use(Toast, {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

// Montar la aplicación
app.mount('#app')