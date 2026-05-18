<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import HeroSection from '@/components/HeroSection.vue'
import VButton from '@/components/VButton.vue'
import CardGame from '@/components/CardGame.vue'

import castle from '@/asset/castle.png'
import dungeon from '@/asset/dungeon.png'
// import dungeon from '@/asset/test.jpg'

import bushCastle from '@/asset/bushCastle.png'

import { useRouter } from 'vue-router'
const router = useRouter()


const GAMES = [
  {
    id: 'tarot_africain',
    title: 'Tarot Africain',
    description: 'desc',
    tags: [
      { title: 'Famille', color: '#42b883' },
      { title: 'Jeux de Cartes', color: '#3178c6' },
    ],
  },
  {
    id: 'jeu_2',
    title: 'jeu 2',
    description: 'descdescdes cdescdescdescdescdescdescdesc descdescdescdescv descdescdescdesc cdescdescdescdescdescdescdesc cdescdescdescdescdescdescdesc cdescdescdescdescdescdescdesc cdescdescdescdescdescdescdesc ',
    tags: [
      { title: 'theme 1', color: '#f59e0b' },
      { title: 'theme 2', color: '#38bdf8' },
    ],
  },
  {
    id: 'jeu_3',
    title: 'jeu 3',
    description: 'desc',
    tags: [
      { title: 'theme 1', color: '#a78bfa' },
      { title: 'theme 2', color: '#34d399' },
    ],
  },
  {
    id: 'jeu_4',
    title: 'jeu 4',
    description: 'desc',
    tags: [
      { title: 'theme 1', color: '#f87171' },
      { title: 'theme 2', color: '#fb923c' },
    ],
  },
]

function goToGameReview(gameId: string) {
  router.push({ name: 'GameReview', params: { id: gameId } })
}
</script>

<template>
  <AppNavbar />

  <main>
    <!-- Chateau + Buisson -->
    <HeroSection :image="castle" :parallax="true">
      <img
        :src="bushCastle"
        alt=""
        aria-hidden="true"
        class="pointer-events-none select-none absolute inset-x-0 bottom-0 w-full h-full object-cover object-bottom"
        style="z-index: 1"
      />

      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-black"
        style="z-index: 2"
      />

      <div
        class="relative z-10 flex min-h-screen w-full items-center justify-start px-4 sm:px-8 md:px-16 -mt-24"
      >
        <div class="flex flex-col items-center gap-4">
          <h1 class="font-luckiest text-5xl sm:text-7xl md:text-8xl text-white">
            Games Lobby
          </h1>
          <p class="text-lg sm:text-xl md:text-2xl text-white">
            La plateforme de jeu en ligne
          </p>
          <VButton class="mt-2 rounded-lg px-8 py-4 text-base">
            COMMENCER MAINTENANT
          </VButton>
        </div>
      </div>
    </HeroSection>

    <!-- Dungeon / Jeux -->
    <div class="bg-black">
      <HeroSection :image="dungeon" overlay-color="rgba(200, 100, 30, 0.45)">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black to-transparent" />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black to-transparent" />

        <div class="relative z-10 px-4 py-24 sm:px-8 md:px-16">
          <h2 class="font-luckiest mb-12 mt-12 text-center text-4xl text-white sm:text-5xl">
            Nos Jeux
          </h2>

          <div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            <CardGame
              v-for="game in GAMES"
              :key="game.id"
              :title="game.title"
              :description="game.description"
              :tags="game.tags"
              class="game-card"
              @click="goToGameReview(game.id)"
            />
          </div>
        </div>
      </HeroSection>
    </div>
  </main>

  <AppFooter />
</template>
