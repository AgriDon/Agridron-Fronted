import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import InicioView from './views/inicio-view.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/inicio',
    name: 'inicio',
    component: InicioView,
    meta: { title: 'Inicio' }
  },
  {
    path: '/fincas',
    name: 'fincas',
    component: () => import('./views/fincas-view.vue'),
    meta: { title: 'Fincas' }
  },
  {
    path: '/parcelas',
    name: 'parcelas',
    component: () => import('./views/parcelas-view.vue'),
    meta: { title: 'Parcelas' }
  },
  {
    path: '/misiones',
    name: 'misiones',
    component: () => import('./views/misiones-view.vue'),
    meta: { title: 'Misiones' }
  },
  {
    path: '/drones',
    name: 'drones',
    component: () => import('./views/drones-view.vue'),
    meta: { title: 'Drones' }
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: () => import('./views/reportes-view.vue'),
    meta: { title: 'Reportes' }
  },
  {
    path: '/configuracion',
    name: 'configuracion',
    component: () => import('./views/configuracion-view.vue'),
    meta: { title: 'Configuración' }
  },
  {
    path: '/',
    redirect: '/inicio'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./views/not-found-view.vue'),
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
