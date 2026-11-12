const fincasView = () => import('./views/fincas-view.vue');
const fincaFormView = () => import('./views/finca-form-view.vue');
const parcelasView = () => import('./views/parcelas-view.vue');
const parcelaFormView = () => import('./views/parcela-form-view.vue');
const parcelaDetailView = () => import('./views/parcela-detail-view.vue');
const cultivoView = () => import('./views/cultivo-view.vue');
const cultivoFormView = () => import('./views/cultivo-form-view.vue');
const cultivoDetailView = () => import('./views/cultivo-detail-view.vue');

export const fieldManagementRoutes = [
    {
        path: '/fincas',
        name: 'fincas',
        component: fincasView,
        meta: { title: 'Fincas' }
    },
    {
        path: '/fincas/edit/:id?',
        name: 'fincas-edit',
        component: fincaFormView,
        meta: { title: 'Fincas' }
    },
    {
        path: '/parcelas',
        name: 'parcelas',
        component: parcelasView,
        meta: { title: 'Parcelas' }
    },
    {
        path: '/parcelas/edit/:id?',
        name: 'parcelas-edit',
        component: parcelaFormView,
        meta: { title: 'Parcelas' }
    },
    {
        path: '/parcelas/:id(\\d+)',
        name: 'parcela-detail',
        component: parcelaDetailView,
        meta: { title: 'Parcelas' }
    },
    {
        path: '/cultivos',
        name: 'cultivos',
        component: cultivoView,
        meta: { title: 'Cultivos' }
    },
    {
        path: '/cultivos/edit/:id?',
        name: 'cultivos-edit',
        component: cultivoFormView,
        meta: { title: 'Cultivos' }
    },
    {
        path: '/cultivos/:id(\\d+)',
        name: 'cultivo-detail',
        component: cultivoDetailView,
        meta: { title: 'Cultivos' }
    }
];

export default fieldManagementRoutes;
