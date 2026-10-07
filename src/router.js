import { createRouter, createWebHistory } from 'vue-router'
import InicioView from './shared/presentation/views/inicio-view.vue'

const routes = [
  {
    path: '/inicio',
    name: 'inicio',
    component: InicioView,
    meta: { title: 'Inicio' }
  },
  {
    path: '/fincas',
    name: 'fincas',
    component: () => import('./shared/presentation/views/fincas-view.vue'),
    meta: { title: 'Fincas' }
  },
  {
    // Optional id: without it the form creates, with it the form edits.
    path: '/fincas/edit/:id?',
    name: 'fincas-edit',
    component: () => import('./fieldManagement/presentation/views/finca-form-view.vue'),
    meta: { title: 'Fincas' }
  },
  {
    path: '/parcelas',
    name: 'parcelas',
    component: () => import('./shared/presentation/views/parcelas-view.vue'),
    meta: { title: 'Parcelas' }
  },
  {
    path: '/parcelas/edit/:id?',
    name: 'parcelas-edit',
    component: () => import('./fieldManagement/presentation/views/parcela-form-view.vue'),
    meta: { title: 'Parcelas' }
  },
  {
    path: '/parcelas/:id(\\d+)',
    name: 'parcela-detail',
    component: () => import('./fieldManagement/presentation/views/parcela-detail-view.vue'),
    meta: { title: 'Parcelas' }
  },
  {
    path: '/cultivos/:id(\\d+)',
    name: 'cultivo-detail',
    component: () => import('./fieldManagement/presentation/views/cultivo-detail-view.vue'),
    meta: { title: 'Cultivos' }
  },
  {
    path: '/cultivos',
    name: 'cultivos',
    component: () => import('./shared/presentation/views/cultivo-view.vue'),
    meta: { title: 'Cultivos' }
  },
  {
    path: '/cultivos/edit/:id?',
    name: 'cultivos-edit',
    component: () => import('./fieldManagement/presentation/views/cultivo-form-view.vue'),
    meta: { title: 'Cultivos' }
  },
  {
    path: '/misiones',
    name: 'misiones',
    component: () => import('./flightOperations/presentation/views/MissionManagement.vue'),
    meta: { title: 'Misiones' }
  },
    
  {
    path: '/drones',
    name: 'drones',
    component: () => import('./shared/presentation/views/drones-view.vue'),
    meta: { title: 'Drones' }
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: () => import('./shared/presentation/views/reportes-view.vue'),
    meta: { title: 'Reportes' }
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
