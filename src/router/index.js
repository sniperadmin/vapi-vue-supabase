import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Get current user if not already loaded
  if (!authStore.user) {
    await authStore.getCurrentUser()
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.user) {
    next('/')
  } else if (to.name === 'Login' && authStore.user) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router