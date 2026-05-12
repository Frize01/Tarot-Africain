import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/landing'
    },
    {
      path: '/landing',
      component: () => import('@/views/LandingView.vue')
    }
  ],
})

export default router
