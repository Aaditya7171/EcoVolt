import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/services/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/chargers',
      name: 'chargers',
      component: () => import('../views/ChargersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chargers/new',
      name: 'charger-create',
      component: () => import('../views/ChargerFormView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chargers/:id/edit',
      name: 'charger-edit',
      component: () => import('../views/ChargerFormView.vue'),
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/pending',
      name: 'admin-pending',
      component: () => import('../views/AdminPendingView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true, allowGuest: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth) {
    if (!authenticated) {
      // No authentication - redirect to login
      next('/login')
    } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
      // Non-admin trying to access admin area - redirect to chargers
      next('/chargers')
    } else {
      // Authenticated user with proper access
      next()
    }
  } else if (to.meta.requiresGuest && authenticated) {
    // Already authenticated trying to access login/register
    next('/chargers')
  } else {
    next()
  }
})

export default router
