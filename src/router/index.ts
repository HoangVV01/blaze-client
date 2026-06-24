import { createRouter, createWebHistory } from 'vue-router'
import ConversationsView from '../components/conversations/ConversationsView.vue'
import ChannelsView from '../components/ChannelsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import Layout from '../components/layout/Layout.vue'
import { isAuthenticated } from '../api/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/',
      component: Layout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: ':serverId?',
          name: 'channels',
          component: ChannelsView,
        },
        {
          path: 'conversations',
          name: 'conversations',
          component: ConversationsView,
        },
      ],
    },
  ],
})

// Authentication guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth !== false
  const authenticated = isAuthenticated()

  if (requiresAuth && !authenticated) {
    next('/login')
  } else if (
    !requiresAuth &&
    authenticated &&
    (to.path === '/login' ||
      to.path === '/register' ||
      to.path === '/forgot-password' ||
      to.path === '/reset-password')
  ) {
    next('/')
  } else {
    next()
  }
})

export default router
