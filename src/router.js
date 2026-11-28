import { createRouter, createWebHistory } from 'vue-router'
import InicioView from './shared/presentation/views/inicio-view.vue'
import { iamRoutes } from './iam/presentation/iam-routes.js'
import { fieldManagementRoutes } from './fieldManagement/presentation/field-management-routes.js'
import { flightOperationsRoutes } from './flightOperations/presentation/flight-operations-routes.js'
import pinia from './pinia.js'
import { useIamStore } from './iam/application/iam.store.js'
import { setUnauthorizedHandler } from './shared/infrastructure/base-api.js'

const routes = [
  ...iamRoutes,
  {
    path: '/inicio',
    name: 'inicio',
    component: InicioView,
    meta: { title: 'Inicio' }
  },
  ...fieldManagementRoutes,
  ...flightOperationsRoutes,
  {
    path: '/reportes',
    name: 'reportes',
    component: () => import('./reporting/presentation/views/reports-view.vue'),
    meta: { title: 'Reportes' }
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: () => import('./inventoryManagement/presentation/views/inventory-view.vue'),
    meta: { title: 'Inventario' }
  },
  {
    path: '/configuracion',
    name: 'configuracion',
    component: () => import('./shared/presentation/views/configuracion-view.vue'),
    meta: { title: 'Configuración' }
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('./shared/presentation/views/terms-view.vue'),
    meta: { title: 'Terms and Conditions', public: true }
  },
  {
    path: '/terminos',
    redirect: '/terms'
  },
  {
    path: '/',
    redirect: '/inicio'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./shared/presentation/views/not-found-view.vue'),
    meta: { title: 'Página no encontrada', public: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

setUnauthorizedHandler(() => {
  if (router.currentRoute.value.path !== '/sign-in') {
    router.replace('/sign-in')
  }
})

router.beforeEach((to) => {
  const baseTitle = 'AgriDron Solutions'
  document.title = to.meta.title ? `${baseTitle} - ${to.meta.title}` : baseTitle

  const iamStore = useIamStore(pinia)
  const isPublicRoute = Boolean(to.meta.public)
  const isGuestOnlyRoute = Boolean(to.meta.guestOnly)

  if (!isPublicRoute && !iamStore.isAuthenticated) {
    return {
      path: '/sign-in',
      query: to.fullPath && to.fullPath !== '/inicio' ? { redirect: to.fullPath } : undefined
    }
  }

  if (isGuestOnlyRoute && iamStore.isAuthenticated) {
    return { path: '/inicio' }
  }

  return true
})

export default router
