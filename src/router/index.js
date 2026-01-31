import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Es recomendable usar '@' en todos los imports para mantener consistencia
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import WorkspaceView from '@/views/WorkspaceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: WorkspaceView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    // Opcional: Redirigir cualquier ruta desconocida al Home o Login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Función para esperar a que Firebase inicialice antes de evaluar la ruta
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener()
        resolve(user)
      },
      reject,
    )
  })
}

// 🔒 PROTECCIÓN DE RUTAS
router.beforeEach(async (to, from, next) => {
  // Comprobamos si la ruta a la que vamos tiene la meta "requiresAuth"
  if (to.meta.requiresAuth) {
    const user = await getCurrentUser()

    if (!user) {
      // 1. Si no hay usuario logueado -> Login
      next('/login')
    } else if (!user.emailVerified) {
      // 2. Si está logueado pero NO tiene email verificado -> Login (o vista de aviso)
      alert('Debes verificar tu correo electrónico para acceder.')
      next('/login')
    } else {
      // 3. Todo correcto -> Dejar pasar
      next()
    }
  } else {
    // Si la ruta es pública (login/register) -> Dejar pasar
    next()
  }
})

export default router
