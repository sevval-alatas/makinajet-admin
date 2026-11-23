import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ModerationPage from '@/pages/ModerationPage.vue'
import AllListingsPage from '@/pages/AllListingsPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import SystemPlaceholderPage from '@/pages/SystemPlaceholderPage.vue'
import ChangePasswordPage from '@/pages/ChangePasswordPage.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/moderation'
      },
      {
        path: 'moderation',
        name: 'moderation',
        component: ModerationPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'stores',
        name: 'stores',
        component: SystemPlaceholderPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'listings',
        name: 'all-listings',
        component: AllListingsPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'users',
        component: SystemPlaceholderPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'payments',
        name: 'payments',
        component: SystemPlaceholderPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'reports',
        name: 'reports',
        component: SystemPlaceholderPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'change-password',
        name: 'change-password',
        component: ChangePasswordPage,
        meta: { requiresAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/moderation'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// JWT Role == Admin Navigation Guard
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      authStore.logout()
      return {
        path: '/login',
        query: to.fullPath !== '/moderation' ? { redirect: to.fullPath } : {}
      }
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated && authStore.isAdmin) {
    return { path: '/moderation' }
  }

  return true
})

export default router
