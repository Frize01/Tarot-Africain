import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/LandingView.vue')
    },
    {
      path:'/auth',
      component: () => import('@/views/AuthView.vue')
    },
    {
      path: '/game-review/:id',
      name: 'GameReview',
      component: () => import('@/modules/tarot_africain/views/GameReview.vue')
    }
  ],
})

export default router
