import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore.js'
import MunicipalityList from '@/views/municipality/MunicipalityList.vue'
import MunicipalityDetail from '@/views/municipality/MunicipalityDetail.vue'
import MunicipalityForm from '@/views/municipality/MunicipalityForm.vue'
import SectorList from '@/views/sector/SectorList.vue'
import SectorDetail from '@/views/sector/SectorDetail.vue'
import SectorForm from '@/views/sector/SectorForm.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ProfileView from '@/views/auth/ProfileView.vue'
import ChangePasswordView from '@/views/auth/ChangePasswordView.vue'

const routes = [
  {
    path: '/',
    redirect: '/municipalities'
  },
  // Auth routes (public)
  {
    path: '/auth/login',
    name: 'Login',
    component: LoginView,
    meta: { 
      title: 'Iniciar Sesión',
      guest: true
    }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: RegisterView,
    meta: { 
      title: 'Crear Cuenta',
      guest: true
    }
  },
  // Protected routes
  {
    path: '/auth/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { 
      title: 'Mi Perfil',
      requiresAuth: true
    }
  },
  {
    path: '/auth/change-password',
    name: 'ChangePassword',
    component: ChangePasswordView,
    meta: { 
      title: 'Cambiar Contraseña',
      requiresAuth: true
    }
  },
  {
    path: '/municipalities',
    name: 'MunicipalityList',
    component: MunicipalityList,
    meta: { 
      title: 'Municipios',
      requiresAuth: true
    }
  },
  {
    path: '/municipalities/create',
    name: 'MunicipalityCreate',
    component: MunicipalityForm,
    meta: { 
      title: 'Crear Municipio',
      requiresAuth: true
    }
  },
  {
    path: '/municipalities/:id',
    name: 'MunicipalityDetail',
    component: MunicipalityDetail,
    meta: { 
      title: 'Detalle de Municipio',
      requiresAuth: true
    }
  },
  {
    path: '/municipalities/:id/edit',
    name: 'MunicipalityEdit',
    component: MunicipalityForm,
    meta: { 
      title: 'Editar Municipio',
      requiresAuth: true
    }
  },
  {
    path: '/sectors',
    name: 'SectorList',
    component: SectorList,
    meta: { 
      title: 'Sectores',
      requiresAuth: true
    }
  },
  {
    path: '/sectors/create',
    name: 'SectorCreate',
    component: SectorForm,
    meta: { 
      title: 'Crear Sector',
      requiresAuth: true
    }
  },
  {
    path: '/sectors/:id',
    name: 'SectorDetail',
    component: SectorDetail,
    meta: { 
      title: 'Detalle de Sector',
      requiresAuth: true
    }
  },
  {
    path: '/sectors/:id/edit',
    name: 'SectorEdit',
    component: SectorForm,
    meta: { 
      title: 'Editar Sector',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/municipalities'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Change page title
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - DenounceBeasts`
  }

  // Get auth store
  const authStore = useAuthStore()
  
  // Initialize auth store if not already done
  if (!authStore.isInitialized) {
    authStore.init()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to login with return URL
      next({
        name: 'Login',
        query: { returnUrl: to.fullPath }
      })
      return
    }
  }

  // Check if route is for guests only (login/register)
  if (to.meta.guest && authStore.isAuthenticated) {
    // Redirect to home if already authenticated
    next({ path: '/' })
    return
  }

  next()
})

export default router