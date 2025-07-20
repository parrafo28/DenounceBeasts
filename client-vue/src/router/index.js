import { createRouter, createWebHistory } from 'vue-router'
import MunicipalityList from '@/views/municipality/MunicipalityList.vue'
import MunicipalityDetail from '@/views/municipality/MunicipalityDetail.vue'
import MunicipalityForm from '@/views/municipality/MunicipalityForm.vue'
import SectorList from '@/views/sector/SectorList.vue'
import SectorDetail from '@/views/sector/SectorDetail.vue'
import SectorForm from '@/views/sector/SectorForm.vue'

const routes = [
  {
    path: '/',
    redirect: '/municipalities'
  },
  {
    path: '/municipalities',
    name: 'MunicipalityList',
    component: MunicipalityList,
    meta: { title: 'Municipios' }
  },
  {
    path: '/municipalities/create',
    name: 'MunicipalityCreate',
    component: MunicipalityForm,
    meta: { title: 'Crear Municipio' }
  },
  {
    path: '/municipalities/:id',
    name: 'MunicipalityDetail',
    component: MunicipalityDetail,
    meta: { title: 'Detalle de Municipio' }
  },
  {
    path: '/municipalities/:id/edit',
    name: 'MunicipalityEdit',
    component: MunicipalityForm,
    meta: { title: 'Editar Municipio' }
  },
  {
    path: '/sectors',
    name: 'SectorList',
    component: SectorList,
    meta: { title: 'Sectores' }
  },
  {
    path: '/sectors/create',
    name: 'SectorCreate',
    component: SectorForm,
    meta: { title: 'Crear Sector' }
  },
  {
    path: '/sectors/:id',
    name: 'SectorDetail',
    component: SectorDetail,
    meta: { title: 'Detalle de Sector' }
  },
  {
    path: '/sectors/:id/edit',
    name: 'SectorEdit',
    component: SectorForm,
    meta: { title: 'Editar Sector' }
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

// Cambiar título de la página
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - DenounceBeasts`
  }
  next()
})

export default router