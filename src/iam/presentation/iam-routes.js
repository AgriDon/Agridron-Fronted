const SignInView = () => import('./views/sign-in.view.vue')
const SignUpView = () => import('./views/sign-up.view.vue')
const VerifyEmailView = () => import('./views/verify-email.view.vue')

/**
 * Public IAM route definitions rendered outside the authenticated shell layout.
 *
 * Route meta flags:
 * - `public`: bypasses authentication guard.
 * - `guestOnly`: redirects authenticated users back to `/inicio`.
 * - `hideNavigation`: hides sidebar and top header bar in `App.vue`.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
export const iamRoutes = [
  {
    path: '/sign-in',
    alias: '/login',
    name: 'sign-in',
    component: SignInView,
    meta: {
      title: 'Iniciar sesión',
      public: true,
      guestOnly: true,
      hideNavigation: true
    }
  },
  {
    path: '/sign-up',
    alias: '/register',
    name: 'sign-up',
    component: SignUpView,
    meta: {
      title: 'Crear cuenta',
      public: true,
      guestOnly: true,
      hideNavigation: true
    }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: {
      title: 'Verificar correo',
      public: true,
      hideNavigation: true
    }
  }
]

export default iamRoutes
