/**
 * Flight Operations Bounded Context routes configuration.
 * Modular routing following Evans DDD / Learning Center architecture.
 */
export const flightOperationsRoutes = [
  {
    path: '/drones',
    name: 'drones',
    component: () => import('./views/drones-view.vue'),
    meta: { title: 'Flota de Drones' }
  },
  {
    path: '/drones/:id(\\d+)',
    name: 'drone-detail',
    component: () => import('./views/dron-detail-view.vue'),
    meta: { title: 'Detalle de Dron' }
  },
  {
    path: '/drones/edit/:id?',
    name: 'drones-edit',
    component: () => import('./views/dron-form-view.vue'),
    meta: { title: 'Gestión de Dron' }
  },
  {
    path: '/misiones',
    name: 'misiones',
    component: () => import('./views/mission-management-view.vue'),
    meta: { title: 'Gestión de Misiones' }
  },
  {
    path: '/misiones/:id(\\d+)/monitoreo',
    name: 'mision-monitoreo',
    component: () => import('./views/mission-monitoring-view.vue'),
    meta: { title: 'Cabina de Monitoreo de Misión' }
  }
]
