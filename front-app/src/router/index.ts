import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/LandingView.vue'),
      meta: { transition: true, transitionType: 'split', transitionColor: '#130303' }
    },
    {
      path:'/auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { transition: true, transitionType: 'points', transitionColor: '#000000' }
    },
    {
      path:'/account',
      name: 'account',
      component: () => import('@/views/AccountView.vue'),
      // meta: { transition: true, transitionType: 'split', transitionColor: '#14863a' }
    },
    {
      path: '/tarot_africain/informations',
      name: 'TarotAfricain',
      component: () => import('@/modules/tarot_africain/views/GameReview.vue'),
      props: { gameId: 'tarot_africain' },
      meta: { transition: true, transitionType: 'split', transitionColor: '#130303' }
    },
    {
      path: '/tarot_africain/lobby/:gameId',
      name: 'TarotAfricainLobby',
      component: () => import('@/modules/tarot_africain/views/Lobby.vue'),
    },
    {
      path: '/tarot_africain/game/:gameId',
      name: 'TarotAfricainGame',
      component: () => import('@/modules/tarot_africain/views/Game.vue'),
      props: true
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/modules/tarot_africain/views/Test.vue')
    },
  ],
})

export default router
