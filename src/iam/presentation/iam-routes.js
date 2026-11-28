const SignInView = () => import('./views/sign-in.view.vue')
const SignUpView = () => import('./views/sign-up.view.vue')
const VerifyEmailView = () => import('./views/verify-email.view.vue')

/** Public IAM routes with `public`, `guestOnly`, and `hideNavigation` metadata flags. */
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
      guestOnly: false,
      hideNavigation: true
    }
  }
]

export default iamRoutes
