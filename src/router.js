import { createRouter, createWebHistory } from 'vue-router'
import InicioView from './shared/presentation/views/inicio-view.vue'
import { fieldManagementRoutes } from './fieldManagement/presentation/field-management-routes.js'

const routes = [
  {
    path: '/inicio',
    name: 'inicio',
    component: InicioView,
    meta: { title: 'Inicio' }
  },
  ...fieldManagementRoutes,
  {
    path: '/misiones',
    name: 'misiones',
    component: () => import('./flightOperations/presentation/views/mission-management-view.vue'),
    meta: { title: 'Misiones' }
  },
  {
    path: '/drones',
    name: 'drones',
    component: () => import('./flightOperations/presentation/views/drones-view.vue'),
    meta: { title: 'Drones' }
  },
  {
    path: '/drones/:id(\\d+)',
    name: 'drone-detail',
    component: () => import('./flightOperations/presentation/views/dron-detail-view.vue'),
    meta: { title: 'Drones' }
  },
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
    path: '/',
    redirect: '/inicio'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./shared/presentation/views/not-found-view.vue'),
    meta: { title: 'Página no encontrada' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const baseTitle = 'AgriDron Solutions'
  document.title = to.meta.title ? `${baseTitle} - ${to.meta.title}` : baseTitle
})

export default router
