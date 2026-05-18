import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
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
      path: '/tarot_africain/informations',
      name: 'TarotAfricain',
      component: () => import('@/modules/tarot_africain/views/GameReview.vue'),
      props: { gameId: 'tarot_africain' }
    },
    {
      path: '/tarot_africain/lobby/:gameId',
      name: 'TarotAfricainLobby',
      component: () => import('@/modules/tarot_africain/views/Lobby.vue')
    }
  ],
})

export default router
